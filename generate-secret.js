#!/usr/bin/env node

/**
 * Script pour générer un NEXTAUTH_SECRET sécurisé
 * Usage: node generate-secret.js
 */

const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

console.log('\n🔐 NEXTAUTH_SECRET généré pour la production:\n');
console.log(generateSecret());
console.log('\n✅ Copiez cette valeur dans vos variables d\'environnement Vercel\n');
console.log('💡 Cette clé doit rester secrète et ne jamais être commitée dans Git!\n');
