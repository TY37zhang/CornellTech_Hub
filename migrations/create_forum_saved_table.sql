-- Create forum_saved table
CREATE TABLE IF NOT EXISTS forum_saved (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);

-- Add foreign key constraints
ALTER TABLE forum_saved
    ADD CONSTRAINT fk_forum_saved_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE forum_saved
    ADD CONSTRAINT fk_forum_saved_post
    FOREIGN KEY (post_id)
    REFERENCES forum_posts(id)
    ON DELETE CASCADE; 