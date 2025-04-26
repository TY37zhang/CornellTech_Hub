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