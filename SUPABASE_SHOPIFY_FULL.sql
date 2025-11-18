-- ============================================================
-- SUPABASE - CONFIGURATION COMPLÈTE IA + SHOPIFY (18/11/2025)
-- ============================================================
-- Ce script unique couvre :
--   3. Tables Shopify (shops / orders / customers)
--   4. Fonctions PostgreSQL (limites & analytics)
--   5. Row Level Security + vues de rétrocompatibilité
--   6. Requêtes de vérification finales
--
-- Mode d'emploi :
--   • Ouvrir Supabase Dashboard → SQL Editor → Nouveau script
--   • Copier / coller l'ENTIÈRETÉ de ce fichier
--   • Cliquer sur "Run" (l'exécution est idempotente)
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 0. EXTENSIONS
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 1. IA - BASE DE CONNAISSANCES UTILISATEURS
-- ------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS knowledge_base JSONB;

COMMENT ON COLUMN public.users.knowledge_base IS
  'Base de connaissances (produits, FAQ, règles métier) utilisée par l''IA pour générer des réponses précises';

CREATE INDEX IF NOT EXISTS idx_users_knowledge_base ON public.users USING GIN (knowledge_base);

-- ------------------------------------------------------------
-- 2. SUBSCRIPTIONS - SEGMENTATION (E-COMMERCE vs FREELANCE)
-- ------------------------------------------------------------
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS segment TEXT CHECK (segment IN ('shopify','freelance'));

-- Plans e-commerce = accès Shopify
UPDATE public.subscriptions SET segment = 'shopify'
WHERE segment IS NULL AND plan IN ('STARTER','PRO','SCALE');

-- Reste = freestyle (pas d'accès Shopify)
UPDATE public.subscriptions SET segment = 'freelance'
WHERE segment IS NULL;

-- ------------------------------------------------------------
-- 3. TABLE PRINCIPALE - SHOPIFY_SHOPS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shopify_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  shop_name TEXT,
  access_token TEXT NOT NULL,
  scope TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending','active','inactive','error')),
  is_active BOOLEAN GENERATED ALWAYS AS (status = 'active') STORED,
  currency TEXT DEFAULT 'EUR',
  timezone TEXT,
  webhook_registered BOOLEAN DEFAULT FALSE,
  total_orders INTEGER DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  total_revenue NUMERIC(14,2) DEFAULT 0,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, shop_domain)
);

CREATE INDEX IF NOT EXISTS idx_shopify_shops_user_id   ON public.shopify_shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_shops_domain    ON public.shopify_shops(shop_domain);
CREATE INDEX IF NOT EXISTS idx_shopify_shops_status    ON public.shopify_shops(status);

-- ------------------------------------------------------------
-- 4. TABLE COMMANDES - SHOPIFY_ORDERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shopify_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shopify_shops(id) ON DELETE CASCADE,
  shopify_order_id BIGINT NOT NULL,
  order_number TEXT NOT NULL,
  name TEXT,
  source_name TEXT,
  financial_status TEXT,
  fulfillment_status TEXT,
  total_price NUMERIC(14,2) DEFAULT 0,
  subtotal_price NUMERIC(14,2),
  total_tax NUMERIC(14,2),
  currency TEXT,
  customer_email TEXT,
  customer_name TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  line_items JSONB,
  shipping_lines JSONB,
  tracking_company TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  tags TEXT[],
  created_at_shopify TIMESTAMPTZ,
  processed_at_shopify TIMESTAMPTZ,
  fulfilled_at_shopify TIMESTAMPTZ,
  cancelled_at_shopify TIMESTAMPTZ,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (shop_id, shopify_order_id)
);

CREATE INDEX IF NOT EXISTS idx_shopify_orders_shop          ON public.shopify_orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_created       ON public.shopify_orders(created_at_shopify DESC);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_order_number  ON public.shopify_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_customer_mail ON public.shopify_orders(customer_email);

