import { journals } from '@server/db/schema';

import { eq, and } from 'drizzle-orm';
import { db } from '@server/db';
import { auth } from '@server/utils/auth';


export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid ID' });
  }

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  const userId = session.user.id;

  try {
    const deleted = await db.delete(journals)
      .where(and(eq(journals.id, id), eq(journals.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      throw createError({ statusCode: 404, message: 'Journal not found or distinct' });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete journal:', error);
    throw createError({ statusCode: 500, message: 'Failed to delete journal' });
  }
});
