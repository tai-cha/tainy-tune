import { threads } from '@server/db/schema';

import { eq, and } from 'drizzle-orm';
import { db } from '@server/db';
import { auth } from '@server/utils/auth';


export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  try {
    const threadId = parseInt(id);
    const session = await auth.api.getSession({ headers: event.headers });
    if (!session) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    const userId = session.user.id;

    await db.delete(threads).where(and(eq(threads.id, threadId), eq(threads.userId, userId)));
    return { success: true };
  } catch (error) {
    console.error('Failed to delete thread:', error);
    throw createError({ statusCode: 500, message: 'Failed to delete thread' });
  }
});
