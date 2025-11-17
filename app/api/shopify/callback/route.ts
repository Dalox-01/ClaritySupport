/**
 * SHOPIFY OAUTH CALLBACK - SAUVEGARDE SIMPLIFIÉE
 * 
 * Shopify redirige ici après autorisation
 * On échange le code → token → sauvegarde → redirect Mail Center
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(req: NextRequest) {
  console.log('🟢 [SHOPIFY CALLBACK] START');
  
  try {
    const { searchParams } = new URL(req.url);
    
    const code = searchParams.get('code');
    const shopDomain = searchParams.get('shop');
    const state = searchParams.get('state');

    console.log(`🔵 Params: code=${!!code}, shop=${shopDomain}, state=${!!state}`);

    if (!code || !shopDomain || !state) {
      console.error('❌ Missing OAuth params');
      return NextResponse.redirect(
        new URL('/mail-center?shopify_error=missing_params', APP_URL)
      );
    }

    // Décoder userId
    let userId: string;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      userId = stateData.userId;
      console.log(`✅ User ID: ${userId}`);
    } catch (error) {
      console.error('❌ Invalid state');
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
    const { data: savedShop, error: saveError } = await supabase
      .from('shopify_shops')
      .upsert({
        user_id: userId,
        shop_domain: shopDomain,
        shop_name: shopName,
        shop_email: shopEmail,
        access_token: accessToken,
        status: 'active',
      }, {
        onConflict: 'user_id,shop_domain',
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Database save error:', saveError);
      return NextResponse.redirect(
        new URL('/mail-center?shopify_error=save_failed', APP_URL)
      );
    }

    console.log(`✅ Shop saved: ${savedShop.id}`);

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
