-- Migration: Correction du schéma emails_cache
-- Date: 2025-11-12
-- Description: Aligner les colonnes avec le code TypeScript

-- Renommer email_id -> external_message_id
ALTER TABLE emails_cache 
  RENAME COLUMN email_id TO external_message_id;

-- Renommer received_date -> received_at
ALTER TABLE emails_cache 
  RENAME COLUMN received_date TO received_at;

-- Renommer is_replied -> replied_at (changer le type aussi)
ALTER TABLE emails_cache 
  DROP COLUMN IF EXISTS is_replied;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

-- Renommer auto_replied -> is_auto_replied
ALTER TABLE emails_cache 
  RENAME COLUMN auto_replied TO is_auto_replied;

-- Ajouter les colonnes manquantes
ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS snippet TEXT;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS sentiment TEXT;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS urgency_score INTEGER DEFAULT 0;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS requires_validation BOOLEAN DEFAULT FALSE;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS has_attachments BOOLEAN DEFAULT FALSE;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Recréer l'index avec le nouveau nom de colonne
DROP INDEX IF EXISTS idx_emails_cache_received_date;
CREATE INDEX IF NOT EXISTS idx_emails_cache_received_at ON emails_cache(received_at DESC);

-- Recréer la contrainte unique avec le nouveau nom
ALTER TABLE emails_cache 
  DROP CONSTRAINT IF EXISTS emails_cache_account_id_email_id_key;

ALTER TABLE emails_cache 
  ADD CONSTRAINT emails_cache_account_id_external_message_id_key 
  UNIQUE(account_id, external_message_id);

-- Mettre à jour les commentaires
COMMENT ON TABLE emails_cache IS 'Cache des emails synchronisés depuis Gmail/Outlook - Mis à jour 2025-11-12';
COMMENT ON COLUMN emails_cache.external_message_id IS 'ID du message dans Gmail/Outlook';
COMMENT ON COLUMN emails_cache.received_at IS 'Date de réception du message';
COMMENT ON COLUMN emails_cache.is_auto_replied IS 'True si IA a envoyé une réponse automatique';
COMMENT ON COLUMN emails_cache.category IS 'Catégorie générale détectée par IA';
COMMENT ON COLUMN emails_cache.support_category IS 'Catégorie support détaillée (FACTURATION, TECHNIQUE, etc.)';
