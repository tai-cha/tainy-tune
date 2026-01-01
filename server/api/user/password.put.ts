import { auth } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const body = await readBody(event);
  const { currentPassword, newPassword } = body;

  const res = await auth.api.changePassword({
    body: { currentPassword, newPassword },
    headers: event.headers
  });

  if (res?.error) {
    throw createError({ statusCode: 400, message: res.error.message });
  }

  return { success: true };
});
