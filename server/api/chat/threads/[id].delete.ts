import { threads } from '@server/db/schema';

import { eq } from 'drizzle-orm';

import { db } from '@server/db';


export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  try {
    const threadId = parseInt(id);
    await db.delete(threads).where(eq(threads.id, threadId));
    return { success: true };
  } catch (error) {
    console.error('Failed to delete thread:', error);
    throw createError({ statusCode: 500, message: 'Failed to delete thread' });
  }
});
