
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { journals } from "../server/db/schema";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { isNull } from "drizzle-orm";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);


main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function main() {
  console.log("Starting UUID migration...");

  try {
    await db.transaction(async (tx) => {
      // Fetch entries without clientUuid inside transaction
      const entries = await tx.select().from(journals).where(isNull(journals.clientUuid));

      console.log(`Found ${entries.length} entries to migrate.`);

      for (const entry of entries) {
        const uuid = randomUUID();
        await tx.update(journals)
          .set({ clientUuid: uuid })
          .where(sql`${journals.id} = ${entry.id}`);
        console.log(`Updated entry ${entry.id} with UUID ${uuid}`);
      }
    });

    console.log("Migration complete.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}
