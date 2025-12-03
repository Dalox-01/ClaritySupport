-- Migration: Configuration IA par utilisateur pour le Mail Center

CREATE TABLE IF NOT EXISTS ai_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Configuration JSON pour chaque catégorie
  config JSONB NOT NULL DEFAULT '{
    "support": {
      "enabled": true,
      "autoReply": false,
      "requireValidation": true,
      "tone": "professionnel",
      "customPrompt": "Tu es un assistant de support technique professionnel. Réponds de manière claire et rassurante.",
      "keywords": ["problème", "bug", "erreur", "aide", "support", "ne fonctionne pas"],
      "responseTemplate": "Bonjour,\\n\\nMerci de nous avoir contactés. Notre équipe va traiter votre demande dans les plus brefs délais.\\n\\nCordialement,",
      "delayMinutes": 0
    },
    "vente": {
      "enabled": true,
      "autoReply": false,
      "requireValidation": true,
      "tone": "professionnel",
      "customPrompt": "Tu es un commercial expert. Sois persuasif mais respectueux. Mets en avant la valeur de nos produits.",
      "keywords": ["devis", "prix", "tarif", "acheter", "commander", "intéressé"],
      "responseTemplate": "Bonjour,\\n\\nMerci pour votre intérêt ! Nous serions ravis de discuter de vos besoins.\\n\\nCordialement,",
      "delayMinutes": 0
    },
    "urgent": {
      "enabled": true,
      "autoReply": false,
      "requireValidation": true,
      "tone": "professionnel",
      "customPrompt": "C''est une situation urgente. Sois rapide, efficace et propose une action concrète immédiate.",
      "keywords": ["urgent", "URGENT", "immédiat", "critique", "asap", "rapidement"],
      "responseTemplate": "Bonjour,\\n\\nVotre demande urgente est bien reçue et traitée en priorité.\\n\\nCordialement,",
      "delayMinutes": 0
    },
    "spam": {
      "enabled": false,
      "autoReply": false,
      "requireValidation": false,
      "tone": "formel",
      "customPrompt": "Email détecté comme spam. Pas de réponse automatique.",
      "keywords": ["spam", "publicité", "marketing", "unsubscribe"],
      "responseTemplate": "",
      "delayMinutes": 0
    }
  }'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_ai_configurations_user_id ON ai_configurations(user_id);

-- Contrainte unique : un seul config par utilisateur
CREATE UNIQUE INDEX idx_ai_configurations_unique_user ON ai_configurations(user_id);

-- RLS Policies
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;

-- Politique: L'utilisateur peut voir sa propre config
CREATE POLICY "Users can view their own AI configuration"
  ON ai_configurations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: L'utilisateur peut créer sa config
CREATE POLICY "Users can create their own AI configuration"
  ON ai_configurations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: L'utilisateur peut modifier sa config
CREATE POLICY "Users can update their own AI configuration"
  ON ai_configurations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique: L'utilisateur peut supprimer sa config
CREATE POLICY "Users can delete their own AI configuration"
  ON ai_configurations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_ai_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_configurations_updated_at
  BEFORE UPDATE ON ai_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_configurations_updated_at();

