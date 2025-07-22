-- Add moderation columns to forum_posts
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_posts' AND column_name = 'status') THEN
        ALTER TABLE "forum_posts" ADD COLUMN "status" VARCHAR(50) DEFAULT 'active';
        UPDATE "forum_posts" SET "status" = 'active' WHERE "status" IS NULL;
    END IF;
    
    -- Add moderation columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_posts' AND column_name = 'moderated_by') THEN
        ALTER TABLE "forum_posts" ADD COLUMN "moderated_by" UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_posts' AND column_name = 'moderated_at') THEN
        ALTER TABLE "forum_posts" ADD COLUMN "moderated_at" TIMESTAMPTZ(6);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_posts' AND column_name = 'moderation_reason') THEN
        ALTER TABLE "forum_posts" ADD COLUMN "moderation_reason" VARCHAR(255);
    END IF;
END $$;

-- Add moderation columns to forum_comments
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_comments' AND column_name = 'status') THEN
        ALTER TABLE "forum_comments" ADD COLUMN "status" VARCHAR(20) DEFAULT 'active';
        UPDATE "forum_comments" SET "status" = 'active' WHERE "status" IS NULL;
    END IF;
    
    -- Add moderation columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_comments' AND column_name = 'moderated_by') THEN
        ALTER TABLE "forum_comments" ADD COLUMN "moderated_by" UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_comments' AND column_name = 'moderated_at') THEN
        ALTER TABLE "forum_comments" ADD COLUMN "moderated_at" TIMESTAMPTZ(6);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_comments' AND column_name = 'moderation_reason') THEN
        ALTER TABLE "forum_comments" ADD COLUMN "moderation_reason" VARCHAR(255);
    END IF;
END $$;

-- Add moderation columns to course_reviews
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_reviews' AND column_name = 'status') THEN
        ALTER TABLE "course_reviews" ADD COLUMN "status" VARCHAR(20) DEFAULT 'active';
        UPDATE "course_reviews" SET "status" = 'active' WHERE "status" IS NULL;
    END IF;
    
    -- Add moderation columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_reviews' AND column_name = 'moderated_by') THEN
        ALTER TABLE "course_reviews" ADD COLUMN "moderated_by" UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_reviews' AND column_name = 'moderated_at') THEN
        ALTER TABLE "course_reviews" ADD COLUMN "moderated_at" TIMESTAMPTZ(6);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_reviews' AND column_name = 'moderation_reason') THEN
        ALTER TABLE "course_reviews" ADD COLUMN "moderation_reason" VARCHAR(255);
    END IF;
END $$;

-- Add moderation columns to review_replies
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'review_replies' AND column_name = 'status') THEN
        ALTER TABLE "review_replies" ADD COLUMN "status" VARCHAR(20) DEFAULT 'active';
        UPDATE "review_replies" SET "status" = 'active' WHERE "status" IS NULL;
    END IF;
    
    -- Add moderation columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'review_replies' AND column_name = 'moderated_by') THEN
        ALTER TABLE "review_replies" ADD COLUMN "moderated_by" UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'review_replies' AND column_name = 'moderated_at') THEN
        ALTER TABLE "review_replies" ADD COLUMN "moderated_at" TIMESTAMPTZ(6);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'review_replies' AND column_name = 'moderation_reason') THEN
        ALTER TABLE "review_replies" ADD COLUMN "moderation_reason" VARCHAR(255);
    END IF;
END $$;

-- Create moderation_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS "moderation_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "moderator_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "target_type" VARCHAR(50) NOT NULL,
    "target_id" UUID NOT NULL,
    "reason" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "idx_forum_posts_status" ON "forum_posts"("status");
CREATE INDEX IF NOT EXISTS "idx_forum_comments_status" ON "forum_comments"("status");
CREATE INDEX IF NOT EXISTS "idx_course_reviews_status" ON "course_reviews"("status");
CREATE INDEX IF NOT EXISTS "idx_review_replies_status" ON "review_replies"("status");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_moderator_id" ON "moderation_logs"("moderator_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_created_at" ON "moderation_logs"("created_at");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_target_type_id" ON "moderation_logs"("target_type", "target_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_action" ON "moderation_logs"("action");

-- Add foreign keys if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'moderation_logs_moderator_id_fkey') THEN
        ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;