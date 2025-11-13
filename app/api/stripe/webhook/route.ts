// API Route: Webhook Stripe pour gérer les événements d'abonnement

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, getPlanTypeFromPriceId } from '@/lib/stripe';
import { supabase } from '@/lib/db';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

/**
 * Webhook Stripe - Endpoint pour recevoir les événements
 * Configuration requise dans Stripe Dashboard:
 * 1. Aller dans Developers > Webhooks
 * 2. Ajouter endpoint: https://votredomaine.com/api/stripe/webhook
 * 3. Sélectionner les événements:
 *    - checkout.session.completed
 *    - customer.subscription.updated
 *    - customer.subscription.deleted
 *    - invoice.payment_succeeded
 *    - invoice.payment_failed
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('❌ Signature Stripe manquante');
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET non configuré');
      return NextResponse.json({ error: 'Webhook secret manquant' }, { status: 500 });
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('❌ Erreur vérification signature webhook:', err);
      console.error('📝 Signature reçue:', signature?.substring(0, 20) + '...');
      console.error('🔑 Webhook secret configuré:', webhookSecret?.substring(0, 10) + '...');
      console.error('📄 Body length:', body.length);
      return NextResponse.json({ 
        error: 'Signature invalide',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, { status: 400 });
    }

    console.log(`📬 Webhook reçu: ${event.type}`);

    // Traiter l'événement selon son type
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`ℹ️ Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Erreur webhook Stripe:', error);
    return NextResponse.json({ 
      error: 'Erreur traitement webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Gérer la completion d'une session de checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`✅ Checkout complété: ${session.id}`);
  console.log(`📋 Métadonnées session:`, JSON.stringify(session.metadata));
  console.log(`📋 Customer:`, session.customer);
  console.log(`📋 Subscription:`, session.subscription);

  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType;
  const billingPeriod = session.metadata?.billingPeriod;

  if (!userId || !planType) {
    console.error('⚠️ Métadonnées manquantes dans la session');
    console.error('⚠️ userId:', userId, 'planType:', planType);
    console.error('⚠️ Toutes les métadonnées:', session.metadata);
    return;
  }

  console.log(`🔍 Récupération de l'abonnement Stripe...`);
  const subscriptionData = await stripe.subscriptions.retrieve(session.subscription as string) as any;
  console.log(`✅ Abonnement Stripe récupéré:`, subscriptionData.id);

  // Convertir les timestamps Unix en ISO strings de manière sécurisée
  const currentPeriodStart = subscriptionData.current_period_start 
    ? new Date(subscriptionData.current_period_start * 1000).toISOString()
    : new Date().toISOString();
  const currentPeriodEnd = subscriptionData.current_period_end
    ? new Date(subscriptionData.current_period_end * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 jours par défaut

  // Déterminer le segment depuis le Price ID
  const priceId = subscriptionData.items.data[0].price.id;
  const { NEW_PRICE_TO_PLAN_MAP } = await import('@/lib/stripe');
  const planMapping = NEW_PRICE_TO_PLAN_MAP[priceId];
  const segment = planMapping?.segment || 'shopify'; // Défaut shopify si non trouvé

  const subscriptionPayload = {
    user_id: userId,
    plan: planType,
    segment: segment, // AJOUT DU SEGMENT
    status: 'active',
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscriptionData.id,
    stripe_price_id: subscriptionData.items.data[0].price.id,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    billing_period: billingPeriod || 'monthly',
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  };

  console.log(`💾 Tentative d'insertion dans Supabase:`, JSON.stringify(subscriptionPayload));

  // Créer ou mettre à jour l'abonnement dans la base de données
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionPayload, {
      onConflict: 'user_id',
    })
    .select();

  if (error) {
    console.error('❌ Erreur sauvegarde abonnement:', error);
    console.error('❌ Détails erreur:', JSON.stringify(error));
  } else {
    console.log(`✅ Abonnement ${planType} créé pour user ${userId}`);
    console.log(`✅ Données insérées:`, JSON.stringify(data));
  }

  await syncUserPlan({
    userId,
    planType,
    segment,
    status: 'active',
    stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
  });
}

/**
 * Gérer la mise à jour d'un abonnement
 */
