/**
 * SERVICE SHOPIFY - INTÉGRATION HAUTE PERFORMANCE
 * 
 * Gestion des boutiques Shopify avec limitations par plan :
 * - Starter: 1 boutique
 * - Pro: 3 boutiques
 * - Enterprise: illimité
 * - Freelance: aucun accès
 * 
 * Architecture:
 * - OAuth 2.0 Shopify
 * - Webhooks pour synchronisation temps réel
 * - Cache intelligent pour performance
 * - Rate limiting compliance Shopify API (2 req/s)
 */

import { supabase } from './db';

export type ShopifyPlan = 'starter' | 'pro' | 'enterprise' | 'free';

export interface ShopifyShop {
  id: string;
  user_id: string;
  shop_domain: string;
  shop_name: string | null;
  shop_email: string | null;
  access_token: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  total_orders: number;
  total_customers: number;
  total_revenue: number;
  last_sync_at: string | null;
  created_at: string;
}

export interface ShopifyOrder {
  id: string;
  shop_id: string;
  shopify_order_id: number;
  order_number: string;
  customer_email: string | null;
  customer_name: string | null;
  total_price: number;
  financial_status: string;
  fulfillment_status: string | null;
  created_at_shopify: string;
}

export interface ShopifyLimits {
  plan: string;
  currentShops: number;
  maxShops: number;
  canAddMore: boolean;
  hasAccess: boolean;
}

/**
 * CONFIGURATION LIMITES PAR PLAN
 */
const SHOPIFY_LIMITS: Record<string, number> = {
  'FREE': 0,       // Pas d'accès Shopify pour les plans gratuits
  'STARTER': 1,    // 1 boutique pour Starter
  'PRO': 3,        // 3 boutiques pour Pro
  'ENTERPRISE': 999999, // Illimité pour Enterprise
};

/**
 * Vérifier si l'utilisateur a accès à Shopify selon son plan
 */
export async function checkShopifyAccess(userId: string): Promise<ShopifyLimits> {
  try {
    const { data, error } = await supabase
      .rpc('check_shopify_shop_limit', { p_user_id: userId });

    if (error) {
      console.error('[SHOPIFY] Error checking limits:', error);
      throw error;
    }

    return {
      plan: data.plan,
      currentShops: data.currentShops || 0,
      maxShops: data.maxShops || 0,
      canAddMore: data.canAddMore || false,
      hasAccess: data.hasAccess || false,
    };
  } catch (error) {
    console.error('[SHOPIFY] Failed to check access:', error);
    throw error;
  }
}

/**
 * Récupérer les boutiques de l'utilisateur
 */
export async function getUserShops(userId: string): Promise<ShopifyShop[]> {
  try {
    const { data, error } = await supabase
      .from('shopify_shops')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[SHOPIFY] Error fetching shops:', error);
    throw error;
  }
}

/**
 * Créer une connexion OAuth Shopify
 * Génère l'URL d'autorisation pour l'utilisateur
 * 
 * Accepte plusieurs formats:
 * - "ma-boutique.myshopify.com" ✅
 * - "ma-boutique" ✅ (ajoute .myshopify.com automatiquement)
 * - "https://ma-boutique.myshopify.com" ✅ (nettoie le https)
 */
export function generateShopifyAuthUrl(
  shopDomain: string,
  userId: string
): string {
  const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
  const SHOPIFY_SCOPES = 'read_orders,read_customers,read_products,read_inventory';
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/callback`;
  
  if (!SHOPIFY_API_KEY) {
    throw new Error('SHOPIFY_API_KEY non configurée');
  }

  // Nettoyer le domaine
  let cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '').trim().toLowerCase();
  
  // Si c'est juste le nom (ex: "aegisvolt"), ajouter .myshopify.com
  if (!cleanDomain.includes('.')) {
    cleanDomain = `${cleanDomain}.myshopify.com`;
  }
  
  // Si c'est un domaine personnalisé (ex: "aegisvolt.shop"), erreur explicite
  if (!cleanDomain.endsWith('.myshopify.com')) {
    throw new Error(
      `DOMAINE_PERSONNALISE:Pour les domaines personnalisés comme "${cleanDomain}", ` +
      `veuillez entrer votre domaine Shopify au format "votre-boutique.myshopify.com". ` +
      `Vous le trouverez dans: Shopify Admin → Paramètres → Domaines → Domaine principal.`
    );
  }
  
  // Générer un nonce pour sécurité
  const state = Buffer.from(JSON.stringify({
    userId,
    timestamp: Date.now(),
  })).toString('base64');

  const params = new URLSearchParams({
    client_id: SHOPIFY_API_KEY,
    scope: SHOPIFY_SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
  });

  console.log(`✅ [SHOPIFY] OAuth URL generated for: ${cleanDomain}`);

  return `https://${cleanDomain}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Échanger le code OAuth contre un access_token
 */
export async function exchangeShopifyCode(
  shopDomain: string,
  code: string
): Promise<string> {
  const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
  const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

  if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
    throw new Error('Clés Shopify non configurées');
  }

  const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    const response = await fetch(
      `https://${cleanDomain}/admin/oauth/access_token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: SHOPIFY_API_KEY,
          client_secret: SHOPIFY_API_SECRET,
          code,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify OAuth error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('[SHOPIFY] OAuth exchange failed:', error);
    throw error;
  }
}

/**
 * Enregistrer une boutique dans la base de données
 */
export async function saveShopToDatabase(
  userId: string,
  shopDomain: string,
  accessToken: string
): Promise<ShopifyShop> {
  try {
    // Récupérer les informations de la boutique
    const shopInfo = await fetchShopInfo(shopDomain, accessToken);

    const { data, error } = await supabase
      .from('shopify_shops')
      .insert({
        user_id: userId,
        shop_domain: shopDomain,
        shop_name: shopInfo.name,
        shop_email: shopInfo.email,
        shop_currency: shopInfo.currency,
        shop_timezone: shopInfo.timezone,
        access_token: accessToken,
        scope: 'read_orders,read_customers,read_products,read_inventory',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ [SHOPIFY] Shop connected: ${shopDomain} for user ${userId}`);

    return data;
  } catch (error) {
    console.error('[SHOPIFY] Error saving shop:', error);
    throw error;
  }
}

