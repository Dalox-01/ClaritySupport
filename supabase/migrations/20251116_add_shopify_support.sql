-- Migration: Ajout support Shopify pour utilisateurs e-commerce
-- Date: 2025-11-16

-- ============================================================
-- 1. Ajouter la colonne 'segment' à la table subscriptions
-- ============================================================
-- Cette colonne permet de différencier les plans e-commerce vs freelance
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS segment TEXT DEFAULT 'shopify' CHECK (segment IN ('shopify', 'freelance'));

COMMENT ON COLUMN public.subscriptions.segment IS 'Type d''abonnement: shopify (e-commerce) ou freelance';

-- Mettre à jour les abonnements existants selon leur plan
-- Les plans STARTER/PRO/SCALE sont e-commerce par défaut
UPDATE public.subscriptions 
SET segment = 'shopify' 
WHERE plan IN ('STARTER', 'PRO', 'SCALE') AND segment IS NULL;

-- Les plans SOLO/PRO/UNLIMITED sont freelance
UPDATE public.subscriptions 
SET segment = 'freelance' 
WHERE plan IN ('SOLO', 'UNLIMITED') AND segment IS NULL;

-- ============================================================
-- 2. Créer la table shopify_connections
-- ============================================================
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
  
  -- Contrainte unique: un utilisateur ne peut pas connecter 2x la même boutique
  UNIQUE(user_id, shop_domain)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_shopify_connections_user_id ON public.shopify_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_connections_status ON public.shopify_connections(status);

COMMENT ON TABLE public.shopify_connections IS 'Connexions Shopify des utilisateurs e-commerce';
COMMENT ON COLUMN public.shopify_connections.shop_domain IS 'Domaine de la boutique (ex: ma-boutique.myshopify.com)';
COMMENT ON COLUMN public.shopify_connections.access_token IS 'Token OAuth Shopify (chiffré côté application)';
COMMENT ON COLUMN public.shopify_connections.status IS 'État: pending (OAuth en cours), active (connecté), inactive (déconnecté), error (erreur)';
COMMENT ON COLUMN public.shopify_connections.webhook_registered IS 'Webhooks Shopify configurés (pour sync commandes)';

-- ============================================================
-- 3. Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.shopify_connections ENABLE ROW LEVEL SECURITY;

-- Politique: Utilisateurs peuvent voir leurs propres connexions
CREATE POLICY "Users can view own shopify connections"
  ON public.shopify_connections
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Politique: Utilisateurs peuvent insérer leurs propres connexions
CREATE POLICY "Users can insert own shopify connections"
  ON public.shopify_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Politique: Utilisateurs peuvent mettre à jour leurs propres connexions
CREATE POLICY "Users can update own shopify connections"
  ON public.shopify_connections
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politique: Utilisateurs peuvent supprimer leurs propres connexions
CREATE POLICY "Users can delete own shopify connections"
  ON public.shopify_connections
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 4. Fonction trigger pour updated_at
-- ============================================================
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

-- ============================================================
-- 5. Vue pour statistiques Shopify par utilisateur
-- ============================================================
CREATE OR REPLACE VIEW public.shopify_stats AS
SELECT 
  user_id,
  COUNT(*) as total_shops,
  COUNT(*) FILTER (WHERE status = 'active') as active_shops,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_shops,
  MAX(created_at) as last_connection_at
FROM public.shopify_connections
GROUP BY user_id;

COMMENT ON VIEW public.shopify_stats IS 'Statistiques des connexions Shopify par utilisateur';

-- ============================================================
-- 6. Fonction pour vérifier les limites Shopify selon le plan
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_shopify_limit(p_user_id UUID)
RETURNS TABLE (
  can_add_shop BOOLEAN,
  current_count INTEGER,
  max_allowed INTEGER,
  plan TEXT
) AS $$
DECLARE
  v_plan TEXT;
  v_segment TEXT;
  v_current_count INTEGER;
  v_max_allowed INTEGER;
BEGIN
  -- Récupérer le plan et segment de l'utilisateur
  SELECT s.plan, s.segment
  INTO v_plan, v_segment
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id AND s.status = 'active'
  LIMIT 1;
  
  -- Si pas d'abonnement ou segment freelance, pas d'accès Shopify
  IF v_plan IS NULL OR v_segment = 'freelance' THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'NONE'::TEXT;
    RETURN;
  END IF;
  
  -- Compter les boutiques actuelles
  SELECT COUNT(*)
  INTO v_current_count
  FROM public.shopify_connections
  WHERE user_id = p_user_id;
  
  -- Déterminer la limite selon le plan
  v_max_allowed := CASE 
    WHEN v_plan = 'STARTER' THEN 1
    WHEN v_plan = 'PRO' THEN 3
    WHEN v_plan = 'SCALE' THEN 999
    ELSE 0
  END;
  
  -- Retourner le résultat
  RETURN QUERY SELECT 
    (v_current_count < v_max_allowed) as can_add_shop,
    v_current_count as current_count,
    v_max_allowed as max_allowed,
    v_plan as plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_shopify_limit IS 'Vérifie si l''utilisateur peut ajouter une boutique Shopify selon son plan';

-- ============================================================
-- Test de la migration
-- ============================================================
-- Vérifier la structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('subscriptions', 'shopify_connections')
ORDER BY table_name, ordinal_position;

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'shopify_connections';

COMMENT ON COLUMN public.subscriptions.segment IS 'Type d''abonnement: shopify (e-commerce) ou freelance (ajouté 2025-11-16)';
