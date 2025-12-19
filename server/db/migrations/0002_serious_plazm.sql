CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text DEFAULT 'New Chat',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "journals" ADD COLUMN "mood_score" integer;--> statement-breakpoint
ALTER TABLE "journals" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "journals" ADD COLUMN "distortion_tags" text[];--> statement-breakpoint
ALTER TABLE "journals" ADD COLUMN "advice" text;--> statement-breakpoint
ALTER TABLE "journals" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;