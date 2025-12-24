import { threads, messages, journals } from '@server/db/schema';

import { eq, inArray, asc, and } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '~/utils/env';

import { db } from '@server/db';


const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

import { auth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  const userId = session.user.id;

  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { message, contextIds } = body;

  if (!id || !message) {
    throw createError({ statusCode: 400, message: 'Thread ID and message are required' });
  }

  const threadId = parseInt(id);

  // Security Verification: Ensure thread belongs to the authenticated user
  const [existingThread] = await db.select()
    .from(threads)
    .where(and(
      eq(threads.id, threadId),
      eq(threads.userId, userId)
    ))
    .limit(1);

  if (!existingThread) {
    throw createError({ statusCode: 404, message: 'Thread not found' });
  }

  try {
    // 1. Save User Message
    await db.insert(messages).values({
      thread_id: threadId,
      role: 'user',
      content: message,
    });

    // Update thread updated_at
    await db.update(threads)
      .set({ updated_at: new Date() })
      .where(eq(threads.id, threadId));

    // 2. Prepare Context
    // Load thread to see if it has context_ids
    const [thread] = await db.select().from(threads).where(eq(threads.id, threadId));

    // Combine thread context IDs + validation message context IDs
    const threadContextIds = thread?.context_ids || [];
    const messageContextIds = (contextIds && Array.isArray(contextIds)) ? contextIds : [];

    // Merge unique IDs
    const allContextIds = Array.from(new Set([...threadContextIds, ...messageContextIds].map(Number)));
    let contextText = '';

    // 2a. Fetch Explicit Context
    if (allContextIds.length > 0) {
      const targetJournals = await db
        .select()
        .from(journals)
        .where(inArray(journals.id, allContextIds));

      if (targetJournals.length > 0) {
        contextText += '【ユーザーが指定した参照記録（コンテキスト）】:\n';
        targetJournals.forEach(j => {
          contextText += `
[日付: ${j.created_at ? new Date(j.created_at).toLocaleDateString('ja-JP') : '不明'}]
気分: ${j.mood_score ? j.mood_score + '/10' : '未記録'}
タグ: ${j.tags ? j.tags.join(', ') : 'なし'}
内容: ${j.content}
(過去のAIアドバイス: ${j.advice || 'なし'})
-------------------\n`;
        });
      }
    }

    // 2b. RAG Retrieval (Vector Search)
    const queryEmbedding = await getEmbedding(message);
    const similarJournals = await searchSimilarJournals(userId, queryEmbedding);

    // Filter out journals that are already explicitly included (to avoid duplication)
    const explicitIds = new Set((contextIds || []).map((cid: any) => Number(cid)));
    const uniqueSimilarJournals = similarJournals.filter(j => !explicitIds.has(j.id));

    if (uniqueSimilarJournals.length > 0) {
      contextText += '\n【関連するかもしれない過去の記録】:\n';
      uniqueSimilarJournals.forEach(j => {
        contextText += `- ${j.content}\n`;
      });
    }

    // 3. Construct Prompt (Localized)
    // Simplify: We already saved the user message.
    // Ideally we pass full history to Gemini.

    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.thread_id, threadId))
      .orderBy(asc(messages.created_at)); // Oldest first

    // Build chat history for Gemini
    // Note: Gemini API handles history differently via chatSession, but here we construct a single prompt with context.
    // Or we can use generateContent with a structure.
    // For now, let's use a System Instruction + History + New Query approach.

    const systemPrompt = `
あなたは、ユーザーの親身なパートナー（メンタルケア・アシスタント）です。
ユーザーの過去の記録（日記）を参照しながら、共感的かつ建設的な対話を行ってください。

【参照情報の扱い方】
- 参照された記録の内容を単に要約したり復唱したりしないでください。ユーザーは既に内容を知っています。
- 記録はあくまで「背景知識」として活用し、現在のユーザーの感情や状況への理解を深めるために使ってください。
- 過去の記録と現在の発言に共通する思考パターン（認知の歪み）や、気分の変化などの「気づき」があれば、それを優しく指摘してください。
- 引用が必要な場合は、話の流れの中で自然に行ってください。

【回答のスタイル】
- 日本語で答えてください。
- 短すぎず長すぎず、読みやすい文章を心がけてください。
- ユーザーを否定せず、受容的な態度を示してください。
- 必要に応じて、CBT（認知行動療法）的な視点（極端な思考への気づきなど）を優しく提供してください。
    `.trim();

    // Construct the full prompt text
    // (Combining history is naive here, but works for short-medium/context window)

    // We will append the context to the latest user message or system prompt.
    // Let's append context to the system prompt area or just before the latest message.

    let fullPrompt = `${systemPrompt}\n\n`;

    if (contextText) {
      fullPrompt += `以下は参照用のコンテキスト情報です:\n${contextText}\n\n`;
    }

    fullPrompt += `これまでの会話:\n`;
    history.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.content}\n`;
    });

    // The "history" includes the user message we just saved.
    // So the prompt effectively ends with "ユーザー: [New Message]";

    // 4. Generate AI Response
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    // 5. Save AI Message
    const [aiMsg] = await db.insert(messages).values({
      thread_id: threadId,
      role: 'assistant',
      content: responseText,
    }).returning();

    return aiMsg;

  } catch (error: any) {
    console.error('Error in chat thread API:', error);

    // Handle Gemini Rate Limit
    if (error.status === 429 || error.message?.includes('429')) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        message: 'AIの利用制限に達しました。しばらく時間（約1分）を置いてから再試行してください。',
      });
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error processing chat message',
    });
  }
});
