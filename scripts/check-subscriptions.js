// Script pour vérifier la table subscriptions dans Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Lire le fichier .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubscriptions() {
  console.log('🔍 Vérification de la table subscriptions...\n');

  // Vérifier la structure de la table
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .limit(10);

  if (error) {
    console.error('❌ Erreur lors de la récupération des subscriptions:', error.message);
    return;
  }

  console.log(`📊 Nombre d'abonnements trouvés: ${subscriptions?.length || 0}\n`);

  if (subscriptions && subscriptions.length > 0) {
    console.log('📋 Données des abonnements:\n');
    subscriptions.forEach((sub, index) => {
      console.log(`Abonnement #${index + 1}:`);
      console.log(`  - User ID: ${sub.user_id}`);
      console.log(`  - Plan: ${sub.plan}`);
      console.log(`  - Status: ${sub.status}`);
      console.log(`  - Stripe Customer: ${sub.stripe_customer_id || 'N/A'}`);
      console.log(`  - Stripe Subscription: ${sub.stripe_subscription_id || 'N/A'}`);
      console.log(`  - Period: ${sub.current_period_start} → ${sub.current_period_end}`);
      console.log(`  - Créé le: ${sub.created_at}`);
      console.log('');
    });
  } else {
    console.log('⚠️  Aucun abonnement trouvé dans la table.');
    console.log('💡 Cela signifie que le webhook Stripe n\'a pas encore mis à jour la base.');
  }

  // Vérifier les utilisateurs
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, plan')
    .limit(5);

  if (!usersError && users) {
    console.log('\n👥 Utilisateurs dans la table users:');
    users.forEach(user => {
      console.log(`  - ${user.email}: plan = ${user.plan || 'N/A'}`);
    });
  }
}

checkSubscriptions().then(() => {
  console.log('\n✅ Vérification terminée');
  process.exit(0);
}).catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
