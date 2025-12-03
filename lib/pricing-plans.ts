/**
 * Système de plans tarifaires pour ClaritySupport
 * 4 plans : FREE (essai 7 jours), Starter, Pro, Scale
 */

export type PlanType = 'free' | 'starter' | 'pro' | 'scale';

export interface PlanFeatures {
  // Comptes email
  maxEmailAccounts: number;
  
  // Emails traités par mois
  emailsPerMonth: number;
  
  // Boutiques Shopify
  maxShopifyStores: number;
  
  // IA et personnalisation
  aiEnabled: boolean;
  customAIConfig: boolean;
  maxKnowledgeFiles: number; // Nombre max de fichiers techniques
  
  // Affiliation
  affiliateEnabled: boolean;
  
  // Support
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  responseTime: string;
  
  // Essai gratuit
  trialDays?: number;
}

export interface PricingPlan {
  id: PlanType;
  name: string;
  tagline: string;
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  prices: {
    monthly: number;
    yearly: number;
  };
  limits: {
    emailsPerMonth: number;
    emailAccounts: number;
    shopifyStores: number;
    knowledgeFiles: number;
  };
  description: string;
  features: PlanFeatures;
  featureList: string[];
  highlighted: boolean;
  popular: boolean;
  cta: string;
  limitations?: string[];
}

export const PRICING_PLANS: Record<PlanType, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Essai gratuit 7 jours',
    price: {
      monthly: 0,
      yearly: 0,
      currency: '€',
    },
    prices: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      emailsPerMonth: 500,
      emailAccounts: 1,
      shopifyStores: 1,
      knowledgeFiles: 0,
    },
    description: 'Testez ClaritySupport gratuitement pendant 7 jours',
    featureList: [
      '1 compte email',
      '500 réponses IA pendant 7 jours',
      '1 boutique Shopify',
      'IA de base',
      'Support communautaire',
    ],
    features: {
      maxEmailAccounts: 1,
      emailsPerMonth: 500,
      maxShopifyStores: 1,
      aiEnabled: true,
      customAIConfig: false,
      maxKnowledgeFiles: 0,
      affiliateEnabled: false,
      supportLevel: 'community',
      responseTime: 'Forum',
      trialDays: 7,
    },
    highlighted: false,
    popular: false,
    cta: 'Essayer gratuitement',
    limitations: [
      'Limité à 7 jours',
      'Maximum 500 réponses',
      '1 seul compte email',
      'Pas de personnalisation IA',
      'Pas d\'affiliation',
    ],
  },
  
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'Pour démarrer',
    price: {
      monthly: 49,
      yearly: 490,
      currency: '€',
    },
    prices: {
      monthly: 49,
      yearly: 490,
    },
    limits: {
      emailsPerMonth: 5000,
      emailAccounts: 3,
      shopifyStores: 1,
      knowledgeFiles: 0,
    },
    description: 'Idéal pour démarrer avec l\'automatisation du support',
    featureList: [
      'Jusqu\'à 3 comptes email',
      '5 000 réponses clients/mois',
      '1 boutique Shopify',
      'IA de base',
      'Support email',
    ],
    features: {
      maxEmailAccounts: 3,
      emailsPerMonth: 5000,
      maxShopifyStores: 1,
      aiEnabled: true,
      customAIConfig: false,
      maxKnowledgeFiles: 0,
      affiliateEnabled: false,
      supportLevel: 'email',
      responseTime: '24-48h',
    },
    highlighted: false,
    popular: false,
    cta: 'Choisir Starter',
    limitations: [
      'Limité à 3 comptes email',
      '1 seule boutique Shopify',
      'Pas de personnalisation IA',
      'Pas de fichiers techniques',
      'Pas d\'affiliation',
    ],
  },
  
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Le plus populaire',
    price: {
      monthly: 99,
      yearly: 990,
      currency: '€',
    },
    prices: {
      monthly: 99,
      yearly: 990,
    },
    limits: {
      emailsPerMonth: 20000,
      emailAccounts: 10,
      shopifyStores: 3,
      knowledgeFiles: 5,
    },
    description: 'Solution complète avec personnalisation IA',
    featureList: [
      'Jusqu\'à 10 comptes email',
      '20 000 emails clients/mois',
      'Jusqu\'à 3 boutiques Shopify',
      'Personnalisation complète IA',
      'Jusqu\'à 5 fichiers techniques',
      'Lien d\'affiliation',
      'Support prioritaire',
    ],
    features: {
      maxEmailAccounts: 10,
      emailsPerMonth: 20000,
      maxShopifyStores: 3,
      aiEnabled: true,
      customAIConfig: true,
      maxKnowledgeFiles: 5,
      affiliateEnabled: true,
      supportLevel: 'priority',
      responseTime: '4-12h',
    },
    highlighted: true,
    popular: true,
    cta: 'Choisir Pro - Recommandé',
  },
  
  scale: {
    id: 'scale',
    name: 'Scale',
    tagline: 'Pour les entreprises',
    price: {
      monthly: 199,
      yearly: 1990,
      currency: '€',
    },
    prices: {
      monthly: 199,
      yearly: 1990,
    },
    limits: {
      emailsPerMonth: 60000,
      emailAccounts: -1, // Illimité
      shopifyStores: -1, // Illimité
      knowledgeFiles: -1, // Illimité
    },
    description: 'Puissance illimitée pour votre entreprise',
    featureList: [
      'Comptes email illimités',
      '60 000 emails clients/mois',
      'Boutiques Shopify illimitées',
      'Personnalisation IA illimitée',
      'Fichiers techniques illimités',
      'Lien d\'affiliation',
      'Support dédié',
    ],
    features: {
      maxEmailAccounts: 99999,
      emailsPerMonth: 60000,
      maxShopifyStores: 99999,
      aiEnabled: true,
      customAIConfig: true,
      maxKnowledgeFiles: 99999,
      affiliateEnabled: true,
      supportLevel: 'dedicated',
      responseTime: '1-4h',
    },
    highlighted: false,
    popular: false,
    cta: 'Choisir Scale',
  },
};

