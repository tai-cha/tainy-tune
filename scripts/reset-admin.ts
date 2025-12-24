import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../server/db/schema';

const { users, journals, threads, checkins, meditations } = schema;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
  console.log('Resetting Admin User...');

  const adminEmail = 'admin@local.host';
  const admin = await db.query.users.findFirst({
    where: eq(users.email, adminEmail)
  });

  if (!admin) {
    console.log('Admin user not found. (Nothing to reset)');
    await client.end();
    process.exit(0);
  }

  console.log(`Found Admin: ${admin.id}`);

  // 1. Unlink Data (Set userId to NULL) to prevent CASCADE deletion
  console.log('Unlinking data...');

  await db.update(journals).set({ userId: null }).where(eq(journals.userId, admin.id));
  await db.update(threads).set({ userId: null }).where(eq(threads.userId, admin.id));
  await db.update(checkins).set({ userId: null }).where(eq(checkins.userId, admin.id));
  await db.update(meditations).set({ userId: null }).where(eq(meditations.userId, admin.id));

  // 2. Delete Admin User
  console.log('Deleting Admin user...');
  await db.delete(users).where(eq(users.id, admin.id));

  console.log('Done. Restart the server to recreate Admin with the current INIT_ADMIN_PASSWORD.');
  await client.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  await client.end();
  process.exit(1);
});
