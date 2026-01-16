
import { eq, and } from 'drizzle-orm';
import { journals, systemSettings } from '~/server/db/schema';
import { db } from '~/server/db';
import { auth } from '~/server/utils/auth';
import { getEmbedding } from '~/server/utils/embedding';

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
  const { content, moodScore, tags } = body;

  if (typeof content !== 'string' || content.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Content is required and must be a non-empty string.',
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
    if (existing.content !== content || existing.moodScore !== moodScore) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Journal editing is disabled by administrator.',
      });
    }

    // Content is same, so it's a no-op / idempotent retry. Return current.
    return existing;
  }

  // 2. Perform Update
  let newEmbedding: number[] | undefined;
  
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
  }

  // Update database
  try {
    const updateData: any = {
      content,
      moodScore,
      isAnalysisFailed: false, // Reset flag on manual edit
      tags,
      updatedAt: new Date(),
    };

    if (newEmbedding) {
      updateData.embedding = newEmbedding;
    }

    const [updated] = await db
      .update(journals)
      .set(updateData)
      .where(and(eq(journals.id, id), eq(journals.userId, session.user.id)))
      .returning();

    return updated;

  } catch (error: unknown) {
    console.error('Failed to update journal:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update journal entry.',
    });
  }
});