-- ------------------------------------------------------------
-- 5. TABLE CLIENTS - SHOPIFY_CUSTOMERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shopify_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shopify_shops(id) ON DELETE CASCADE,
  shopify_customer_id BIGINT NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  orders_count INTEGER DEFAULT 0,
  total_spent NUMERIC(14,2) DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (shop_id, shopify_customer_id)
);

CREATE INDEX IF NOT EXISTS idx_shopify_customers_shop  ON public.shopify_customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_shopify_customers_email ON public.shopify_customers(email);

-- ------------------------------------------------------------
-- 6. VUE DE RÉTROCOMPATIBILITÉ (plan-enforcement utilise shopify_stores)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.shopify_stores AS
SELECT
  s.id,
  s.user_id,
  s.shop_domain,
  s.shop_name,
  s.status,
  s.is_active,
  s.total_orders,
  s.total_customers,
  s.total_revenue,
  s.created_at,
  s.updated_at
FROM public.shopify_shops s;

-- ------------------------------------------------------------
-- 7. FONCTION : LIMITES PAR PLAN
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_shopify_shop_limit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_plan TEXT;
  v_segment TEXT;
  v_current INTEGER := 0;
  v_max INTEGER := 0;
  v_has_access BOOLEAN := FALSE;
  v_can_add BOOLEAN := FALSE;
BEGIN
  SELECT COALESCE(s.plan, 'FREE'), COALESCE(s.segment, 'freelance')
  INTO v_plan, v_segment
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
  ORDER BY s.created_at DESC NULLS LAST
  LIMIT 1;

  IF v_plan IS NULL THEN
    v_plan := 'FREE';
  END IF;

  SELECT COUNT(*)
  INTO v_current
  FROM public.shopify_shops
  WHERE user_id = p_user_id
    AND status = 'active';

  IF v_segment = 'shopify' AND v_plan IN ('STARTER','PRO','SCALE') THEN
    v_has_access := TRUE;
    IF v_plan = 'STARTER' THEN
      v_max := 1;
    ELSIF v_plan = 'PRO' THEN
      v_max := 3;
    ELSIF v_plan = 'SCALE' THEN
      v_max := -1; -- illimité
    ELSE
      v_max := 0;
    END IF;
  ELSE
    v_has_access := FALSE;
    v_max := 0;
  END IF;

  IF v_has_access THEN
    IF v_max = -1 THEN
      v_can_add := TRUE;
    ELSE
      v_can_add := v_current < v_max;
    END IF;
  ELSE
    v_can_add := FALSE;
  END IF;

  RETURN jsonb_build_object(
    'plan', v_plan,
    'segment', v_segment,
    'currentShops', v_current,
    'maxShops', v_max,
    'hasAccess', v_has_access,
    'canAddMore', v_can_add
  );
END;
$$;

