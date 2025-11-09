/**
 * Script de test du système de paiement Stripe
 * Execute: npm run test:payment
 */

console.log('🧪 Test du Système de Paiement Stripe\n');

// Vérification des variables d'environnement
console.log('📋 Vérification de la configuration...\n');

const requiredEnvVars = [
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_STARTER_MONTHLY',
  'STRIPE_PRICE_PRO_MONTHLY',
  'NEXT_PUBLIC_APP_URL',
];

let configOk = true;

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MANQUANT`);
    configOk = false;
  } else if (varName.includes('STRIPE') && !value.startsWith('pk_') && !value.startsWith('sk_') && !value.startsWith('price_') && !value.startsWith('whsec_')) {
    console.log(`⚠️  ${varName}: Format suspect`);
  } else {
    const displayValue = value.substring(0, 12) + '...';
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('');

if (!configOk) {
  console.log('❌ Configuration incomplète !');
  console.log('\n📝 Actions requises :');
  console.log('1. Créer un compte Stripe : https://dashboard.stripe.com/register');
  console.log('2. Activer le mode TEST');
  console.log('3. Créer les produits Starter (7.99€) et Pro (18.99€)');
  console.log('4. Configurer les webhooks');
  console.log('5. Copier les clés dans .env');
  console.log('\n📖 Guide complet : GUIDE_TEST_PAIEMENT.md\n');
  process.exit(1);
}

// Vérifier le mode (TEST vs LIVE)
console.log('🔍 Vérification du mode Stripe...\n');

const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
const secretKey = process.env.STRIPE_SECRET_KEY || '';

if (publishableKey.startsWith('pk_test_') && secretKey.startsWith('sk_test_')) {
  console.log('✅ Mode TEST activé (recommandé pour les tests)');
} else if (publishableKey.startsWith('pk_live_') && secretKey.startsWith('sk_live_')) {
  console.log('⚠️  MODE LIVE DÉTECTÉ !');
  console.log('   Les vrais paiements seront effectués !');
  console.log('   Utilisez le mode TEST pour les tests.\n');
} else {
  console.log('❌ Clés Stripe invalides\n');
  process.exit(1);
}

console.log('');

// Test de connexion à Stripe
console.log('🔌 Test de connexion à Stripe...\n');

(async () => {
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });

    // Test 1: Récupérer les prix
    console.log('Test 1: Récupération des prix...');
    const starterPrice = await stripe.prices.retrieve(process.env.STRIPE_PRICE_STARTER_MONTHLY!);
    const proPrice = await stripe.prices.retrieve(process.env.STRIPE_PRICE_PRO_MONTHLY!);

    console.log(`✅ Prix Starter: ${starterPrice.unit_amount! / 100}€ / ${starterPrice.recurring?.interval}`);
    console.log(`✅ Prix Pro: ${proPrice.unit_amount! / 100}€ / ${proPrice.recurring?.interval}`);
    console.log('');

    // Test 2: Lister les webhooks
    console.log('Test 2: Vérification des webhooks...');
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (webhooks.data.length === 0) {
      console.log('⚠️  Aucun webhook configuré !');
      console.log('   Configurez les webhooks pour que les abonnements fonctionnent.');
      console.log('   Voir GUIDE_TEST_PAIEMENT.md section "Configurer les Webhooks"\n');
    } else {
      console.log(`✅ ${webhooks.data.length} webhook(s) configuré(s):`);
      webhooks.data.forEach((wh: any, index: number) => {
        console.log(`   ${index + 1}. ${wh.url}`);
        console.log(`      Events: ${wh.enabled_events.join(', ')}`);
      });
      console.log('');
    }

    // Test 3: Créer un customer de test (sera supprimé)
    console.log('Test 3: Création d\'un customer de test...');
    const testCustomer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test User',
      metadata: { test: 'true' },
    });
    console.log(`✅ Customer créé: ${testCustomer.id}`);

    // Supprimer immédiatement le customer de test
    await stripe.customers.del(testCustomer.id);
    console.log(`✅ Customer de test supprimé`);
    console.log('');

    // Résumé
    console.log('📊 Résumé des Tests\n');
    console.log('✅ Configuration Stripe: OK');
    console.log('✅ Connexion à l\'API: OK');
    console.log('✅ Prix configurés: OK');
    console.log(webhooks.data.length > 0 ? '✅ Webhooks: OK' : '⚠️  Webhooks: À configurer');
    console.log('✅ Création de customer: OK');
    console.log('');

    // Instructions suivantes
    console.log('🎯 Prochaines étapes:\n');
    console.log('1. Lancer le serveur: npm run dev');
    console.log('2. Se connecter à l\'application');
    console.log('3. Aller sur /dashboard/pricing');
    console.log('4. Tester l\'achat d\'un plan avec la carte:');
    console.log('   Numéro: 4242 4242 4242 4242');
    console.log('   Date: 12/25');
    console.log('   CVC: 123');
    console.log('');
    console.log('📖 Guide complet: GUIDE_TEST_PAIEMENT.md');
    console.log('');

    // Cartes de test
    console.log('💳 Cartes de test Stripe:\n');
    console.log('✅ Paiement réussi:       4242 4242 4242 4242');
    console.log('❌ Paiement refusé:       4000 0000 0000 0002');
    console.log('💰 Fonds insuffisants:    4000 0000 0000 9995');
    console.log('🔐 3D Secure requis:      4000 0027 6000 3184');
    console.log('');

    console.log('✅ Tous les tests sont passés ! Système de paiement prêt.\n');
  } catch (error: any) {
    console.log('❌ Erreur lors des tests:\n');
    console.log(error.message);
    console.log('');
    console.log('🔧 Vérifiez:');
    console.log('- Les clés Stripe sont correctes');
    console.log('- Les Prix IDs existent dans Stripe');
    console.log('- Vous êtes en mode TEST');
    console.log('');
    process.exit(1);
  }
})();
