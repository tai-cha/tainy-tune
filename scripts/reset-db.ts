
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌  DATABASE_URL environment variable is not defined.');
  process.exit(1);
}
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log('🗑️  Clearing journals table...');
  await db.execute(sql`TRUNCATE TABLE journals RESTART IDENTITY CASCADE`);
  console.log('✅  Done!');
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
