ALTER TABLE "journals" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "banned" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "banned" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "journals_embedding_index" ON "journals" USING hnsw ("embedding" vector_cosine_ops);