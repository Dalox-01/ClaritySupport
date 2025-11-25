-- Migration: Ajout soft delete pour emails_cache
-- Date: 2025-11-12
-- Description: Ajouter colonne deleted_at pour marquer les emails supprimés au lieu de les supprimer définitivement

-- Ajouter la colonne deleted_at
ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Index pour améliorer les performances des requêtes filtrant les emails non supprimés
CREATE INDEX IF NOT EXISTS idx_emails_cache_deleted_at ON emails_cache(deleted_at) WHERE deleted_at IS NULL;

-- Commentaire
COMMENT ON COLUMN emails_cache.deleted_at IS 'Date de suppression (soft delete) - NULL = email actif';
