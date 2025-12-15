
import postgres from 'postgres';
import { env } from 'process';

// Use .env if available (Node loads it if using jiti/dotenv, but here we might need manual loading if not using nuxt context)
// For simplicity, let's assume process.env is populated or we hardcode for devcontainer
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/tainy_tune';

const sql = postgres(connectionString, {
  max: 1, // Max 1 connection
  idle_timeout: 3, // Close idle connections after 3s
  connect_timeout: 5, // Timeout if can't connect
});

async function main() {
  console.log('Connecting to database...');
  // Mask password for logging
  console.log(`URL: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);

  try {
    console.log('Dropping journals table...');
    await sql`DROP TABLE IF EXISTS journals CASCADE`;
    console.log('Table journals dropped successfully.');
  } catch (e) {
    console.error('Error dropping table:', e);
  } finally {
    console.log('Closing connection...');
    await sql.end();
    console.log('Done.');
    process.exit(0);
  }
}

// Hard timeout
setTimeout(() => {
  console.error('Timeout: Force exiting...');
  process.exit(1);
}, 10000);

main();

