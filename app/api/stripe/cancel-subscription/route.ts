// API Route: Annuler un abonnement Stripe

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/cancel-subscription
 * Annule l'abonnement de l'utilisateur à la fin de la période en cours
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer l'abonnement de l'utilisateur
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ 
        error: 'Aucun abonnement actif trouvé' 
      }, { status: 404 });
    }

    // Annuler l'abonnement dans Stripe (à la fin de la période)
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    // Mettre à jour dans la base de données
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.stripe_subscription_id);

    if (updateError) {
      console.error('Erreur mise à jour abonnement:', updateError);
    }

    console.log(`✅ Abonnement ${subscription.stripe_subscription_id} annulé à la fin de la période`);

    return NextResponse.json({
      success: true,
      message: 'Abonnement annulé avec succès',
      cancel_at: stripeSubscription.cancel_at,
    });

  } catch (error) {
    console.error('❌ Erreur annulation abonnement:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'annulation de l\'abonnement',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
