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
  const { content, mood, clientUuid } = body;

  if (!content || typeof content !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Content is required and must be a string',
    });
  }

  // Idempotency Check
  if (clientUuid) {
    const existing = await db.select().from(journals).where(eq(journals.clientUuid, clientUuid)).limit(1);
    if (existing.length > 0) {
      // Check if user ID matches? Should be safe as UUIDs are unique, but good practice.
      if (existing.length > 0 && existing[0] && existing[0].userId !== userId) {
        // Collision? Extremely rare for UUID v4.
        console.error(`[Idempotency] UUID collision or hacking attempt for ${clientUuid}`);
        // Treat as normal processing or error? Error safest.
        throw createError({ statusCode: 409, statusMessage: "UUID Conflict" });
      }
      console.log(`[Idempotency] Skipping duplicate creation for UUID ${clientUuid}`);
      return existing[0];
    }
  }

  try {
    // 1. Generate Embedding first (Sequential execution needed for RAG)
    const embedding = await getEmbedding(content);

    // ... (rest of logic: context search, analysis)
    // To match original indentation, I will just replicate context.

    // 2. Retrieve Context (RAG)
    // Fetch top 3 similar journals to provide context
    let contextJournals: JournalEntry[] = [];
    try {
      contextJournals = await searchSimilarJournals(userId, embedding, 3);
      console.log(`[RAG] Found ${contextJournals.length} similar journals for context.`);
    } catch (e) {
      console.warn('[RAG] Retrieval failed, proceeding without context:', e);
    }

    // 3. Analyze with Context
    const aiAnalysis = await analyzeJournal(content, contextJournals);

    // 4. Prepare Data (User input overrides AI mood if provided)
    const finalMoodScore = typeof mood === 'number' ? mood : aiAnalysis.moodScore;

    // 5. Save to DB
    const [inserted] = await db
      .insert(journals)
      .values({
        userId,
        content,
        embedding,
        moodScore: finalMoodScore,
        clientUuid: clientUuid || null, // Add clientUuid
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
