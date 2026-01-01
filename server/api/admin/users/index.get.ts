import { auth } from "~/server/utils/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session || session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: "Unauthorized" });
  }

  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  return allUsers;
});
