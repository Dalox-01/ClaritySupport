// API Route: Récupérer l'abonnement actuel de l'utilisateur

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
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

    // Récupérer l'abonnement depuis la base de données (actif en priorité, puis le plus récent)
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('status', { ascending: true }) // 'active' vient avant 'canceled'
      .order('created_at', { ascending: false });

    // Prendre le premier abonnement actif, sinon le plus récent
    const subscription = subscriptions?.find(s => s.status === 'active') || subscriptions?.[0];

    // Si on a un abonnement avec un stripe_subscription_id, toujours vérifier Stripe pour avoir les données à jour
    if (subscription?.stripe_subscription_id) {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        
        console.log(`📋 Abonnement Stripe récupéré (depuis DB) pour ${session.user.id}:`, {
          id: stripeSub.id,
          status: stripeSub.status,
          cancel_at_period_end: stripeSub.cancel_at_period_end,
          current_period_end: new Date((stripeSub as any).current_period_end * 1000).toISOString(),
        });

        // Mapper le price_id au plan
        const priceToPlans: Record<string, string> = {
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || '']: 'STARTER',
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '']: 'PRO',
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || '']: 'ENTERPRISE',
        };
        
        const plan = stripeSub.items.data[0]?.price.id 
          ? priceToPlans[stripeSub.items.data[0].price.id] || subscription.plan 
          : subscription.plan;

        return NextResponse.json({ 
          subscription: {
            ...subscription,
            plan: plan || subscription.plan,
            status: stripeSub.status,
            current_period_start: new Date((stripeSub as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((stripeSub as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: stripeSub.cancel_at_period_end || false,
            canceled_at: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000).toISOString() : null,
          }
        });
      } catch (stripeError) {
        console.error('Erreur récupération abonnement Stripe depuis DB:', stripeError);
        // En cas d'erreur Stripe, retourner les données de la DB
        return NextResponse.json({ subscription });
      }
    }

    if (error) {
      if (error.code === 'PGRST116') {
        // Pas d'abonnement dans subscriptions, récupérer le plan depuis users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('plan, stripe_customer_id')
          .eq('id', session.user.id)
          .single();

        if (userError || !userData) {
          console.error('Erreur récupération utilisateur:', userError);
          return NextResponse.json({ 
            error: 'Utilisateur non trouvé',
            subscription: null 
          }, { status: 404 });
        }

        // Si l'utilisateur a un stripe_customer_id, récupérer l'abonnement depuis Stripe
        if (userData.stripe_customer_id) {
          try {
            const stripeSubscriptions = await stripe.subscriptions.list({
              customer: userData.stripe_customer_id,
              status: 'all',
              limit: 1,
            });

            if (stripeSubscriptions.data.length > 0) {
              const stripeSub = stripeSubscriptions.data[0];
              
              // Mapper le price_id au plan
              const priceToPlans: Record<string, string> = {
                [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || '']: 'STARTER',
                [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '']: 'PRO',
                [process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || '']: 'ENTERPRISE',
              };
              
              const plan = stripeSub.items.data[0]?.price.id 
                ? priceToPlans[stripeSub.items.data[0].price.id] || userData.plan 
                : userData.plan;

              console.log(`📋 Abonnement Stripe récupéré pour ${session.user.id}:`, {
                id: stripeSub.id,
                status: stripeSub.status,
                cancel_at_period_end: stripeSub.cancel_at_period_end,
                current_period_end: new Date((stripeSub as any).current_period_end * 1000).toISOString(),
              });

              return NextResponse.json({ 
                subscription: {
                  id: stripeSub.id,
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
            }
          } catch (stripeError) {
            console.error('Erreur récupération abonnement Stripe:', stripeError);
          }
        }

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
