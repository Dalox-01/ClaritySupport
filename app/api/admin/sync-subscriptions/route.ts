// API Route: Synchroniser les abonnements Stripe vers Supabase
// GET /api/admin/sync-subscriptions

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🔄 Synchronisation des abonnements Stripe...');

    // Récupérer tous les utilisateurs avec un stripe_customer_id
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id, plan')
      .not('stripe_customer_id', 'is', null);

    if (usersError) {
      return NextResponse.json({ error: 'Erreur récupération utilisateurs', details: usersError }, { status: 500 });
    }

    const results = [];

    for (const user of users) {
      try {
        // Récupérer les abonnements Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 10,
        });

        if (subscriptions.data.length === 0) {
          results.push({ user: user.email, status: 'no_subscription' });
          continue;
        }

        for (const sub of subscriptions.data) {
          // Mapper le price_id au plan
          const priceId = sub.items.data[0]?.price.id;
          let plan = user.plan;

          if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER) {
            plan = 'STARTER';
          } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) {
            plan = 'PRO';
          } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE) {
            plan = 'ENTERPRISE';
          }

          const subscriptionData = {
            user_id: user.id,
            plan: plan,
            status: sub.status,
            stripe_customer_id: user.stripe_customer_id,
            stripe_subscription_id: sub.id,
            stripe_price_id: priceId,
            current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
            billing_period: sub.items.data[0]?.price.recurring?.interval || 'month',
            cancel_at_period_end: sub.cancel_at_period_end || false,
          };

          // Vérifier si existe déjà
          const { data: existing } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', sub.id)
            .single();

          if (existing) {
            // Mettre à jour
            const { error: updateError } = await supabase
              .from('subscriptions')
              .update(subscriptionData)
              .eq('stripe_subscription_id', sub.id);

            if (updateError) {
              results.push({ user: user.email, subscription: sub.id, status: 'update_error', error: updateError.message });
            } else {
              results.push({ user: user.email, subscription: sub.id, status: 'updated', cancel_at_period_end: sub.cancel_at_period_end });
            }
          } else {
            // Insérer
            const { error: insertError } = await supabase
              .from('subscriptions')
              .insert(subscriptionData);

            if (insertError) {
              results.push({ user: user.email, subscription: sub.id, status: 'insert_error', error: insertError.message });
            } else {
              results.push({ user: user.email, subscription: sub.id, status: 'created', cancel_at_period_end: sub.cancel_at_period_end });
            }
          }
        }
      } catch (error) {
        results.push({ user: user.email, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      success: true,
      total_users: users.length,
      results: results,
    });

  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
    return NextResponse.json({ 
      error: 'Erreur synchronisation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
