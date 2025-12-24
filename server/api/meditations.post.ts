import { defineEventHandler, readBody } from 'h3';
import { db } from '@server/db'; // Shared db instance
import { meditations } from '@server/db/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { duration_seconds } = body;

  if (typeof duration_seconds !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid duration_seconds' });
  }

  // Pure Insert logic
  const inserted = await db.insert(meditations)
    .values({
      duration_seconds,
      created_at: new Date(),
    })
    .returning();

  return { status: 'created', data: inserted[0] };
});
