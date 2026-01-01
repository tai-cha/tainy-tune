import { auth } from "~/server/utils/auth";
import { db } from "~/server/db";
import { systemSettings } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session || session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: "Unauthorized" });
  }

  const body = await readBody(event);
  const { registrationEnabled } = body;

  const existing = await db.select().from(systemSettings).limit(1);

  if (existing.length === 0) {
    await db.insert(systemSettings).values({
      id: 1,
      registrationEnabled,
      updatedAt: new Date(),
    });
  } else {
    await db.update(systemSettings)
      .set({ registrationEnabled, updatedAt: new Date() })
      .where(eq(systemSettings.id, existing[0].id));
  }

  return { success: true };
});
