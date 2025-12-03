-- Migration: Ajouter les colonnes pour le cache d'optimisation IA
-- Date: 2025-12-03

-- Ajouter les colonnes de cache pour l'optimisation des tokens
ALTER TABLE users ADD COLUMN IF NOT EXISTS optimized_ai_context TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS optimized_ai_hash VARCHAR(100);

-- Index pour recherche rapide par hash
CREATE INDEX IF NOT EXISTS idx_users_optimized_ai_hash ON users(optimized_ai_hash);

-- Commentaires
COMMENT ON COLUMN users.optimized_ai_context IS 'Contexte IA synthétisé et optimisé pour réduire la consommation de tokens';
COMMENT ON COLUMN users.optimized_ai_hash IS 'Hash de la configuration IA pour détecter les changements et invalider le cache';
