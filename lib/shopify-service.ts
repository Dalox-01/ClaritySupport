import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { normalizePlanName } from './plan-limits';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
// Allow overriding the app URL specifically for Shopify (e.g. to handle www vs non-www mismatch)
const APP_URL = process.env.SHOPIFY_APP_URL || process.env.NEXT_PUBLIC_APP_URL!;

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
  
  // 1. Get user plan
  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .select('plan, segment')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  // Check for admin email override
  const { data: userData } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();

  const isSuperAdmin = userData?.email === 'clarityteamfr@gmail.com';

  // Default to FREE if no subscription found
  let plan = normalizePlanName(sub?.plan);
  if (isSuperAdmin) {
    plan = 'SCALE';
  }
  const segment = sub?.segment || 'freelance';

  // 2. Count current shops
  const { count, error: countError } = await supabase
    .from('shopify_shops')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) throw countError;

  const currentShops = count || 0;

  // 3. Define limits
  let maxShops = 0;
  let hasAccess = false;

  // Admin override for specific email (hardcoded for safety/speed as requested)
  // In a real app, we would check a role or specific permission
  const { data: user } = await supabase.auth.getUser();
  // Note: getUser() in server component context might not return email directly if using service role client
  // But here we are using getSupabaseServerClient which uses cookies, so getUser() should work.
  // However, to be safe and consistent, let's fetch user email from auth.users table or similar if needed.
  // Actually, let's just check the plan. If the user is upgraded to 'SCALE' or 'ENTERPRISE', they have access.
  
  if (plan === 'STARTER') {
    maxShops = 1;
    hasAccess = true;
  } else if (plan === 'PRO') {
    maxShops = 3;
    hasAccess = true;
  } else if (plan === 'SCALE') {
    maxShops = -1; // Unlimited
    hasAccess = true;
  }

  // Force access for specific email if needed (though upgrading plan is cleaner)
  // We will handle the upgrade via SQL as requested.

  const canAddMore = maxShops === -1 || currentShops < maxShops;

  return {
    plan,
    currentShops,
    maxShops,
    canAddMore,
    hasAccess
  };
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

export async function fetchShopifyOrders(shopDomain: string, accessToken: string, limit = 50) {
  const res = await fetch(`https://${shopDomain}/admin/api/2023-10/orders.json?status=any&limit=${limit}`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch orders from ${shopDomain}`);
  }

  const data = await res.json();
  return data.orders;
}

export async function fetchShopifyProducts(shopDomain: string, accessToken: string, limit = 50) {
  const res = await fetch(`https://${shopDomain}/admin/api/2023-10/products.json?limit=${limit}`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products from ${shopDomain}`);
  }

  const data = await res.json();
  return data.products;
}

export async function verifyShopifyWebhook(
  req: Request,
  hmacHeader: string
): Promise<boolean> {
  const rawBody = await req.text();
  const crypto = require('crypto');
  const digest = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');
  return digest === hmacHeader;
}
