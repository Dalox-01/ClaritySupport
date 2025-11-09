-- Migration: Ajout du comptage d'usage Mail Center
-- ⚠️ MIGRATION OBSOLÈTE - Quota unifié maintenant utilisé (usage_count)
-- Cette migration n'est plus nécessaire car le système utilise un quota global

-- Les colonnes ci-dessous ne sont plus nécessaires avec le quota unifié
-- Si vous les avez déjà créées, vous pouvez les garder (elles ne sont pas utilisées)
-- Ou les supprimer avec le script 20250105_cleanup_unused_columns.sql

-- ALTER TABLE users ADD COLUMN IF NOT EXISTS mail_center_usage integer NOT NULL DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS mail_center_usage_month integer NOT NULL DEFAULT 0;
-- CREATE INDEX IF NOT EXISTS idx_users_mail_center_usage ON users(mail_center_usage_month, mail_center_usage);
-- COMMENT ON COLUMN users.mail_center_usage IS 'Nombre de réponses automatiques générées ce mois-ci dans Mail Center';
-- COMMENT ON COLUMN users.mail_center_usage_month IS 'Mois de référence pour le comptage Mail Center (format YYYYMM)';

-- NOTE: Le système utilise maintenant usage_count et usage_month pour TOUT (quota global)

