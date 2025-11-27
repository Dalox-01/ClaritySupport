-- Migration: Resend inbox onboarding and webhook support
-- Description: Adapte mail_accounts pour les adresses de routage et supprime la dépendance OAuth obligatoire

BEGIN;

-- Étendre la liste des providers autorisés
ALTER TABLE mail_accounts
  DROP CONSTRAINT IF EXISTS mail_accounts_provider_check;

ALTER TABLE mail_accounts
  ADD CONSTRAINT mail_accounts_provider_check
  CHECK (provider IN ('gmail', 'outlook', 'resend'));

-- Autoriser les comptes sans jetons OAuth
ALTER TABLE mail_accounts ALTER COLUMN access_token DROP NOT NULL;
ALTER TABLE mail_accounts ALTER COLUMN refresh_token DROP NOT NULL;
ALTER TABLE mail_accounts ALTER COLUMN token_expires_at DROP NOT NULL;

-- Colonnes utilisées par la connexion Resend
ALTER TABLE mail_accounts
  ADD COLUMN IF NOT EXISTS routing_email TEXT,
  ADD COLUMN IF NOT EXISTS support_email TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'waiting_test', 'connected', 'error')),
  ADD COLUMN IF NOT EXISTS verification_code TEXT,
  ADD COLUMN IF NOT EXISTS last_verification_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_inbound_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resend_config JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Renseigner un état cohérent pour les comptes existants
UPDATE mail_accounts
SET verification_status = 'connected'
WHERE provider IN ('gmail', 'outlook')
  AND (verification_status IS NULL OR verification_status = 'pending');

-- Unicité sur l'adresse de routage
CREATE UNIQUE INDEX IF NOT EXISTS mail_accounts_routing_email_key
  ON mail_accounts(routing_email)
  WHERE routing_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mail_accounts_verification_status
  ON mail_accounts(verification_status);

COMMIT;
