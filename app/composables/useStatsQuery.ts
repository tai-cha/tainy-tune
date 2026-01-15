import { db } from '~/utils/local-db';
import { startOfMonth, subMonths, format, isSameDay } from 'date-fns';

export const useStatsQuery = () => {

  const fetchStats = async () => {
    // Try online fetch first
    const isOnline = navigator.onLine;

    if (isOnline) {
      try {
        const data = await $fetch('/api/stats', { timeout: 5000 });
        return data;
      } catch (e) {
        console.warn('Online stats fetch failed, falling back to local calculation', e);
      }
    }

    // Offline Calculation
    return await calculateLocalStats();
  };

  const calculateLocalStats = async () => {
    // Fetch all journals (or last 6 months to match server likely?)
    // Server implementation usually fetches all or limited range.
    // Let's fetch all for simplicity or filter if needed.
    const journals = await db.journalEntries.toArray();

    // 1. Mood History (Daily Average)
    // Group by Date
    const moodMap = new Map<string, { sum: number; count: number }>();

    journals.forEach(j => {
      if (j.moodScore != null && j.createdAt) {
        const dateKey = format(j.createdAt, 'yyyy-MM-dd');
        const curr = moodMap.get(dateKey) || { sum: 0, count: 0 };
        curr.sum += j.moodScore;
        curr.count++;
        moodMap.set(dateKey, curr);
      }
    });

    // Convert to array
    const moodHistory = Array.from(moodMap.entries()).map(([date, val]) => ({
      date,
      score: val.sum / val.count
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    // 2. Distortion Counts
    const distortionCounts: Record<string, number> = {};

    journals.forEach(j => {
      if (j.distortionTags && Array.isArray(j.distortionTags)) {
        j.distortionTags.forEach(tag => {
          distortionCounts[tag] = (distortionCounts[tag] || 0) + 1;
        });
      }
    });

    return {
      moodHistory,
      distortionCounts
    };
  };

  return {
    fetchStats
  };
};
