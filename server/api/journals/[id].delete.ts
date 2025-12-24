import { journals } from '@server/db/schema';

import { eq } from 'drizzle-orm';

import { db } from '@server/db';


export default defineEventHandler(async (event) => {
  const idStr = getRouterParam(event, 'id');
  if (!idStr || isNaN(Number(idStr))) {
    throw createError({ statusCode: 400, message: 'Invalid ID' });
  }
  const id = Number(idStr);

  try {
    await db.delete(journals).where(eq(journals.id, id));
    return { success: true };
  } catch (error) {
    console.error('Failed to delete journal:', error);
    throw createError({ statusCode: 500, message: 'Failed to delete journal' });
  }
});
