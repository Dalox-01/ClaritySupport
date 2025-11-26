-- Vérifier la structure actuelle de la table users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Vérifier la structure actuelle de la table automation_rules
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'automation_rules'
ORDER BY ordinal_position;
