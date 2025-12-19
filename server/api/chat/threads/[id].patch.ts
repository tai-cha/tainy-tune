import { threads } from '@server/db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '~/utils/env';
import { eq } from 'drizzle-orm';

const client = postgres(env.DATABASE_URL);
const db = drizzle(client);

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  const body = await readBody(event);
  const { title, isPinned } = body;

  try {
    const threadId = parseInt(id);

    const updateData: any = {};
    if (typeof title !== 'undefined') updateData.title = title;

    if (typeof isPinned !== 'undefined') {
      // If pinning, set pinned_at to now. If unpinning, set to null.
      updateData.pinned_at = isPinned ? new Date() : null;
    }



    const [updated] = await db
      .update(threads)
      .set(updateData)
      .where(eq(threads.id, threadId))
      .returning();

    return updated;
  } catch (error) {
    console.error('Failed to update thread:', error);
    throw createError({ statusCode: 500, message: 'Failed to update thread' });
  }
});
