import { sql } from 'drizzle-orm';
import { pgTable, serial, text, vector, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  role: text('role'),
  settings: text('settings'), // Stored as JSON string or use jsonb if preferred
});

export const sessions = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const verifications = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
});

export const journals = pgTable('journals', {
  id: serial('id').primaryKey(),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }).notNull(),
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
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }).notNull(),
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
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  mood_score: integer('mood_score').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const meditations = pgTable('meditations', {
  id: serial('id').primaryKey(),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  duration_seconds: integer('duration_seconds').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});
