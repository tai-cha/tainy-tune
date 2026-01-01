import { auth } from "~/server/utils/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session || session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: "Unauthorized" });
  }

  const userId = getRouterParam(event, 'id');
  if (!userId) throw createError({ statusCode: 400, statusMessage: "Missing ID" });

  const body = await readBody(event);
  const { role } = body;

  if (role !== 'admin' && role !== 'user') {
    throw createError({ statusCode: 400, statusMessage: "Invalid role" });
  }

  await db.update(users).set({ role }).where(eq(users.id, userId));
  return { success: true };
});