async function handleSubscriptionUpdated(subscription: any) {
  console.log(`🔄 Abonnement mis à jour: ${subscription.id}`);

  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('⚠️ userId manquant dans les métadonnées de l\'abonnement');
    return;
  }

  // Déterminer le plan depuis le Price ID
  const priceId = subscription.items.data[0].price.id;
  const planInfo = getPlanTypeFromPriceId(priceId);

  if (!planInfo) {
    console.error('⚠️ Plan non trouvé pour Price ID:', priceId);
    return;
  }

  const normalizedStatus = mapStripeStatus(subscription.status);
  const stripeCustomerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;

  // Convertir les timestamps Unix en ISO strings de manière sécurisée
  const currentPeriodStart = subscription.current_period_start 
    ? new Date(subscription.current_period_start * 1000).toISOString()
    : new Date().toISOString();
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Mettre à jour l'abonnement avec le segment
  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan: planInfo.planType,
      segment: planInfo.segment || 'shopify', // AJOUT DU SEGMENT
      status: normalizedStatus,
      stripe_price_id: priceId,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      billing_period: planInfo.billingPeriod,
      cancel_at_period_end: subscription.cancel_at_period_end,
      stripe_customer_id: stripeCustomerId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('❌ Erreur mise à jour abonnement:', error);
  } else {
    console.log(`✅ Abonnement mis à jour: ${planInfo.planType} (${planInfo.billingPeriod})`);
  }

  await syncUserPlan({
    userId,
    planType: planInfo.planType,
    segment: planInfo.segment,
    status: normalizedStatus,
    stripeCustomerId,
  });
}

/**
 * Gérer la suppression d'un abonnement
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`🗑️ Abonnement supprimé: ${subscription.id}`);

  // Mettre l'abonnement en statut "cancelled"
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('❌ Erreur annulation abonnement:', error);
  } else {
    console.log(`✅ Abonnement marqué comme annulé`);
  }

  const userId = subscription.metadata?.userId;
  if (userId) {
    await syncUserPlan({
      userId,
      status: 'cancelled',
    });
  } else {
    console.warn('⚠️ Impossible de synchroniser le plan utilisateur: userId absent des métadonnées Stripe');
  }
}

/**
 * Gérer un paiement réussi
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`💰 Paiement réussi pour facture: ${invoice.id}`);

  // Vous pouvez logger les paiements, envoyer des emails de confirmation, etc.
  // Pour l'instant, on ne fait rien de spécial car la mise à jour de l'abonnement
  // est déjà gérée par customer.subscription.updated
}

/**
 * Gérer un paiement échoué
 */
async function handlePaymentFailed(invoice: any) {
  console.error(`❌ Paiement échoué pour facture: ${invoice.id}`);

  // Vous pouvez envoyer un email à l'utilisateur pour l'informer
  // ou mettre à jour le statut de l'abonnement
  
  if (invoice.subscription) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription as string);

    if (error) {
      console.error('❌ Erreur mise à jour statut abonnement:', error);
    } else {
      console.log(`⚠️ Abonnement marqué comme past_due`);
    }
  }
}

function mapPlanToUserPlan(planType?: string | null): string | null {
  if (!planType) return null;
  
  // Nouveaux plans (depuis pricing.ts)
  const newPlans = ['STARTER', 'PRO', 'SCALE', 'SOLO', 'UNLIMITED'];
  if (newPlans.includes(planType.toUpperCase())) {
    return planType.toUpperCase();
  }
  
  // Anciens plans (pour rétrocompatibilité)
  switch (planType.toLowerCase()) {
    case 'starter':
      return 'STARTER';
    case 'pro':
      return 'PRO';
    case 'enterprise':
      return 'ENTERPRISE';
    case 'free':
      return 'FREE';
    default:
      return null;
  }
}

function mapStripeStatus(status?: string | null): 'active' | 'past_due' | 'cancelled' | 'trial' | 'expired' {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'active';
    case 'trialing':
    case 'trial':
      return 'trial';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'cancelled':
    case 'incomplete':
    case 'incomplete_expired':
    case 'unpaid':
      return 'cancelled';
    case 'paused':
      return 'past_due';
    default:
      return 'cancelled';
  }
}

async function syncUserPlan(params: {
  userId: string;
  planType?: string | null;
  segment?: 'shopify' | 'freelance' | null;
  status?: string | null;
  stripeCustomerId?: string | null;
}): Promise<void> {
  const { userId, planType, segment, status, stripeCustomerId } = params;
  const normalizedStatus = mapStripeStatus(status);
  const updates: Record<string, any> = {};

  if (stripeCustomerId) {
    updates.stripe_customer_id = stripeCustomerId;
  }

  if (normalizedStatus === 'active' || normalizedStatus === 'trial' || normalizedStatus === 'past_due') {
    const mappedPlan = mapPlanToUserPlan(planType);
    if (mappedPlan) {
      updates.plan = mappedPlan;
    } else {
      console.warn(`⚠️ Plan ${planType} non reconnu pour utilisateur ${userId}`);
    }
  } else {
    updates.plan = 'FREE';
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('❌ Erreur synchronisation plan utilisateur:', error, { userId, updates });
  } else {
    console.log(`✅ Plan utilisateur synchronisé pour ${userId}:`, updates);
  }
}
