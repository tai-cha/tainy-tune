import { db } from "~/server/db";
import { systemSettings } from "~/server/db/schema";

export default defineEventHandler(async (event) => {
  const settings = await db.query.systemSettings.findFirst({
    orderBy: (t, { desc }) => [desc(t.updatedAt)]
  });

  return {
    registrationEnabled: settings?.registrationEnabled ?? true,
    turnstileSiteKey: settings?.turnstileSiteKey || null,
    allowJournalEditing: settings?.allowJournalEditing ?? false, // Safe access
    // Do NOT return secret key
  };
});
