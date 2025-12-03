// Script pour corriger manuellement un abonnement après paiement
// Utiliser si le webhook n'était pas configuré au moment du paiement

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSubscription() {
  console.log('🔍 Recherche de votre utilisateur...\n');

  // 1. Trouver votre email d'utilisateur
  const userEmail = process.argv[2];
  const plan = process.argv[3]; // 'starter', 'pro', ou 'enterprise'

  if (!userEmail || !plan) {
    console.error('❌ Usage: node fix-my-subscription.js <email> <plan>');
    console.error('   Exemple: node fix-my-subscription.js user@example.com pro');
    process.exit(1);
  }

  const validPlans = ['starter', 'pro', 'enterprise'];
  if (!validPlans.includes(plan)) {
    console.error('❌ Plan invalide. Utilisez: starter, pro, ou enterprise');
    process.exit(1);
  }

  // 2. Chercher l'utilisateur
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('❌ Erreur récupération utilisateurs:', userError);
    process.exit(1);
  }

  const user = users.users.find(u => u.email === userEmail);
  
  if (!user) {
    console.error(`❌ Utilisateur ${userEmail} non trouvé`);
    process.exit(1);
  }

  console.log(`✅ Utilisateur trouvé: ${user.email} (ID: ${user.id})\n`);

  // 3. Créer/Mettre à jour l'abonnement
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1); // +1 mois

  const subscriptionData = {
    user_id: user.id,
    plan: plan,
    status: 'active',
    stripe_customer_id: 'manual_fix',
    stripe_subscription_id: 'manual_fix_' + Date.now(),
    stripe_price_id: 'manual_fix',
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    billing_period: 'monthly',
    cancel_at_period_end: false,
    updated_at: now.toISOString(),
  };

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'user_id',
    })
    .select()
    .single();

  if (subError) {
    console.error('❌ Erreur création abonnement:', subError);
    process.exit(1);
  }

  console.log('✅ Abonnement créé/mis à jour avec succès!\n');
  console.log('📋 Détails:');
  console.log(`   Plan: ${subscription.plan.toUpperCase()}`);
  console.log(`   Statut: ${subscription.status}`);
  console.log(`   Période: ${new Date(subscription.current_period_start).toLocaleDateString()} - ${new Date(subscription.current_period_end).toLocaleDateString()}`);
  console.log('\n✅ Votre abonnement est maintenant actif dans Mail Center!');
  console.log('🔄 Rafraîchissez la page pour voir les changements.');
}

fixSubscription().catch(console.error);
