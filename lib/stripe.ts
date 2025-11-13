import Stripe from 'stripe';
import { PlanType } from './pricing-plans';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-10-29.clover',
    });
  }
  return stripeClient;
}

export const stripe = getStripe();

/**
 * Mapping des nouveaux Price IDs (depuis pricing.ts) vers les plans
 * E-commerce (shopify) et Freelance
 */
export const NEW_PRICE_TO_PLAN_MAP: Record<string, { segment: 'shopify' | 'freelance'; plan: string; period: 'monthly' }> = {
  // E-commerce Plans
  'price_1ST1dgGJn0NQpREzoGsS4OPI': { segment: 'shopify', plan: 'STARTER', period: 'monthly' },
  'price_1ST1gZGJn0NQpREz5KODKSCP': { segment: 'shopify', plan: 'PRO', period: 'monthly' },
  'price_1ST1iLGJn0NQpREzIdkg9x2N': { segment: 'shopify', plan: 'SCALE', period: 'monthly' },
  
  // Freelance Plans
  'price_1ST1nmGJn0NQpREzqP6lfgbH': { segment: 'freelance', plan: 'SOLO', period: 'monthly' },
  'price_1ST1qTGJn0NQpREzJUHjVmtt': { segment: 'freelance', plan: 'PRO', period: 'monthly' },
  'price_1ST1t9GJn0NQpREzTsWCr3w4': { segment: 'freelance', plan: 'UNLIMITED', period: 'monthly' },
};

/**
 * Mapping des plans ClaritySupport vers les Price IDs Stripe
 * Les Price IDs sont à configurer dans les variables d'environnement
 */
export const STRIPE_PRICE_IDS: Record<PlanType, { monthly: string; yearly: string }> = {
  free: {
    monthly: '', // Plan gratuit, pas de Price ID
    yearly: '',
  },
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || '',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || '',
  },
};

/**
 * Récupérer ou créer un customer Stripe pour un utilisateur
 */
export async function getOrCreateStripeCustomer(params: {
  userId: string;
  email: string;
  name?: string;
}): Promise<string> {
  const { userId, email, name } = params;

  // Chercher si le customer existe déjà
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Créer un nouveau customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  return customer.id;
}

/**
 * Créer une session Stripe Checkout pour souscrire à un abonnement
 */
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
  planType: PlanType | string;
  billingPeriod: 'monthly' | 'yearly' | string;
}): Promise<Stripe.Checkout.Session> {
  const { customerId, priceId, successUrl, cancelUrl, userId, planType, billingPeriod } = params;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planType,
      billingPeriod,
    },
    subscription_data: {
      metadata: {
        userId,
        planType,
        billingPeriod,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    customer_update: {
      address: 'auto',
    },
  });

  return session;
}

/**
 * Créer une session de portail client Stripe
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const { customerId, returnUrl } = params;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Changer de plan (upgrade/downgrade)
 */
export async function updateSubscriptionPlan(params: {
  subscriptionId: string;
  newPriceId: string;
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}): Promise<Stripe.Subscription> {
  const { subscriptionId, newPriceId, prorationBehavior = 'create_prorations' } = params;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: prorationBehavior,
  });

  return updatedSubscription;
}

/**
 * Annuler un abonnement (à la fin de la période)
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

/**
 * Réactiver un abonnement annulé (avant la fin de la période)
 */
export async function reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}

/**
 * Récupérer les factures d'un customer
 */
export async function getInvoices(customerId: string, limit = 10): Promise<Stripe.Invoice[]> {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data;
}

/**
 * Déterminer le plan depuis un Price ID Stripe
 */
export function getPlanTypeFromPriceId(priceId: string): {
  planType: PlanType | string;
  billingPeriod: 'monthly' | 'yearly';
  segment?: 'shopify' | 'freelance';
} | null {
  // D'abord, vérifier dans le nouveau mapping
  const newPlanInfo = NEW_PRICE_TO_PLAN_MAP[priceId];
  if (newPlanInfo) {
    return {
      planType: newPlanInfo.plan,
      billingPeriod: newPlanInfo.period,
      segment: newPlanInfo.segment,
    };
  }

  // Sinon, chercher dans l'ancien mapping (pour rétrocompatibilité)
  for (const [planType, prices] of Object.entries(STRIPE_PRICE_IDS)) {
    if (prices.monthly === priceId) {
      return { planType: planType as PlanType, billingPeriod: 'monthly' };
    }
    if (prices.yearly === priceId) {
      return { planType: planType as PlanType, billingPeriod: 'yearly' };
    }
  }
  return null;
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function createStripeCustomer(email: string, name?: string): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name: name || undefined,
  });
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    return null;
  }
}
