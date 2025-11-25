-- Ajouter le champ support_category à la table emails_cache
-- Pour stocker la catégorie de support professionnel détectée par les hashtags

ALTER TABLE emails_cache
ADD COLUMN IF NOT EXISTS support_category TEXT 
CHECK (support_category IN (
  'urgent', 
  'commande', 
  'remboursement', 
  'question-produit', 
  'suivi-commande', 
  'sav', 
  'reclamation', 
  'information', 
  'facturation', 
  'technique',
  'autre'
));

-- Ajouter le champ detected_hashtags pour stocker les hashtags trouvés
ALTER TABLE emails_cache
ADD COLUMN IF NOT EXISTS detected_hashtags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Ajouter les colonnes pour le tracking des réponses automatiques
ALTER TABLE emails_cache
ADD COLUMN IF NOT EXISTS auto_replied BOOLEAN DEFAULT FALSE;

ALTER TABLE emails_cache
ADD COLUMN IF NOT EXISTS auto_replied_at TIMESTAMPTZ;

-- Créer un index pour améliorer les performances de filtrage
CREATE INDEX IF NOT EXISTS idx_emails_cache_support_category 
ON emails_cache(support_category);

-- Index pour les emails non traités par l'IA
CREATE INDEX IF NOT EXISTS idx_emails_cache_auto_replied 
ON emails_cache(auto_replied) WHERE auto_replied IS NULL OR auto_replied = FALSE;

-- Commentaires pour documentation
COMMENT ON COLUMN emails_cache.support_category IS 'Catégorie de support client professionnelle détectée automatiquement par analyse des hashtags';
COMMENT ON COLUMN emails_cache.detected_hashtags IS 'Liste des hashtags/mots-clés détectés dans le sujet et le corps de l''email';
COMMENT ON COLUMN emails_cache.auto_replied IS 'Indique si une réponse automatique a été envoyée par l''IA';
COMMENT ON COLUMN emails_cache.auto_replied_at IS 'Date et heure de l''envoi de la réponse automatique';
