import { sql } from 'drizzle-orm';
import { pgTable, serial, text, vector, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';

export const journals = pgTable('journals', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  mood_score: integer('mood_score'),
  tags: text('tags').array(),
  distortion_tags: text('distortion_tags').array(),
  advice: text('advice'),
  fact: text('fact'),
  emotion: text('emotion'),
  is_analysis_failed: boolean('is_analysis_failed').default(false),
  created_at: timestamp('created_at').defaultNow(),
  embedding: vector('embedding', { dimensions: 384 }),
});

// Threads table for chat sessions
export const threads = pgTable('threads', {
  id: serial('id').primaryKey(),
  title: text('title').default('New Chat'),
  context_ids: integer('context_ids').array(),
  pinned_at: timestamp('pinned_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (t) => ({
  orderingIdx: index('threads_ordering_idx').on(sql`${t.pinned_at} DESC NULLS LAST`, t.updated_at.desc()),
}));

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  thread_id: integer('thread_id').references(() => threads.id, { onDelete: 'cascade' }).notNull(),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const checkins = pgTable('checkins', {
  id: serial('id').primaryKey(),
  mood_score: integer('mood_score').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const meditations = pgTable('meditations', {
  id: serial('id').primaryKey(),
  duration_seconds: integer('duration_seconds').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});
