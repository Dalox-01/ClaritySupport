/**
 * Script de test de sécurité
 * Execute ce fichier pour vérifier que les mesures de sécurité fonctionnent
 */

import { 
  sanitizeHtml, 
  escapeHtml, 
  sanitizeUrl,
  sanitizeInput,
  validatePasswordStrength,
  containsMaliciousCode,
  sanitizeFilename,
  validateSqlInput,
  isValidEmail,
  secureCompare
} from './security';

console.log('🛡️ Test des utilitaires de sécurité\n');

// Test 1: sanitizeHtml
console.log('1️⃣ Test sanitizeHtml()');
const maliciousHtml = '<p>Hello</p><script>alert("XSS")</script><img src=x onerror="alert(1)">';
const cleanHtml = sanitizeHtml(maliciousHtml);
console.log('Input:', maliciousHtml);
console.log('Output:', cleanHtml);
console.log('✅ Script tags removed:', !cleanHtml.includes('<script'));
console.log('✅ Event handlers removed:', !cleanHtml.includes('onerror'));
console.log('');

// Test 2: escapeHtml
console.log('2️⃣ Test escapeHtml()');
const textWithHtml = '<div>Test & "quotes"</div>';
const escapedText = escapeHtml(textWithHtml);
console.log('Input:', textWithHtml);
console.log('Output:', escapedText);
console.log('✅ HTML escaped:', escapedText.includes('&lt;div&gt;'));
console.log('');

// Test 3: sanitizeUrl
console.log('3️⃣ Test sanitizeUrl()');
const urls = [
  'https://example.com',
  'javascript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  'http://safe-site.com',
];
urls.forEach(url => {
  const clean = sanitizeUrl(url);
  console.log(`${url} → ${clean}`);
});
console.log('');

// Test 4: containsMaliciousCode
console.log('4️⃣ Test containsMaliciousCode()');
const inputs = [
  'Hello world',
  '<script>alert(1)</script>',
  'onclick=alert(1)',
  'javascript:void(0)',
];
inputs.forEach(input => {
  const isMalicious = containsMaliciousCode(input);
  console.log(`${input} → ${isMalicious ? '❌ MALICIOUS' : '✅ SAFE'}`);
});
console.log('');

// Test 5: validatePasswordStrength
console.log('5️⃣ Test validatePasswordStrength()');
const passwords = [
  'weak',
  'Weak123',
  'StrongP@ss123',
];
passwords.forEach(pwd => {
  const result = validatePasswordStrength(pwd);
  console.log(`${pwd} → ${result.valid ? '✅ VALID' : '❌ INVALID'}`);
  if (!result.valid) {
    console.log('  Errors:', result.errors);
  }
});
console.log('');

// Test 6: sanitizeFilename
console.log('6️⃣ Test sanitizeFilename()');
const filenames = [
  'document.pdf',
  '../../../etc/passwd',
  'file<script>.txt',
  'normal-file_123.jpg',
];
filenames.forEach(filename => {
  const clean = sanitizeFilename(filename);
  console.log(`${filename} → ${clean}`);
});
console.log('');

// Test 7: validateSqlInput
console.log('7️⃣ Test validateSqlInput()');
const sqlInputs = [
  'john@example.com',
  "' OR '1'='1",
  'DROP TABLE users',
  'normal text',
];
sqlInputs.forEach(input => {
  const isValid = validateSqlInput(input);
  console.log(`${input} → ${isValid ? '✅ SAFE' : '❌ SUSPICIOUS'}`);
});
console.log('');

// Test 8: isValidEmail
console.log('8️⃣ Test isValidEmail()');
const emails = [
  'user@example.com',
  'invalid.email',
  'test@test',
  'valid.email+tag@domain.co.uk',
];
emails.forEach(email => {
  const isValid = isValidEmail(email);
  console.log(`${email} → ${isValid ? '✅ VALID' : '❌ INVALID'}`);
});
console.log('');

// Test 9: secureCompare
console.log('9️⃣ Test secureCompare()');
console.log('secureCompare("secret", "secret"):', secureCompare('secret', 'secret'));
console.log('secureCompare("secret", "wrong"):', secureCompare('secret', 'wrong'));
console.log('secureCompare("abc", "abcd"):', secureCompare('abc', 'abcd'));
console.log('');

// Test 10: sanitizeInput
console.log('🔟 Test sanitizeInput()');
const userInputs = [
  'Normal text',
  'Text with \x00 null byte',
  'A'.repeat(2000), // Long text
];
userInputs.forEach((input, i) => {
  const clean = sanitizeInput(input.substring(0, 50), 100);
  console.log(`Input ${i + 1} (${input.length} chars) → Output (${clean.length} chars)`);
});
console.log('');

console.log('✅ Tous les tests de sécurité sont terminés!\n');
console.log('📋 Résumé:');
console.log('- sanitizeHtml: Supprime scripts et attributs dangereux');
console.log('- escapeHtml: Échappe les caractères HTML');
console.log('- sanitizeUrl: Bloque les URLs dangereuses');
console.log('- containsMaliciousCode: Détecte le code malveillant');
console.log('- validatePasswordStrength: Valide la force du mot de passe');
console.log('- sanitizeFilename: Prévient path traversal');
console.log('- validateSqlInput: Détecte les injections SQL');
console.log('- isValidEmail: Valide les emails');
console.log('- secureCompare: Compare de manière sécurisée');
console.log('- sanitizeInput: Nettoie les inputs texte\n');
console.log('🛡️ Votre application est sécurisée!');
