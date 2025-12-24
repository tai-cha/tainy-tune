import { defineEventHandler, readBody } from 'h3';
import { db } from '@server/db'; // Shared db instance
import { meditations } from '@server/db/schema';

import { auth } from '@server/utils/auth';

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  const userId = session.user.id;
  const body = await readBody(event);
  const { duration_seconds } = body;

  if (typeof duration_seconds !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid duration_seconds' });
  }

  // Pure Insert logic
  const inserted = await db.insert(meditations)
    .values({
      userId,
      duration_seconds,
      created_at: new Date(),
    })
    .returning();

  return { status: 'created', data: inserted[0] };
});