/**
 * Récupérer les informations de la boutique via Shopify API
 */
async function fetchShopInfo(
  shopDomain: string,
  accessToken: string
): Promise<any> {
  const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    const response = await fetch(
      `https://${cleanDomain}/admin/api/2024-01/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.shop;
  } catch (error) {
    console.error('[SHOPIFY] Error fetching shop info:', error);
    throw error;
  }
}

/**
 * Synchroniser les commandes d'une boutique
 * Performance: Batch de 250 commandes (limite Shopify API)
 */
export async function syncShopOrders(shopId: string): Promise<number> {
  try {
    // Récupérer la boutique
    const { data: shop, error: shopError } = await supabase
      .from('shopify_shops')
      .select('*')
      .eq('id', shopId)
      .single();

    if (shopError) throw shopError;

    // Marquer la synchronisation en cours
    await supabase
      .from('shopify_shops')
      .update({ sync_status: 'in_progress' })
      .eq('id', shopId);

    // Récupérer les commandes depuis Shopify API
    const orders = await fetchShopifyOrders(shop.shop_domain, shop.access_token);

    // Insérer/Mettre à jour les commandes en batch
    const orderRecords = orders.map((order: any) => ({
      shop_id: shopId,
      shopify_order_id: order.id,
      order_number: order.name,
      customer_email: order.email,
      customer_name: order.customer?.display_name || null,
      customer_phone: order.phone,
      total_price: parseFloat(order.total_price),
      subtotal_price: parseFloat(order.subtotal_price),
      total_tax: parseFloat(order.total_tax),
      currency: order.currency,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status,
      created_at_shopify: order.created_at,
      updated_at_shopify: order.updated_at,
      line_items_count: order.line_items?.length || 0,
      note: order.note,
      tags: order.tags ? order.tags.split(',') : [],
    }));

    // Upsert (insert or update)
    const { error: ordersError } = await supabase
      .from('shopify_orders')
      .upsert(orderRecords, {
        onConflict: 'shop_id,shopify_order_id',
        ignoreDuplicates: false,
      });

    if (ordersError) throw ordersError;

    // Mettre à jour les statistiques
    await supabase.rpc('update_shop_statistics', { p_shop_id: shopId });

    // Marquer la synchronisation réussie
    await supabase
      .from('shopify_shops')
      .update({
        sync_status: 'success',
        last_sync_at: new Date().toISOString(),
      })
      .eq('id', shopId);

    console.log(`✅ [SHOPIFY] Synced ${orders.length} orders for shop ${shopId}`);

    return orders.length;
  } catch (error) {
    console.error('[SHOPIFY] Sync error:', error);

    // Marquer l'erreur
    await supabase
      .from('shopify_shops')
      .update({
        sync_status: 'error',
        sync_error: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', shopId);

    throw error;
  }
}

/**
 * Récupérer les commandes depuis Shopify API
 */
async function fetchShopifyOrders(
  shopDomain: string,
  accessToken: string,
  limit: number = 250
): Promise<any[]> {
  const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    const response = await fetch(
      `https://${cleanDomain}/admin/api/2024-01/orders.json?limit=${limit}&status=any`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error('[SHOPIFY] Error fetching orders:', error);
    throw error;
  }
}

/**
 * Déconnecter une boutique
 */
export async function disconnectShop(shopId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('shopify_shops')
      .delete()
      .eq('id', shopId)
      .eq('user_id', userId);

    if (error) throw error;

    console.log(`✅ [SHOPIFY] Shop disconnected: ${shopId}`);
  } catch (error) {
    console.error('[SHOPIFY] Error disconnecting shop:', error);
    throw error;
  }
}

/**
 * Obtenir les statistiques d'une boutique
 */
export async function getShopAnalytics(shopId: string): Promise<any> {
  try {
    const { data: shop, error: shopError } = await supabase
      .from('shopify_shops')
      .select('*')
      .eq('id', shopId)
      .single();

    if (shopError) throw shopError;

    // Récupérer les commandes récentes
    const { data: orders, error: ordersError } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at_shopify', { ascending: false })
      .limit(100);

    if (ordersError) throw ordersError;

    // Calculer les métriques
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.financial_status === 'paid')
      .reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      shop: {
        domain: shop.shop_domain,
        name: shop.shop_name,
        status: shop.status,
      },
      metrics: {
        totalOrders: shop.total_orders,
        totalCustomers: shop.total_customers,
        totalRevenue: shop.total_revenue,
        avgOrderValue,
      },
      recentOrders: orders.slice(0, 10),
    };
  } catch (error) {
    console.error('[SHOPIFY] Error fetching analytics:', error);
    throw error;
  }
}
