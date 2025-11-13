/**
 * Limites et fonctionnalités par plan
 * Basé sur les plans définis dans lib/constants/pricing.ts
 */

export type PlanName = 
  // E-commerce (Shopify)
  | 'STARTER' | 'PRO' | 'SCALE'
  // Freelance
  | 'SOLO' | 'UNLIMITED'
  // Système
  | 'FREE';

export interface PlanLimits {
  // Limites emails
  emailAccounts: number;
  autoRepliesPerMonth: number;
  
  // Fonctionnalités
  aiTemplates: boolean;
  prioritySupport: boolean;
  analytics: boolean;
  multiShops: number; // 0 = pas de Shopify, nombre de boutiques autorisées
  whiteLabel: boolean;
  customApi: boolean;
  
  // Limites additionnelles
  signatureDynamique: boolean;
  upsellAuto: boolean;
  orderTracking: boolean;
}

/**
 * Configuration des limites par plan
 * Note: Les plans de base (fallback si segment non spécifié)
 */
export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  // ============ PLANS E-COMMERCE (SHOPIFY) - DEFAULTS ============
  STARTER: {
    emailAccounts: 3,
    autoRepliesPerMonth: 5000,
    aiTemplates: false,
    prioritySupport: false,
    analytics: false,
    multiShops: 1,
    whiteLabel: false,
    customApi: false,
    signatureDynamique: false,
    upsellAuto: false,
    orderTracking: true,
  },
  
  PRO: {
    emailAccounts: 10,
    autoRepliesPerMonth: 20000,
    aiTemplates: true,
    prioritySupport: true,
    analytics: true,
    multiShops: 3,
    whiteLabel: false,
    customApi: false,
    signatureDynamique: true,
    upsellAuto: true,
    orderTracking: true,
  },
  
  SCALE: {
    emailAccounts: -1, // illimité
    autoRepliesPerMonth: 50000,
    aiTemplates: true,
    prioritySupport: true,
    analytics: true,
    multiShops: -1, // illimité
    whiteLabel: true,
    customApi: true,
    signatureDynamique: true,
    upsellAuto: true,
    orderTracking: true,
  },
  
  // ============ PLANS FREELANCE - DEFAULTS ============
  SOLO: {
    emailAccounts: 1,
    autoRepliesPerMonth: 500,
    aiTemplates: false,
    prioritySupport: false,
    analytics: false,
    multiShops: 0,
    whiteLabel: false,
    customApi: false,
    signatureDynamique: false,
    upsellAuto: false,
    orderTracking: false,
  },
  
  UNLIMITED: {
    emailAccounts: 1,
    autoRepliesPerMonth: -1, // illimité
    aiTemplates: true,
    prioritySupport: true,
    analytics: true,
    multiShops: 0,
    whiteLabel: false,
    customApi: true,
    signatureDynamique: true,
    upsellAuto: false,
    orderTracking: false,
  },
  
  // ============ PLAN GRATUIT ============
  FREE: {
    emailAccounts: 1,
    autoRepliesPerMonth: 100,
    aiTemplates: false,
    prioritySupport: false,
    analytics: false,
    multiShops: 0,
    whiteLabel: false,
    customApi: false,
    signatureDynamique: false,
    upsellAuto: false,
    orderTracking: false,
  },
};

/**
 * Configurations spécifiques par segment
 * Ces valeurs surchargent PLAN_LIMITS quand le segment est spécifié
 */
const SEGMENT_OVERRIDES: Record<'shopify' | 'freelance', Partial<Record<PlanName, Partial<PlanLimits>>>> = {
  shopify: {
    // STARTER Shopify (identique au default)
    STARTER: {
      emailAccounts: 3,
      autoRepliesPerMonth: 5000,
      multiShops: 1,
      orderTracking: true,
    },
    // PRO Shopify (identique au default)
    PRO: {
      emailAccounts: 10,
      autoRepliesPerMonth: 20000,
      multiShops: 3,
      orderTracking: true,
      upsellAuto: true,
    },
    // SCALE Shopify (identique au default)
    SCALE: {
      emailAccounts: -1,
      autoRepliesPerMonth: 50000,
      multiShops: -1,
      orderTracking: true,
    },
  },
  freelance: {
    // SOLO Freelance (identique au default)
    SOLO: {
      emailAccounts: 1,
      autoRepliesPerMonth: 500,
      multiShops: 0,
      orderTracking: false,
    },
    // PRO Freelance (⚠️ DIFFÉRENT de PRO Shopify)
    PRO: {
      emailAccounts: 1,
      autoRepliesPerMonth: 2000,  // ⚠️ 2000 vs 20000 pour Shopify
      multiShops: 0,
      orderTracking: false,
      upsellAuto: false,
    },
    // UNLIMITED Freelance (identique au default)
    UNLIMITED: {
      emailAccounts: 1,
      autoRepliesPerMonth: -1,
      multiShops: 0,
      orderTracking: false,
    },
  },
};

/**
 * Récupérer les limites d'un plan avec gestion du segment
 * Applique les overrides spécifiques au segment si fourni
 */
export function getPlanLimits(planName: string | null | undefined, segment?: 'shopify' | 'freelance'): PlanLimits {
  if (!planName) return PLAN_LIMITS.FREE;
  
  const normalizedPlan = planName.toUpperCase() as PlanName;
  const baseLimits = PLAN_LIMITS[normalizedPlan] || PLAN_LIMITS.FREE;
  
  // Si un segment est spécifié, appliquer les overrides
  if (segment && SEGMENT_OVERRIDES[segment]?.[normalizedPlan]) {
    return {
      ...baseLimits,
      ...SEGMENT_OVERRIDES[segment][normalizedPlan],
    };
  }
  
  return baseLimits;
}

/**
 * Vérifier si un plan a accès à une fonctionnalité
 */
export function hasFeature(planName: string | null | undefined, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(planName);
  const value = limits[feature];
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value > 0 || value === -1; // -1 = illimité
  }
  
  return false;
}

/**
 * Vérifier si l'utilisateur peut ajouter un compte email
 */
export function canAddEmailAccount(planName: string | null | undefined, currentCount: number): boolean {
  const limits = getPlanLimits(planName);
  
  if (limits.emailAccounts === -1) return true; // illimité
  return currentCount < limits.emailAccounts;
}

/**
 * Vérifier si l'utilisateur peut générer plus de réponses ce mois
 */
export function canGenerateReply(planName: string | null | undefined, usageThisMonth: number): boolean {
  const limits = getPlanLimits(planName);
  
  if (limits.autoRepliesPerMonth === -1) return true; // illimité
  return usageThisMonth < limits.autoRepliesPerMonth;
}

/**
 * Obtenir le pourcentage d'utilisation des réponses automatiques
 */
export function getUsagePercentage(planName: string | null | undefined, usageThisMonth: number): number {
  const limits = getPlanLimits(planName);
  
  if (limits.autoRepliesPerMonth === -1) return 0; // illimité, pas de pourcentage
  if (limits.autoRepliesPerMonth === 0) return 100;
  
  return Math.min(100, Math.round((usageThisMonth / limits.autoRepliesPerMonth) * 100));
}
