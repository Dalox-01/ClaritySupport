import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les informations utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, plan')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur a un abonnement actif
    if (userData.plan === 'FREE') {
      return NextResponse.json(
        { success: false, message: 'Aucun abonnement actif à résilier' },
        { status: 400 }
      );
    }

    if (!userData.stripe_customer_id) {
      return NextResponse.json(
        { success: false, message: 'Aucune information de paiement trouvée' },
        { status: 400 }
      );
    }

    // Récupérer les abonnements Stripe du client
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Aucun abonnement actif trouvé' },
        { status: 400 }
      );
    }

    const subscription = subscriptions.data[0];

    // Annuler l'abonnement à la fin de la période de facturation
    const canceledSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    const cancelAtDate = new Date(canceledSubscription.cancel_at! * 1000);

    // Créer un log d'audit
    await supabase.from('audit_logs').insert({
      user_id: session.user.email,
      action: 'subscription_canceled',
      details: {
        subscription_id: subscription.id,
        plan: userData.plan,
        cancel_at: cancelAtDate.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });

    console.log(`✅ Abonnement annulé pour ${session.user.email} - Actif jusqu'au ${cancelAtDate.toLocaleDateString('fr-FR')}`);

    return NextResponse.json({
      success: true,
      message: 'Abonnement résilié avec succès',
      cancel_at: cancelAtDate.toISOString(),
      cancel_at_formatted: cancelAtDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la résiliation:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Erreur lors de la résiliation de l\'abonnement' 
      },
      { status: 500 }
    );
  }
}
