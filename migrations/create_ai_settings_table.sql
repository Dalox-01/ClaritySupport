-- Migration: Créer la table ai_settings pour activer/désactiver l'IA

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  auto_reply_urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_ai_settings_user_id ON ai_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_settings_enabled ON ai_settings(enabled) WHERE enabled = true;

-- Commentaires
COMMENT ON TABLE ai_settings IS 'Configuration globale IA pour chaque utilisateur';
COMMENT ON COLUMN ai_settings.enabled IS 'Si true, IA répond automatiquement aux emails';
COMMENT ON COLUMN ai_settings.auto_reply_urgent IS 'Si true, IA répond même aux emails urgents (dangereux)';

-- Activer RLS (Row Level Security)
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Politique RLS: les utilisateurs peuvent lire/modifier leurs propres paramètres
CREATE POLICY ai_settings_user_policy ON ai_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insérer des paramètres par défaut pour les utilisateurs existants (IA désactivée)
INSERT INTO ai_settings (user_id, enabled, auto_reply_urgent)
SELECT id, false, false
FROM users
WHERE id NOT IN (SELECT user_id FROM ai_settings)
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON POLICY ai_settings_user_policy ON ai_settings IS 'Utilisateurs peuvent gérer leurs propres paramètres IA';
