-- Add program column to users table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'program') THEN
        ALTER TABLE users ADD COLUMN program VARCHAR(20);
    END IF;
END $$; 