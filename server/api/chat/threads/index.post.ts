import { threads, messages, journals } from '@server/db/schema';

import { eq, inArray } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEmbedding } from '@server/utils/embedding';
import { searchSimilarJournals } from '@server/utils/retrieval';
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

  const body = await readBody(event);
  const { initialContextIds, message } = body;

  // Prevent empty threads if message is missing (optional enforcement)
  // For "New Chat" flows, we might want to wait until first message.

  if (!message && (!initialContextIds || initialContextIds.length === 0)) {
    // If purely empty, maybe allow? But user complained.
    // Let's assume frontend only calls this when sending 1st message.
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Create Thread
      let title = `New Chat (${new Date().toLocaleTimeString('ja-JP')})`;
      if (initialContextIds && initialContextIds.length > 0) {
        title = `日記についての会話 (${new Date().toLocaleTimeString('ja-JP')})`;
      } else if (message) {
        title = message.slice(0, 20) + (message.length > 20 ? '...' : '');
      }

      const [thread] = await tx
        .insert(threads)
        .values({
          userId,
          title,
          contextIds: initialContextIds || null,
        })
        .returning({
          id: threads.id,
          title: threads.title,
          contextIds: threads.contextIds,
          pinnedAt: threads.pinnedAt,
          createdAt: threads.createdAt,
          updatedAt: threads.updatedAt
        });

      if (!thread) throw new Error("Failed to create thread");

      // 2. If message provided, process it immediately
      let newMessages: any[] = [];

      if (message) {
        // 2a. Save User Message
        const [userMsg] = await tx.insert(messages).values({
          threadId: thread.id,
          role: 'user',
          content: message,
        }).returning();
        newMessages.push(userMsg);

        // 2b. Prepare AI Context
        let contextText = '';

        // Explicit Context
        const allContextIds = initialContextIds || [];
        if (allContextIds.length > 0) {
          const targetJournals = await tx
            .select()
            .from(journals)
            .where(inArray(journals.id, allContextIds));

          if (targetJournals.length > 0) {
            contextText += '【ユーザーが指定した参照記録（コンテキスト）】:\n';
            targetJournals.forEach(j => {
              contextText += `
[日付: ${j.createdAt ? new Date(j.createdAt).toLocaleDateString('ja-JP') : '不明'}]
気分: ${j.moodScore != null ? j.moodScore + '/10' : '未記録'}
タグ: ${j.tags ? j.tags.join(', ') : 'なし'}
内容: ${j.content}
(過去のAIアドバイス: ${j.advice || 'なし'})
-------------------\n`;
            });
          }
        }

        // RAG Retrieval
        const queryEmbedding = await getEmbedding(message);
        const similarJournals = await searchSimilarJournals(userId, queryEmbedding);
        // Filter out duplicates
        const explicitIds = new Set(allContextIds);
        const uniqueSimilarJournals = similarJournals.filter(j => !explicitIds.has(j.id));

        if (uniqueSimilarJournals.length > 0) {
          contextText += '\n【関連するかもしれない過去の記録】:\n';
          uniqueSimilarJournals.forEach(j => {
            contextText += `- ${j.content}\n`;
          });
        }

        // 2c. Generate Prompt
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

        let fullPrompt = `${systemPrompt}\n\n`;
        if (contextText) fullPrompt += `以下は参照用のコンテキスト情報です:\n${contextText}\n\n`;
        fullPrompt += `ユーザー: ${message}\n`;

        // 2d. Generate & Save AI Message
        const genResult = await model.generateContent(fullPrompt);
        const responseText = genResult.response.text();

        const [aiMsg] = await tx.insert(messages).values({
          threadId: thread.id,
          role: 'assistant',
          content: responseText,
        }).returning();
        newMessages.push(aiMsg);
      }

      return {
        thread,
        messages: newMessages
      };
    });

    return result;

  } catch (error: any) {
    console.error('Failed to create thread:', error);

    // Handle Gemini Rate Limit
    if (error.status === 429 || error.message?.includes('429')) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        message: 'AIの利用制限に達しました。しばらく時間（約1分）を置いてから再試行してください。',
      });
    }

    throw createError({
      statusCode: 500,
      message: `Failed to create thread: ${error.message}`,
    });
  }
});
