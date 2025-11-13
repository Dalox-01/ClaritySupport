/**
 * Limites et fonctionnalités par plan
 * 6 PLANS DISTINCTS : 3 E-commerce + 2 Freelance + 1 Gratuit
 * IMPORTANT: PRO_SHOPIFY ≠ PRO_FREELANCE (prix, limites, features différents)
 */

export type PlanName = 
  // E-commerce (Shopify) - 3 plans
  | 'STARTER_SHOPIFY' | 'PRO_SHOPIFY' | 'SCALE_SHOPIFY'
  // Freelance - 2 plans
  | 'SOLO_FREELANCE' | 'PRO_FREELANCE' | 'UNLIMITED_FREELANCE'
  // Système
  | 'FREE';

// Compatibilité ancienne nomenclature (pour migration)
export const PLAN_NAME_MAPPING: Record<string, PlanName> = {
  // E-commerce
  'STARTER': 'STARTER_SHOPIFY',
  'PRO': 'PRO_SHOPIFY', // Par défaut, PRO = E-commerce
  'SCALE': 'SCALE_SHOPIFY',
  // Freelance
  'SOLO': 'SOLO_FREELANCE',
  'UNLIMITED': 'UNLIMITED_FREELANCE',
  // Gratuit
  'FREE': 'FREE',
};

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
 * Configuration des 6 PLANS DISTINCTS
 * Chaque plan est unique avec ses propres limites et prix
 */
export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  // ============ E-COMMERCE (SHOPIFY) - 3 PLANS ============
  STARTER_SHOPIFY: {
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
  
  PRO_SHOPIFY: {
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
  
  SCALE_SHOPIFY: {
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
  
  // ============ FREELANCE - 3 PLANS ============
  SOLO_FREELANCE: {
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
  
  PRO_FREELANCE: {
    emailAccounts: 1,
    autoRepliesPerMonth: 2000,  // ⚠️ DIFFÉRENT de PRO_SHOPIFY (20000)
    aiTemplates: true,
    prioritySupport: true,
    analytics: true,
    multiShops: 0,
    whiteLabel: false,
    customApi: false,
    signatureDynamique: true,
    upsellAuto: false,
    orderTracking: false,
  },
  
  UNLIMITED_FREELANCE: {
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
  
  // ============ GRATUIT ============
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
 * Convertir un nom de plan + segment en PlanName unifié
 */
export function getPlanNameWithSegment(planBaseName: string, segment: 'shopify' | 'freelance'): PlanName {
  const normalized = planBaseName.toUpperCase();
  
  if (segment === 'shopify') {
    if (normalized === 'STARTER') return 'STARTER_SHOPIFY';
    if (normalized === 'PRO') return 'PRO_SHOPIFY';
    if (normalized === 'SCALE') return 'SCALE_SHOPIFY';
  }
  
  if (segment === 'freelance') {
    if (normalized === 'SOLO') return 'SOLO_FREELANCE';
    if (normalized === 'PRO') return 'PRO_FREELANCE';
    if (normalized === 'UNLIMITED') return 'UNLIMITED_FREELANCE';
  }
  
  if (normalized === 'FREE') return 'FREE';
  
  // Fallback: essayer le mapping direct
  return PLAN_NAME_MAPPING[normalized] || 'FREE';
}

/**
 * Récupérer les limites d'un plan avec gestion du segment
 * NOUVELLE VERSION: Utilise les plans unifiés (PRO_SHOPIFY vs PRO_FREELANCE)
 */
export function getPlanLimits(planName: string | null | undefined, segment?: 'shopify' | 'freelance'): PlanLimits {
  if (!planName) return PLAN_LIMITS.FREE;
  
  // Si segment fourni, construire le nom de plan complet
  if (segment) {
    const fullPlanName = getPlanNameWithSegment(planName, segment);
    return PLAN_LIMITS[fullPlanName] || PLAN_LIMITS.FREE;
  }
  
  // Essayer en tant que plan unifié direct
  const normalizedPlan = planName.toUpperCase() as PlanName;
  if (PLAN_LIMITS[normalizedPlan]) {
    return PLAN_LIMITS[normalizedPlan];
  }
  
  // Fallback: utiliser le mapping
  const mappedPlan = PLAN_NAME_MAPPING[normalizedPlan];
  return PLAN_LIMITS[mappedPlan] || PLAN_LIMITS.FREE;
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
