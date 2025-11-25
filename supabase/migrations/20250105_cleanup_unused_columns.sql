-- Migration: Nettoyage des colonnes inutilisées (quota unifié)

-- Les colonnes mail_center_usage et mail_center_usage_month ne sont plus nécessaires
-- car nous utilisons maintenant usage_count et usage_month pour le quota global

-- OPTIONNEL: Vous pouvez supprimer ces colonnes si elles ont été créées
-- Décommentez les lignes ci-dessous pour les supprimer

-- ALTER TABLE users DROP COLUMN IF EXISTS mail_center_usage;
-- ALTER TABLE users DROP COLUMN IF EXISTS mail_center_usage_month;
-- DROP INDEX IF EXISTS idx_users_mail_center_usage;

-- NOTE: Ces colonnes ne sont pas obligatoires à supprimer
-- Elles peuvent rester dans la base sans impact sur le fonctionnement

