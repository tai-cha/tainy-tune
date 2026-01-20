/*
 Manual Migration for UUID Refactoring
 Goal: Rename 'clientUuid' to 'id' to preserve data and switch to UUID primary key.
 */
-- 1. Drop existing primary key constraint on 'id'
-- Note: original table name was journal_entries, so pkey might be named journal_entries_pkey
ALTER TABLE "journals" DROP CONSTRAINT IF EXISTS "journals_pkey";
--> statement-breakpoint
ALTER TABLE "journals" DROP CONSTRAINT IF EXISTS "journal_entries_pkey";
--> statement-breakpoint
-- 2. Drop the original serial 'id' column
ALTER TABLE "journals" DROP COLUMN IF EXISTS "id";
--> statement-breakpoint
-- 3. Rename 'clientUuid' to 'id'
ALTER TABLE "journals"
  RENAME COLUMN "clientUuid" TO "id";
--> statement-breakpoint
-- 4. Set 'id' as Primary Key
ALTER TABLE "journals"
ADD PRIMARY KEY ("id");
--> statement-breakpoint
-- 5. Set default value for new 'id' (UUID generation)
ALTER TABLE "journals"
ALTER COLUMN "id"
SET DEFAULT gen_random_uuid();
--> statement-breakpoint
-- 6. Drop the unique constraint on the former 'clientUuid' (now 'id') as PK implies uniqueness (optional but clean)
-- Note: Constraint name might vary, check if it exists: "journals_clientUuid_unique"
ALTER TABLE "journals" DROP CONSTRAINT IF EXISTS "journals_clientUuid_unique";