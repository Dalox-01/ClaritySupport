import { NextRequest, NextResponse } from 'next/server';
import { verifyShopifyWebhook, getSupabaseServerClient } from '@/lib/shopify-service';

export async function POST(req: NextRequest) {
  const hmac = req.headers.get('X-Shopify-Hmac-Sha256');
  const topic = req.headers.get('X-Shopify-Topic');
  const shopDomain = req.headers.get('X-Shopify-Shop-Domain');

  if (!hmac || !topic || !shopDomain) {
    return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
  }

  // Note: verifyShopifyWebhook consumes the stream, so we need to clone or handle carefully.
  // In Next.js App Router, req.text() can be called once.
  // We need to pass the raw body to verify.
  // However, verifyShopifyWebhook in lib/shopify-service.ts calls req.text().
  // We should probably refactor verifyShopifyWebhook to take the text body, 
  // but for now let's assume we can read it here and pass it if we change the signature,
  // or just let the function handle it if we pass the cloned request.
  // Actually, let's read the text here and verify manually or update the helper.
  
  // Let's read the text here to be safe and use it for processing too.
  const rawBody = await req.text();
  
  const crypto = require('crypto');
  const secret = process.env.SHOPIFY_API_SECRET!;
  const digest = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  if (digest !== hmac) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const supabase = await getSupabaseServerClient();

  // Find the shop in DB
  const { data: shop, error: shopError } = await supabase
    .from('shopify_shops')
    .select('id')
    .eq('shop_domain', shopDomain)
    .single();

  if (shopError || !shop) {
    console.error(`Shop not found for domain: ${shopDomain}`);
    return NextResponse.json({ message: 'Shop not found' }, { status: 200 }); // Return 200 to stop retries
  }

  if (topic === 'orders/create' || topic === 'orders/updated') {
    const order = payload;
    const orderData = {
      shop_id: shop.id,
      shopify_order_id: order.id.toString(),
      order_number: order.order_number.toString(),
      customer_email: order.email || order.customer?.email,
      customer_name: order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Guest',
      total_price: order.total_price,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status,
      shipping_address: order.shipping_address,
      tracking_company: order.fulfillments?.[0]?.tracking_company || null,
      tracking_number: order.fulfillments?.[0]?.tracking_number || null,
      tracking_url: order.fulfillments?.[0]?.tracking_url || null,
      created_at_shopify: order.created_at,
      fulfilled_at_shopify: order.closed_at || order.processed_at,
      line_items: order.line_items
    };

    const { error: upsertError } = await supabase
      .from('shopify_orders')
      .upsert(orderData, { onConflict: 'shopify_order_id' });

    if (upsertError) {
      console.error('Error upserting order webhook:', upsertError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  } else if (topic === 'app/uninstalled') {
    await supabase
      .from('shopify_shops')
      .update({ status: 'uninstalled', access_token: null })
      .eq('id', shop.id);
  }

  return NextResponse.json({ success: true });
}
