/**
 * Limites et fonctionnalités par plan
 * 4 PLANS DISTINCTS : 3 E-commerce + 1 Gratuit
 */

export type PlanName = 
  | 'STARTER' | 'PRO' | 'SCALE' | 'FREE';

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
  
  // Personnalisation IA
  aiCustomizationLevel: 'none' | 'basic' | 'full'; // none, basic (filters/keywords), full
  ragFileLimit: number; // Nombre de fichiers dans la base de connaissances (-1 = illimité)
}

/**
 * Configuration des PLANS
 */
export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
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
    aiCustomizationLevel: 'basic',
    ragFileLimit: 0,
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
    aiCustomizationLevel: 'full',
    ragFileLimit: 5,
  },
  
  SCALE: {
    emailAccounts: -1, // illimité
    autoRepliesPerMonth: 60000,
    aiTemplates: true,
    prioritySupport: true,
    analytics: true,
    multiShops: -1, // illimité
    whiteLabel: true,
    customApi: true,
    signatureDynamique: true,
    upsellAuto: true,
    orderTracking: true,
    aiCustomizationLevel: 'full',
    ragFileLimit: -1,
  },
  
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
    aiCustomizationLevel: 'none',
    ragFileLimit: 0,
  },
};

/**
 * Récupérer les limites d'un plan
 */
export function getPlanLimits(planName: string | null | undefined): PlanLimits {
  const normalized = (planName?.toUpperCase() || 'FREE') as PlanName;
  return PLAN_LIMITS[normalized] || PLAN_LIMITS.FREE;
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

