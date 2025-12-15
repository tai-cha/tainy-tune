import { pgTable, serial, text, vector, integer, timestamp } from 'drizzle-orm/pg-core';

export const journals = pgTable('journals', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  mood_score: integer('mood_score'),
  tags: text('tags').array(),
  distortion_tags: text('distortion_tags').array(),
  advice: text('advice'),
  created_at: timestamp('created_at').defaultNow(),
  embedding: vector('embedding', { dimensions: 384 }),
});
