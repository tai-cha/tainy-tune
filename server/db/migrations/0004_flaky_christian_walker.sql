ALTER TABLE "journals" ADD COLUMN "is_analysis_failed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "pinned_at" timestamp;--> statement-breakpoint
CREATE INDEX "threads_ordering_idx" ON "threads" USING btree ("pinned_at" DESC NULLS LAST,"updated_at" DESC NULLS LAST);