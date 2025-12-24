import { defineEventHandler, readBody } from 'h3';
import { db } from '@server/db'; // Shared db instance
import { checkins } from '@server/db/schema';
import { sql, desc, gt } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { mood_score } = body;

  if (typeof mood_score !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mood_score' });
  }

  // 1. Check for existing check-in within the last 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const existingCheckin = await db.select()
    .from(checkins)
    .where(gt(checkins.created_at, oneHourAgo))
    .orderBy(desc(checkins.created_at))
    .limit(1);

  if (existingCheckin.length > 0) {
    // 2. Update existing
    const targetId = existingCheckin[0].id;
    const updated = await db.update(checkins)
      .set({
        mood_score,
        created_at: new Date() // Update timestamp to now? Or keep original? "Update mood_score & created_at" was the plan.
      })
      .where(sql`${checkins.id} = ${targetId}`)
      .returning();

    return { status: 'updated', data: updated[0] };
  } else {
    // 3. Insert new
    const inserted = await db.insert(checkins)
      .values({
        mood_score,
        created_at: new Date(),
      })
      .returning();

    return { status: 'created', data: inserted[0] };
  }
});
