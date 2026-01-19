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
  const { durationSeconds } = body;

  if (typeof durationSeconds !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid durationSeconds' });
  }

  // Pure Insert logic
  const inserted = await db.insert(meditations)
    .values({
      userId,
      durationSeconds,
      createdAt: new Date(),
    })
    .returning();

  return { status: 'created', data: inserted[0] };
});
