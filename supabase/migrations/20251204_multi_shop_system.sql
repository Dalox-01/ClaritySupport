-- ============================================================
-- MIGRATION: Système Multi-Boutiques avec Signatures
-- Date: 2025-12-04
-- Description: 
--   - Ajoute une table shops pour gérer les boutiques utilisateur
--   - Lie les signatures aux boutiques
--   - Lie les comptes email aux boutiques
--   - Lie les configurations IA aux boutiques
-- ============================================================

-- ============================================================
-- 1. TABLE SHOPS (Boutiques utilisateur)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  
  -- Informations de base
  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  
  -- Personnalisation visuelle
  color TEXT DEFAULT '#3B82F6', -- Couleur par défaut (bleu)
  logo_url TEXT,
  
  -- Liaison e-commerce (optionnel)
  platform TEXT CHECK (platform IN ('shopify', 'woocommerce', 'prestashop', 'custom', NULL)),
  external_shop_id TEXT, -- ID de la boutique sur la plateforme externe
  shop_domain TEXT,
  
  -- Statut
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Métadonnées
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  UNIQUE(user_id, name)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON public.shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_is_active ON public.shops(is_active);
CREATE INDEX IF NOT EXISTS idx_shops_external_id ON public.shops(external_shop_id);

-- ============================================================
-- 2. TABLE SHOP_EMAIL_SIGNATURES (Signatures par boutique)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shop_email_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  
  -- Contenu de la signature
  name TEXT NOT NULL DEFAULT 'Signature principale',
  closing_text TEXT DEFAULT 'Cordialement,',
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  sender_title TEXT, -- Ex: "Responsable Support Client"
  
  -- Informations complémentaires
  phone TEXT,
  website TEXT,
  address TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  
  -- Logo/Image
  logo_url TEXT,
  logo_width INTEGER DEFAULT 150,
  
  -- Contenu HTML personnalisé (optionnel)
  custom_html TEXT,
  
  -- Paramètres
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_shop_signatures_shop_id ON public.shop_email_signatures(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_signatures_user_id ON public.shop_email_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_signatures_default ON public.shop_email_signatures(is_default);

-- ============================================================
-- 3. TABLE SHOP_AI_CONFIGURATIONS (Config IA par boutique)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shop_ai_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  
  -- Configuration IA de base
  model TEXT DEFAULT 'gpt-4o-mini',
  max_tokens INTEGER DEFAULT 300,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  
  -- Ton et style
  tone TEXT DEFAULT 'professional' CHECK (tone IN ('professional', 'friendly', 'formal', 'casual', 'empathetic')),
  language TEXT DEFAULT 'fr',
  response_length TEXT DEFAULT 'medium' CHECK (response_length IN ('short', 'medium', 'long')),
  
  -- Réponses automatiques
  auto_reply_enabled BOOLEAN DEFAULT FALSE,
  require_validation BOOLEAN DEFAULT TRUE,
  
  -- Contexte boutique
  business_context TEXT,
  custom_instructions TEXT,
  faq_content TEXT,
  
  -- Signature par défaut liée
  default_signature_id UUID REFERENCES public.shop_email_signatures(id) ON DELETE SET NULL,
  
  -- Templates par catégorie
  category_templates JSONB DEFAULT '{}'::jsonb,
  
  -- Paramètres avancés
  advanced_settings JSONB DEFAULT '{}'::jsonb,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Une seule config par boutique
  UNIQUE(shop_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_shop_ai_config_shop_id ON public.shop_ai_configurations(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_ai_config_user_id ON public.shop_ai_configurations(user_id);

-- ============================================================
-- 4. MODIFICATION TABLE MAIL_ACCOUNTS (Ajouter shop_id)
-- ============================================================
ALTER TABLE public.mail_accounts 
  ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_mail_accounts_shop_id ON public.mail_accounts(shop_id);

-- ============================================================
-- 5. MODIFICATION TABLE EMAILS_CACHE (Ajouter shop_id)
-- ============================================================
ALTER TABLE public.emails_cache 
  ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_emails_cache_shop_id ON public.emails_cache(shop_id);

-- ============================================================
-- 6. TRIGGERS POUR UPDATED_AT
-- ============================================================
CREATE OR REPLACE FUNCTION update_shops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_shop_signatures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_shop_ai_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers
DROP TRIGGER IF EXISTS shops_updated_at ON public.shops;
CREATE TRIGGER shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION update_shops_updated_at();

DROP TRIGGER IF EXISTS shop_signatures_updated_at ON public.shop_email_signatures;
CREATE TRIGGER shop_signatures_updated_at
  BEFORE UPDATE ON public.shop_email_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_signatures_updated_at();

DROP TRIGGER IF EXISTS shop_ai_config_updated_at ON public.shop_ai_configurations;
CREATE TRIGGER shop_ai_config_updated_at
  BEFORE UPDATE ON public.shop_ai_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_ai_config_updated_at();

-- ============================================================
-- 7. FONCTION: Créer boutique par défaut pour utilisateur
-- ============================================================
CREATE OR REPLACE FUNCTION create_default_shop_for_user(p_user_id TEXT, p_shop_name TEXT DEFAULT 'Ma Boutique')
RETURNS UUID AS $$
DECLARE
  new_shop_id UUID;
BEGIN
  -- Créer la boutique par défaut
  INSERT INTO public.shops (user_id, name, display_name, is_default)
  VALUES (p_user_id, p_shop_name, p_shop_name, TRUE)
  ON CONFLICT (user_id, name) DO NOTHING
  RETURNING id INTO new_shop_id;
  
  -- Si la boutique existe déjà, récupérer son ID
  IF new_shop_id IS NULL THEN
    SELECT id INTO new_shop_id 
    FROM public.shops 
    WHERE user_id = p_user_id AND is_default = TRUE
    LIMIT 1;
  END IF;
  
  RETURN new_shop_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 8. FONCTION: Obtenir la boutique active ou créer par défaut
-- ============================================================
CREATE OR REPLACE FUNCTION get_or_create_default_shop(p_user_id TEXT)
RETURNS UUID AS $$
DECLARE
  shop_id UUID;
BEGIN
  -- Chercher une boutique par défaut existante
  SELECT id INTO shop_id 
  FROM public.shops 
  WHERE user_id = p_user_id AND is_default = TRUE AND is_active = TRUE
  LIMIT 1;
  
  -- Si pas de boutique par défaut, chercher n'importe quelle boutique active
  IF shop_id IS NULL THEN
    SELECT id INTO shop_id 
    FROM public.shops 
    WHERE user_id = p_user_id AND is_active = TRUE
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;
  
  -- Si toujours pas de boutique, en créer une
  IF shop_id IS NULL THEN
    shop_id := create_default_shop_for_user(p_user_id);
  END IF;
  
  RETURN shop_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 9. RLS POLICIES
-- ============================================================
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_email_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_ai_configurations ENABLE ROW LEVEL SECURITY;

-- Policies pour shops
DROP POLICY IF EXISTS "Users can view their own shops" ON public.shops;
CREATE POLICY "Users can view their own shops"
  ON public.shops FOR SELECT
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can create their own shops" ON public.shops;
CREATE POLICY "Users can create their own shops"
  ON public.shops FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own shops" ON public.shops;
CREATE POLICY "Users can update their own shops"
  ON public.shops FOR UPDATE
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own shops" ON public.shops;
CREATE POLICY "Users can delete their own shops"
  ON public.shops FOR DELETE
  USING (user_id = auth.uid()::text);

-- Policies pour shop_email_signatures
DROP POLICY IF EXISTS "Users can view their own signatures" ON public.shop_email_signatures;
CREATE POLICY "Users can view their own signatures"
  ON public.shop_email_signatures FOR SELECT
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can create their own signatures" ON public.shop_email_signatures;
CREATE POLICY "Users can create their own signatures"
  ON public.shop_email_signatures FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own signatures" ON public.shop_email_signatures;
CREATE POLICY "Users can update their own signatures"
  ON public.shop_email_signatures FOR UPDATE
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own signatures" ON public.shop_email_signatures;
CREATE POLICY "Users can delete their own signatures"
  ON public.shop_email_signatures FOR DELETE
  USING (user_id = auth.uid()::text);

-- Policies pour shop_ai_configurations
DROP POLICY IF EXISTS "Users can view their own AI configs" ON public.shop_ai_configurations;
CREATE POLICY "Users can view their own AI configs"
  ON public.shop_ai_configurations FOR SELECT
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can create their own AI configs" ON public.shop_ai_configurations;
CREATE POLICY "Users can create their own AI configs"
  ON public.shop_ai_configurations FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own AI configs" ON public.shop_ai_configurations;
CREATE POLICY "Users can update their own AI configs"
  ON public.shop_ai_configurations FOR UPDATE
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own AI configs" ON public.shop_ai_configurations;
CREATE POLICY "Users can delete their own AI configs"
  ON public.shop_ai_configurations FOR DELETE
  USING (user_id = auth.uid()::text);

-- ============================================================
-- 10. COMMENTAIRES DE DOCUMENTATION
-- ============================================================
COMMENT ON TABLE public.shops IS 'Boutiques/environnements utilisateur pour le Mail Center multi-boutiques';
COMMENT ON COLUMN public.shops.color IS 'Couleur hex pour identifier visuellement la boutique';
COMMENT ON COLUMN public.shops.platform IS 'Plateforme e-commerce liée (shopify, woocommerce, etc.)';
COMMENT ON COLUMN public.shops.is_default IS 'Boutique par défaut affichée à la connexion';

COMMENT ON TABLE public.shop_email_signatures IS 'Signatures email personnalisées par boutique';
COMMENT ON COLUMN public.shop_email_signatures.closing_text IS 'Formule de politesse (Cordialement, Bien à vous, etc.)';
COMMENT ON COLUMN public.shop_email_signatures.social_links IS 'Liens réseaux sociaux en JSON';

COMMENT ON TABLE public.shop_ai_configurations IS 'Configuration IA personnalisée par boutique';
COMMENT ON COLUMN public.shop_ai_configurations.business_context IS 'Contexte métier de la boutique pour l IA';
COMMENT ON COLUMN public.shop_ai_configurations.category_templates IS 'Prompts personnalisés par catégorie de support';
