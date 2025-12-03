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
      // Pas d'abonnement dans subscriptions, vérifier si l'utilisateur a un stripe_customer_id
      const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', session.user.id)
        .single();

      if (!userData?.stripe_customer_id) {
        return NextResponse.json({ 
          error: 'Aucun abonnement actif trouvé' 
        }, { status: 404 });
      }

      // Récupérer les abonnements Stripe du client
      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: userData.stripe_customer_id,
        status: 'active',
        limit: 1,
      });

      if (stripeSubscriptions.data.length === 0) {
        return NextResponse.json({ 
          error: 'Aucun abonnement actif trouvé dans Stripe' 
        }, { status: 404 });
      }

      const stripeSubscription = stripeSubscriptions.data[0];

      // Annuler l'abonnement dans Stripe
      const updatedSubscription = await stripe.subscriptions.update(
        stripeSubscription.id,
        {
          cancel_at_period_end: true,
        }
      );

      console.log(`✅ Abonnement ${stripeSubscription.id} marqué pour annulation à la fin de la période`);
      console.log(`📅 L'utilisateur restera sur le plan actuel jusqu'au ${new Date(updatedSubscription.cancel_at! * 1000).toLocaleDateString()}`);
      console.log(`🔄 Le webhook Stripe mettra automatiquement users.plan = 'FREE' à cette date`);

      return NextResponse.json({
        success: true,
        message: 'Abonnement résilié avec succès',
        cancel_at: updatedSubscription.cancel_at,
      });
    }

    // Annuler l'abonnement dans Stripe (à la fin de la période)
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    // Mettre à jour dans la table subscriptions
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

    console.log(`✅ Abonnement ${subscription.stripe_subscription_id} marqué pour annulation à la fin de la période`);
    console.log(`📅 L'utilisateur restera sur le plan actuel jusqu'au ${new Date(stripeSubscription.cancel_at! * 1000).toLocaleDateString()}`);
    console.log(`🔄 Le webhook Stripe mettra automatiquement users.plan = 'FREE' à cette date`);

    return NextResponse.json({
      success: true,
      message: 'Abonnement résilié avec succès',
      cancel_at: stripeSubscription.cancel_at,
    });

  } catch (error) {
    console.error('❌ Erreur résiliation abonnement:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la résiliation de l\'abonnement',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
