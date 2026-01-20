import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '~/server/db';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

export default defineNitroPlugin(async () => {
  if (import.meta.dev) return;

  const potentialPaths = [
    process.env.MIGRATIONS_FOLDER,
    resolve(process.cwd(), 'migrations'), // Generic fallback
    resolve(dirname(process.argv[1]), 'migrations'), // Relative to entry script (prod/build)
    resolve(process.cwd(), 'server/db/migrations'), // Local source
  ].filter(Boolean) as string[];

  let migrationsFolder: string | undefined;

  for (const path of potentialPaths) {
    if (existsSync(path)) {
      migrationsFolder = path;
      break;
    }
  }

  if (!migrationsFolder) {
    console.error('❌  Migrations folder not found. Searched in:', potentialPaths);
    process.exit(1);
  }

  try {
    console.log(`🔄  Running database migrations from ${migrationsFolder}...`);
    await migrate(db, { migrationsFolder });
    console.log('✅  Database migrations completed!');
  } catch (error) {
    console.error('❌  Database migrations failed!', error);
    process.exit(1);
  }
});
