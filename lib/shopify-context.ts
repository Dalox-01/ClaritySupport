import { getSupabaseServerClient } from './shopify-service';
import { minifyShopifyOrder, ShopifyOrder } from './shopify-minifier';

export interface ShopifyContext {
  shopName: string;
  summary: string;
  recentOrders: string;
  stats: {
    totalOrders: number;
    totalRevenue: string;
  };
}

export async function getShopifyContext(userId: string): Promise<ShopifyContext | null> {
  const supabase = await getSupabaseServerClient();

  // 1. Get Active Shop
  const { data: shop, error: shopError } = await supabase
    .from('shopify_shops')
    .select('id, shop_name, shop_domain, total_orders, total_revenue')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (shopError || !shop) {
    return null;
  }

  // 2. Get Recent Orders (Last 5)
  const { data: orders, error: ordersError } = await supabase
    .from('shopify_orders')
    .select('*')
    .eq('shop_id', shop.id)
    .order('created_at_shopify', { ascending: false })
    .limit(5);

  if (ordersError) {
    console.error('Error fetching orders for context:', ordersError);
    return null;
  }

  // 3. Minify Orders
  const minifiedOrders = (orders || []).map((order: any) => {
    // Map DB order to ShopifyOrder interface expected by minifier
    const mappedOrder: ShopifyOrder = {
      name: order.order_number,
      order_number: parseInt(order.order_number),
      created_at: order.created_at_shopify,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status,
      total_price: order.total_price,
      currency: 'EUR', // Assuming EUR or fetch from shop settings if available
      shipping_address: order.shipping_address,
      line_items: order.line_items,
      fulfillments: order.tracking_company ? [{
        tracking_company: order.tracking_company,
        tracking_url: order.tracking_url
      }] : []
    };
    return minifyShopifyOrder(mappedOrder);
  }).join('\n---\n');

  // 4. Construct Summary
  // Ultra-compact summary
  const summary = `Shop:${shop.shop_name || shop.shop_domain} | Orders:${shop.total_orders} | Rev:${Math.round(shop.total_revenue || 0)}€`;

  return {
    shopName: shop.shop_name || shop.shop_domain,
    summary,
    recentOrders: minifiedOrders,
    stats: {
      totalOrders: shop.total_orders || 0,
      totalRevenue: shop.total_revenue || '0',
    }
  };
}
