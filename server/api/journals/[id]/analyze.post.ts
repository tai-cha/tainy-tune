import { journals } from '@server/db/schema';
import { analyzeJournal } from '@server/utils/ai';
import { getEmbedding } from '@server/utils/embedding';
import { searchSimilarJournals } from '@server/utils/retrieval';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '~/utils/env';
import { eq } from 'drizzle-orm';

const client = postgres(env.DATABASE_URL);
const db = drizzle(client);

export default defineEventHandler(async (event) => {
  const idStr = getRouterParam(event, 'id');
  if (!idStr || isNaN(Number(idStr))) {
    throw createError({ statusCode: 400, message: 'Invalid ID' });
  }
  const id = Number(idStr);

  try {
    // 1. Fetch Journal
    const [journal] = await db
      .select()
      .from(journals)
      .where(eq(journals.id, id));

    if (!journal) {
      throw createError({ statusCode: 404, message: 'Journal not found' });
    }

    // 2. Ensure Embedding exists (for RAG)
    let embedding = journal.embedding;
    let needUpdateEmbedding = false;

    if (!embedding) {
      console.log(`[RAG] Embedding missing for journal ${id}, generating...`);
      embedding = await getEmbedding(journal.content);
      needUpdateEmbedding = true;
    }

    // 3. Retrieve Context (RAG)
    // Exclude current ID to avoid self-reference
    let contextJournals: any[] = [];
    try {
      contextJournals = await searchSimilarJournals(embedding, 3, id);
      console.log(`[RAG] Found ${contextJournals.length} similar journals for context (Re-analysis).`);
    } catch (e) {
      console.warn('[RAG] Retrieval failed, proceeding without context:', e);
    }

    // 4. Re-analyze with Context
    const aiAnalysis = await analyzeJournal(journal.content, contextJournals);

    if (aiAnalysis.is_analysis_failed) {
      throw createError({
        statusCode: 429,
        message: 'AI analysis failed again (Rate Limit). Please try later.',
      });
    }

    // 5. Update DB
    const updateData: any = {
      mood_score: aiAnalysis.mood_score,
      tags: aiAnalysis.tags,
      distortion_tags: aiAnalysis.distortion_tags,
      advice: aiAnalysis.advice,
      fact: aiAnalysis.fact,
      emotion: aiAnalysis.emotion,
      is_analysis_failed: aiAnalysis.is_analysis_failed,
    };

    // If we generated embedding on the fly, save it too
    if (needUpdateEmbedding) {
      updateData.embedding = embedding;
    }

    const [updated] = await db
      .update(journals)
      .set(updateData)
      .where(eq(journals.id, id))
      .returning();

    return updated;

  } catch (error: any) {
    console.error('Re-analysis failed:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal Server Error',
    });
  }
});
