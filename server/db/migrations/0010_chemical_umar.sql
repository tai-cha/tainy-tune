ALTER TABLE "checkins" RENAME COLUMN "mood_score" TO "moodScore";--> statement-breakpoint
ALTER TABLE "checkins" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "journals" RENAME COLUMN "mood_score" TO "moodScore";--> statement-breakpoint
ALTER TABLE "journals" RENAME COLUMN "client_uuid" TO "clientUuid";--> statement-breakpoint
ALTER TABLE "journals" RENAME COLUMN "distortion_tags" TO "distortionTags";--> statement-breakpoint
ALTER TABLE "journals" RENAME COLUMN "is_analysis_failed" TO "isAnalysisFailed";--> statement-breakpoint
ALTER TABLE "journals" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "meditations" RENAME COLUMN "duration_seconds" TO "durationSeconds";--> statement-breakpoint
ALTER TABLE "meditations" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "thread_id" TO "threadId";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "system_settings" RENAME COLUMN "registration_enabled" TO "registrationEnabled";--> statement-breakpoint
ALTER TABLE "system_settings" RENAME COLUMN "turnstile_site_key" TO "turnstileSiteKey";--> statement-breakpoint
ALTER TABLE "system_settings" RENAME COLUMN "turnstile_secret_key" TO "turnstileSecretKey";--> statement-breakpoint
ALTER TABLE "system_settings" RENAME COLUMN "allow_journal_editing" TO "allowJournalEditing";--> statement-breakpoint
ALTER TABLE "system_settings" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "threads" RENAME COLUMN "context_ids" TO "contextIds";--> statement-breakpoint
ALTER TABLE "threads" RENAME COLUMN "pinned_at" TO "pinnedAt";--> statement-breakpoint
ALTER TABLE "threads" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "threads" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "journals" DROP CONSTRAINT "journals_client_uuid_unique";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_thread_id_threads_id_fk";
--> statement-breakpoint
DROP INDEX "threads_ordering_idx";--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_threadId_threads_id_fk" FOREIGN KEY ("threadId") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "threads_ordering_idx" ON "threads" USING btree ("pinnedAt" DESC NULLS LAST,"updatedAt" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "journals" ADD CONSTRAINT "journals_clientUuid_unique" UNIQUE("clientUuid");