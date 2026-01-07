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
  const { registrationEnabled, turnstileSiteKey, turnstileSecretKey } = body;

  const existing = await db.select().from(systemSettings).limit(1);

  if (existing.length === 0) {
    await db.insert(systemSettings).values({
      id: 1,
      // Default to true if undefined, but it should be provided or default in schema? Schema default is true.
      // But here we insert. If registrationEnabled is undefined, we should probably use default or true.
      // However, usually first insert happens via seed or manual.
      // If we insert here, we should provide values.
      registrationEnabled: registrationEnabled ?? true,
      turnstileSiteKey,
      turnstileSecretKey,
      updatedAt: new Date(),
    });
  } else {
    const updateData: any = { updatedAt: new Date() };
    if (registrationEnabled !== undefined) updateData.registrationEnabled = registrationEnabled;
    if (turnstileSiteKey !== undefined) updateData.turnstileSiteKey = turnstileSiteKey;
    if (turnstileSecretKey !== undefined) updateData.turnstileSecretKey = turnstileSecretKey;

    await db.update(systemSettings)
      .set(updateData)
      .where(eq(systemSettings.id, existing[0].id));
  }

  return { success: true };
});
