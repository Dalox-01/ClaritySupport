/**
 * API Route: Connexion Shopify
 * Permet aux utilisateurs e-commerce de connecter leur boutique Shopify
 * 
 * Restrictions:
 * - Accessible uniquement aux utilisateurs avec segment "shopify"
 * - Nécessite un abonnement actif (STARTER, PRO ou SCALE)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserPlanInfo } from '@/lib/plan-enforcement';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/shopify/connect
 * Récupère les boutiques Shopify connectées de l'utilisateur
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;

    // Vérifier que l'utilisateur a un plan e-commerce
    const planInfo = await getUserPlanInfo(userId);
    
    if (planInfo.segment !== 'shopify') {
      return NextResponse.json(
        { 
          error: 'Accès refusé',
          message: 'Cette fonctionnalité est réservée aux abonnements E-commerce. Veuillez mettre à niveau votre plan.',
        },
        { status: 403 }
      );
    }

    // Récupérer les boutiques connectées
    const { data: shops, error } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ [SHOPIFY] Error fetching shops:', error);
      throw error;
    }

    return NextResponse.json({
      shops: shops || [],
      planLimits: {
        maxShops: planInfo.plan.includes('STARTER') ? 1 : planInfo.plan.includes('PRO') ? 3 : 999,
        currentShops: shops?.length || 0,
      },
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
 * Connecte une nouvelle boutique Shopify
 * 
 * Body: { shopDomain: string }
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

    // Vérifier que l'utilisateur a un plan e-commerce
    const planInfo = await getUserPlanInfo(userId);
    
    if (planInfo.segment !== 'shopify') {
      return NextResponse.json(
        { 
          error: 'Accès refusé',
          message: 'Cette fonctionnalité est réservée aux abonnements E-commerce.',
        },
        { status: 403 }
      );
    }

    // Vérifier la limite de boutiques selon le plan
    const { data: existingShops } = await supabase
      .from('shopify_connections')
      .select('id')
      .eq('user_id', userId);

    const maxShops = planInfo.plan.includes('STARTER') ? 1 : planInfo.plan.includes('PRO') ? 3 : 999;
    
    if (existingShops && existingShops.length >= maxShops) {
      return NextResponse.json(
        { 
          error: 'Limite atteinte',
          message: `Votre plan ${planInfo.plan} permet ${maxShops} boutique${maxShops > 1 ? 's' : ''}. Mettez à niveau pour en ajouter plus.`,
        },
        { status: 403 }
      );
    }

    // Valider le format du domaine Shopify
    const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!cleanDomain.includes('.myshopify.com')) {
      return NextResponse.json(
        { error: 'Domaine invalide. Format attendu: votre-boutique.myshopify.com' },
        { status: 400 }
      );
    }

    // Vérifier si la boutique n'est pas déjà connectée
    const { data: existingShop } = await supabase
      .from('shopify_connections')
      .select('id')
      .eq('shop_domain', cleanDomain)
      .eq('user_id', userId)
      .single();

    if (existingShop) {
      return NextResponse.json(
        { error: 'Cette boutique est déjà connectée' },
        { status: 409 }
      );
    }

    // Créer la connexion Shopify (à ce stade, juste enregistrer le domaine)
    // Dans une implémentation réelle, vous feriez l'OAuth Shopify ici
    const { data: newShop, error: insertError } = await supabase
      .from('shopify_connections')
      .insert({
        user_id: userId,
        shop_domain: cleanDomain,
        access_token: null, // Sera rempli après OAuth
        status: 'pending', // pending, active, inactive
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ [SHOPIFY] Insert error:', insertError);
      throw insertError;
    }

    console.log(`✅ [SHOPIFY] Shop ${cleanDomain} connected for user ${userId}`);

    return NextResponse.json({
      success: true,
      shop: newShop,
      message: 'Boutique connectée avec succès !',
      // Dans une vraie implémentation, retourner l'URL OAuth Shopify
      nextStep: 'oauth_required',
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

    // Supprimer la boutique (seulement si elle appartient à l'utilisateur)
    const { error } = await supabase
      .from('shopify_connections')
      .delete()
      .eq('id', shopId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ [SHOPIFY] Delete error:', error);
      throw error;
    }

    console.log(`✅ [SHOPIFY] Shop ${shopId} disconnected for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Boutique déconnectée',
    });

  } catch (error) {
    console.error('❌ [SHOPIFY] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
