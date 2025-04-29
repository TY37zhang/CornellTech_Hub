-- Drop existing enum type if it exists
DROP TYPE IF EXISTS vote_action;

-- Create enum type for vote actions
CREATE TYPE vote_action AS ENUM ('upvote', 'downvote');

-- Create comment_votes table
CREATE TABLE IF NOT EXISTS comment_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action_type vote_action NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
);

-- Add foreign key constraints
ALTER TABLE comment_votes
    ADD CONSTRAINT fk_comment_votes_comment
    FOREIGN KEY (comment_id)
    REFERENCES forum_comments(id)
    ON DELETE CASCADE;

ALTER TABLE comment_votes
    ADD CONSTRAINT fk_comment_votes_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_comment_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.action_type = 'upvote' THEN
            UPDATE forum_comments 
            SET like_count = like_count + 1
            WHERE id = NEW.comment_id;
        ELSE
            UPDATE forum_comments 
            SET dislike_count = dislike_count + 1
            WHERE id = NEW.comment_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.action_type = 'upvote' THEN
            UPDATE forum_comments 
            SET like_count = GREATEST(like_count - 1, 0)
            WHERE id = OLD.comment_id;
        ELSE
            UPDATE forum_comments 
            SET dislike_count = GREATEST(dislike_count - 1, 0)
            WHERE id = OLD.comment_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' AND OLD.action_type != NEW.action_type THEN
        IF NEW.action_type = 'upvote' THEN
            UPDATE forum_comments 
            SET like_count = like_count + 1,
                dislike_count = GREATEST(dislike_count - 1, 0)
            WHERE id = NEW.comment_id;
        ELSE
            UPDATE forum_comments 
            SET like_count = GREATEST(like_count - 1, 0),
                dislike_count = dislike_count + 1
            WHERE id = NEW.comment_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_comment_vote_counts_on_insert
    AFTER INSERT ON comment_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_vote_counts();

CREATE TRIGGER update_comment_vote_counts_on_delete
    AFTER DELETE ON comment_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_vote_counts();

CREATE TRIGGER update_comment_vote_counts_on_update
    AFTER UPDATE OF action_type ON comment_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_vote_counts(); 