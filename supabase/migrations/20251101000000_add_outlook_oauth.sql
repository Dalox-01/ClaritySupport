-- Ajouter les colonnes pour stocker les tokens OAuth Microsoft
ALTER TABLE users
ADD COLUMN IF NOT EXISTS outlook_access_token TEXT,
ADD COLUMN IF NOT EXISTS outlook_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS outlook_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_outlook_token ON users(outlook_access_token);
