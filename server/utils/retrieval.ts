import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { journals } from '../db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../utils/env';

const client = postgres(env.DATABASE_URL);
const db = drizzle(client);

export const searchSimilarJournals = async (queryEmbedding: number[], limit = 5) => {
  const similarity = sql<number>`1 - (${cosineDistance(journals.embedding, queryEmbedding)})`;

  return await db
    .select({
      id: journals.id,
      content: journals.content,
      similarity,
    })
    .from(journals)
    .where(gt(similarity, 0.5)) // Filter by similarity threshold
    .orderBy(desc(similarity))
    .limit(limit);
};
