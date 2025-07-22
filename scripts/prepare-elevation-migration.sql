-- Prepare for elevation system migration
-- This script adds the new columns before removing the old ones

-- Add the new elevation columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_mod BOOLEAN DEFAULT false;

-- Migrate admin users
UPDATE users 
SET is_admin = true 
WHERE role = 'admin' OR (roles @> ARRAY['admin']::user_role[]);

-- Migrate mod users  
UPDATE users 
SET is_mod = true 
WHERE role = 'mod' OR (roles @> ARRAY['mod']::user_role[]);

-- Special handling for tz445@cornell.edu to ensure admin status
UPDATE users 
SET is_admin = true 
WHERE email = 'tz445@cornell.edu';

-- Convert admin/mod primary roles to appropriate base roles
UPDATE users 
SET role = CASE 
    WHEN roles @> ARRAY['faculty']::user_role[] THEN 'faculty'
    WHEN roles @> ARRAY['staff']::user_role[] THEN 'staff'
    ELSE 'student'
END
WHERE role IN ('admin', 'mod');

-- Show migration results
SELECT 
    email,
    role,
    is_admin,
    is_mod,
    CASE 
        WHEN is_admin THEN 'ADMIN'
        WHEN is_mod THEN 'MOD'
        ELSE 'USER'
    END as elevation_level
FROM users 
WHERE is_admin = true OR is_mod = true
ORDER BY is_admin DESC, is_mod DESC, email;