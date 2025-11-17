-- ============================================
-- SYSTÈME DE FILTRES PERSONNALISÉS
-- Date: 2025-11-17
-- Description: Filtres personnalisables par utilisateur avec détection IA et limitations par plan
-- ============================================

-- ============================================
-- Table: user_filters
-- Stocke les filtres personnalisés créés par les utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS user_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Informations du filtre
  name TEXT NOT NULL, -- ex: "Urgences VIP", "Demandes de remboursement"
  description TEXT, -- Description du filtre
  color TEXT DEFAULT '#3B82F6', -- Couleur badge dans l'UI (hex)
  icon TEXT DEFAULT 'Filter', -- Nom de l'icône Lucide
  
  -- Type de filtre
  is_default BOOLEAN DEFAULT FALSE, -- true = filtre de base (non supprimable), false = créé par utilisateur
  filter_key TEXT NOT NULL, -- Clé unique pour référence (ex: "urgent_vip", "refund_request")
  
  -- Configuration de détection IA
  keywords JSONB DEFAULT '[]'::jsonb, -- Mots-clés pour détection: ["urgent", "ASAP", "immédiat"]
  detection_rules JSONB DEFAULT '{}'::jsonb, -- Règles avancées de détection
  -- Structure: {
  --   "matchMode": "any" | "all", // any = 1 mot suffit, all = tous les mots requis
  --   "caseSensitive": false,
  --   "regexPatterns": ["pattern1", "pattern2"],
  --   "excludeKeywords": ["mot à exclure"]
  -- }
  
  -- Configuration des réponses IA
  response_config JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "tone": "pro" | "cordial" | "empathique" | "technique",
  --   "language": "fr" | "en",
  --   "customInstructions": "Instructions spécifiques pour ce filtre",
  --   "responseTemplate": "Template de réponse optionnel",
  --   "autoReplyEnabled": false,
  --   "priorityLevel": "high" | "normal" | "low"
  -- }
  
  -- Statistiques d'utilisation
  usage_count INTEGER DEFAULT 0, -- Nombre d'emails classés dans ce filtre
  last_used_at TIMESTAMPTZ, -- Dernière utilisation
  
  -- Statut
  is_active BOOLEAN DEFAULT TRUE, -- Actif ou archivé
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  UNIQUE(user_id, filter_key) -- Un utilisateur ne peut pas avoir 2 filtres avec la même clé
);

-- Index pour performance
CREATE INDEX idx_user_filters_user_id ON user_filters(user_id);
CREATE INDEX idx_user_filters_active ON user_filters(is_active);
CREATE INDEX idx_user_filters_default ON user_filters(is_default);
CREATE INDEX idx_user_filters_keywords ON user_filters USING GIN(keywords);

-- Row Level Security (RLS)
ALTER TABLE user_filters ENABLE ROW LEVEL SECURITY;

-- Politique: L'utilisateur ne peut voir que ses filtres
CREATE POLICY "Users can view their own filters"
  ON user_filters
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: L'utilisateur peut créer ses filtres (limite vérifiée côté app)
CREATE POLICY "Users can insert their own filters"
  ON user_filters
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_default = FALSE);

-- Politique: L'utilisateur peut modifier ses filtres personnalisés uniquement
CREATE POLICY "Users can update their custom filters"
  ON user_filters
  FOR UPDATE
  USING (auth.uid() = user_id AND is_default = FALSE);

-- Politique: L'utilisateur peut supprimer ses filtres personnalisés uniquement
CREATE POLICY "Users can delete their custom filters"
  ON user_filters
  FOR DELETE
  USING (auth.uid() = user_id AND is_default = FALSE);

-- Trigger: Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_user_filters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_filters_updated_at
  BEFORE UPDATE ON user_filters
  FOR EACH ROW
  EXECUTE FUNCTION update_user_filters_updated_at();

-- ============================================
-- FONCTION RPC: Vérifier la limite de filtres personnalisés par plan
-- ============================================
CREATE OR REPLACE FUNCTION check_custom_filter_limit(p_user_id UUID)
RETURNS TABLE(
  can_create BOOLEAN,
  current_count INTEGER,
  max_allowed INTEGER,
  plan TEXT
) AS $$
DECLARE
  v_plan TEXT;
  v_current_count INTEGER;
  v_max_allowed INTEGER;
