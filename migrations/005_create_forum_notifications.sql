-- Create forum_notification_preferences table
CREATE TABLE IF NOT EXISTS forum_notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notify_on_reply BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_notification_preferences_post_id ON forum_notification_preferences(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_notification_preferences_user_id ON forum_notification_preferences(user_id);

-- Add notify_on_reply column to forum_posts if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'forum_posts' AND column_name = 'notify_on_reply') THEN
        ALTER TABLE forum_posts ADD COLUMN notify_on_reply BOOLEAN DEFAULT false;
    END IF;
END $$; 