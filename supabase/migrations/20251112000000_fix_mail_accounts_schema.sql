-- Migration: Correction du schéma mail_accounts
-- Date: 2025-11-12
-- Description: Renommer les colonnes pour correspondre au code

-- Renommer access_token_encrypted -> access_token
ALTER TABLE mail_accounts 
  RENAME COLUMN access_token_encrypted TO access_token;

-- Renommer refresh_token_encrypted -> refresh_token
ALTER TABLE mail_accounts 
  RENAME COLUMN refresh_token_encrypted TO refresh_token;

-- Supprimer la colonne sync_enabled (on utilise seulement is_active)
ALTER TABLE mail_accounts 
  DROP COLUMN IF EXISTS sync_enabled;

-- Renommer last_sync_at -> last_sync
ALTER TABLE mail_accounts 
  RENAME COLUMN last_sync_at TO last_sync;

-- Mettre à jour les commentaires
COMMENT ON TABLE mail_accounts IS 'Comptes email connectés (Gmail, Outlook) - Mis à jour 2025-11-12';
COMMENT ON COLUMN mail_accounts.access_token IS 'Token d''accès chiffré';
COMMENT ON COLUMN mail_accounts.refresh_token IS 'Token de rafraîchissement chiffré';
COMMENT ON COLUMN mail_accounts.token_expires_at IS 'Date d''expiration du token';
COMMENT ON COLUMN mail_accounts.is_active IS 'Compte actif ou non';
COMMENT ON COLUMN mail_accounts.last_sync IS 'Date de dernière synchronisation';
