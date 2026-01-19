import { journals } from '@server/db/schema';

import { desc, and, gte, lte, ilike, or, eq, sql, isNull } from 'drizzle-orm';

import { db } from '@server/db';


import { auth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  const userId = session.user.id;

  const query = getQuery(event);
  const id = query.id as string | undefined;
  const startDate = query.startDate as string | undefined;
  const endDate = query.endDate as string | undefined;
  const search = query.search as string | undefined;
  const limit = query.limit ? parseInt(query.limit as string) : undefined;
  const updatedAfter = query.updatedAfter as string | undefined;

  // Build filters
  const filters = [eq(journals.userId, userId)];
  if (id) filters.push(eq(journals.id, id));
  if (startDate) filters.push(gte(journals.createdAt, new Date(startDate)));
  if (endDate) filters.push(lte(journals.createdAt, new Date(endDate)));
  if (updatedAfter) {
    const date = new Date(updatedAfter);

    if (Number.isNaN(date.getTime())) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid updatedAfter' });
    }

    filters.push(or(
      gte(journals.updatedAt, date),
      and(isNull(journals.updatedAt), gte(journals.createdAt, date))
    )!);
  }
  if (search) {
    const searchPattern = `%${search}%`;
    const orConditions = [
      ilike(journals.content, searchPattern),
      sql`array_to_string(${journals.tags}, ' ') ILIKE ${searchPattern}`,
      // Search raw English keys
      sql`array_to_string(${journals.distortionTags}, ' ') ILIKE ${searchPattern}`
    ];

    // Check if search matches any localized distortion names
    const matchedKeys = findDistortionKeys(search);
    matchedKeys.forEach(key => {
      orConditions.push(sql`array_to_string(${journals.distortionTags}, ' ') ILIKE ${`%${key}%`}`);
    });

    const searchFilter = or(...orConditions);
    if (searchFilter != null) {
      filters.push(searchFilter);
    }
  }

  try {
    let queryBuilder = db
      .select()
      .from(journals)
      .where(and(...filters)!)
      .orderBy(desc(journals.createdAt))
      .$dynamic();

    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }

    const offset = query.offset ? parseInt(query.offset as string) : undefined;
    if (offset) {
      queryBuilder = queryBuilder.offset(offset);
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
