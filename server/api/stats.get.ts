import { journals } from '../db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../utils/env';
import { desc, and, gte, lte, sql } from 'drizzle-orm';
import { getValidDistortionKeys } from '../utils/locale';

const client = postgres(env.DATABASE_URL);
const db = drizzle(client);

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  // Default to last 30 days if not specified
  const endDate = query.endDate ? new Date(query.endDate as string) : new Date();
  const startDate = query.startDate
    ? new Date(query.startDate as string)
    : new Date(new Date().setDate(endDate.getDate() - 30));

  try {
    const records = await db
      .select({
        created_at: journals.created_at,
        mood_score: journals.mood_score,
        distortion_tags: journals.distortion_tags,
      })
      .from(journals)
      .where(
        and(
          gte(journals.created_at, startDate),
          lte(journals.created_at, endDate)
        )
      )
      .orderBy(desc(journals.created_at));

    // Aggregate mood scores by date (average if multiple per day)
    const moodMap: Record<string, { sum: number; count: number }> = {};

    records.forEach(r => {
      if (r.mood_score && r.created_at) {
        const date = r.created_at.toISOString().split('T')[0];
        if (!moodMap[date]) {
          moodMap[date] = { sum: 0, count: 0 };
        }
        moodMap[date].sum += r.mood_score;
        moodMap[date].count += 1;
      }
    });

    const moodHistory = Object.entries(moodMap)
      .map(([date, data]) => ({
        date,
        score: Math.round((data.sum / data.count) * 10) / 10 // 1 decimal place
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Aggregate distortions
    const distortionCounts: Record<string, number> = {};

    // Initialize all known keys to 0
    getValidDistortionKeys().forEach(key => {
      distortionCounts[key] = 0;
    });

    records.forEach(r => {
      if (r.distortion_tags && Array.isArray(r.distortion_tags)) {
        r.distortion_tags.forEach(tag => {
          // Only increment if it's a valid key (or if you want to track unknown ones too, remove the check)
          // For now, let's just increment safely.
          distortionCounts[tag] = (distortionCounts[tag] || 0) + 1;
        });
      }
    });

    return {
      moodHistory,
      distortionCounts
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch statistics',
    });
  }
});
