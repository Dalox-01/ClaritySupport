/**
 * Tests unitaires pour lib/pricing-plans.ts
 * Vérifie la cohérence des plans tarifaires
 */

import {
  PRICING_PLANS,
  PlanType,
  getPlanByType,
  getUpgradePlans,
  comparePlans,
  canAccessFeature,
  getAnnualSavings,
  getRecommendedPlan,
  canUseAffiliate,
} from '../../lib/pricing-plans';

describe('Pricing Plans', () => {
  describe('Structure des plans', () => {
    test('devrait avoir exactement 3 plans: starter, pro, scale', () => {
      const planTypes = Object.keys(PRICING_PLANS);
      expect(planTypes).toHaveLength(3);
      expect(planTypes).toContain('starter');
      expect(planTypes).toContain('pro');
      expect(planTypes).toContain('scale');
    });

    test('chaque plan devrait avoir tous les champs requis', () => {
      const requiredFields = [
        'id', 'name', 'tagline', 'price', 'prices', 'limits',
        'description', 'features', 'featureList', 'highlighted', 'popular', 'cta'
      ];

      Object.values(PRICING_PLANS).forEach(plan => {
        requiredFields.forEach(field => {
          expect(plan).toHaveProperty(field);
        });
      });
    });
  });

  describe('Prix des plans', () => {
    test('Starter devrait coûter 49€/mois', () => {
      expect(PRICING_PLANS.starter.price.monthly).toBe(49);
      expect(PRICING_PLANS.starter.prices.monthly).toBe(49);
    });

    test('Pro devrait coûter 99€/mois', () => {
      expect(PRICING_PLANS.pro.price.monthly).toBe(99);
      expect(PRICING_PLANS.pro.prices.monthly).toBe(99);
    });

    test('Scale devrait coûter 199€/mois', () => {
      expect(PRICING_PLANS.scale.price.monthly).toBe(199);
      expect(PRICING_PLANS.scale.prices.monthly).toBe(199);
    });

    test('les prix annuels devraient offrir une réduction (10 mois pour 12)', () => {
      Object.values(PRICING_PLANS).forEach(plan => {
        const monthlyTotal = plan.price.monthly * 12;
        expect(plan.price.yearly).toBeLessThan(monthlyTotal);
      });
    });
  });

  describe('Limites des plans', () => {
    test('Starter: 5000 emails, 3 comptes, 1 Shopify, 0 fichiers', () => {
      const starter = PRICING_PLANS.starter.limits;
      expect(starter.emailsPerMonth).toBe(5000);
      expect(starter.emailAccounts).toBe(3);
      expect(starter.shopifyStores).toBe(1);
      expect(starter.knowledgeFiles).toBe(0);
    });

    test('Pro: 20000 emails, 10 comptes, 3 Shopify, 5 fichiers', () => {
      const pro = PRICING_PLANS.pro.limits;
      expect(pro.emailsPerMonth).toBe(20000);
      expect(pro.emailAccounts).toBe(10);
      expect(pro.shopifyStores).toBe(3);
      expect(pro.knowledgeFiles).toBe(5);
    });

    test('Scale: 60000 emails, illimité pour le reste', () => {
      const scale = PRICING_PLANS.scale.limits;
      expect(scale.emailsPerMonth).toBe(60000);
      expect(scale.emailAccounts).toBe(-1); // Illimité
      expect(scale.shopifyStores).toBe(-1); // Illimité
      expect(scale.knowledgeFiles).toBe(-1); // Illimité
    });

    test('les limites devraient augmenter avec le niveau du plan', () => {
      expect(PRICING_PLANS.pro.limits.emailsPerMonth).toBeGreaterThan(
        PRICING_PLANS.starter.limits.emailsPerMonth
      );
      expect(PRICING_PLANS.scale.limits.emailsPerMonth).toBeGreaterThan(
        PRICING_PLANS.pro.limits.emailsPerMonth
      );
    });
  });

  describe('Fonctionnalités des plans', () => {
    test('tous les plans devraient avoir l\'IA activée', () => {
      Object.values(PRICING_PLANS).forEach(plan => {
        expect(plan.features.aiEnabled).toBe(true);
      });
    });

    test('seuls Pro et Scale devraient avoir customAIConfig', () => {
      expect(PRICING_PLANS.starter.features.customAIConfig).toBe(false);
      expect(PRICING_PLANS.pro.features.customAIConfig).toBe(true);
      expect(PRICING_PLANS.scale.features.customAIConfig).toBe(true);
    });

    test('seuls Pro et Scale devraient avoir l\'affiliation', () => {
      expect(PRICING_PLANS.starter.features.affiliateEnabled).toBe(false);
      expect(PRICING_PLANS.pro.features.affiliateEnabled).toBe(true);
      expect(PRICING_PLANS.scale.features.affiliateEnabled).toBe(true);
    });

    test('Pro devrait être le plan populaire/highlighted', () => {
      expect(PRICING_PLANS.pro.popular).toBe(true);
      expect(PRICING_PLANS.pro.highlighted).toBe(true);
    });
  });

  describe('Fonctions utilitaires', () => {
    describe('getPlanByType', () => {
      test('devrait retourner le bon plan', () => {
        expect(getPlanByType('starter').id).toBe('starter');
        expect(getPlanByType('pro').id).toBe('pro');
        expect(getPlanByType('scale').id).toBe('scale');
      });
    });

    describe('getUpgradePlans', () => {
      test('Starter devrait pouvoir upgrader vers Pro et Scale', () => {
        const upgrades = getUpgradePlans('starter');
        expect(upgrades).toHaveLength(2);
        expect(upgrades.map(p => p.id)).toEqual(['pro', 'scale']);
      });

      test('Pro devrait pouvoir upgrader vers Scale uniquement', () => {
        const upgrades = getUpgradePlans('pro');
        expect(upgrades).toHaveLength(1);
        expect(upgrades[0].id).toBe('scale');
      });

      test('Scale ne devrait avoir aucun upgrade', () => {
        const upgrades = getUpgradePlans('scale');
        expect(upgrades).toHaveLength(0);
      });
    });

    describe('comparePlans', () => {
      test('devrait retourner un nombre négatif si planA < planB', () => {
        expect(comparePlans('starter', 'pro')).toBeLessThan(0);
        expect(comparePlans('starter', 'scale')).toBeLessThan(0);
        expect(comparePlans('pro', 'scale')).toBeLessThan(0);
      });

      test('devrait retourner 0 si plans identiques', () => {
        expect(comparePlans('starter', 'starter')).toBe(0);
        expect(comparePlans('pro', 'pro')).toBe(0);
        expect(comparePlans('scale', 'scale')).toBe(0);
      });

      test('devrait retourner un nombre positif si planA > planB', () => {
        expect(comparePlans('pro', 'starter')).toBeGreaterThan(0);
        expect(comparePlans('scale', 'starter')).toBeGreaterThan(0);
        expect(comparePlans('scale', 'pro')).toBeGreaterThan(0);
      });
    });

    describe('canAccessFeature', () => {
      test('Scale peut accéder à toutes les fonctionnalités', () => {
        expect(canAccessFeature('scale', 'starter')).toBe(true);
        expect(canAccessFeature('scale', 'pro')).toBe(true);
        expect(canAccessFeature('scale', 'scale')).toBe(true);
      });

      test('Starter ne peut accéder qu\'aux fonctionnalités Starter', () => {
        expect(canAccessFeature('starter', 'starter')).toBe(true);
        expect(canAccessFeature('starter', 'pro')).toBe(false);
        expect(canAccessFeature('starter', 'scale')).toBe(false);
      });
    });

    describe('getAnnualSavings', () => {
      test('devrait calculer les économies correctement', () => {
        Object.values(PRICING_PLANS).forEach(plan => {
          const savings = getAnnualSavings(plan);
          const expected = (plan.price.monthly * 12) - plan.price.yearly;
          expect(savings).toBe(expected);
        });
      });

      test('les économies devraient être positives', () => {
        Object.values(PRICING_PLANS).forEach(plan => {
          expect(getAnnualSavings(plan)).toBeGreaterThan(0);
        });
      });
    });

    describe('getRecommendedPlan', () => {
      test('devrait retourner le plan Pro', () => {
        const recommended = getRecommendedPlan();
        expect(recommended.id).toBe('pro');
      });
    });

    describe('canUseAffiliate', () => {
      test('Starter ne peut pas utiliser l\'affiliation', () => {
        expect(canUseAffiliate('starter')).toBe(false);
      });

      test('Pro et Scale peuvent utiliser l\'affiliation', () => {
        expect(canUseAffiliate('pro')).toBe(true);
        expect(canUseAffiliate('scale')).toBe(true);
      });
    });
  });
});
