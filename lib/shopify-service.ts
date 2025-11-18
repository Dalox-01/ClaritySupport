import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export type ShopifyLimits = {
  plan: string;
  currentShops: number;
  maxShops: number;
  canAddMore: boolean;
  hasAccess: boolean;
};

export type ShopifyShop = {
  id: string;
  shop_domain: string;
  shop_name: string | null;
  status: string;
  total_orders: number | null;
  total_customers: number | null;
  total_revenue: number | null;
  last_sync_at: string | null;
};

export async function getSupabaseServerClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Cookie: cookieStore.toString(),
      },
    },
  });
}

export async function checkShopifyAccess(userId: string): Promise<ShopifyLimits> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc('check_shopify_shop_limit', {
    p_user_id: userId,
  });
  if (error) {
    throw error;
  }
  return data as ShopifyLimits;
}

export async function getUserShops(userId: string): Promise<ShopifyShop[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from('shopify_shops')
    .select(
      'id, shop_domain, shop_name, status, total_orders, total_customers, total_revenue, last_sync_at'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) {
    throw error;
  }
  return (data || []) as ShopifyShop[];
}

export function generateShopifyAuthUrl(shopDomain: string, userId: string): string {
  const redirectUri = encodeURIComponent(`${APP_URL}/api/shopify/callback`);
  const scopes = [
    'read_orders',
    'read_customers',
    'read_products',
    'read_inventory',
  ].join(',');
  const state = encodeURIComponent(userId);
  return `https://${shopDomain}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
}

export async function exchangeShopifyCode(shopDomain: string, code: string): Promise<string> {
  const url = `https://${shopDomain}/admin/oauth/access_token`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to exchange Shopify code');
  }
  const json = await res.json();
  return json.access_token as string;
}

export async function saveShopToDatabase(
  userId: string,
  shopDomain: string,
  accessToken: string,
  shopName?: string | null
): Promise<ShopifyShop> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from('shopify_shops')
    .insert({
      user_id: userId,
      shop_domain: shopDomain,
      shop_name: shopName ?? null,
      access_token: accessToken,
      status: 'active',
    })
    .select(
      'id, shop_domain, shop_name, status, total_orders, total_customers, total_revenue, last_sync_at'
    )
    .single();
  if (error) {
    throw error;
  }
  return data as ShopifyShop;
}

export async function disconnectShop(shopId: string, userId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from('shopify_shops')
    .delete()
    .match({ id: shopId, user_id: userId });
  if (error) {
    throw error;
  }
}
