import { defineEventHandler, readBody } from 'h3';
import { db } from '@server/db'; // Shared db instance
import { checkins } from '@server/db/schema';
import { auth } from '@server/utils/auth';
import { and, eq, sql, desc, gt } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  const userId = session.user.id;

  const body = await readBody(event);
  const { moodScore } = body;

  if (typeof moodScore !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid moodScore' });
  }

  // 1. Check for existing check-in within the last 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const existingCheckin = await db.select()
    .from(checkins)
    .where(and(eq(checkins.userId, userId), gt(checkins.createdAt, oneHourAgo)))
    .orderBy(desc(checkins.createdAt))
    .limit(1);

  if (existingCheckin.length > 0) {
    // 2. Update existing
    const targetId = existingCheckin[0]!.id;
    const updated = await db.update(checkins)
      .set({
        moodScore,
        createdAt: new Date() // Update timestamp to now
      })
      .where(and(eq(checkins.id, targetId), eq(checkins.userId, userId)))
      .returning();

    return { status: 'updated', data: updated[0] };
  } else {
    // 3. Insert new
    const inserted = await db.insert(checkins)
      .values({
        userId,
        moodScore,
        createdAt: new Date(),
      })
      .returning();

    return { status: 'created', data: inserted[0] };
  }
});
