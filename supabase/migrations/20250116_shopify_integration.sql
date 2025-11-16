-- Migration: Intégration Shopify pour Mail Center
-- Date: 2025-01-16
-- Description: Tables pour gérer les connexions Shopify avec limitations par plan

-- Table: shopify_shops
-- Stocke les boutiques Shopify connectées par utilisateur
CREATE TABLE IF NOT EXISTS shopify_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Informations de la boutique
  shop_domain TEXT NOT NULL, -- ex: ma-boutique.myshopify.com
  shop_name TEXT,
  shop_email TEXT,
  shop_currency TEXT DEFAULT 'EUR',
  shop_timezone TEXT DEFAULT 'Europe/Paris',
  
  -- Tokens d'accès Shopify
  access_token TEXT NOT NULL, -- Token pour l'API Shopify
  scope TEXT, -- Permissions accordées
  
  -- Statut
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'error')),
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT CHECK (sync_status IN ('success', 'error', 'in_progress')),
  sync_error TEXT,
  
  -- Statistiques (cache)
  total_orders INTEGER DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index et contraintes
  UNIQUE(user_id, shop_domain)
);

-- Index pour performance
CREATE INDEX idx_shopify_shops_user_id ON shopify_shops(user_id);
CREATE INDEX idx_shopify_shops_status ON shopify_shops(status);
CREATE INDEX idx_shopify_shops_last_sync ON shopify_shops(last_sync_at);

-- Row Level Security (RLS)
ALTER TABLE shopify_shops ENABLE ROW LEVEL SECURITY;

-- Politique: L'utilisateur ne peut voir que ses boutiques
CREATE POLICY "Users can view their own shops"
  ON shopify_shops
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: L'utilisateur peut insérer ses boutiques
CREATE POLICY "Users can insert their own shops"
  ON shopify_shops
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: L'utilisateur peut modifier ses boutiques
CREATE POLICY "Users can update their own shops"
  ON shopify_shops
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique: L'utilisateur peut supprimer ses boutiques
CREATE POLICY "Users can delete their own shops"
  ON shopify_shops
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger: Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_shopify_shops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shopify_shops_updated_at
  BEFORE UPDATE ON shopify_shops
  FOR EACH ROW
  EXECUTE FUNCTION update_shopify_shops_updated_at();

-- ============================================
-- Table: shopify_orders
-- Stocke les commandes synchronisées depuis Shopify
-- ============================================
CREATE TABLE IF NOT EXISTS shopify_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shopify_shops(id) ON DELETE CASCADE,
  
  -- Identifiants Shopify
  shopify_order_id BIGINT NOT NULL, -- ID de la commande Shopify
  order_number TEXT NOT NULL, -- Numéro de commande (#1001)
  
  -- Informations client
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  
  -- Détails de la commande
  total_price DECIMAL(10,2),
  subtotal_price DECIMAL(10,2),
  total_tax DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  
  -- Statut
  financial_status TEXT, -- paid, pending, refunded, etc.
  fulfillment_status TEXT, -- fulfilled, partial, unfulfilled
  
  -- Dates
  created_at_shopify TIMESTAMPTZ NOT NULL,
  updated_at_shopify TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Métadonnées
  line_items_count INTEGER DEFAULT 0,
  note TEXT,
  tags TEXT[],
  
  -- Synchronisation
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(shop_id, shopify_order_id)
);

-- Index pour performance
CREATE INDEX idx_shopify_orders_shop_id ON shopify_orders(shop_id);
CREATE INDEX idx_shopify_orders_customer_email ON shopify_orders(customer_email);
CREATE INDEX idx_shopify_orders_created_at ON shopify_orders(created_at_shopify);
CREATE INDEX idx_shopify_orders_financial_status ON shopify_orders(financial_status);

-- RLS pour shopify_orders
ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view orders from their shops"
  ON shopify_orders
  FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shopify_shops WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Table: shopify_customers
-- Stocke les clients synchronisés depuis Shopify
-- ============================================
CREATE TABLE IF NOT EXISTS shopify_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shopify_shops(id) ON DELETE CASCADE,
  
  -- Identifiants Shopify
  shopify_customer_id BIGINT NOT NULL,
  
  -- Informations client
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  
  -- Statistiques
  orders_count INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  
  -- Statut
  state TEXT, -- enabled, disabled, invited
  verified_email BOOLEAN DEFAULT false,
  
  -- Dates
  created_at_shopify TIMESTAMPTZ,
  updated_at_shopify TIMESTAMPTZ,
  
  -- Synchronisation
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(shop_id, shopify_customer_id)
);

-- Index pour performance
CREATE INDEX idx_shopify_customers_shop_id ON shopify_customers(shop_id);
CREATE INDEX idx_shopify_customers_email ON shopify_customers(email);

-- RLS pour shopify_customers
ALTER TABLE shopify_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view customers from their shops"
  ON shopify_customers
  FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shopify_shops WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Fonction: Vérifier les limites de boutiques Shopify par plan
-- ============================================
CREATE OR REPLACE FUNCTION check_shopify_shop_limit(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_plan TEXT;
  v_current_shops INTEGER;
  v_max_shops INTEGER;
BEGIN
  -- Récupérer le plan de l'utilisateur
  SELECT plan INTO v_user_plan
  FROM users
  WHERE id = p_user_id;
  
  -- Compter les boutiques actives
  SELECT COUNT(*) INTO v_current_shops
  FROM shopify_shops
  WHERE user_id = p_user_id
  AND status != 'inactive';
  
  -- Définir les limites par plan
  CASE UPPER(v_user_plan)
    WHEN 'STARTER' THEN v_max_shops := 1;
    WHEN 'PRO' THEN v_max_shops := 3;
    WHEN 'ENTERPRISE' THEN v_max_shops := 999999; -- Illimité
    ELSE v_max_shops := 0; -- Plans freelance n'ont pas accès
  END CASE;
  
  -- Retourner les informations
  RETURN jsonb_build_object(
    'plan', v_user_plan,
    'currentShops', v_current_shops,
    'maxShops', v_max_shops,
    'canAddMore', v_current_shops < v_max_shops,
    'hasAccess', v_max_shops > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Fonction: Synchroniser les statistiques d'une boutique
-- ============================================
CREATE OR REPLACE FUNCTION update_shop_statistics(p_shop_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE shopify_shops
  SET
    total_orders = (
      SELECT COUNT(*)
      FROM shopify_orders
      WHERE shop_id = p_shop_id
    ),
    total_customers = (
      SELECT COUNT(*)
      FROM shopify_customers
      WHERE shop_id = p_shop_id
    ),
    total_revenue = (
      SELECT COALESCE(SUM(total_price), 0)
      FROM shopify_orders
      WHERE shop_id = p_shop_id
      AND financial_status = 'paid'
    )
  WHERE id = p_shop_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires pour documentation
COMMENT ON TABLE shopify_shops IS 'Boutiques Shopify connectées par utilisateur avec limitations par plan (Starter: 1, Pro: 3, Enterprise: illimité)';
COMMENT ON TABLE shopify_orders IS 'Commandes synchronisées depuis Shopify pour analyse et support client';
COMMENT ON TABLE shopify_customers IS 'Clients Shopify synchronisés pour un meilleur suivi';
COMMENT ON FUNCTION check_shopify_shop_limit IS 'Vérifie si l''utilisateur peut ajouter une boutique selon son plan';
COMMENT ON FUNCTION update_shop_statistics IS 'Met à jour les statistiques d''une boutique (commandes, clients, revenus)';
