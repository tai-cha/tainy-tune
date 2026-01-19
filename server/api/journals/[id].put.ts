
import { eq, and } from 'drizzle-orm';
import { journals, systemSettings } from '~/server/db/schema';
import { db } from '~/server/db';
import { auth } from '~/server/utils/auth';
import { getEmbedding } from '~/server/utils/embedding';
import { analyzeJournal, type JournalEntry } from '~/server/utils/ai';
import { searchSimilarJournals } from '~/server/utils/retrieval';

type JournalUpdatePayload = Partial<typeof journals.$inferInsert>;

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const id = getRouterParam(event, 'id') || '';
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid ID",
    });
  }

  const body = await readBody(event);
  const { content, moodScore } = body;

  if (typeof content !== 'string' || content.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Content is required and must be a non-empty string.',
    });
  }

  if (typeof moodScore !== 'number') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Mood score is required and must be a number.',
    });
  }

  // Fetch existing first to compare
  const [existing] = await db.select().from(journals).where(
    and(eq(journals.id, id), eq(journals.userId, session.user.id))
  ).limit(1);

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  // 1. Check Edit Permission
  const settings = await db.select().from(systemSettings).limit(1);
  const allowEditing = (settings.length > 0 && settings[0]) ? settings[0].allowJournalEditing : false;

  if (!allowEditing) {
    // If different content/mood and editing disabled -> 403
    // Note: We only check user-provided fields (content, moodScore) to determine
    // if this is an actual edit attempt vs. an idempotent retry of the same request.
    // Server-generated fields (tags, distortionTags, advice, fact, emotion, embedding)
    // are not part of the request and thus not checked for idempotency.
    if (existing.content !== content || existing.moodScore !== moodScore) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Journal editing is disabled by administrator.',
      });
    }

    // Same content and moodScore, so this is an idempotent retry. Return existing record.
    return existing;
  }

  // 2. Perform Update
  let newEmbedding: number[] | undefined;
  let aiAnalysis: Awaited<ReturnType<typeof analyzeJournal>> | undefined;
  let analysisFailed = false;

  // Generate embedding first if content changed
  if (content !== existing.content) {
    try {
      newEmbedding = await getEmbedding(content);
    } catch (error: unknown) {
      console.error('Failed to generate embedding:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to generate embedding for journal content.',
      });
    }

    // 2a. Re-Analyze if content changed
    try {
      // Retrieve Context (RAG) using the NEW embedding
      // We exclude the current journal ID from context search to avoid self-reference (though embedding search uses cosine similarity so exact match might be top 1)
      // searchSimilarJournals(userId, vector, limit, excludeId)
      let contextJournals: JournalEntry[] = [];
      try {
        contextJournals = await searchSimilarJournals(session.user.id, newEmbedding!, 3, id) satisfies JournalEntry[];
      } catch (e) {
        console.warn('[RAG] Retrieval failed during update, proceeding without context:', e);
      }

      aiAnalysis = await analyzeJournal(content, contextJournals);

    } catch (error) {
      console.error('Failed to re-analyze journal:', error);
      analysisFailed = true;
      // We don't fail the whole update if analysis fails, but we might want to flag it?
      // For now, let's log and proceed, keeping old analysis or setting isAnalysisFailed?
      // Existing logic in post.ts doesn't explicitly handle analysis failure by fallback, it lets it throw or return default.
      // analyzeJournal usually returns a structure even on failure (fallback).
    }
  } else {
    analysisFailed = existing.isAnalysisFailed ?? false;
  }

  // Update database
  try {
    const updateData: JournalUpdatePayload = {
      content,
      moodScore,
      isAnalysisFailed: analysisFailed, // Set based on analysis outcome
      updatedAt: new Date(),
    };

    if (newEmbedding) {
      updateData.embedding = newEmbedding;
    }

    if (aiAnalysis) {
      updateData.tags = aiAnalysis.tags;
      updateData.distortionTags = aiAnalysis.distortionTags;
      updateData.advice = aiAnalysis.advice;
      updateData.fact = aiAnalysis.fact;
      updateData.emotion = aiAnalysis.emotion;
      // We do NOT override moodScore here because `moodScore` in body comes from user input (slider)
      // which takes precedence over AI.
    }

    const [updated] = await db
      .update(journals)
      .set(updateData)
      .where(and(eq(journals.id, id), eq(journals.userId, session.user.id)))
      .returning();

    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Journal entry not found or permission denied.',
      });
    }

    return updated;

  } catch (error: unknown) {
    // If it's a known error (e.g. 404 from above), rethrow it
    if (typeof error === 'object' && error != null && 'statusCode' in error) {
      throw error;
    }

    console.error('Failed to update journal:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update journal entry.',
    });
  }
});
