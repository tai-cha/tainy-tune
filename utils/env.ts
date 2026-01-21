// Env is expected to be loaded by the runner (Nuxt, Drizzle Kit, etc.)

const requiredEnvVars = ['DATABASE_URL', 'GEMINI_API_KEY', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'INIT_ADMIN_PASSWORD'] as const;

const required = requiredEnvVars.reduce((acc, key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  acc[key] = value;
  return acc;
}, {} as Record<typeof requiredEnvVars[number], string>);

const hops = parseInt(process.env.BETTER_AUTH_TRUST_PROXY_HOPS || '1', 10);

export const env = {
  ...required,
  BETTER_AUTH_TRUST_PROXY_HOPS: isNaN(hops) ? 1 : hops
};
