import { threads, messages, journals } from '@server/db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '~/utils/env';
import { eq, asc, inArray } from 'drizzle-orm';

const client = postgres(env.DATABASE_URL);
const db = drizzle(client);

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, message: 'Thread ID is required' });
  }

  try {
    const threadId = parseInt(id);

    // Fetch thread info
    const [thread] = await db
      .select()
      .from(threads)
      .where(eq(threads.id, threadId));

    if (!thread) {
      throw createError({ statusCode: 404, message: 'Thread not found' });
    }

    // Fetch messages
    const threadMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.thread_id, threadId))
      .orderBy(asc(messages.created_at));

    // Fetch context journals if any
    let contextJournals: any[] = [];
    if (thread.context_ids && thread.context_ids.length > 0) {
      contextJournals = await db
        .select()
        .from(journals)
        .where(inArray(journals.id, thread.context_ids));
    }

    return {
      thread,
      messages: threadMessages,
      contextJournals, // Return context
    };
  } catch (error: any) {
    console.error('Failed to fetch thread details:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch thread details',
    });
  }
});
