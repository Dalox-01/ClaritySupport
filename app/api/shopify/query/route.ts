import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/shopify-service';

export const dynamic = 'force-dynamic';

function extractOrderNumber(subject: string, body: string): string | null {
  const text = `${subject}\n${body}`;
  const match = text.match(/#(\d{3,10})/);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { customerEmail, orderNumber, emailSubject, emailBody } = await req.json();

  if (!customerEmail && !orderNumber && !emailSubject && !emailBody) {
    return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
  }

  let resolvedOrderNumber: string | null = orderNumber || null;
  if (!resolvedOrderNumber && (emailSubject || emailBody)) {
    resolvedOrderNumber = extractOrderNumber(emailSubject || '', emailBody || '');
  }

  const supabase = await getSupabaseServerClient();

  const shopsRes = await supabase
    .from('shopify_shops')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (shopsRes.error) {
    return NextResponse.json({ error: 'Failed to load shops' }, { status: 500 });
  }

  const shops = shopsRes.data || [];
  if (shops.length === 0) {
    return NextResponse.json({ error: 'No Shopify shop connected' }, { status: 404 });
  }

  const shopIds = shops.map((s) => s.id);

  let query = supabase
    .from('shopify_orders')
    .select(
      'shop_id, shopify_order_id, order_number, customer_email, customer_name, total_price, financial_status, fulfillment_status, shipping_address, tracking_company, tracking_number, tracking_url, created_at_shopify, fulfilled_at_shopify, line_items'
    )
    .in('shop_id', shopIds)
    .order('created_at_shopify', { ascending: false })
    .limit(1);

  if (resolvedOrderNumber) {
    query = query.eq('order_number', resolvedOrderNumber);
  }

  if (customerEmail) {
    query = query.eq('customer_email', customerEmail.toLowerCase());
  }

  const { data: orders, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to query orders' }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ found: false });
  }

  const order = orders[0] as any;

  const estimatedDelivery = order.fulfilled_at_shopify || null;

  return NextResponse.json({
    found: true,
    order: {
      orderNumber: order.order_number,
      shopifyOrderId: order.shopify_order_id,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      totalPrice: order.total_price,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      createdAt: order.created_at_shopify,
      fulfilledAt: order.fulfilled_at_shopify,
      estimatedDelivery,
      trackingCompany: order.tracking_company,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
      lineItems: order.line_items,
      shippingAddress: order.shipping_address,
    },
  });
}
