-- Vérifier la structure actuelle de la table mail_accounts
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'mail_accounts'
ORDER BY ordinal_position;
