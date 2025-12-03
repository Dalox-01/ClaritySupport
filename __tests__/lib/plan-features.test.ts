/**
 * Tests unitaires pour lib/plan-features.ts
 * Vérifie les fonctionnalités par plan
 */

import {
  PLAN_FEATURES,
  canUseSignatures,
  canUseVariables,
  canUseCustomTemplates,
  canUseVoiceDictation,
  canUseChatbot,
  getMaxSignatures,
  getMaxCustomTemplates,
  hasPdfWatermark,
  getGenerationsLimit,
  getPlanName,
  getPlanPrice,
  canUseAffiliate,
} from '../../lib/plan-features';

describe('Plan Features', () => {
  describe('Structure PLAN_FEATURES', () => {
    test('devrait avoir tous les types de plans', () => {
      expect(PLAN_FEATURES).toHaveProperty('starter');
      expect(PLAN_FEATURES).toHaveProperty('pro');
      expect(PLAN_FEATURES).toHaveProperty('scale');
      expect(PLAN_FEATURES).toHaveProperty('ADMIN');
    });

    test('chaque plan devrait avoir tous les champs requis', () => {
      const requiredFields = [
        'generations', 'signatures', 'variables', 'customTemplates',
        'voiceDictation', 'pdfWatermark', 'historyDays', 'chatbot',
        'maxEmailAccounts', 'maxShopifyStores', 'maxKnowledgeFiles', 'affiliateEnabled'
      ];

      Object.values(PLAN_FEATURES).forEach(plan => {
        requiredFields.forEach(field => {
          expect(plan).toHaveProperty(field);
        });
      });
    });
  });

  describe('Limites de génération', () => {
    test('Starter: 5000 générations/mois', () => {
      expect(PLAN_FEATURES.starter.generations).toBe(5000);
    });

    test('Pro: 20000 générations/mois', () => {
      expect(PLAN_FEATURES.pro.generations).toBe(20000);
    });

    test('Scale: 60000 générations/mois', () => {
      expect(PLAN_FEATURES.scale.generations).toBe(60000);
    });

    test('ADMIN: quasi illimité', () => {
      expect(PLAN_FEATURES.ADMIN.generations).toBe(999999);
    });

    test('getGenerationsLimit devrait retourner les bonnes valeurs', () => {
      expect(getGenerationsLimit('starter')).toBe(5000);
      expect(getGenerationsLimit('pro')).toBe(20000);
      expect(getGenerationsLimit('scale')).toBe(60000);
    });
  });

  describe('Fonctionnalités signatures', () => {
    test('Starter: limité à 3 signatures', () => {
      expect(PLAN_FEATURES.starter.signatures).toBe(3);
      expect(getMaxSignatures('starter')).toBe(3);
    });

    test('Pro et Scale: signatures illimitées', () => {
      expect(PLAN_FEATURES.pro.signatures).toBe(-1);
      expect(PLAN_FEATURES.scale.signatures).toBe(-1);
    });

    test('canUseSignatures devrait retourner true pour tous les plans', () => {
      expect(canUseSignatures('starter')).toBe(true);
      expect(canUseSignatures('pro')).toBe(true);
      expect(canUseSignatures('scale')).toBe(true);
    });
  });

  describe('Fonctionnalités templates', () => {
    test('Starter: limité à 5 templates', () => {
      expect(PLAN_FEATURES.starter.customTemplates).toBe(5);
    });

    test('Pro et Scale: templates illimités', () => {
      expect(PLAN_FEATURES.pro.customTemplates).toBe(-1);
      expect(PLAN_FEATURES.scale.customTemplates).toBe(-1);
    });

    test('canUseCustomTemplates devrait retourner true pour tous', () => {
      expect(canUseCustomTemplates('starter')).toBe(true);
      expect(canUseCustomTemplates('pro')).toBe(true);
      expect(canUseCustomTemplates('scale')).toBe(true);
    });
  });

  describe('Fonctionnalités chatbot', () => {
    test('Starter: pas de chatbot', () => {
      expect(PLAN_FEATURES.starter.chatbot).toBe(false);
      expect(canUseChatbot('starter')).toBe(false);
    });

    test('Pro et Scale: chatbot activé', () => {
      expect(PLAN_FEATURES.pro.chatbot).toBe(true);
      expect(PLAN_FEATURES.scale.chatbot).toBe(true);
      expect(canUseChatbot('pro')).toBe(true);
      expect(canUseChatbot('scale')).toBe(true);
    });
  });

  describe('Limites comptes email', () => {
    test('Starter: 3 comptes max', () => {
      expect(PLAN_FEATURES.starter.maxEmailAccounts).toBe(3);
    });

    test('Pro: 10 comptes max', () => {
      expect(PLAN_FEATURES.pro.maxEmailAccounts).toBe(10);
    });

    test('Scale: illimité (99999)', () => {
      expect(PLAN_FEATURES.scale.maxEmailAccounts).toBe(99999);
    });
  });

  describe('Limites boutiques Shopify', () => {
    test('Starter: 1 boutique max', () => {
      expect(PLAN_FEATURES.starter.maxShopifyStores).toBe(1);
    });

    test('Pro: 3 boutiques max', () => {
      expect(PLAN_FEATURES.pro.maxShopifyStores).toBe(3);
    });

    test('Scale: illimité (99999)', () => {
      expect(PLAN_FEATURES.scale.maxShopifyStores).toBe(99999);
    });
  });

  describe('Limites fichiers techniques', () => {
    test('Starter: 0 fichiers', () => {
      expect(PLAN_FEATURES.starter.maxKnowledgeFiles).toBe(0);
    });

    test('Pro: 5 fichiers max', () => {
      expect(PLAN_FEATURES.pro.maxKnowledgeFiles).toBe(5);
    });

    test('Scale: illimité (99999)', () => {
      expect(PLAN_FEATURES.scale.maxKnowledgeFiles).toBe(99999);
    });
  });

  describe('Affiliation', () => {
    test('Starter: pas d\'affiliation', () => {
      expect(PLAN_FEATURES.starter.affiliateEnabled).toBe(false);
      expect(canUseAffiliate('starter')).toBe(false);
    });

    test('Pro et Scale: affiliation activée', () => {
      expect(PLAN_FEATURES.pro.affiliateEnabled).toBe(true);
      expect(PLAN_FEATURES.scale.affiliateEnabled).toBe(true);
      expect(canUseAffiliate('pro')).toBe(true);
      expect(canUseAffiliate('scale')).toBe(true);
    });
  });

  describe('Utilitaires', () => {
    test('canUseVariables devrait retourner true pour tous', () => {
      expect(canUseVariables('starter')).toBe(true);
      expect(canUseVariables('pro')).toBe(true);
      expect(canUseVariables('scale')).toBe(true);
    });

    test('canUseVoiceDictation devrait retourner true pour tous', () => {
      expect(canUseVoiceDictation('starter')).toBe(true);
      expect(canUseVoiceDictation('pro')).toBe(true);
      expect(canUseVoiceDictation('scale')).toBe(true);
    });

    test('hasPdfWatermark devrait retourner false pour tous', () => {
      expect(hasPdfWatermark('starter')).toBe(false);
      expect(hasPdfWatermark('pro')).toBe(false);
      expect(hasPdfWatermark('scale')).toBe(false);
    });

    test('getPlanName devrait retourner les bons noms', () => {
      expect(getPlanName('starter')).toBe('Starter');
      expect(getPlanName('pro')).toBe('Pro');
      expect(getPlanName('scale')).toBe('Scale');
      expect(getPlanName('ADMIN')).toBe('Admin');
    });

    test('getPlanPrice devrait retourner les bons prix', () => {
      expect(getPlanPrice('starter')).toBe(49);
      expect(getPlanPrice('pro')).toBe(99);
      expect(getPlanPrice('scale')).toBe(199);
      expect(getPlanPrice('ADMIN')).toBe(0);
    });
  });

  describe('Cohérence entre plans', () => {
    test('les générations devraient augmenter avec le niveau du plan', () => {
      expect(PLAN_FEATURES.pro.generations).toBeGreaterThan(PLAN_FEATURES.starter.generations);
      expect(PLAN_FEATURES.scale.generations).toBeGreaterThan(PLAN_FEATURES.pro.generations);
    });

    test('les comptes email devraient augmenter avec le niveau du plan', () => {
      expect(PLAN_FEATURES.pro.maxEmailAccounts).toBeGreaterThan(PLAN_FEATURES.starter.maxEmailAccounts);
      expect(PLAN_FEATURES.scale.maxEmailAccounts).toBeGreaterThan(PLAN_FEATURES.pro.maxEmailAccounts);
    });

    test('les boutiques Shopify devraient augmenter avec le niveau du plan', () => {
      expect(PLAN_FEATURES.pro.maxShopifyStores).toBeGreaterThan(PLAN_FEATURES.starter.maxShopifyStores);
      expect(PLAN_FEATURES.scale.maxShopifyStores).toBeGreaterThan(PLAN_FEATURES.pro.maxShopifyStores);
    });
  });
});
