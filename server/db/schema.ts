import { pgTable, serial, text, vector } from 'drizzle-orm/pg-core';

export const journals = pgTable('journals', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 384 }),
});
