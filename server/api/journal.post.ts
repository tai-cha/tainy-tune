import { journals } from '../db/schema';
import { analyzeJournal } from '../utils/ai';
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
  const { content, mood } = body;

  if (!content || typeof content !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Content is required and must be a string',
    });
  }

  try {
    // 1. Process with AI (Parallel: Embedding + CBT Analysis)
    const [embedding, aiAnalysis] = await Promise.all([
      getEmbedding(content),
      analyzeJournal(content),
    ]);

    // 2. Prepare Data (User input overrides AI mood if provided)
    const finalMoodScore = typeof mood === 'number' ? mood : aiAnalysis.mood_score;

    // 3. Save to DB
    const [inserted] = await db
      .insert(journals)
      .values({
        content,
        embedding,
        mood_score: finalMoodScore,
        tags: aiAnalysis.tags,
        distortion_tags: aiAnalysis.distortion_tags,
        advice: aiAnalysis.advice,
      })
      .returning();

    return inserted;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error),
      data: error,
    });
  }
});
