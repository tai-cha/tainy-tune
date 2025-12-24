import { threads } from '@server/db/schema';

import { eq, and } from 'drizzle-orm';
import { db } from '@server/db';
import { auth } from '@server/utils/auth';


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



    const session = await auth.api.getSession({ headers: event.headers });
    if (!session) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    const userId = session.user.id;

    const [updated] = await db
      .update(threads)
      .set(updateData)
      .where(and(eq(threads.id, threadId), eq(threads.userId, userId)))
      .returning();

    return updated;
  } catch (error) {
    console.error('Failed to update thread:', error);
    throw createError({ statusCode: 500, message: 'Failed to update thread' });
  }
});
