import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, captcha } from "better-auth/plugins";
import { db } from "~/server/db";
import { users, sessions, accounts, verifications, systemSettings } from "~/server/db/schema";
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
  rateLimit: {
    window: 60,
    max: 15,
  },
  plugins: [
    admin(),
    {
      id: "dynamic-captcha",
      hooks: {
        before: [
          {
            matcher: (context) => context.path === "/sign-up/email" || context.path === "/sign-in/email",
            handler: async (ctx) => {
              const settings = await db.query.systemSettings.findFirst();
              if (settings?.turnstileSiteKey && settings?.turnstileSecretKey) {
                const headers = new Headers(ctx?.request?.headers);
                const token = headers.get("x-turnstile-response");
                if (!token) {
                  throw new APIError("BAD_REQUEST", { message: "Captcha token is missing" });
                }

                const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
                const formData = new FormData();
                formData.append("secret", settings.turnstileSecretKey);
                formData.append("response", token);

                const result = await fetch(verifyUrl, {
                  body: formData,
                  method: "POST",
                });
                const outcome = await result.json();
                if (!outcome.success) {
                  throw new APIError("BAD_REQUEST", { message: "Captcha verification failed" });
                }
              }
              return { context: ctx };
            }
          }
        ]
      }
    }
  ],
  emailAndPassword: {
    enabled: true
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
    env.BETTER_AUTH_URL
  ],
  advanced: {
    useSecureCookies: !isDev,
    cookiePrefix: "tainy-tune",
    defaultCookieAttributes: {
      secure: !isDev,
      sameSite: "lax",
      httpOnly: true
    }
  }
});
