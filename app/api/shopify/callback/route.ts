/**
 * API Route: Shopify OAuth Callback
 * Gère le retour OAuth de Shopify après autorisation
 * 
 * Flow:
 * 1. L'utilisateur autorise l'app sur Shopify
 * 2. Shopify redirige vers /api/shopify/callback?code=xxx&shop=xxx&state=userId
 * 3. On échange le code contre un access_token permanent
 * 4. On sauvegarde la boutique en BDD
 * 5. On lance la synchronisation initiale des commandes
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  exchangeShopifyCode, 
  saveShopToDatabase, 
  syncShopOrders 
} from '@/lib/shopify-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  console.log('🟢 [SHOPIFY CALLBACK] ==================== START V2 ====================');
  console.log('🟢 [SHOPIFY CALLBACK] Full URL:', req.url);
  console.log('🟢 [SHOPIFY CALLBACK] Method:', req.method);
  console.log('🟢 [SHOPIFY CALLBACK] Headers:', Object.fromEntries(req.headers.entries()));
  console.log('🟢 [SHOPIFY CALLBACK] ENV Check - SHOPIFY_API_SECRET exists:', !!process.env.SHOPIFY_API_SECRET);
  console.log('🟢 [SHOPIFY CALLBACK] ENV Check - SHOPIFY_API_KEY exists:', !!process.env.SHOPIFY_API_KEY);
  
  try {
    const { searchParams } = new URL(req.url);
    
    const code = searchParams.get('code');
    const shopDomain = searchParams.get('shop');
    const state = searchParams.get('state'); // Contains userId
    const hmac = searchParams.get('hmac');

    console.log('🟢 [SHOPIFY CALLBACK] Query params:', { 
      code: code?.substring(0, 20) + '...', 
      shop: shopDomain, 
      state: state?.substring(0, 20) + '...',
      hmac: hmac?.substring(0, 20) + '...' 
    });

    // Validation des paramètres OAuth
    if (!code || !shopDomain || !state) {
      console.error('❌ [SHOPIFY CALLBACK] Missing OAuth parameters:', { code: !!code, shop: !!shopDomain, state: !!state });
      return NextResponse.redirect(
        new URL('/mail-center?shopify_error=missing_params', req.url)
      );
    }

    // Décoder le state pour extraire le userId
    let userId: string;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      userId = stateData.userId;
      console.log('✅ [SHOPIFY CALLBACK] State decoded, userId:', userId);
      
      if (!userId) {
        throw new Error('userId not found in state');
      }
    } catch (error) {
      console.error('❌ [SHOPIFY CALLBACK] Failed to decode state:', error);
      console.error('❌ [SHOPIFY CALLBACK] Raw state:', state);
      return NextResponse.redirect(
        new URL('/mail-center?shopify_error=invalid_state', req.url)
      );
    }

    console.log(`🔄 [SHOPIFY CALLBACK] Processing OAuth for shop: ${shopDomain}, user: ${userId}`);

    // Étape 1: Échanger le code contre un access_token
    let accessToken: string;
    try {
      accessToken = await exchangeShopifyCode(shopDomain, code);
      console.log(`✅ [SHOPIFY CALLBACK] Access token obtained for ${shopDomain}`);
    } catch (error) {
      console.error('❌ [SHOPIFY CALLBACK] Token exchange failed:', error);
      return NextResponse.redirect(
        new URL('/mail-center?shopify_error=token_exchange_failed', req.url)
      );
    }

    // Étape 2: Sauvegarder la boutique en base de données
    let savedShop: { id: string; domain: string };
    try {
      console.log('🔵 [SHOPIFY CALLBACK] Calling saveShopToDatabase with:', { userId, shopDomain });
      const shopData = await saveShopToDatabase(userId, shopDomain, accessToken);
      console.log('✅ [SHOPIFY CALLBACK] saveShopToDatabase returned:', shopData);
      savedShop = { id: shopData.id, domain: shopData.shop_domain };
      console.log(`✅ [SHOPIFY CALLBACK] Shop saved to database: ${savedShop.id}`);
    } catch (error) {
      console.error('❌ [SHOPIFY CALLBACK] Failed to save shop:', error);
      console.error('❌ [SHOPIFY CALLBACK] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        shopDomain,
      });
      return NextResponse.redirect(
        new URL('/mail-center?shopify_error=save_failed&details=' + encodeURIComponent(error instanceof Error ? error.message : 'unknown'), req.url)
      );
    }

    // Étape 3: Lancer la synchronisation initiale des commandes (asynchrone)
    // On ne bloque pas le callback pour améliorer la performance
    syncShopOrders(savedShop.id)
      .then(() => {
        console.log(`✅ [SHOPIFY CALLBACK] Initial sync completed for shop ${savedShop.id}`);
      })
      .catch((syncError) => {
        console.error(`⚠️ [SHOPIFY CALLBACK] Initial sync failed for shop ${savedShop.id}:`, syncError);
        // Ne pas bloquer le callback même si la sync échoue
      });

    // Étape 4: Rediriger vers le Mail Center avec succès
    console.log(`🎉 [SHOPIFY CALLBACK] Shop ${shopDomain} successfully connected for user ${userId}`);

    return NextResponse.redirect(
      new URL('/mail-center?shopify_success=true&shop=' + encodeURIComponent(shopDomain), req.url)
    );

  } catch (error) {
    console.error('❌ [SHOPIFY CALLBACK] Unexpected error:', error);
    return NextResponse.redirect(
      new URL('/mail-center?shopify_error=server_error', req.url)
    );
  }
}