-- ------------------------------------------------------------
-- 8. FONCTION : MISE À JOUR DES STATISTIQUES
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_shop_statistics(p_shop_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_orders INTEGER := 0;
  v_customers INTEGER := 0;
  v_revenue NUMERIC(14,2) := 0;
BEGIN
  SELECT
    COUNT(*),
    COALESCE(SUM(total_price), 0)
  INTO v_orders, v_revenue
  FROM public.shopify_orders
  WHERE shop_id = p_shop_id;

  SELECT COUNT(DISTINCT customer_email)
  INTO v_customers
  FROM public.shopify_orders
  WHERE shop_id = p_shop_id
    AND customer_email IS NOT NULL;

  UPDATE public.shopify_shops
  SET total_orders = v_orders,
      total_customers = v_customers,
      total_revenue = v_revenue,
      last_sync_at = NOW()
  WHERE id = p_shop_id;
END;
$$;

-- ------------------------------------------------------------
-- 9. TRIGGERS updated_at / sync stats
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_shopify_shops_updated   ON public.shopify_shops;
DROP TRIGGER IF EXISTS trg_shopify_orders_updated  ON public.shopify_orders;
DROP TRIGGER IF EXISTS trg_shopify_customers_upd   ON public.shopify_customers;

CREATE TRIGGER trg_shopify_shops_updated
  BEFORE UPDATE ON public.shopify_shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER trg_shopify_orders_updated
  BEFORE UPDATE ON public.shopify_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER trg_shopify_customers_upd
  BEFORE UPDATE ON public.shopify_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

-- Mettre à jour les stats dès qu'une commande est modifiée
CREATE OR REPLACE FUNCTION public.refresh_shopify_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_shop_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_shop_id := OLD.shop_id;
  ELSE
    v_shop_id := NEW.shop_id;
  END IF;

  PERFORM public.update_shop_statistics(v_shop_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_shopify_orders_stats ON public.shopify_orders;
CREATE TRIGGER trg_shopify_orders_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.shopify_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_shopify_stats();

-- ------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------
ALTER TABLE public.shopify_shops    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_customers ENABLE ROW LEVEL SECURITY;

-- SHOPIFY_SHOPS
DROP POLICY IF EXISTS shopify_shops_select_policy ON public.shopify_shops;
CREATE POLICY shopify_shops_select_policy
  ON public.shopify_shops
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS shopify_shops_insert_policy ON public.shopify_shops;
CREATE POLICY shopify_shops_insert_policy
  ON public.shopify_shops
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS shopify_shops_update_policy ON public.shopify_shops;
CREATE POLICY shopify_shops_update_policy
  ON public.shopify_shops
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS shopify_shops_delete_policy ON public.shopify_shops;
CREATE POLICY shopify_shops_delete_policy
  ON public.shopify_shops
  FOR DELETE USING (auth.uid() = user_id);

-- SHOPIFY_ORDERS
DROP POLICY IF EXISTS shopify_orders_select_policy ON public.shopify_orders;
CREATE POLICY shopify_orders_select_policy
  ON public.shopify_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shopify_shops s
      WHERE s.id = shopify_orders.shop_id
        AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS shopify_orders_modify_policy ON public.shopify_orders;
CREATE POLICY shopify_orders_modify_policy
  ON public.shopify_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shopify_shops s
      WHERE s.id = shopify_orders.shop_id
        AND s.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopify_shops s
      WHERE s.id = shopify_orders.shop_id
        AND s.user_id = auth.uid()
    )
  );

-- SHOPIFY_CUSTOMERS
DROP POLICY IF EXISTS shopify_customers_select_policy ON public.shopify_customers;
CREATE POLICY shopify_customers_select_policy
  ON public.shopify_customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shopify_shops s
      WHERE s.id = shopify_customers.shop_id
        AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS shopify_customers_modify_policy ON public.shopify_customers;
CREATE POLICY shopify_customers_modify_policy
  ON public.shopify_customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shopify_shops s
      WHERE s.id = shopify_customers.shop_id
        AND s.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopify_shops s
      WHERE s.id = shopify_customers.shop_id
        AND s.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 11. REQUÊTES DE CONTRÔLE
-- ------------------------------------------------------------
-- 11.1 Vérifier les colonnes critiques
SELECT 'users' AS table, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'knowledge_base'
UNION ALL
SELECT 'subscriptions', column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions' AND column_name = 'segment';

-- 11.2 Vérifier la structure Shopify
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('shopify_shops','shopify_orders','shopify_customers')
ORDER BY table_name, ordinal_position;

-- 11.3 Vérifier les policies actives
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('shopify_shops','shopify_orders','shopify_customers')
ORDER BY tablename, policyname;

-- 11.4 Tester la fonction de limites (remplacer par un user réel)
-- SELECT check_shopify_shop_limit('00000000-0000-0000-0000-000000000000');

COMMIT;

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
