-- Add STARTER plan support
-- Update users table to support 3 plans

-- Modify plan column to allow STARTER
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE users ADD CONSTRAINT users_plan_check CHECK (plan IN ('FREE', 'STARTER', 'PRO'));

-- Update existing users (keep current plans)
-- No data migration needed as FREE and PRO users stay the same
