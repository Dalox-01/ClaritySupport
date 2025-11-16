-- ============================================================
-- MIGRATION SHOPIFY - À EXÉCUTER DANS SUPABASE SQL EDITOR
-- Copier-coller ce fichier ENTIER dans Supabase > SQL Editor
-- ============================================================

-- ÉTAPE 1: Ajouter la colonne segment
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS segment TEXT DEFAULT 'shopify' CHECK (segment IN ('shopify', 'freelance'));

-- ÉTAPE 2: Créer la table shopify_connections
CREATE TABLE IF NOT EXISTS public.shopify_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  access_token TEXT,
  scope TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'error')),
  webhook_registered BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, shop_domain)
);

-- ÉTAPE 3: Créer les index
CREATE INDEX IF NOT EXISTS idx_shopify_connections_user_id ON public.shopify_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_connections_status ON public.shopify_connections(status);

-- ÉTAPE 4: Activer RLS
ALTER TABLE public.shopify_connections ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 5: Créer les politiques RLS
DROP POLICY IF EXISTS "Users can view own shopify connections" ON public.shopify_connections;
CREATE POLICY "Users can view own shopify connections"
  ON public.shopify_connections
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own shopify connections" ON public.shopify_connections;
CREATE POLICY "Users can insert own shopify connections"
  ON public.shopify_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own shopify connections" ON public.shopify_connections;
CREATE POLICY "Users can update own shopify connections"
  ON public.shopify_connections
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own shopify connections" ON public.shopify_connections;
CREATE POLICY "Users can delete own shopify connections"
  ON public.shopify_connections
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ÉTAPE 6: Créer le trigger updated_at
CREATE OR REPLACE FUNCTION public.update_shopify_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shopify_connections_timestamp ON public.shopify_connections;
CREATE TRIGGER update_shopify_connections_timestamp
  BEFORE UPDATE ON public.shopify_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shopify_connections_updated_at();

-- ÉTAPE 7: Assigner les segments aux abonnements existants
-- E-commerce (Shopify)
UPDATE public.subscriptions 
SET segment = 'shopify' 
WHERE plan IN ('STARTER', 'PRO', 'SCALE');

-- Freelance
UPDATE public.subscriptions 
SET segment = 'freelance' 
WHERE plan IN ('SOLO', 'UNLIMITED');

-- Plans PRO ambigus : par défaut shopify si pas déjà défini
UPDATE public.subscriptions 
SET segment = 'shopify' 
WHERE plan = 'PRO' AND segment IS NULL;

-- VÉRIFICATION FINALE
SELECT 
  'subscriptions' as table_name,
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' AND column_name = 'segment'
UNION ALL
SELECT 
  'shopify_connections' as table_name,
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'shopify_connections'
ORDER BY table_name, column_name;

-- Afficher les abonnements avec leur segment
SELECT 
  u.email,
  s.plan,
  s.segment,
  s.status
FROM subscriptions s
JOIN users u ON u.id = s.user_id
ORDER BY s.segment, s.plan;
