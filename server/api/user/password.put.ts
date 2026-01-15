import { auth } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const body = await readBody(event);
  const { currentPassword, newPassword } = body;

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword },
      headers: event.headers
    });
  } catch (error: any) {
    throw createError({ statusCode: 400, message: error.body?.message || error.message || 'Failed to change password' });
  }

  return { success: true };
});
