import { journals } from '@server/db/schema';

import { desc, and, gte, lte, ilike, or, eq, sql } from 'drizzle-orm';

import { db } from '@server/db';


export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = query.id as string | undefined;
  const startDate = query.startDate as string | undefined;
  const endDate = query.endDate as string | undefined;
  const search = query.search as string | undefined;
  const limit = query.limit ? parseInt(query.limit as string) : undefined;

  // Build filters
  const filters = [];
  if (id) filters.push(eq(journals.id, Number(id)));
  if (startDate) filters.push(gte(journals.created_at, new Date(startDate)));
  if (endDate) filters.push(lte(journals.created_at, new Date(endDate)));
  if (search) {
    const searchPattern = `%${search}%`;
    const orConditions = [
      ilike(journals.content, searchPattern),
      sql`array_to_string(${journals.tags}, ' ') ILIKE ${searchPattern}`,
      // Search raw English keys
      sql`array_to_string(${journals.distortion_tags}, ' ') ILIKE ${searchPattern}`
    ];

    // Check if search matches any localized distortion names
    const matchedKeys = findDistortionKeys(search);
    matchedKeys.forEach(key => {
      orConditions.push(sql`array_to_string(${journals.distortion_tags}, ' ') ILIKE ${`%${key}%`}`);
    });

    filters.push(or(...orConditions));
  }

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
