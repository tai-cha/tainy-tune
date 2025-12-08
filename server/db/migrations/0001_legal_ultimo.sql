ALTER TABLE "journal_entries" RENAME TO "journals";--> statement-breakpoint
ALTER TABLE "journals" ADD COLUMN "embedding" vector(384);