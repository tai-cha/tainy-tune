import { journals } from '../db/schema';
import { getEmbedding } from '../utils/embedding';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../utils/env';

// Initialize Drizzle client
// Note: In a real production app, you might want to move this to a shared db client file
// to avoid creating multiple connections.
const client = postgres(env.DATABASE_URL);
const db = drizzle(client);

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { content } = body;

  if (!content || typeof content !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Content is required and must be a string',
    });
  }

  try {
    // Generate embedding
    const embedding = await getEmbedding(content);

    // Insert into database
    const result = await db.insert(journals).values({
      content,
      embedding,
    }).returning();

    return result[0];
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
