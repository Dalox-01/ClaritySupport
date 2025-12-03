/**
 * Configuration globale des tests Jest
 */

// Mock des variables d'environnement
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.NEXTAUTH_SECRET = 'test-secret';

// Augmenter le timeout pour les tests async
jest.setTimeout(10000);

// Mock global de console pour les tests silencieux
// Décommentez pour supprimer les logs pendant les tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
});

// Nettoyage global après tous les tests
afterAll(() => {
  jest.restoreAllMocks();
});
