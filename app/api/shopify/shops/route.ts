/**
 * ROUTE API SHOPIFY SIMPLIFIÉE - CONNEXION PAR TOKEN
 * 
 * Flux:
 * 1. L'utilisateur génère un Access Token dans Shopify Admin
 * 2. Il colle le token + domaine boutique dans notre interface
 * 3. On teste la connexion immédiatement
 * 4. On sauvegarde si OK
 * 
 * Avantages:
 * - Pas de OAuth complexe
 * - Pas de callback qui bloque
 * - Connexion instantanée
 * - Plus sécurisé (token révocable)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET - Récupérer les boutiques de l'utilisateur
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer les boutiques
    const { data: shops, error } = await supabase
      .from('shopify_shops')
      .select('id, shop_domain, shop_name, status, created_at, last_sync_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      shops: shops || [] 
    });

  } catch (error) {
    console.error('[SHOPIFY API] GET error:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}

/**
 * POST - Connecter une nouvelle boutique avec Access Token
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const { shopDomain, accessToken } = body;

    if (!shopDomain || !accessToken) {
      return NextResponse.json({ 
        error: 'Domaine et access token requis' 
      }, { status: 400 });
    }

    // Nettoyer le domaine
    let cleanDomain = shopDomain.trim().toLowerCase();
    if (!cleanDomain.includes('.')) {
      cleanDomain = `${cleanDomain}.myshopify.com`;
    }
    if (!cleanDomain.endsWith('.myshopify.com')) {
      return NextResponse.json({ 
        error: 'Le domaine doit être au format: votreboutique.myshopify.com' 
      }, { status: 400 });
    }

    // Tester la connexion en récupérant les infos de la boutique
    console.log(`🔵 Testing Shopify connection for ${cleanDomain}...`);
    
    const shopInfoResponse = await fetch(
      `https://${cleanDomain}/admin/api/2025-10/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!shopInfoResponse.ok) {
      const errorText = await shopInfoResponse.text();
      console.error(`❌ Shopify API error:`, shopInfoResponse.status, errorText);
      
      if (shopInfoResponse.status === 401) {
        return NextResponse.json({ 
          error: 'Access token invalide ou expiré' 
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: `Erreur Shopify API: ${shopInfoResponse.status}` 
      }, { status: 400 });
    }

    const shopData = await shopInfoResponse.json();
    const shop = shopData.shop;

    console.log(`✅ Shopify connection successful: ${shop.name}`);

    // Sauvegarder la boutique
    const { data: savedShop, error: saveError } = await supabase
      .from('shopify_shops')
      .upsert({
        user_id: session.user.id,
        shop_domain: cleanDomain,
        shop_name: shop.name,
        shop_email: shop.email,
        shop_currency: shop.currency,
        shop_timezone: shop.iana_timezone,
        access_token: accessToken,
        status: 'active',
      }, {
        onConflict: 'user_id,shop_domain',
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Database save error:', saveError);
      throw saveError;
    }

    console.log(`✅ Shop saved: ${savedShop.id}`);

    return NextResponse.json({ 
      success: true,
      message: `Boutique ${shop.name} connectée avec succès !`,
      shop: {
        id: savedShop.id,
        domain: savedShop.shop_domain,
        name: savedShop.shop_name,
      }
    });

  } catch (error) {
    console.error('[SHOPIFY API] POST error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, { status: 500 });
  }
}

/**
 * DELETE - Déconnecter une boutique
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const { shopId } = body;

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID requis' }, { status: 400 });
    }

    const { error } = await supabase
      .from('shopify_shops')
      .delete()
      .eq('id', shopId)
      .eq('user_id', session.user.id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'Boutique déconnectée' 
    });

  } catch (error) {
    console.error('[SHOPIFY API] DELETE error:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}
