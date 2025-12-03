// Script pour appliquer la migration support_category
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔧 Application de la migration support_category...\n');

  try {
    // 1. Ajouter la colonne support_category
    console.log('1️⃣  Ajout de la colonne support_category...');
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE emails_cache
        ADD COLUMN IF NOT EXISTS support_category TEXT 
        CHECK (support_category IN (
          'urgent', 
          'commande', 
          'remboursement', 
          'question-produit', 
          'suivi-commande', 
          'sav', 
          'reclamation', 
          'information', 
          'facturation', 
          'technique'
        ));
      `
    });

    if (error1) {
      console.log('⚠️  La colonne support_category existe peut-être déjà');
    } else {
      console.log('✅ Colonne support_category ajoutée');
    }

    // 2. Ajouter la colonne detected_hashtags
    console.log('\n2️⃣  Ajout de la colonne detected_hashtags...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE emails_cache
        ADD COLUMN IF NOT EXISTS detected_hashtags TEXT[] DEFAULT ARRAY[]::TEXT[];
      `
    });

    if (error2) {
      console.log('⚠️  La colonne detected_hashtags existe peut-être déjà');
    } else {
      console.log('✅ Colonne detected_hashtags ajoutée');
    }

    // 3. Créer l'index
    console.log('\n3️⃣  Création de l\'index sur support_category...');
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_emails_cache_support_category 
        ON emails_cache(support_category);
      `
    });

    if (error3) {
      console.log('⚠️  L\'index existe peut-être déjà');
    } else {
      console.log('✅ Index créé');
    }

    // 4. Vérifier les colonnes
    console.log('\n4️⃣  Vérification des colonnes...');
    const { data, error: error4 } = await supabase
      .from('emails_cache')
      .select('id, support_category, detected_hashtags')
      .limit(1);

    if (error4) {
      console.error('❌ Erreur lors de la vérification:', error4.message);
      console.log('\n⚠️  Les colonnes n\'existent pas encore. Essayez d\'exécuter directement le SQL:');
      console.log('\n--- SQL À EXÉCUTER DANS SUPABASE SQL EDITOR ---');
      console.log(`
ALTER TABLE emails_cache
ADD COLUMN IF NOT EXISTS support_category TEXT 
CHECK (support_category IN (
  'urgent', 'commande', 'remboursement', 'question-produit', 
  'suivi-commande', 'sav', 'reclamation', 'information', 
  'facturation', 'technique'
));

ALTER TABLE emails_cache
ADD COLUMN IF NOT EXISTS detected_hashtags TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE INDEX IF NOT EXISTS idx_emails_cache_support_category 
ON emails_cache(support_category);
      `);
    } else {
      console.log('✅ Les colonnes sont accessibles!');
      console.log('   support_category:', typeof data);
      console.log('   detected_hashtags:', typeof data);
    }

    console.log('\n🎉 Migration terminée!');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.log('\n💡 Solution: Allez dans Supabase Dashboard > SQL Editor et exécutez:');
    console.log(`
ALTER TABLE emails_cache
ADD COLUMN IF NOT EXISTS support_category TEXT 
CHECK (support_category IN (
  'urgent', 'commande', 'remboursement', 'question-produit', 
  'suivi-commande', 'sav', 'reclamation', 'information', 
  'facturation', 'technique'
));

ALTER TABLE emails_cache
ADD COLUMN IF NOT EXISTS detected_hashtags TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE INDEX IF NOT EXISTS idx_emails_cache_support_category 
ON emails_cache(support_category);
    `);
  }
}

applyMigration();
