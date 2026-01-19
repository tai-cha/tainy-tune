import { cosineDistance, desc, gt, sql, ne, and, eq } from 'drizzle-orm';
import { journals } from '@server/db/schema';
import { db } from '@server/db';

export const searchSimilarJournals = async (userId: string, queryEmbedding: number[], limit = 5, excludeId?: string) => {
  const similarity = sql<number>`1 - (${cosineDistance(journals.embedding, queryEmbedding)})`;

  const whereClause = excludeId
    ? and(eq(journals.userId, userId), gt(similarity, 0.5), ne(journals.id, excludeId))
    : and(eq(journals.userId, userId), gt(similarity, 0.5));

  return await db
    .select({
      id: journals.id,
      content: journals.content,
      createdAt: journals.createdAt,
      advice: journals.advice,
      similarity,
    })
    .from(journals)
    .where(whereClause)
    .orderBy(desc(similarity))
    .limit(limit);
};
