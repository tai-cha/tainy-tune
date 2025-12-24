CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
ALTER TABLE "checkins" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "journals" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meditations" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "threads" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";