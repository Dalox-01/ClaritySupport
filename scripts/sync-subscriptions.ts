// Script pour synchroniser les abonnements Stripe vers Supabase
// Usage: npx tsx scripts/sync-subscriptions.ts

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncSubscriptions() {
  console.log('🔄 Synchronisation des abonnements Stripe...\n');

  // Récupérer tous les utilisateurs avec un stripe_customer_id
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, stripe_customer_id, plan')
    .not('stripe_customer_id', 'is', null);

  if (usersError) {
    console.error('❌ Erreur récupération utilisateurs:', usersError);
    return;
  }

  console.log(`✅ ${users.length} utilisateurs avec stripe_customer_id trouvés\n`);

  for (const user of users) {
    console.log(`\n👤 User: ${user.email} (${user.plan})`);
    console.log(`   Customer ID: ${user.stripe_customer_id}`);

    try {
      // Récupérer les abonnements Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'all',
        limit: 10,
      });

      if (subscriptions.data.length === 0) {
        console.log('   ⚠️  Aucun abonnement Stripe trouvé');
        continue;
      }

      for (const sub of subscriptions.data) {
        console.log(`   📋 Subscription: ${sub.id} (${sub.status})`);

        // Mapper le price_id au plan
        const priceId = sub.items.data[0]?.price.id;
        let plan = user.plan;

        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER) {
          plan = 'STARTER';
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) {
          plan = 'PRO';
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE) {
          plan = 'SCALE';
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
            console.error('   ❌ Erreur mise à jour:', updateError.message);
          } else {
            console.log('   ✅ Abonnement mis à jour');
          }
        } else {
          // Insérer
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert(subscriptionData);

          if (insertError) {
            console.error('   ❌ Erreur insertion:', insertError.message);
          } else {
            console.log('   ✅ Abonnement créé dans subscriptions');
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ Erreur pour ${user.email}:`, error);
    }
  }

  console.log('\n✅ Synchronisation terminée !');
}

syncSubscriptions().catch(console.error);
