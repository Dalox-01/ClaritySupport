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

    const body = await req.json();
    let priceId: string;
    let planType: string = 'custom';
    let billingPeriod: string = 'monthly';

    // Nouveau système: priceId direct
    if (body.priceId) {
      priceId = body.priceId;
      console.log(`🆕 Utilisation du priceId direct: ${priceId}`);
    } 
    // Ancien système: plan + billingPeriod
    else if (body.plan && body.billingPeriod) {
      const { plan, billingPeriod: period } = body;

      // Valider le plan
      const validPlans: PlanType[] = ['starter', 'pro', 'scale'];
      if (!validPlans.includes(plan)) {
        return NextResponse.json({ 
          error: 'Plan invalide',
          validPlans 
        }, { status: 400 });
      }

      // Valider la période de facturation
      if (period !== 'monthly' && period !== 'yearly') {
        return NextResponse.json({ 
          error: 'Période de facturation invalide' 
        }, { status: 400 });
      }

      planType = plan;
      billingPeriod = period;

      // Récupérer le Price ID Stripe
      priceId = STRIPE_PRICE_IDS[plan as PlanType][period as 'monthly' | 'yearly'];
      
      if (!priceId) {
        return NextResponse.json({ 
          error: 'Price ID Stripe non configuré pour ce plan',
          plan,
          billingPeriod: period
        }, { status: 500 });
      }

      console.log(`🔧 Ancien système - Plan: ${plan}, Période: ${period}, PriceId: ${priceId}`);
    } else {
      return NextResponse.json({ 
        error: 'Paramètres manquants: fournissez soit priceId, soit plan et billingPeriod' 
      }, { status: 400 });
    }

    // Récupérer ou créer le customer Stripe
    const customerId = await getOrCreateStripeCustomer({
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined,
    });

    // URLs de redirection
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/checkout?canceled=true`;

    // Log des paramètres AVANT création
    console.log(`🔍 Création checkout avec métadonnées:`);
    console.log(`   - userId: ${session.user.id}`);
    console.log(`   - planType: ${planType}`);
    console.log(`   - billingPeriod: ${billingPeriod}`);
    console.log(`   - priceId: ${priceId}`);

    // Créer la session Checkout
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      userId: session.user.id,
      planType,
      billingPeriod,
    });

    console.log(`✅ Session Checkout créée pour user ${session.user.id}: ${checkoutSession.id}`);
    console.log(`📋 Métadonnées dans la session créée:`, JSON.stringify(checkoutSession.metadata));

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
