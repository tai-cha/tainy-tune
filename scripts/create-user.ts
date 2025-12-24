import 'dotenv/config';
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../server/db/schema';
import { users, sessions, accounts, verifications } from "../server/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

// Minimal auth instance for scripting
const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: users, session: sessions, account: accounts, verification: verifications }
  }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET || "dummy",
  baseURL: "http://localhost:3000" // Not used for direct API calls usually, but required config
});

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'TestUser';

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-user.ts <email> <password> [name]');
    process.exit(1);
  }

  console.log(`Creating user: ${email}...`);

  try {
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      }
    });
    console.log('User created successfully:', user);
  } catch (e) {
    console.error('Failed to create user:', e);
  }

  await client.end();
  process.exit(0);
}

main();
