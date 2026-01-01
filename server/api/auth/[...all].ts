import { auth } from "~/server/utils/auth";
import { db } from "~/server/db";
import { systemSettings } from "~/server/db/schema";

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  if (event.method === "POST" && url.pathname.endsWith("/sign-up/email")) {
    const settings = await db.select().from(systemSettings).limit(1);
    if (settings.length > 0 && !settings[0].registrationEnabled) {
      throw createError({
        statusCode: 403, // Forbidden
        statusMessage: "Registration is currently disabled.",
        message: "現在、新規登録は受け付けていません。"
      });
    }
  }
  return auth.handler(toWebRequest(event));
});
