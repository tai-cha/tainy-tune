import { journals, checkins } from '@server/db/schema';
import { db } from '@server/db';
import { and, gte, eq } from 'drizzle-orm';
import { getValidDistortionKeys } from '@server/utils/locale';
import { auth } from '@server/utils/auth';

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  const userId = session.user.id;

  // Defaults to 3 months for stats history
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  try {
    const [journalData, checkinData] = await Promise.all([
      db
        .select({
          createdAt: journals.createdAt,
          moodScore: journals.moodScore,
          distortionTags: journals.distortionTags,
        })
        .from(journals)
        .where(
          and(
            eq(journals.userId, userId),
            gte(journals.createdAt, threeMonthsAgo)
          )
        ),
      db
        .select({
          moodScore: checkins.moodScore,
          createdAt: checkins.createdAt,
        })
        .from(checkins)
        .where(
          and(
            eq(checkins.userId, userId),
            gte(checkins.createdAt, threeMonthsAgo)
          )
        ),
    ]);

    // Merge for Mood History
    // We want a unified list of { date, score }
    const allMoods: { date: Date; score: number }[] = [];

    journalData.forEach((j) => {
      if (typeof j.moodScore === 'number' && j.createdAt) {
        allMoods.push({ date: j.createdAt, score: j.moodScore });
      }
    });

    checkinData.forEach((c) => {
      if (typeof c.moodScore === 'number' && c.createdAt) {
        allMoods.push({ date: c.createdAt, score: c.moodScore });
      }
    });

    // Group by YYYY-MM-DD
    const moodMap: Record<string, { sum: number; count: number }> = {};

    allMoods.forEach((item) => {
      const dateKey = item.date.toISOString().split('T')[0] || 'unknown';
      if (!moodMap[dateKey]) {
        moodMap[dateKey] = { sum: 0, count: 0 };
      }
      moodMap[dateKey].sum += item.score;
      moodMap[dateKey].count += 1;
    });

    const moodHistory = Object.keys(moodMap)
      .map((date) => {
        const data = moodMap[date];
        if (!data) return { date, score: 0 };
        return {
          date,
          score: Math.round((data.sum / data.count) * 10) / 10,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Cleanup distortions
    const distortionCounts: Record<string, number> = {};

    // Initialize standard keys
    getValidDistortionKeys().forEach((key) => {
      distortionCounts[key] = 0;
    });

    journalData.forEach((j) => {
      if (j.distortionTags && Array.isArray(j.distortionTags)) {
        j.distortionTags.forEach((tag) => {
          distortionCounts[tag] = (distortionCounts[tag] || 0) + 1;
        });
      }
    });

    return {
      moodHistory,
      distortionCounts,
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch statistics',
    });
  }
});
