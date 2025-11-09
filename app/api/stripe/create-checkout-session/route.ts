// API Route: Créer une session Stripe Checkout

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  createCheckoutSession, 
  getOrCreateStripeCustomer,
  STRIPE_PRICE_IDS 
} from '@/lib/stripe';
import { PlanType } from '@/lib/pricing-plans';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { plan, billingPeriod } = await req.json();

    // Valider le plan
    const validPlans: PlanType[] = ['starter', 'pro', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ 
        error: 'Plan invalide',
        validPlans 
      }, { status: 400 });
    }

    // Valider la période de facturation
    if (billingPeriod !== 'monthly' && billingPeriod !== 'yearly') {
      return NextResponse.json({ 
        error: 'Période de facturation invalide' 
      }, { status: 400 });
    }

    // Récupérer le Price ID Stripe
    const priceId = STRIPE_PRICE_IDS[plan as PlanType][billingPeriod as 'monthly' | 'yearly'];
    
    if (!priceId) {
      return NextResponse.json({ 
        error: 'Price ID Stripe non configuré pour ce plan',
        plan,
        billingPeriod
      }, { status: 500 });
    }

    // Récupérer ou créer le customer Stripe
    const customerId = await getOrCreateStripeCustomer({
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined,
    });

    // URLs de redirection
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/mail-center?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/mail-center?checkout=canceled`;

    // Créer la session Checkout
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      userId: session.user.id,
      planType: plan,
      billingPeriod,
    });

    console.log(`✅ Session Checkout créée pour user ${session.user.id}: ${checkoutSession.id}`);

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error('❌ Erreur création session Checkout:', error);
    return NextResponse.json({ 
      error: 'Erreur création session de paiement',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
