import { journals } from '@server/db/schema';
import { analyzeJournal } from '@server/utils/ai';
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

    // 2. Re-analyze
    const aiAnalysis = await analyzeJournal(journal.content);

    // If analysis failed again (fallback returned), throw 429 or similar?
    // analyzeJournal returns fallback on error.
    if (aiAnalysis.is_analysis_failed) {
      throw createError({
        statusCode: 429,
        message: 'AI analysis failed again (Rate Limit). Please try later.',
      });
    }

    // 3. Update DB
    // Only update AI fields. Preserve user content/embedding unless needed.
    // Ideally user might have edited mood score manually?
    // User said "Only those failed analysis".
    // So we overwite mood_score, tags, advice.
    const [updated] = await db
      .update(journals)
      .set({
        mood_score: aiAnalysis.mood_score,
        tags: aiAnalysis.tags,
        distortion_tags: aiAnalysis.distortion_tags,
        advice: aiAnalysis.advice,
        is_analysis_failed: aiAnalysis.is_analysis_failed,
      })
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
