/**
 * SHOPIFY OAUTH CALLBACK - SAUVEGARDE SIMPLIFIÉE
 * 
 * Shopify redirige ici après autorisation
 * On échange le code → token → sauvegarde → redirect Mail Center
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// Client Supabase avec SERVICE_ROLE_KEY pour bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  console.log('🟢 [SHOPIFY CALLBACK] START');
  
  try {
    const { searchParams } = new URL(req.url);
    
    const code = searchParams.get('code');
    const shopDomain = searchParams.get('shop');
    const state = searchParams.get('state');
    const hmac = searchParams.get('hmac');

    console.log(`🔵 Received params:`, {
      hasCode: !!code,
      shop: shopDomain,
      hasState: !!state,
      hasHmac: !!hmac,
      statePreview: state?.substring(0, 50) + '...',
    });

    if (!code || !shopDomain || !state) {
      console.error('❌ Missing OAuth params:', { code: !!code, shop: !!shopDomain, state: !!state });
      return NextResponse.redirect(
        new URL('/mail-center?shopify_error=missing_params', APP_URL)
      );
    }

    // Décoder userId (URL decode + base64 decode)
    let userId: string;
    try {
      // Shopify URL-encode le state, il faut le décoder d'abord
      const decodedState = decodeURIComponent(state);
      const stateData = JSON.parse(Buffer.from(decodedState, 'base64').toString('utf-8'));
      userId = stateData.userId;
      console.log(`✅ User ID decoded: ${userId}`);
    } catch (error) {
      console.error('❌ Invalid state decode:', error);
      console.error(`❌ State received: ${state}`);
      return NextResponse.redirect(
        new URL('/mail-center?shopify_error=invalid_state', APP_URL)
      );
    }

    // Échanger code → access token
    console.log(`🔵 Exchanging code for access token...`);
    const tokenResponse = await fetch(
      `https://${shopDomain}/admin/oauth/access_token`,
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

    if (!tokenResponse.ok) {
      console.error(`❌ Token exchange failed: ${tokenResponse.status}`);
      return NextResponse.redirect(
        new URL('/mail-center?shopify_error=token_exchange_failed', APP_URL)
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log(`✅ Access token obtained`);

    // Récupérer infos boutique
    console.log(`🔵 Fetching shop info...`);
    const shopInfoResponse = await fetch(
      `https://${shopDomain}/admin/api/2025-10/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    let shopName = shopDomain.replace('.myshopify.com', '');
    let shopEmail = null;

    if (shopInfoResponse.ok) {
      const shopData = await shopInfoResponse.json();
      shopName = shopData.shop.name;
      shopEmail = shopData.shop.email;
      console.log(`✅ Shop info: ${shopName}`);
    } else {
      console.warn(`⚠️ Could not fetch shop info (non-blocking)`);
    }

    // Sauvegarder en BDD
    console.log(`🔵 Saving to database...`);
    console.log(`🔵 Data to save:`, {
      user_id: userId,
      shop_domain: shopDomain,
      shop_name: shopName,
      has_access_token: !!accessToken,
    });

    const { data: savedShop, error: saveError } = await supabase
      .from('shopify_shops')
      .upsert(
        {
          user_id: userId,
          shop_domain: shopDomain,
          shop_name: shopName,
          shop_email: shopEmail,
          access_token: accessToken,
          status: 'active',
        },
        {
          onConflict: 'user_id,shop_domain',
          ignoreDuplicates: false, // Update si existe déjà
        }
      )
      .select()
      .single();

    if (saveError) {
      console.error('❌ Database save error:', saveError);
      console.error('❌ Error details:', JSON.stringify(saveError, null, 2));
      return NextResponse.redirect(
        new URL('/mail-center?shopify_error=save_failed', APP_URL)
      );
    }

    console.log(`✅ Shop saved successfully:`, savedShop?.id);

    // Redirection succès
    return NextResponse.redirect(
      new URL(`/mail-center?shopify_success=true&shop=${encodeURIComponent(shopName)}`, APP_URL)
    );

  } catch (error) {
    console.error('❌ Callback error:', error);
    return NextResponse.redirect(
      new URL('/mail-center?shopify_error=server_error', APP_URL)
    );
  }
}
