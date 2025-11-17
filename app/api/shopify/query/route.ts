/**
 * API SHOPIFY QUERY - Pour l'IA
 * 
 * Permet à l'IA de récupérer des données Shopify en temps réel:
 * - Commandes d'un client (par email, téléphone, ou numéro de commande)
 * - Stock d'un produit
 * - Statut de livraison
 * - Informations client
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST - Requête de données Shopify
 * 
 * Body: {
 *   action: 'get_order' | 'get_customer' | 'get_product_stock',
 *   params: { ... }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const { action, params } = body;

    // Récupérer la première boutique active de l'utilisateur
    const { data: shop, error: shopError } = await supabase
      .from('shopify_shops')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (shopError || !shop) {
      return NextResponse.json({ 
        error: 'Aucune boutique Shopify connectée' 
      }, { status: 400 });
    }

    // Router vers la bonne action
    switch (action) {
      case 'get_order':
        return await handleGetOrder(shop, params);
      
      case 'get_customer':
        return await handleGetCustomer(shop, params);
      
      case 'get_product_stock':
        return await handleGetProductStock(shop, params);
      
      default:
        return NextResponse.json({ 
          error: `Action inconnue: ${action}` 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('[SHOPIFY QUERY] Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, { status: 500 });
  }
}

/**
 * Récupérer une commande par email, téléphone ou numéro
 */
async function handleGetOrder(shop: any, params: any) {
  const { email, phone, orderNumber } = params;

  let query = '';
  if (email) query = `email:${email}`;
  else if (phone) query = `phone:${phone}`;
  else if (orderNumber) query = `name:${orderNumber}`;
  else {
    return NextResponse.json({ 
      error: 'email, phone ou orderNumber requis' 
    }, { status: 400 });
  }

  const response = await fetch(
    `https://${shop.shop_domain}/admin/api/2025-10/orders.json?query=${encodeURIComponent(query)}&limit=5`,
    {
      headers: {
        'X-Shopify-Access-Token': shop.access_token,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shopify API error:', response.status, errorText);
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  const orders = data.orders || [];

  // Formater les commandes pour l'IA
  const formattedOrders = orders.map((order: any) => ({
    orderNumber: order.name,
    date: order.created_at,
    total: `${order.total_price} ${order.currency}`,
    status: order.financial_status,
    fulfillmentStatus: order.fulfillment_status || 'non_expedie',
    items: order.line_items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    shippingAddress: order.shipping_address ? {
      address: order.shipping_address.address1,
      city: order.shipping_address.city,
      zip: order.shipping_address.zip,
      country: order.shipping_address.country,
    } : null,
    trackingNumber: order.fulfillments?.[0]?.tracking_number || null,
    trackingUrl: order.fulfillments?.[0]?.tracking_url || null,
  }));

  return NextResponse.json({ 
    success: true,
    orders: formattedOrders,
    count: formattedOrders.length,
  });
}

/**
 * Récupérer les infos d'un client par email
 */
async function handleGetCustomer(shop: any, params: any) {
  const { email } = params;

  if (!email) {
    return NextResponse.json({ 
      error: 'email requis' 
    }, { status: 400 });
  }

  const response = await fetch(
    `https://${shop.shop_domain}/admin/api/2025-10/customers/search.json?query=email:${encodeURIComponent(email)}`,
    {
      headers: {
        'X-Shopify-Access-Token': shop.access_token,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  const customers = data.customers || [];

  if (customers.length === 0) {
    return NextResponse.json({ 
      success: true,
      customer: null,
      message: 'Client non trouvé',
    });
  }

  const customer = customers[0];

  return NextResponse.json({ 
    success: true,
    customer: {
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email,
      phone: customer.phone,
      ordersCount: customer.orders_count,
      totalSpent: `${customer.total_spent} ${shop.shop_currency}`,
      createdAt: customer.created_at,
    },
  });
}

/**
 * Récupérer le stock d'un produit par titre ou SKU
 */
async function handleGetProductStock(shop: any, params: any) {
  const { title, sku } = params;

  if (!title && !sku) {
    return NextResponse.json({ 
      error: 'title ou sku requis' 
    }, { status: 400 });
  }

  let query = '';
  if (sku) query = `sku:${sku}`;
  else if (title) query = `title:${title}`;

  const response = await fetch(
    `https://${shop.shop_domain}/admin/api/2025-10/products.json?query=${encodeURIComponent(query)}&limit=5`,
    {
      headers: {
        'X-Shopify-Access-Token': shop.access_token,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  const products = data.products || [];

  const formattedProducts = products.map((product: any) => ({
    title: product.title,
    variants: product.variants.map((variant: any) => ({
      title: variant.title,
      sku: variant.sku,
      price: `${variant.price} ${shop.shop_currency}`,
      inventoryQuantity: variant.inventory_quantity,
      available: variant.inventory_quantity > 0,
    })),
  }));

  return NextResponse.json({ 
    success: true,
    products: formattedProducts,
    count: formattedProducts.length,
  });
}
