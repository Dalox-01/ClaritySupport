import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseServerClient, fetchShopifyOrders } from '@/lib/shopify-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await getSupabaseServerClient();

  // Get user's shops
  const { data: shops, error: shopsError } = await supabase
    .from('shopify_shops')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (shopsError || !shops || shops.length === 0) {
    return NextResponse.json({ message: 'No active shops found' });
  }

  let totalSynced = 0;

  for (const shop of shops) {
    try {
      const orders = await fetchShopifyOrders(shop.shop_domain, shop.access_token);
      
      if (!orders || orders.length === 0) continue;

      const ordersToUpsert = orders.map((order: any) => ({
        shop_id: shop.id,
        shopify_order_id: order.id.toString(),
        order_number: order.order_number.toString(),
        customer_email: order.email || order.customer?.email,
        customer_name: order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Guest',
        total_price: order.total_price,
        financial_status: order.financial_status,
        fulfillment_status: order.fulfillment_status,
        shipping_address: order.shipping_address,
        // Simple mapping for tracking - taking the first fulfillment if available
        tracking_company: order.fulfillments?.[0]?.tracking_company || null,
        tracking_number: order.fulfillments?.[0]?.tracking_number || null,
        tracking_url: order.fulfillments?.[0]?.tracking_url || null,
        created_at_shopify: order.created_at,
        fulfilled_at_shopify: order.closed_at || order.processed_at, // Approximate
        line_items: order.line_items
      }));

      const { error: upsertError } = await supabase
        .from('shopify_orders')
        .upsert(ordersToUpsert, { onConflict: 'shopify_order_id' });

      if (upsertError) {
        console.error(`Error upserting orders for ${shop.shop_domain}:`, upsertError);
      } else {
        totalSynced += ordersToUpsert.length;
        
        // Update last sync time
        await supabase
          .from('shopify_shops')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('id', shop.id);
      }

    } catch (error) {
      console.error(`Error syncing shop ${shop.shop_domain}:`, error);
    }
  }

  return NextResponse.json({ success: true, synced: totalSynced });
}
