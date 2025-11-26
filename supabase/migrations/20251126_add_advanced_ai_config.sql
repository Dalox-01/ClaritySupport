-- Migration: Ajout de la configuration IA avancée
-- Date: 2025-11-26

ALTER TABLE ai_configurations
ADD COLUMN IF NOT EXISTS advanced_mode_config JSONB DEFAULT NULL;

COMMENT ON COLUMN ai_configurations.advanced_mode_config IS 'Configuration complète pour le mode avancé (modèles, prompts, RAG, etc.)';
