import { journals } from '@server/db/schema';
import { analyzeJournal, type JournalEntry } from '@server/utils/ai';
import { getEmbedding } from '@server/utils/embedding';
import { searchSimilarJournals } from '@server/utils/retrieval';

import { eq, and } from 'drizzle-orm';

import { db } from '@server/db';


import { auth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  const userId = session.user.id;

  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid ID' });
  }

  try {
    // 1. Fetch Journal
    const [journal] = await db
      .select()
      .from(journals)
      .where(and(
        eq(journals.id, id),
        eq(journals.userId, userId)
      ));

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
    let contextJournals: JournalEntry[] = [];
    try {
      contextJournals = await searchSimilarJournals(userId, embedding, 3, id);
      console.log(`[RAG] Found ${contextJournals.length} similar journals for context (Re-analysis).`);
    } catch (e) {
      console.warn('[RAG] Retrieval failed, proceeding without context:', e);
    }

    // 4. Re-analyze with Context
    const aiAnalysis = await analyzeJournal(journal.content, contextJournals);

    if (aiAnalysis.isAnalysisFailed) {
      throw createError({
        statusCode: 429,
        message: 'AI analysis failed again (Rate Limit). Please try later.',
      });
    }

    // 5. Update DB
    const updateData: any = {
      moodScore: aiAnalysis.moodScore,
      tags: aiAnalysis.tags,
      distortionTags: aiAnalysis.distortionTags,
      advice: aiAnalysis.advice,
      fact: aiAnalysis.fact,
      emotion: aiAnalysis.emotion,
      isAnalysisFailed: aiAnalysis.isAnalysisFailed,
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
