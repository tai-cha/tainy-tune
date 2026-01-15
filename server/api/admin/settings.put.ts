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
  const { registrationEnabled, turnstileSiteKey, turnstileSecretKey, allowJournalEditing } = body;

  const existing = await db.select().from(systemSettings).limit(1);

  if (existing.length === 0) {
    await db.insert(systemSettings).values({
      id: 1,
      registrationEnabled: registrationEnabled ?? true,
      turnstileSiteKey,
      turnstileSecretKey,
      allowJournalEditing: allowJournalEditing ?? false, // Default to false
      updatedAt: new Date(),
    });
  } else {
    const updateData: any = { updatedAt: new Date() };
    if (registrationEnabled !== undefined) updateData.registrationEnabled = registrationEnabled;
    if (turnstileSiteKey !== undefined) updateData.turnstileSiteKey = turnstileSiteKey;
    if (turnstileSecretKey !== undefined) updateData.turnstileSecretKey = turnstileSecretKey;
    if (allowJournalEditing !== undefined) updateData.allowJournalEditing = allowJournalEditing;

    await db.update(systemSettings)
      .set(updateData)
      .where(eq(systemSettings.id, existing[0]!.id));
  }

  return { success: true };
});
