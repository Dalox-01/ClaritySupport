-- Migration: Ajouter la colonne deleted_at à emails_cache
-- Date: 2025-11-14
-- Description: Permet la suppression logique (soft delete) des emails

-- Ajouter la colonne deleted_at (nullable)
ALTER TABLE emails_cache 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_emails_cache_deleted_at 
ON emails_cache(deleted_at) 
WHERE deleted_at IS NULL;

-- Commentaire pour documentation
COMMENT ON COLUMN emails_cache.deleted_at IS 
'Date de suppression logique de l''email. NULL = email actif.';
