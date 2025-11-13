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
 */
export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  // ============ PLANS E-COMMERCE (SHOPIFY) ============
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
  
  // ============ PLANS FREELANCE ============
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
  
  // PRO Freelance (même nom que PRO E-commerce mais limites différentes)
  // Note: On devra différencier par le segment dans le code
  // PRO: {
  //   emailAccounts: 1,
  //   autoRepliesPerMonth: 2000,
  //   aiTemplates: true,
  //   prioritySupport: true,
  //   analytics: true,
  //   multiShops: 0,
  //   whiteLabel: false,
  //   customApi: false,
  //   signatureDynamique: true,
  //   upsellAuto: false,
  //   orderTracking: false,
  // },
  
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
 * Récupérer les limites d'un plan
 */
export function getPlanLimits(planName: string | null | undefined): PlanLimits {
  if (!planName) return PLAN_LIMITS.FREE;
  
  const normalizedPlan = planName.toUpperCase() as PlanName;
  return PLAN_LIMITS[normalizedPlan] || PLAN_LIMITS.FREE;
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