/**
 * Obtenir le plan d'un utilisateur
 */
export function getPlanByType(type: PlanType): PricingPlan {
  return PRICING_PLANS[type];
}

/**
 * Obtenir les plans supérieurs disponibles pour un upgrade
 */
export function getUpgradePlans(currentPlan: PlanType): PricingPlan[] {
  const planOrder: PlanType[] = ['free', 'starter', 'pro', 'scale'];
  const currentIndex = planOrder.indexOf(currentPlan);
  
  // Filtrer pour ne pas inclure 'free' dans les upgrades (on upgrade vers payant)
  return planOrder
    .slice(currentIndex + 1)
    .filter(type => type !== 'free')
    .map(type => PRICING_PLANS[type]);
}

/**
 * Comparer deux plans
 */
export function comparePlans(planA: PlanType, planB: PlanType): number {
  const planOrder: PlanType[] = ['free', 'starter', 'pro', 'scale'];
  return planOrder.indexOf(planA) - planOrder.indexOf(planB);
}

/**
 * Vérifier si un plan peut accéder à une fonctionnalité
 */
export function canAccessFeature(
  userPlan: PlanType,
  requiredPlan: PlanType
): boolean {
  return comparePlans(userPlan, requiredPlan) >= 0;
}

/**
 * Calculer les économies annuelles
 */
export function getAnnualSavings(plan: PricingPlan): number {
  const monthlyTotal = plan.price.monthly * 12;
  const yearlyPrice = plan.price.yearly;
  return monthlyTotal - yearlyPrice;
}

/**
 * Obtenir le plan recommandé (celui à mettre en avant)
 */
export function getRecommendedPlan(): PricingPlan {
  return PRICING_PLANS.pro;
}

/**
 * Vérifier si un plan permet l'affiliation
 */
export function canUseAffiliate(plan: PlanType): boolean {
  return PRICING_PLANS[plan].features.affiliateEnabled;
}

// Export alias pour compatibilité
export { PRICING_PLANS as PLANS };

