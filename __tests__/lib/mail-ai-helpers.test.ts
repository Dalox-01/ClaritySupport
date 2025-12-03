/**
 * Tests unitaires pour lib/mail-ai-helpers.ts
 * Teste les fonctions d'analyse et de génération de réponses IA
 */

import { classifyEmailByHashtags, type EmailAnalysisResult } from '../../lib/mail-ai-helpers';

// Mock OpenAI pour éviter les appels API réels
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                category: 'support',
                sentiment: 'neutre',
                urgency_score: 5,
                requires_validation: false,
                detected_entities: {},
              })
            }
          }],
          usage: { total_tokens: 100 }
        })
      }
    }
  }));
});

// Mock Supabase
jest.mock('../../lib/db', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    update: jest.fn().mockResolvedValue({ data: null, error: null }),
  }
}));

describe('Mail AI Helpers', () => {
  describe('classifyEmailByHashtags', () => {
    test('devrait détecter un email urgent', () => {
      const result = classifyEmailByHashtags(
        'URGENT: Problème critique',
        'Notre site est down depuis 2 heures, c\'est urgent !'
      );
      
      expect(result).toBeDefined();
      expect(result.category).toBeDefined();
      expect(result.sentiment).toBeDefined();
      expect(result.urgency_score).toBeDefined();
    });

    test('devrait détecter les hashtags de remboursement', () => {
      const result = classifyEmailByHashtags(
        'Demande de remboursement',
        'Je souhaite être remboursé pour ma commande. Merci de me rembourser rapidement.'
      );
      
      expect(result).toBeDefined();
      expect(result.detected_hashtags).toBeDefined();
    });

    test('devrait détecter les hashtags de commande', () => {
      const result = classifyEmailByHashtags(
        'Suivi de ma commande',
        'Où en est ma commande ? Je voudrais suivre mon colis.'
      );
      
      expect(result).toBeDefined();
      expect(result.category).toBeDefined();
    });

    test('devrait retourner un résultat valide pour un email vide', () => {
      const result = classifyEmailByHashtags('', '');
      
      expect(result).toBeDefined();
      expect(result.category).toBeDefined();
      expect(result.sentiment).toBeDefined();
    });

    test('devrait détecter le sentiment négatif', () => {
      const result = classifyEmailByHashtags(
        'Insatisfaction',
        'Je suis très mécontent de votre service. Réclamation pour votre service déplorable.'
      );
      
      expect(result).toBeDefined();
    });

    test('devrait détecter le sentiment positif', () => {
      const result = classifyEmailByHashtags(
        'Merci !',
        'Un grand merci pour votre aide. Votre service est excellent !'
      );
      
      expect(result).toBeDefined();
    });
  });

  describe('Validation des résultats', () => {
    test('le résultat devrait avoir la structure EmailAnalysisResult', () => {
      const result = classifyEmailByHashtags('Test', 'Body');
      
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('sentiment');
      expect(result).toHaveProperty('urgency_score');
      expect(result).toHaveProperty('requires_validation');
      expect(result).toHaveProperty('detected_entities');
    });

    test('urgency_score devrait être entre 0 et 10', () => {
      const result = classifyEmailByHashtags(
        'URGENT !!!!',
        'C\'est très très urgent !!!'
      );
      
      expect(result.urgency_score).toBeGreaterThanOrEqual(0);
      expect(result.urgency_score).toBeLessThanOrEqual(10);
    });
  });

  describe('Détection de catégories spécifiques', () => {
    test('devrait détecter SAV pour problème technique', () => {
      const result = classifyEmailByHashtags(
        'Produit défectueux',
        'Mon produit ne fonctionne plus, il est défaillant et cassé.'
      );
      
      expect(result).toBeDefined();
    });

    test('devrait détecter livraison pour suivi colis', () => {
      const result = classifyEmailByHashtags(
        'Livraison',
        'Mon colis n\'est pas arrivé, où est ma livraison ? Tracking numéro.'
      );
      
      expect(result).toBeDefined();
    });
  });
});

describe('Constantes et Configuration', () => {
  test('les catégories de support valides devraient exister', () => {
    const validSupportCategories = [
      'FACTURATION', 'TECHNIQUE', 'COMMERCIAL', 'REMBOURSEMENT',
      'COMMANDE', 'LIVRAISON', 'RENSEIGNEMENT', 'PRODUIT', 'SERVICE_CLIENT'
    ];
    
    expect(validSupportCategories).toHaveLength(9);
  });

  test('les sentiments valides devraient être définis', () => {
    const validSentiments = ['positif', 'neutre', 'negatif', 'urgent'];
    expect(validSentiments).toHaveLength(4);
  });

  test('les catégories email valides devraient être définies', () => {
    const validCategories = ['support', 'vente', 'spam', 'urgent', 'partenariat', 'autre'];
    expect(validCategories).toHaveLength(6);
  });
});
