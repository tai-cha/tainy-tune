import { journals } from '../db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../utils/env';
import { desc, and, gte, lte, ilike } from 'drizzle-orm';

const client = postgres(env.DATABASE_URL);
const db = drizzle(client);

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const startDate = query.startDate as string | undefined;
  const endDate = query.endDate as string | undefined;
  const search = query.search as string | undefined;
  const limit = query.limit ? parseInt(query.limit as string) : undefined;

  // Build filters
  const filters = [];
  if (startDate) filters.push(gte(journals.created_at, new Date(startDate)));
  if (endDate) filters.push(lte(journals.created_at, new Date(endDate)));
  if (search) filters.push(ilike(journals.content, `%${search}%`));

  try {
    let queryBuilder = db
      .select()
      .from(journals)
      .where(and(...filters))
      .orderBy(desc(journals.created_at));

    if (limit) {
      // @ts-ignore - limit is valid but drizzle types might complain depending on version or complexity
      queryBuilder = queryBuilder.limit(limit);
    }

    const result = await queryBuilder;

    return result;
  } catch (error) {
    console.error('Failed to fetch journals:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch journals',
    });
  }
});
