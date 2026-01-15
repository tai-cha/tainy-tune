import { threads, messages } from '@server/db/schema';

import { desc, eq, sql, and } from 'drizzle-orm';
import { db } from '@server/db';
import { auth } from '@server/utils/auth';


export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  const userId = session.user.id;

  try {
    // Fetch threads with last message preview (optional, but good for UI)
    // For MVP, just fetching threads ordered by updated_at
    const allThreads = await db
      .select()
      .from(threads)
      .where(eq(threads.userId, userId))
      .orderBy(sql`${threads.pinnedAt} DESC NULLS LAST`, desc(threads.updatedAt));

    return allThreads;
  } catch (error) {
    console.error('Failed to fetch threads:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch threads',
    });
  }
});
