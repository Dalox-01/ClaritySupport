/**
 * Système de plans tarifaires pour ClaritySupport
 * Plans optimisés pour rendre le plan Pro (139€) le plus attractif
 */

export type PlanType = 'starter' | 'pro' | 'scale';

export interface PlanFeatures {
  // Comptes email
  maxEmailAccounts: number;
  
  // Emails traités par mois
  emailsPerMonth: number;
  
  // Réponses automatiques
  autoRepliesPerMonth: number;
  
  // IA et personnalisation
  aiEnabled: boolean;
  customAIConfig: boolean;
  knowledgeBase: boolean;
  advancedAnalytics: boolean;
  
  // Support
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  responseTime: string;
  
  // Autres fonctionnalités
  multiLanguage: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  teamMembers: number;
  
  // Templates et automatisation
  customTemplates: number;
  automationRules: number;
  
  // Données
  dataRetention: string; // en jours
  exportData: boolean;
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
    autoRepliesPerMonth: number;
    emailAccounts: number;
    templates: number;
  };
  description: string;
  features: PlanFeatures;
  featureList: string[]; // Liste de fonctionnalités pour l'affichage
  highlighted: boolean; // Pour mettre en avant le plan recommandé
  popular: boolean;
  cta: string;
  limitations?: string[]; // Limitations explicites pour inciter à l'upgrade
}

export const PRICING_PLANS: Record<PlanType, PricingPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'Parfait pour démarrer votre boutique en ligne',
    price: {
      monthly: 49,
      yearly: 490, // -16% sur l'annuel
      currency: '€',
    },
    prices: {
      monthly: 49,
      yearly: 490,
    },
    limits: {
      emailsPerMonth: 2000,
      autoRepliesPerMonth: 2000,
      emailAccounts: 5,
      templates: 50,
    },
    description: 'Idéal pour démarrer avec l\'automatisation du support',
    featureList: [
      '5 comptes email',
      '2 000 réponses IA/mois',
      'IA personnalisable',
      'Base de connaissances',
      'Support email',
      '50 templates',
    ],
    features: {
      maxEmailAccounts: 3,
      emailsPerMonth: 2000,
      autoRepliesPerMonth: 2000,
      aiEnabled: true,
      customAIConfig: true,
      knowledgeBase: true,
      advancedAnalytics: false,
      supportLevel: 'email',
      responseTime: '24-48h',
      multiLanguage: true,
      customBranding: false,
      apiAccess: false,
      teamMembers: 2,
      customTemplates: 10,
      automationRules: 5,
      dataRetention: '30',
      exportData: true,
    },
    highlighted: false,
    popular: false,
    cta: 'Démarrer avec Starter',
    limitations: [
      'Limité à 3 comptes email',
      'Pas d\'analytics avancées',
      'Pas de branding personnalisé',
      'Support par email uniquement',
      'API non disponible',
    ],
  },
  
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Pour les boutiques en croissance',
    price: {
      monthly: 99,
      yearly: 990, // -16% sur l'annuel
      currency: '€',
    },
    prices: {
      monthly: 99,
      yearly: 990,
    },
    limits: {
      emailsPerMonth: 7500,
      autoRepliesPerMonth: 7500,
      emailAccounts: 15,
      templates: 200,
    },
    description: 'Solution complète pour équipes en croissance - Recommandé',
    featureList: [
      '15 comptes email',
      '7 500 réponses IA/mois',
      'IA avancée + personnalisation',
      'Base de connaissances complète',
      'Analytics détaillées',
      'Branding personnalisé',
      '200 templates',
      'Support prioritaire',
      'API complète',
    ],
    features: {
      maxEmailAccounts: 10,
      emailsPerMonth: 7500,
      autoRepliesPerMonth: 7500,
      aiEnabled: true,
      customAIConfig: true,
      knowledgeBase: true,
      advancedAnalytics: true,
      supportLevel: 'priority',
      responseTime: '4-12h',
      multiLanguage: true,
      customBranding: true,
      apiAccess: true,
      teamMembers: 5,
      customTemplates: 50,
      automationRules: 25,
      dataRetention: '90',
      exportData: true,
    },
    highlighted: true, // Plan mis en avant
    popular: true,
    cta: 'Choisir Pro - Recommandé',
  },
  
  scale: {
    id: 'scale',
    name: 'Scale',
    tagline: 'Pour les entreprises e-commerce établies',
    price: {
      monthly: 199,
      yearly: 1990, // -16% sur l'annuel
      currency: '€',
    },
    prices: {
      monthly: 199,
      yearly: 1990,
    },
    limits: {
      emailsPerMonth: 25000,
      autoRepliesPerMonth: 25000,
      emailAccounts: -1, // Illimité
      templates: -1, // Illimité
    },
    description: 'Puissance maximale et support dédié pour votre entreprise',
    featureList: [
      'Comptes email illimités',
      '25 000 réponses IA/mois',
      'IA premium + personnalisation avancée',
      'Base de connaissances illimitée',
      'Analytics avancées',
      'Branding personnalisé',
      'Templates illimités',
      'Support dédié (prioritaire)',
      'Gestionnaire de compte dédié',
      'API complète',
    ],
    features: {
      maxEmailAccounts: 99999, // "Illimité"
      emailsPerMonth: 25000,
      autoRepliesPerMonth: 25000,
      aiEnabled: true,
      customAIConfig: true,
      knowledgeBase: true,
      advancedAnalytics: true,
      supportLevel: 'dedicated',
      responseTime: '1-4h',
      multiLanguage: true,
      customBranding: true,
      apiAccess: true,
      teamMembers: 20,
      customTemplates: 999, // Illimité
      automationRules: 100,
      dataRetention: '365',
      exportData: true,
    },
    highlighted: false,
    popular: false,
    cta: 'Passer à Scale',
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
  const planOrder: PlanType[] = ['starter', 'pro', 'scale'];
  const currentIndex = planOrder.indexOf(currentPlan);
  
  return planOrder
    .slice(currentIndex + 1)
    .map(type => PRICING_PLANS[type]);
}

/**
 * Comparer deux plans
 */
export function comparePlans(planA: PlanType, planB: PlanType): number {
  const planOrder: PlanType[] = ['starter', 'pro', 'scale'];
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

// Export alias pour compatibilité
export { PRICING_PLANS as PLANS };

