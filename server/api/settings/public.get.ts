import { db } from "~/server/db";
import { systemSettings } from "~/server/db/schema";

export default defineEventHandler(async () => {
  const settings = await db.select().from(systemSettings).limit(1);
  if (settings.length === 0) {
    // Default to true if no settings exist yet
    return { registrationEnabled: true };
  }
  return { registrationEnabled: settings[0].registrationEnabled };
});
