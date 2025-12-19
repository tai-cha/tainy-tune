import { threads, messages } from '@server/db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '~/utils/env';
import { desc, eq, sql } from 'drizzle-orm';

const client = postgres(env.DATABASE_URL);
const db = drizzle(client);

export default defineEventHandler(async (event) => {
  try {
    // Fetch threads with last message preview (optional, but good for UI)
    // For MVP, just fetching threads ordered by updated_at
    const allThreads = await db
      .select()
      .from(threads)
      .orderBy(sql`${threads.pinned_at} DESC NULLS LAST`, desc(threads.updated_at));

    return allThreads;
  } catch (error) {
    console.error('Failed to fetch threads:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch threads',
    });
  }
});
