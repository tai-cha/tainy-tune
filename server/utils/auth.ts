import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/server/db";
import { users, sessions, accounts, verifications } from "~/server/db/schema";
import { env } from "~/utils/env";

const isDev = process.env.NODE_ENV === "development";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications
    }
  }),
  emailAndPassword: {
    enabled: true
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
    env.BETTER_AUTH_URL // Add production URL to trusted origins
  ],
  advanced: {
    useSecureCookies: !isDev, // Secure in production
    cookiePrefix: "tainy-tune",
    defaultCookieAttributes: {
      secure: !isDev,
      sameSite: "lax",
      httpOnly: true
    }
  }
});
