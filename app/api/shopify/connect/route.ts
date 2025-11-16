/**
 * API Route: Connexion Shopify
 * Permet aux utilisateurs e-commerce de connecter leur boutique Shopify
 * 
 * Restrictions par plan:
 * - Starter: 1 boutique
 * - Pro: 3 boutiques
 * - Enterprise: illimité
 * - Freelance: aucun accès (403)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  checkShopifyAccess,
  getUserShops,
  generateShopifyAuthUrl,
  disconnectShop,
} from '@/lib/shopify-service';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/shopify/connect
 * Récupère les boutiques Shopify connectées de l'utilisateur + limites du plan
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;

    // Vérifier l'accès Shopify selon le plan
    const limits = await checkShopifyAccess(userId);

    // Si l'utilisateur n'a pas accès (plan freelance ou free)
    if (!limits.hasAccess) {
      return NextResponse.json(
        { 
          error: 'Accès Shopify non disponible',
          message: 'Les intégrations Shopify sont réservées aux plans E-commerce (Starter, Pro, Enterprise)',
          planLimits: limits,
        },
        { status: 403 }
      );
    }

    // Récupérer les boutiques de l'utilisateur
    const shops = await getUserShops(userId);

    return NextResponse.json({
      shops,
      planLimits: limits,
    });

  } catch (error) {
    console.error('❌ [SHOPIFY] GET Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shopify/connect
 * Initie la connexion OAuth avec une boutique Shopify
 * 
 * Body: { shopDomain: "example.myshopify.com" }
 * Returns: { authUrl: "https://example.myshopify.com/admin/oauth/authorize?..." }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const { shopDomain } = await req.json();

    if (!shopDomain || typeof shopDomain !== 'string') {
      return NextResponse.json({ error: 'shopDomain requis' }, { status: 400 });
    }

    // Vérifier les limites du plan
    const limits = await checkShopifyAccess(userId);

    if (!limits.hasAccess) {
      return NextResponse.json(
        { 
          error: 'Accès refusé',
          message: 'Les intégrations Shopify nécessitent un plan E-commerce (Starter, Pro ou Enterprise).',
        },
        { status: 403 }
      );
    }

    // Vérifier si la limite de boutiques est atteinte
    if (!limits.canAddMore) {
      return NextResponse.json(
        {
          error: 'Limite atteinte',
          message: `Votre plan ${limits.plan.toUpperCase()} permet ${limits.maxShops} boutique${limits.maxShops > 1 ? 's' : ''}. Vous avez déjà ${limits.currentShops} boutique${limits.currentShops > 1 ? 's' : ''} connectée${limits.currentShops > 1 ? 's' : ''}.`,
          planLimits: limits,
        },
        { status: 403 }
      );
    }

    // Valider le format du domaine Shopify
    const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // Détecter les domaines personnalisés (pas .myshopify.com)
    if (!cleanDomain.includes('.myshopify.com')) {
      // Vérifier si c'est un domaine personnalisé valide
      const isCustomDomain = /^[a-z0-9-]+\.(com|shop|store|fr|eu|net|org)$/i.test(cleanDomain);
      
      if (isCustomDomain) {
        return NextResponse.json(
          { 
            error: 'Domaine personnalisé détecté',
            customDomain: cleanDomain,
            message: `Pour ${cleanDomain}, veuillez entrer votre domaine Shopify principal (format: votre-boutique.myshopify.com).\n\n📍 Comment le trouver ?\nShopify Admin → Paramètres → Domaines → Recherchez le domaine se terminant par .myshopify.com`,
            helpUrl: 'https://help.shopify.com/fr/manual/domains',
          },
          { status: 400 }
        );
      }
      
      // Sinon, format invalide
      return NextResponse.json(
        { 
          error: 'Format invalide',
          message: 'Format attendu: votre-boutique.myshopify.com',
        },
        { status: 400 }
      );
    }

    // Vérifier si cette boutique n'est pas déjà connectée
    const { data: existingShop } = await supabase
      .from('shopify_shops')
      .select('id, status')
      .eq('user_id', userId)
      .eq('shop_domain', cleanDomain)
      .single();

    if (existingShop) {
      return NextResponse.json(
        { 
          error: 'Boutique déjà connectée',
          message: `La boutique ${cleanDomain} est déjà liée à votre compte.`,
          status: existingShop.status,
        },
        { status: 409 }
      );
    }

    // Générer l'URL d'autorisation OAuth Shopify
    let authUrl: string;
    try {
      authUrl = generateShopifyAuthUrl(cleanDomain, userId);
    } catch (error) {
      // Si c'est un domaine personnalisé, retourner un message d'aide
      if (error instanceof Error && error.message.startsWith('DOMAINE_PERSONNALISE:')) {
        const helpMessage = error.message.replace('DOMAINE_PERSONNALISE:', '');
        return NextResponse.json(
          { 
            error: 'Domaine personnalisé détecté',
            message: helpMessage,
            helpUrl: 'https://help.shopify.com/fr/manual/domains',
          },
          { status: 400 }
        );
      }
      throw error;
    }

    console.log(`✅ [SHOPIFY] OAuth URL generated for ${cleanDomain}`);

    return NextResponse.json({
      success: true,
      authUrl,
      message: `Redirection vers ${cleanDomain} pour autorisation...`,
    });

  } catch (error) {
    console.error('❌ [SHOPIFY] POST Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/shopify/connect
 * Déconnecte une boutique Shopify
 * 
 * Body: { shopId: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const { shopId } = await req.json();

    if (!shopId) {
      return NextResponse.json({ error: 'shopId requis' }, { status: 400 });
    }

    // Déconnexion avec vérification de propriété (RLS)
    await disconnectShop(shopId, userId);

    console.log(`✅ [SHOPIFY] Shop ${shopId} disconnected for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Boutique déconnectée avec succès',
    });

  } catch (error) {
    console.error('❌ [SHOPIFY] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
