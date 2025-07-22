-- Add user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "user_role" AS ENUM ('student', 'faculty', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing fields to users table if they don't exist
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'student';
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "users" ADD COLUMN "is_admin" BOOLEAN DEFAULT false;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "users" ADD COLUMN "is_mod" BOOLEAN DEFAULT false;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
END $$;

-- Add missing moderation fields to existing tables if they don't exist
DO $$
BEGIN
    BEGIN
        ALTER TABLE "course_reviews" ADD COLUMN "status" VARCHAR(20) DEFAULT 'active';
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "course_reviews" ADD COLUMN "moderated_by" UUID;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "course_reviews" ADD COLUMN "moderated_at" TIMESTAMPTZ(6);
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "course_reviews" ADD COLUMN "moderation_reason" VARCHAR(255);
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
END $$;

-- Add missing moderation fields to forum_comments if they don't exist
DO $$
BEGIN
    BEGIN
        ALTER TABLE "forum_comments" ADD COLUMN "status" VARCHAR(20) DEFAULT 'active';
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "forum_comments" ADD COLUMN "moderated_by" UUID;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "forum_comments" ADD COLUMN "moderated_at" TIMESTAMPTZ(6);
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "forum_comments" ADD COLUMN "moderation_reason" VARCHAR(255);
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
END $$;

-- Add missing moderation fields to forum_posts if they don't exist
DO $$
BEGIN
    BEGIN
        ALTER TABLE "forum_posts" ADD COLUMN "moderated_by" UUID;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "forum_posts" ADD COLUMN "moderated_at" TIMESTAMPTZ(6);
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "forum_posts" ADD COLUMN "moderation_reason" VARCHAR(255);
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
END $$;

-- Create review_replies table if it doesn't exist
CREATE TABLE IF NOT EXISTS "review_replies" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "review_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) DEFAULT 'active',
    "moderated_by" UUID,
    "moderated_at" TIMESTAMPTZ(6),
    "moderation_reason" VARCHAR(255),

    CONSTRAINT "review_replies_pkey" PRIMARY KEY ("id")
);

-- Create reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS "reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reporter_id" UUID NOT NULL,
    "reported_item_type" VARCHAR(50) NOT NULL,
    "reported_item_id" UUID NOT NULL,
    "reason" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "admin_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

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

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS "idx_course_reviews_status" ON "course_reviews"("status");
CREATE INDEX IF NOT EXISTS "idx_forum_comments_status" ON "forum_comments"("status");
CREATE INDEX IF NOT EXISTS "idx_forum_posts_status" ON "forum_posts"("status");
CREATE INDEX IF NOT EXISTS "idx_review_replies_review" ON "review_replies"("review_id");
CREATE INDEX IF NOT EXISTS "idx_review_replies_author" ON "review_replies"("author_id");
CREATE INDEX IF NOT EXISTS "idx_review_replies_status" ON "review_replies"("status");
CREATE INDEX IF NOT EXISTS "idx_reports_reporter_id" ON "reports"("reporter_id");
CREATE INDEX IF NOT EXISTS "idx_reports_created_at" ON "reports"("created_at");
CREATE INDEX IF NOT EXISTS "idx_reports_status" ON "reports"("status");
CREATE INDEX IF NOT EXISTS "idx_reports_reported_item_type_id" ON "reports"("reported_item_type", "reported_item_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_moderator_id" ON "moderation_logs"("moderator_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_created_at" ON "moderation_logs"("created_at");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_target_type_id" ON "moderation_logs"("target_type", "target_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_action" ON "moderation_logs"("action");

-- Add foreign keys if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'review_replies_author_id_fkey') THEN
        ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'review_replies_review_id_fkey') THEN
        ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "course_reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_reporter_id_fkey') THEN
        ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'moderation_logs_moderator_id_fkey') THEN
        ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;