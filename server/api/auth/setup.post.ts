import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '~/server/utils/auth';
import { env } from '~/utils/env';
import { z } from 'zod';

const setupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  initToken: z.string().min(1)
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email, password, initToken } = setupSchema.parse(body);

  // 1. Validate Init Token
  if (initToken !== env.INIT_ADMIN_PASSWORD) {
    throw createError({
      statusCode: 403,
      message: 'Invalid initialization token.'
    });
  }

  // 2. Check if Admin already exists
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.role, 'admin')
  });

  if (existingAdmin) {
    throw createError({
      statusCode: 400,
      message: 'Admin user already exists.'
    });
  }

  // 3. Create User via Better Auth
  try {
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name
      }
    });

    if (!user) {
      throw createError({
        statusCode: 500,
        message: 'Failed to create user.'
      });
    }

    // 4. Promote to Admin
    // Since Better Auth might create the user with default role (user),
    // we explicitly update it to 'admin'.
    // `user` response structure depends on Better Auth version, usually it provides user object.
    // However, to be safe, we query by email or use ID if available.

    // Attempt to update immediately.
    const createdUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!createdUser) {
      throw createError({
        statusCode: 500,
        message: "User created but not found in DB."
      })
    }

    await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.id, createdUser.id));

    return { success: true };

  } catch (error: any) {
    // Better Auth throws errors that might need handling
    throw createError({
      statusCode: 400,
      message: error.message || 'Setup failed'
    });
  }
});
