-- Ajouter les colonnes pour stocker les tokens OAuth Gmail
ALTER TABLE users
ADD COLUMN IF NOT EXISTS gmail_access_token TEXT,
ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS gmail_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_gmail_token ON users(gmail_access_token);
