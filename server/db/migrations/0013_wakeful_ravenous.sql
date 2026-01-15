ALTER TABLE "threads" DROP COLUMN "contextIds";
ALTER TABLE "threads"
ADD COLUMN "contextIds" uuid [];