// API Route: Récupérer l'abonnement actuel de l'utilisateur

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any,
});

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

    // Récupérer le stripe_customer_id de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, plan')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData?.stripe_customer_id) {
      console.error('Erreur récupération utilisateur ou pas de stripe_customer_id:', userError);
      return NextResponse.json({ 
        subscription: {
          id: 'user-plan',
          user_id: session.user.id,
          plan: userData?.plan || 'FREE',
          status: 'active',
          stripe_customer_id: null,
          stripe_subscription_id: null,
          stripe_price_id: null,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          billing_period: 'monthly',
          cancel_at_period_end: false,
        }
      });
    }

    // Récupérer TOUS les abonnements Stripe du customer
    try {
      console.log(`🔍 Récupération abonnements Stripe pour customer: ${userData.stripe_customer_id}`);
      
      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: userData.stripe_customer_id,
        status: 'all',
        limit: 100,
      });

      console.log(`📦 ${stripeSubscriptions.data.length} abonnements trouvés:`, 
        stripeSubscriptions.data.map(s => ({
          id: s.id,
          status: s.status,
          cancel_at_period_end: s.cancel_at_period_end,
        }))
      );

      if (stripeSubscriptions.data.length === 0) {
        return NextResponse.json({ 
          subscription: {
            id: 'user-plan',
            user_id: session.user.id,
            plan: userData.plan || 'FREE',
            status: 'active',
            stripe_customer_id: userData.stripe_customer_id,
            stripe_subscription_id: null,
            stripe_price_id: null,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            billing_period: 'monthly',
            cancel_at_period_end: false,
          }
        });
      }

      // Prioriser les abonnements dans cet ordre:
      // 1. Abonnement actif avec cancel_at_period_end=true (en cours de résiliation)
      // 2. Abonnement actif le plus récent
      // 3. Dernier abonnement créé
      const activeCanceling = stripeSubscriptions.data.find(
        s => s.status === 'active' && s.cancel_at_period_end
      );
      
      const activeSubscriptions = stripeSubscriptions.data.filter(s => s.status === 'active');
      const activeRecent = activeSubscriptions.length > 0
        ? activeSubscriptions.sort((a, b) => {
            const aEnd = (a as any).current_period_end || 0;
            const bEnd = (b as any).current_period_end || 0;
            return bEnd - aEnd;
          })[0]
        : undefined;
      
      const mostRecent = stripeSubscriptions.data[0];

      const stripeSub = activeCanceling || activeRecent || mostRecent;

      console.log(`📋 Abonnement Stripe sélectionné pour ${session.user.id}:`, {
        id: stripeSub.id,
        status: stripeSub.status,
        cancel_at_period_end: stripeSub.cancel_at_period_end,
        current_period_end: new Date((stripeSub as any).current_period_end * 1000).toISOString(),
        reason: activeCanceling ? 'canceling' : activeRecent ? 'active-recent' : 'most-recent',
      });

      // Mapper le price_id au plan en utilisant NEW_PRICE_TO_PLAN_MAP
      const { getPlanTypeFromPriceId } = await import('@/lib/stripe');
      const priceId = stripeSub.items.data[0]?.price.id;
      
      let plan = userData.plan || 'FREE';
      if (priceId) {
        const planInfo = getPlanTypeFromPriceId(priceId);
        if (planInfo) {
          plan = typeof planInfo.planType === 'string' ? planInfo.planType : 'FREE';
        }
      }

      // Récupérer l'ID de la DB si existe
      const { data: dbSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('stripe_subscription_id', stripeSub.id)
        .single();

      return NextResponse.json({ 
        subscription: {
          id: dbSub?.id || stripeSub.id,
          user_id: session.user.id,
          plan: plan || 'FREE',
          status: stripeSub.status,
          stripe_customer_id: userData.stripe_customer_id,
          stripe_subscription_id: stripeSub.id,
          stripe_price_id: stripeSub.items.data[0]?.price.id || null,
          current_period_start: new Date((stripeSub as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((stripeSub as any).current_period_end * 1000).toISOString(),
          billing_period: stripeSub.items.data[0]?.price.recurring?.interval || 'month',
          cancel_at_period_end: stripeSub.cancel_at_period_end || false,
          canceled_at: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000).toISOString() : null,
        }
      });
    } catch (stripeError) {
      console.error('Erreur récupération abonnements Stripe:', stripeError);
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération de l\'abonnement' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erreur API subscription/current:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
