-- Migration to support multiple roles per user and add review replies

-- First, create the review_replies table
CREATE TABLE IF NOT EXISTS "review_replies" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "review_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    CONSTRAINT "fk_review_replies_review" FOREIGN KEY ("review_id") REFERENCES "course_reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "fk_review_replies_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Create indexes for review_replies
CREATE INDEX IF NOT EXISTS "idx_review_replies_review" ON "review_replies"("review_id");
CREATE INDEX IF NOT EXISTS "idx_review_replies_author" ON "review_replies"("author_id");

-- Add the new roles column as an array
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "roles" TEXT[] DEFAULT ARRAY['student'];

-- Migrate existing role data to the new roles array format
UPDATE "users" 
SET "roles" = ARRAY["role"::TEXT] 
WHERE "roles" IS NULL OR array_length("roles", 1) IS NULL;

-- Ensure all users have at least the student role if they have no roles
UPDATE "users" 
SET "roles" = ARRAY['student'] 
WHERE "roles" IS NULL OR array_length("roles", 1) IS NULL OR array_length("roles", 1) = 0;

-- Note: The old "role" column will be kept for backward compatibility during transition
-- In a future migration, it can be dropped after confirming all systems use the new "roles" array

-- Example of how to drop the old column later (DO NOT RUN NOW):
-- ALTER TABLE "users" DROP COLUMN IF EXISTS "role";