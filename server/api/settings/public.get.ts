import { db } from "~/server/db";
import { systemSettings } from "~/server/db/schema";

export default defineEventHandler(async (event) => {
  const settings = await db.query.systemSettings.findFirst();

  return {
    registrationEnabled: settings?.registrationEnabled ?? true,
    turnstileSiteKey: settings?.turnstileSiteKey || null,
    // Do NOT return secret key
  };
});
