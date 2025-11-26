-- Création des tables manquantes pour l'IA et les filtres

-- 1. Table automation_rules (Règles d'automatisation / Filtres)
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0,
  triggers JSONB DEFAULT '{}'::jsonb,
  action_type TEXT NOT NULL,
  action_config JSONB DEFAULT '{}'::jsonb,
  mode TEXT DEFAULT 'auto',
  require_validation_if_urgent BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 2. Table response_templates (Templates de réponse)
CREATE TABLE IF NOT EXISTS response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tone TEXT DEFAULT 'professionnel',
  body_template TEXT,
  ai_prompt_override TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 3. Table ai_settings (Paramètres IA globaux)
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Activer RLS
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS (Permissives pour le moment, à restreindre par user_id plus tard si besoin)
CREATE POLICY "Allow all for authenticated users" ON automation_rules FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON response_templates FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON ai_settings FOR ALL USING (true);

-- 6. Ajouter la colonne ai_prompt_config à la table users si elle n'existe pas (au cas où)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'ai_prompt_config') THEN
        ALTER TABLE users ADD COLUMN ai_prompt_config JSONB;
    END IF;
END $$;
