import { auth } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session || session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: "Unauthorized" });
  }

  const userId = getRouterParam(event, 'id');
  if (!userId) {
    throw createError({ statusCode: 400, message: "User ID required" });
  }

  const body = await readBody(event);
  const { newPassword } = body;

  try {
    // Attempt to use setPassword if admin plugin exposes it via internal or api
    // Type casting auth.api for admin methods often needed if types aren't inferred
    // Check if auth.api.setPassword exists
    await auth.api.setUserPassword({
      body: {
        newPassword,
        userId
      },
      headers: event.headers
    });
    return { success: true };
  } catch (e: any) {
    throw createError({ statusCode: 500, message: e.message || "Failed to reset password" });
  }
});
