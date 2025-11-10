// API Route: Récupérer l'abonnement actuel de l'utilisateur

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscription/current
 * Récupère l'abonnement actuel de l'utilisateur connecté
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer l'abonnement depuis la base de données
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Pas d'abonnement dans subscriptions, récupérer le plan depuis users
        const { data: userData } = await supabase
          .from('users')
          .select('plan, stripe_customer_id')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          // Retourner un abonnement basé sur users.plan
          return NextResponse.json({ 
            subscription: {
              id: 'user-plan',
              user_id: session.user.id,
              plan: userData.plan || 'FREE',
              status: 'active',
              stripe_customer_id: userData.stripe_customer_id || null,
              stripe_subscription_id: null,
              stripe_price_id: null,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              billing_period: 'monthly',
              cancel_at_period_end: false,
            }
          });
        }

        // Vraiment aucun abonnement trouvé
        return NextResponse.json({ 
          error: 'Aucun abonnement trouvé',
          subscription: null 
        }, { status: 404 });
      }
      
      console.error('Erreur récupération abonnement:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération de l\'abonnement' 
      }, { status: 500 });
    }

    return NextResponse.json({ subscription });

  } catch (error) {
    console.error('Erreur API subscription/current:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
