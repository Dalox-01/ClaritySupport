// API Route: Récupérer l'abonnement actuel de l'utilisateur

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { normalizePlanName, type PlanName } from '@/lib/plan-limits';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any,
});

export const dynamic = 'force-dynamic';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const TRIAL_DURATION_DAYS = 7;

function calculateTrialWindow(createdAt?: string | null) {
  const start = createdAt ? new Date(createdAt) : new Date();
  const trialEnd = new Date(start.getTime() + TRIAL_DURATION_DAYS * DAY_IN_MS);
  const now = Date.now();
  const isActive = now < trialEnd.getTime();
  const daysLeft = isActive ? Math.max(0, Math.ceil((trialEnd.getTime() - now) / DAY_IN_MS)) : 0;

  return {
    start,
    end: trialEnd,
    isActive,
    daysLeft,
  };
}

function buildManualSubscriptionPayload(params: {
  userId: string;
  plan: PlanName;
  status?: 'active' | 'cancelled' | 'expired' | 'trial';
  stripeCustomerId?: string | null;
  createdAt?: string | null;
}) {
  const baseStart = params.createdAt ? new Date(params.createdAt) : new Date();
  const periodEnd = new Date(baseStart.getTime() + 30 * DAY_IN_MS);

  return {
    id: 'user-plan',
    user_id: params.userId,
    plan: params.plan,
    status: params.status || 'active',
    stripe_customer_id: params.stripeCustomerId || null,
    stripe_subscription_id: null,
    stripe_price_id: null,
    current_period_start: baseStart.toISOString(),
    current_period_end: periodEnd.toISOString(),
    billing_period: 'monthly',
    cancel_at_period_end: false,
    trial_end: params.status === 'trial' ? periodEnd.toISOString() : null,
    trial_days_left: params.status === 'trial' ? Math.max(0, Math.ceil((periodEnd.getTime() - Date.now()) / DAY_IN_MS)) : null,
    is_trial: params.status === 'trial',
    canceled_at: null,
  };
}

function buildTrialSubscriptionPayload(params: {
  userId: string;
  plan: PlanName;
  stripeCustomerId?: string | null;
  createdAt?: string | null;
}) {
  const { start, end, isActive, daysLeft } = calculateTrialWindow(params.createdAt);

  return {
    id: 'user-plan',
    user_id: params.userId,
    plan: params.plan,
    status: isActive ? 'trial' : 'expired',
    stripe_customer_id: params.stripeCustomerId || null,
    stripe_subscription_id: null,
    stripe_price_id: null,
    current_period_start: start.toISOString(),
    current_period_end: end.toISOString(),
    billing_period: 'monthly',
    cancel_at_period_end: false,
    trial_end: end.toISOString(),
    trial_days_left: daysLeft,
    is_trial: isActive,
    canceled_at: null,
  };
}

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
      .select('stripe_customer_id, plan, created_at')
      .eq('id', session.user.id)
      .single();

    const normalizedPlan = normalizePlanName(userData?.plan || 'STARTER');
    const rawPlan = (userData?.plan || '').toUpperCase();
    const isFreePlan = !rawPlan || rawPlan === 'FREE';

    if (userError || !userData?.stripe_customer_id) {
      console.error('Erreur récupération utilisateur ou pas de stripe_customer_id:', userError);
      const payload = isFreePlan
        ? buildTrialSubscriptionPayload({
            userId: session.user.id,
            plan: normalizedPlan,
            stripeCustomerId: userData?.stripe_customer_id,
            createdAt: userData?.created_at || null,
          })
        : buildManualSubscriptionPayload({
            userId: session.user.id,
            plan: normalizedPlan,
            stripeCustomerId: userData?.stripe_customer_id,
            status: 'active',
            createdAt: userData?.created_at || null,
          });

      return NextResponse.json({ subscription: payload });
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
        const payload = isFreePlan
          ? buildTrialSubscriptionPayload({
              userId: session.user.id,
              plan: normalizedPlan,
              stripeCustomerId: userData.stripe_customer_id,
              createdAt: userData.created_at || null,
            })
          : buildManualSubscriptionPayload({
              userId: session.user.id,
              plan: normalizedPlan,
              stripeCustomerId: userData.stripe_customer_id,
              status: 'active',
              createdAt: userData.created_at || null,
            });

        return NextResponse.json({ subscription: payload });
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
      
      let plan = normalizedPlan;
      if (priceId) {
        const planInfo = getPlanTypeFromPriceId(priceId);
        if (planInfo) {
          plan = normalizePlanName(planInfo.planType as string);
        }
      }

      // Récupérer l'ID de la DB si existe
      const { data: dbSub } = await supabase
        .from('subscriptions')
        .select('id, trial_end')
        .eq('stripe_subscription_id', stripeSub.id)
        .single();

      const stripeTrialEnd = (stripeSub as any).trial_end
        ? new Date((stripeSub as any).trial_end * 1000).toISOString()
        : dbSub?.trial_end || null;
      const trialDaysLeft = stripeTrialEnd
        ? Math.max(0, Math.ceil((new Date(stripeTrialEnd).getTime() - Date.now()) / DAY_IN_MS))
        : null;

      return NextResponse.json({ 
        subscription: {
          id: dbSub?.id || stripeSub.id,
          user_id: session.user.id,
          plan: plan || normalizedPlan,
          status: stripeSub.status,
          stripe_customer_id: userData.stripe_customer_id,
          stripe_subscription_id: stripeSub.id,
          stripe_price_id: stripeSub.items.data[0]?.price.id || null,
          current_period_start: new Date((stripeSub as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((stripeSub as any).current_period_end * 1000).toISOString(),
          billing_period: stripeSub.items.data[0]?.price.recurring?.interval || 'month',
          cancel_at_period_end: stripeSub.cancel_at_period_end || false,
          canceled_at: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000).toISOString() : null,
          trial_end: stripeTrialEnd,
          trial_days_left: trialDaysLeft,
          is_trial: stripeSub.status === 'trialing' || stripeSub.status === 'trial',
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
