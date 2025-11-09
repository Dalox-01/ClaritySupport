-- Table pour les signatures email personnalisées
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  html_content TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour recherche rapide par utilisateur
CREATE INDEX IF NOT EXISTS idx_signatures_user_id ON signatures(user_id);

-- RLS (Row Level Security) - Désactivé pour la démo
ALTER TABLE signatures DISABLE ROW LEVEL SECURITY;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_signatures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_signatures_timestamp
  BEFORE UPDATE ON signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_signatures_updated_at();
