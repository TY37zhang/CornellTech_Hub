-- Fix feedback status constraint to allow proper status values
-- This migration fixes the feedback_status_check constraint to allow 'pending', 'in_progress', and 'resolved'

-- Drop the existing constraint if it exists
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_status_check;

-- Add the correct constraint
ALTER TABLE feedback ADD CONSTRAINT feedback_status_check CHECK (status IN ('pending', 'in_progress', 'resolved'));

-- Also add the read column if it doesn't exist (for completeness)
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT false;