BEGIN
  -- Récupérer le plan de l'utilisateur
  SELECT users.plan INTO v_plan
  FROM users
  WHERE id = p_user_id;

  -- Définir les limites par plan
  v_max_allowed := CASE v_plan
    WHEN 'FREE' THEN 0        -- Pas de filtres personnalisés
    WHEN 'STARTER' THEN 0     -- Pas de filtres personnalisés
    WHEN 'PRO' THEN 5         -- 5 filtres personnalisés
    WHEN 'ENTERPRISE' THEN 999999 -- Illimité (infini pratique)
    ELSE 0
  END;

  -- Compter les filtres personnalisés actuels (is_default = false)
  SELECT COUNT(*) INTO v_current_count
  FROM user_filters
  WHERE user_id = p_user_id
    AND is_default = FALSE
    AND is_active = TRUE;

  -- Retourner le résultat
  RETURN QUERY SELECT
    (v_current_count < v_max_allowed) AS can_create,
    v_current_count::INTEGER,
    v_max_allowed::INTEGER,
    v_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION RPC: Cloner les filtres par défaut pour un nouvel utilisateur
-- ============================================
CREATE OR REPLACE FUNCTION initialize_default_filters(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Insérer les filtres de base (non supprimables)
  INSERT INTO user_filters (
    user_id, name, description, color, icon, is_default, filter_key,
    keywords, detection_rules, response_config
  ) VALUES
  -- Filtre 1: Support technique
  (
    p_user_id,
    'Support technique',
    'Questions techniques et problèmes à résoudre',
    '#3B82F6', -- Bleu
    'Wrench',
    TRUE,
    'support_technique',
    '["bug", "erreur", "problème", "ne fonctionne pas", "crash", "plantage", "technique"]'::jsonb,
    '{"matchMode": "any", "caseSensitive": false}'::jsonb,
    '{"tone": "technique", "language": "fr", "priorityLevel": "high"}'::jsonb
  ),
  -- Filtre 2: Questions commerciales
  (
    p_user_id,
    'Questions commerciales',
    'Demandes d''informations sur les prix, fonctionnalités, etc.',
    '#10B981', -- Vert
    'DollarSign',
    TRUE,
    'commercial',
    '["prix", "tarif", "coût", "abonnement", "plan", "fonctionnalité", "démo"]'::jsonb,
    '{"matchMode": "any", "caseSensitive": false}'::jsonb,
    '{"tone": "cordial", "language": "fr", "priorityLevel": "normal"}'::jsonb
  ),
  -- Filtre 3: Réclamations
  (
    p_user_id,
    'Réclamations',
    'Plaintes et demandes de remboursement',
    '#EF4444', -- Rouge
    'AlertTriangle',
    TRUE,
    'reclamations',
    '["remboursement", "insatisfait", "déçu", "plainte", "réclamation", "mauvais service", "annuler"]'::jsonb,
    '{"matchMode": "any", "caseSensitive": false}'::jsonb,
    '{"tone": "empathique", "language": "fr", "priorityLevel": "high"}'::jsonb
  ),
  -- Filtre 4: Questions générales
  (
    p_user_id,
    'Questions générales',
    'Demandes d''information diverses',
    '#8B5CF6', -- Violet
    'HelpCircle',
    TRUE,
    'general',
    '["comment", "quoi", "pourquoi", "où", "quand", "qui", "information"]'::jsonb,
    '{"matchMode": "any", "caseSensitive": false}'::jsonb,
    '{"tone": "cordial", "language": "fr", "priorityLevel": "normal"}'::jsonb
  ),
  -- Filtre 5: Urgent
  (
    p_user_id,
    'Urgent',
    'Demandes urgentes nécessitant une réponse rapide',
    '#F59E0B', -- Orange
    'Zap',
    TRUE,
    'urgent',
    '["urgent", "ASAP", "immédiat", "rapidement", "vite", "prioritaire", "critique"]'::jsonb,
    '{"matchMode": "any", "caseSensitive": false}'::jsonb,
    '{"tone": "pro", "language": "fr", "priorityLevel": "high", "autoReplyEnabled": true}'::jsonb
  );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTAIRES POUR DOCUMENTATION
-- ============================================
COMMENT ON TABLE user_filters IS 'Filtres personnalisables par utilisateur avec détection IA et limitations par plan (PRO: 5, ENTERPRISE: illimité)';
COMMENT ON COLUMN user_filters.keywords IS 'Mots-clés JSON pour détection automatique du filtre';
COMMENT ON COLUMN user_filters.detection_rules IS 'Règles avancées de détection (mode matching, regex, exclusions)';
COMMENT ON COLUMN user_filters.response_config IS 'Configuration des réponses IA spécifiques à ce filtre';
COMMENT ON COLUMN user_filters.is_default IS 'true = filtre de base non supprimable, false = créé par utilisateur';

-- ============================================
-- DONNÉES DE TEST (Optionnel - à supprimer en production)
-- ============================================
-- Décommenter pour tester avec un utilisateur existant
-- SELECT initialize_default_filters('93740474-2330-4e05-bb63-c75cd62d2de0');
