import { auth } from "~/server/utils/auth";
import { db } from "~/server/db";
import { systemSettings } from "~/server/db/schema";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session || session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: "Unauthorized" });
  }

  const settings = await db.select().from(systemSettings).limit(1);
  if (settings.length === 0) {
    return { registrationEnabled: true, turnstileSiteKey: null, turnstileSecretKey: null, allowJournalEditing: false };
  }
  return settings[0];
});
