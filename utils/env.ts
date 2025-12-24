// Env is expected to be loaded by the runner (Nuxt, Drizzle Kit, etc.)

const requiredEnvVars = ['DATABASE_URL', 'GEMINI_API_KEY', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'INIT_ADMIN_PASSWORD'] as const;

export const env = requiredEnvVars.reduce((acc, key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  acc[key] = value;
  return acc;
}, {} as Record<typeof requiredEnvVars[number], string>);
