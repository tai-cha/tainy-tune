import { sql } from 'drizzle-orm';
import { pgTable, serial, text, vector, integer, timestamp, boolean, index, pgEnum, uuid } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'admin']);

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  role: roleEnum('role').default('user'),
  banned: boolean('banned'),
  banReason: text('banReason'),
  banExpires: timestamp('banExpires'),
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
  id: serial('id').primaryKey(), // Original ID was serial, not UUID? Migration prompt implies existing table.
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  moodScore: integer('moodScore'),
  clientUuid: uuid('clientUuid').unique(), // Added for Phase 9
  tags: text('tags').array(), // Original was arrays
  distortionTags: text('distortionTags').array(), // Restore missing column
  advice: text('advice'), // Restore missing column
  fact: text('fact'), // Restore missing column
  emotion: text('emotion'), // Restore missing column
  isAnalysisFailed: boolean('isAnalysisFailed').default(false), // Restore missing column
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt'), // Note: Schema had updatedAt in previous version
  embedding: vector('embedding', { dimensions: 384 }),
});

// Threads table for chat sessions
export const threads = pgTable('threads', {
  id: serial('id').primaryKey(),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').default('New Chat'),
  contextIds: integer('contextIds').array(),
  pinnedAt: timestamp('pinnedAt'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
}, (t) => ({
  orderingIdx: index('threads_ordering_idx').on(sql`${t.pinnedAt} DESC NULLS LAST`, t.updatedAt.desc()),
}));

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  threadId: integer('threadId').references(() => threads.id, { onDelete: 'cascade' }).notNull(),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const checkins = pgTable('checkins', {
  id: serial('id').primaryKey(),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  moodScore: integer('moodScore').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const meditations = pgTable('meditations', {
  id: serial('id').primaryKey(),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  durationSeconds: integer('durationSeconds').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const systemSettings = pgTable('system_settings', {
  id: integer('id').primaryKey().default(1),
  registrationEnabled: boolean('registrationEnabled').default(true).notNull(),
  turnstileSiteKey: text('turnstileSiteKey'),
  turnstileSecretKey: text('turnstileSecretKey'),
  allowJournalEditing: boolean('allowJournalEditing').default(false).notNull(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});
