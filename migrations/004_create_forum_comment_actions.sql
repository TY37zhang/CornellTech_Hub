-- Create forum_comment_actions table
CREATE TABLE IF NOT EXISTS forum_comment_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES forum_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(10) NOT NULL CHECK (action_type IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_comment_actions_comment_id ON forum_comment_actions(comment_id);
CREATE INDEX IF NOT EXISTS idx_forum_comment_actions_user_id ON forum_comment_actions(user_id);

-- Add like_count and dislike_count columns to forum_comments if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'forum_comments' AND column_name = 'like_count') THEN
        ALTER TABLE forum_comments ADD COLUMN like_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'forum_comments' AND column_name = 'dislike_count') THEN
        ALTER TABLE forum_comments ADD COLUMN dislike_count INTEGER DEFAULT 0;
    END IF;
END $$; 