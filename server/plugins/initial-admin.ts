import { eq, isNull } from 'drizzle-orm';
import { db } from '~/server/db';
import { users, journals, threads, checkins, meditations } from '~/server/db/schema';
import { auth } from '~/server/utils/auth';
import { env } from '~/utils/env';

export default defineNitroPlugin(async (nitroApp) => {
  // 1. Check if any user exists
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    console.log('[Auth] Users exist, skipping admin initialization.');
    return;
  }

  console.log('[Auth] No users found. Initializing Admin user...');

  const adminEmail = 'admin@local.host';
  const adminPassword = env.INIT_ADMIN_PASSWORD;

  // Explicitly verify password existence as requested
  if (!adminPassword) {
    console.error('[Auth] INIT_ADMIN_PASSWORD is not set!');
    throw new Error('INIT_ADMIN_PASSWORD environment variable is required for initial setup. Please set it in your .env file.');
  }
  const adminName = 'Admin';

  try {
    // 2. Create Admin User using Better Auth API
    // We mock a request context or use the internal API if supported.
    // Better Auth's `api` methods usually expect a H3Event or standard Request compatibility,
    // but some adapters allow direct calls.
    // If this fails due to context, we might need to manually hash password, 
    // but let's try the standard API first which handles hashing.
    // Actually, `auth.api` returns endpoints. We can use `auth.api.signUpEmail` directly?
    // It usually requires `headers` passed.

    // Attempting direct call. If it fails, we will need to verify hashing.
    // However, for server-side seeding, we might need 'better-auth/node' or similar helper?
    // Let's rely on `auth.api.signUpEmail` accepting a body.

    const newUser = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
      }
    });

    if (!newUser) {
      console.error('[Auth] Failed to create admin user (no response).');
      return;
    }

    // Depending on response structure, get ID.
    // newUser might be the user object or session.
    // Let's refetch to be sure we have the ID.
    const createdUser = await db.query.users.findFirst({
      where: eq(users.email, adminEmail)
    });

    if (!createdUser) {
      console.error('[Auth] Failed to find created admin user.');
      return;
    }

    console.log(`[Auth] Admin created: ${createdUser.id}`);

    // 3. Migrate existing data (orphaned records)
    const adminId = createdUser.id;

    const migrateTable = async (table: any, name: string) => {
      const result = await db.update(table)
        .set({ userId: adminId })
        .where(isNull(table.userId));
      // result in postgres.js driver usually isn't row count directly unless configured
      console.log(`[Auth] Migrated ${name} to Admin.`);
    };

    await migrateTable(journals, 'journals');
    await migrateTable(threads, 'threads');
    await migrateTable(checkins, 'checkins');
    await migrateTable(meditations, 'meditations');

    console.log('[Auth] Initialization complete.');

  } catch (error) {
    console.error('[Auth] Error initializing admin:', error);
  }
});
