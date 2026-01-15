import { journals } from '@server/db/schema';
import { analyzeJournal, type JournalEntry } from '@server/utils/ai';
import { getEmbedding } from '@server/utils/embedding';
import { searchSimilarJournals } from '@server/utils/retrieval';


// Initialize Drizzle client
import { db } from '@server/db';
import { eq } from 'drizzle-orm';


import { auth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  const userId = session.user.id;

  const body = await readBody(event);
  const { content, moodScore, id } = body;

  if (!content || typeof content !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Content is required and must be a string',
    });
  }

  // Idempotency Check
  if (id) {
    const existing = await db.select().from(journals).where(eq(journals.id, id)).limit(1);
    if (existing.length > 0) {
      if (existing[0]?.userId !== userId) {
        console.error(`[Idempotency] UUID collision or hacking attempt for ${id}`);
        throw createError({ statusCode: 409, statusMessage: "UUID Conflict" });
      }
      console.log(`[Idempotency] Skipping duplicate creation for UUID ${id}`);
      return existing[0];
    }
  }

  try {
    // 1. Generate Embedding first (Sequential execution needed for RAG)
    const embedding = await getEmbedding(content);

    // 2. Retrieve Context (RAG)
    // Fetch top 3 similar journals to provide context
    let contextJournals: JournalEntry[] = [];
    try {
      contextJournals = await searchSimilarJournals(userId, embedding, 3, id);
      console.log(`[RAG] Found ${contextJournals.length} similar journals for context.`);
    } catch (e) {
      console.warn('[RAG] Retrieval failed, proceeding without context:', e);
    }

    // 3. Analyze with Context
    const aiAnalysis = await analyzeJournal(content, contextJournals);

    // 4. Prepare Data (User input overrides AI mood if provided)
    const finalMoodScore = typeof moodScore === 'number' ? moodScore : aiAnalysis.moodScore;

    // 5. Save to DB
    const [inserted] = await db
      .insert(journals)
      .values({
        id: id || undefined, // Use provided UUID or let DB generate (though client should provide it)
        userId,
        content,
        embedding,
        moodScore: finalMoodScore,
        tags: aiAnalysis.tags,
        distortionTags: aiAnalysis.distortionTags,
        advice: aiAnalysis.advice,
        fact: aiAnalysis.fact,
        emotion: aiAnalysis.emotion,
        isAnalysisFailed: aiAnalysis.isAnalysisFailed,
      })
      .returning();

    return inserted;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error),
      data: error,
    });
  }
});
