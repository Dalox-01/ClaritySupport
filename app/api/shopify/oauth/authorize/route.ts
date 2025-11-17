/**
 * SHOPIFY OAUTH - VERSION SIMPLIFIÉE 1 CLIC
 * 
 * Flux:
 * 1. User clique "Connecter Shopify"
 * 2. Entre juste son domaine (ex: ma-boutique)
 * 3. Redirigé vers Shopify pour autoriser
 * 4. Retour automatique → Boutique connectée ✅
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_SCOPES = 'read_orders,read_customers,read_products,read_inventory';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/oauth/callback`;

/**
 * POST - Démarrer OAuth (1 clic)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    let { shopDomain } = body;

    if (!shopDomain) {
      return NextResponse.json({ error: 'Domaine requis' }, { status: 400 });
    }

    // Auto-compléter le domaine
    shopDomain = shopDomain.trim().toLowerCase();
    if (!shopDomain.includes('.')) {
      shopDomain = `${shopDomain}.myshopify.com`;
    }

    // Encoder userId dans le state
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      timestamp: Date.now(),
    })).toString('base64');

    // URL OAuth Shopify
    const authUrl = new URL(`https://${shopDomain}/admin/oauth/authorize`);
    authUrl.searchParams.set('client_id', SHOPIFY_API_KEY);
    authUrl.searchParams.set('scope', SHOPIFY_SCOPES);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('state', state);

    console.log(`✅ OAuth URL generated for ${shopDomain}`);

    return NextResponse.json({ 
      success: true,
      authUrl: authUrl.toString(),
      message: 'Redirection vers Shopify...'
    });

  } catch (error) {
    console.error('[SHOPIFY OAUTH] Error:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}
