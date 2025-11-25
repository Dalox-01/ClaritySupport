import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/shopify-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await getSupabaseServerClient();

  // Get user's shops
  const { data: shops, error: shopsError } = await supabase
    .from('shopify_shops')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (shopsError || !shops || shops.length === 0) {
    return NextResponse.json({
      revenue: "0.00 €",
      visitors: "0",
      orders: "0",
      aov: "0.00 €"
    });
  }

  const shopIds = shops.map(s => s.id);

  // Calculate stats for today (UTC)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const { data: orders, error: ordersError } = await supabase
    .from('shopify_orders')
    .select('total_price, customer_email')
    .in('shop_id', shopIds)
    .gte('created_at_shopify', todayStr);

  if (ordersError) {
    console.error('Error fetching orders stats:', ordersError);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }

  let totalRevenue = 0;
  let totalOrders = 0;
  const uniqueCustomers = new Set();

  if (orders) {
    totalOrders = orders.length;
    orders.forEach(order => {
      totalRevenue += parseFloat(order.total_price || '0');
      if (order.customer_email) {
        uniqueCustomers.add(order.customer_email);
      }
    });
  }

  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return NextResponse.json({
    revenue: `${totalRevenue.toFixed(2)} €`,
    visitors: uniqueCustomers.size.toString(), // Approximation using unique customers
    orders: totalOrders.toString(),
    aov: `${aov.toFixed(2)} €`
  });
}
