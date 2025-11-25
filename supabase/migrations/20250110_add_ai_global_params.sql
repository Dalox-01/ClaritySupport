-- Migration: Ajout des paramètres IA globaux (model, maxTokens, categoryTemplates, etc.)

-- Ajouter les colonnes pour les paramètres globaux
-- Note: Le modèle est sélectionné automatiquement (gpt-4o-mini ≤400 tokens, gpt-4o >400 tokens)
ALTER TABLE ai_configurations
  ADD COLUMN IF NOT EXISTS max_tokens INTEGER DEFAULT 300 CHECK (max_tokens >= 100 AND max_tokens <= 1000),
  ADD COLUMN IF NOT EXISTS creativity NUMERIC(3,2) DEFAULT 0.5 CHECK (creativity >= 0 AND creativity <= 1),
  ADD COLUMN IF NOT EXISTS style TEXT DEFAULT 'professionnel',
  ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'professionnel',
  ADD COLUMN IF NOT EXISTS length TEXT DEFAULT 'moyen',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS category_templates JSONB DEFAULT '{
    "urgent": "Vous devez traiter cette demande urgente avec la plus haute priorité. Reconnaissez l''urgence, rassurez le client, et proposez une solution immédiate ou un délai précis.",
    "commande": "Le client a une question sur sa commande. Vérifiez les détails de la commande, fournissez des informations précises sur le statut.",
    "remboursement": "Le client demande un remboursement. Expliquez la politique de remboursement, les délais, et les étapes à suivre.",
    "question-produit": "Le client a une question sur un produit. Fournissez des informations détaillées, techniques si nécessaire, et aidez à la décision d''achat.",
    "suivi-commande": "Le client souhaite suivre sa commande. Fournissez les informations de tracking, les délais estimés, et rassurez sur la livraison.",
    "sav": "Le client a un problème avec un produit acheté. Faites preuve d''empathie, proposez un diagnostic, et les solutions (réparation, échange, remboursement).",
    "reclamation": "Le client fait une réclamation. Reconnaissez le problème, présentez des excuses si approprié, et proposez une compensation ou solution.",
    "information": "Le client demande une information générale. Fournissez une réponse claire et complète, avec des liens ou ressources si pertinent.",
    "facturation": "Le client a une question sur la facturation. Expliquez clairement les montants, les méthodes de paiement, et les délais.",
    "technique": "Le client a un problème technique. Fournissez un diagnostic étape par étape, soyez pédagogue et patient.",
    "autre": "Email non classifié ou divers. Analysez le contenu et fournissez une réponse appropriée et professionnelle."
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS security_audit_log BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS security_mask_personal_data BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS security_data_retention_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS compact_config JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS compact_updated_at TIMESTAMPTZ DEFAULT NULL;

-- Commentaires pour documentation
COMMENT ON COLUMN ai_configurations.max_tokens IS 'Nombre maximum de tokens (100-1000). Défaut: 300. Le modèle est auto-sélectionné (≤400: gpt-4o-mini, >400: gpt-4o)';
COMMENT ON COLUMN ai_configurations.creativity IS 'Niveau de créativité (0 = précis, 1 = créatif). Défaut: 0.5';
COMMENT ON COLUMN ai_configurations.category_templates IS 'Prompts contextuels par catégorie de support';
COMMENT ON COLUMN ai_configurations.security_audit_log IS 'Activer les logs d''audit pour les réponses IA. Défaut: false (RGPD)';
COMMENT ON COLUMN ai_configurations.security_mask_personal_data IS 'Masquer les données personnelles dans les logs. Défaut: false';
COMMENT ON COLUMN ai_configurations.compact_config IS 'Version compressée de la config pour optimiser les tokens (auto-générée)';
COMMENT ON COLUMN ai_configurations.compact_updated_at IS 'Date de dernière mise à jour de la config compacte';
