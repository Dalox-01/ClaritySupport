-- Table pour les variables personnelles de l'utilisateur
CREATE TABLE IF NOT EXISTS user_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  variable_name TEXT NOT NULL,
  variable_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, variable_name)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_user_variables_user_id ON user_variables(user_id);

-- RLS désactivé pour la démo
ALTER TABLE user_variables DISABLE ROW LEVEL SECURITY;

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_user_variables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER update_user_variables_timestamp
  BEFORE UPDATE ON user_variables
  FOR EACH ROW
  EXECUTE FUNCTION update_user_variables_updated_at();
