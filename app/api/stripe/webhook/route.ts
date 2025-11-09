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

  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType;
  const billingPeriod = session.metadata?.billingPeriod;

  if (!userId || !planType) {
    console.error('⚠️ Métadonnées manquantes dans la session');
    return;
  }

  const subscriptionData = await stripe.subscriptions.retrieve(session.subscription as string) as any;

  // Créer ou mettre à jour l'abonnement dans la base de données
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      plan: planType,
      status: 'active',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionData.id,
      stripe_price_id: subscriptionData.items.data[0].price.id,
      current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
      billing_period: billingPeriod || 'monthly',
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('❌ Erreur sauvegarde abonnement:', error);
  } else {
    console.log(`✅ Abonnement ${planType} créé pour user ${userId}`);
  }
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

  // Mettre à jour l'abonnement
  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan: planInfo.planType,
      status: subscription.status === 'active' ? 'active' : subscription.status,
      stripe_price_id: priceId,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      billing_period: planInfo.billingPeriod,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('❌ Erreur mise à jour abonnement:', error);
  } else {
    console.log(`✅ Abonnement mis à jour: ${planInfo.planType} (${planInfo.billingPeriod})`);
  }
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
