import { db } from '~/utils/local-db';
import type { JournalEntry } from '~/utils/local-db';

interface JournalQueryParams {
  startDate?: string | Date;
  endDate?: string | Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export const useJournalQuery = () => {
  const { $client } = useNuxtApp();

  const fetchJournals = async (params: JournalQueryParams) => {
    // Try online fetch first (if online)
    // We can check navigator.onLine but useFetch handles errors too.
    const isOnline = navigator.onLine;

    if (isOnline) {
      try {
        const query: any = {};
        if (params.startDate) query.startDate = new Date(params.startDate).toISOString();
        if (params.endDate) query.endDate = new Date(params.endDate).toISOString();
        if (params.search) query.search = params.search;
        if (params.limit) query.limit = params.limit;
        if (params.offset) query.offset = params.offset;

        const data = await $fetch<JournalEntry[]>('/api/journals', { query });
        return data;
      } catch (e) {
        console.warn('Online fetch failed, falling back to local DB', e);
        // Fallback to local DB below
      }
    }

    // Local DB Query (Dexie)
    return await queryLocalDB(params);
  };

  const queryLocalDB = async (params: JournalQueryParams) => {
    let collection = db.journalEntries.orderBy('createdAt').reverse();

    // Date Range
    if (params.startDate || params.endDate) {
      const start = params.startDate ? new Date(params.startDate) : new Date(0);
      const end = params.endDate ? new Date(params.endDate) : new Date(8640000000000000); // Far future

      // Dexie doesn't support complex ordering + range easily without compound index.
      // For MVP, we filter in memory or use logic.
      // 'createdAt' is indexed. 
      collection = db.journalEntries
        .where('createdAt')
        .between(start, end, true, true)
        .reverse();
    }

    // Search & Filter
    let result = await collection.toArray();

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(j => j.content?.toLowerCase()?.includes(q));
    }

    // Pagination
    if (params.offset !== undefined || params.limit !== undefined) {
      const offset = params.offset || 0;
      const limit = params.limit || result.length;
      result = result.slice(offset, offset + limit);
    }

    return result;
  };

  return {
    fetchJournals
  };
};
