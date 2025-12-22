import { cosineDistance, desc, gt, sql, ne, and } from 'drizzle-orm';
import { journals } from '@server/db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '~/utils/env';

const client = postgres(env.DATABASE_URL);
const db = drizzle(client);

export const searchSimilarJournals = async (queryEmbedding: number[], limit = 5, excludeId?: number) => {
  const similarity = sql<number>`1 - (${cosineDistance(journals.embedding, queryEmbedding)})`;

  const whereClause = excludeId
    ? and(gt(similarity, 0.5), ne(journals.id, excludeId))
    : gt(similarity, 0.5);

  return await db
    .select({
      id: journals.id,
      content: journals.content,
      created_at: journals.created_at,
      advice: journals.advice,
      similarity,
    })
    .from(journals)
    .where(whereClause)
    .orderBy(desc(similarity))
    .limit(limit);
};
