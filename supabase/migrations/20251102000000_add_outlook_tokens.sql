-- Add Outlook OAuth token columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS outlook_access_token TEXT,
ADD COLUMN IF NOT EXISTS outlook_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS outlook_token_expires_at TIMESTAMPTZ;

-- Add index for token lookup
CREATE INDEX IF NOT EXISTS idx_users_outlook_tokens ON users(id) WHERE outlook_access_token IS NOT NULL;
