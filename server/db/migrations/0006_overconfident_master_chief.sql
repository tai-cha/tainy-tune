CREATE TABLE "checkins" (
	"id" serial PRIMARY KEY NOT NULL,
	"mood_score" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meditations" (
	"id" serial PRIMARY KEY NOT NULL,
	"duration_seconds" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
