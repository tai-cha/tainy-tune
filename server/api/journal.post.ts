import { journals } from '@server/db/schema';
import { analyzeJournal } from '@server/utils/ai';
import { getEmbedding } from '@server/utils/embedding';
import { searchSimilarJournals } from '@server/utils/retrieval';


// Initialize Drizzle client
import { db } from '@server/db';


export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { content, mood } = body;

  if (!content || typeof content !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Content is required and must be a string',
    });
  }

  try {
    // 1. Generate Embedding first (Sequential execution needed for RAG)
    const embedding = await getEmbedding(content);

    // 2. Retrieve Context (RAG)
    // Fetch top 3 similar journals to provide context
    // No excludeId needed for new entry (DB doesn't have it yet)
    let contextJournals: any[] = [];
    try {
      contextJournals = await searchSimilarJournals(embedding, 3);
      console.log(`[RAG] Found ${contextJournals.length} similar journals for context.`);
    } catch (e) {
      console.warn('[RAG] Retrieval failed, proceeding without context:', e);
    }

    // 3. Analyze with Context
    const aiAnalysis = await analyzeJournal(content, contextJournals);

    // 4. Prepare Data (User input overrides AI mood if provided)
    const finalMoodScore = typeof mood === 'number' ? mood : aiAnalysis.mood_score;

    // 5. Save to DB
    const [inserted] = await db
      .insert(journals)
      .values({
        content,
        embedding,
        mood_score: finalMoodScore,
        tags: aiAnalysis.tags,
        distortion_tags: aiAnalysis.distortion_tags,
        advice: aiAnalysis.advice,
        fact: aiAnalysis.fact,
        emotion: aiAnalysis.emotion,
        is_analysis_failed: aiAnalysis.is_analysis_failed,
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
