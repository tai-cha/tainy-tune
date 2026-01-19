CREATE TABLE "system_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"registration_enabled" boolean DEFAULT true NOT NULL,
	"turnstile_site_key" text,
	"turnstile_secret_key" text,
	"allow_journal_editing" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "journals"
ADD COLUMN "client_uuid" uuid;
--> statement-breakpoint
ALTER TABLE "journals"
ADD COLUMN "updatedAt" timestamp;
--> statement-breakpoint
ALTER TABLE "user"
ADD COLUMN "banned" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "user"
ADD COLUMN "banReason" text;
--> statement-breakpoint
ALTER TABLE "user"
ADD COLUMN "banExpires" timestamp;
--> statement-breakpoint
ALTER TABLE "journals"
ADD CONSTRAINT "journals_client_uuid_unique" UNIQUE("client_uuid");