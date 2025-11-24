-- Table pour les paramètres d'IA par utilisateur
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  auto_reply_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour la recherche rapide par email
CREATE INDEX IF NOT EXISTS idx_ai_settings_user_email ON ai_settings(user_email);

-- RLS (Row Level Security)
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs ne peuvent voir que leurs propres paramètres
CREATE POLICY "Users can view their own AI settings"
  ON ai_settings
  FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

-- Politique: Les utilisateurs peuvent insérer leurs propres paramètres
CREATE POLICY "Users can insert their own AI settings"
  ON ai_settings
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Politique: Les utilisateurs peuvent mettre à jour leurs propres paramètres
CREATE POLICY "Users can update their own AI settings"
  ON ai_settings
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_email);
