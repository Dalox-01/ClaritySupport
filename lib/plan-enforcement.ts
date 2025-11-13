/**
 * SYSTÈME DE VÉRIFICATION ET ENFORCEMENT DES LIMITES PAR PLAN
 * 
 * Ce module centralise toute la logique de vérification des limites d'abonnement.
 * Utilisé par les APIs et le frontend pour assurer la cohérence des restrictions.
 * 
 * Architecture:
 * - Vérifications synchrones (basées sur plan uniquement)
 * - Vérifications asynchrones (avec comptage DB)
 * - Messages d'erreur personnalisés par fonctionnalité
 * - Suggestions d'upgrade automatiques
 * 
 * @author Assistant Backend Principal
 * @date 2025-11-13
 */

import { createClient } from '@supabase/supabase-js';
import { getPlanLimits, PlanName } from './plan-limits';
import { PRICING_SEGMENTS, SegmentType } from './constants/pricing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export interface EnforcementResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
  usagePercentage?: number;
  suggestedPlans?: string[];
  requiresUpgrade?: boolean;
}

export interface UserPlanInfo {
  userId: string;
  plan: PlanName;
  segment: SegmentType;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  status: string;
  isActive: boolean;
}

// ============================================================================
// RÉCUPÉRATION PLAN UTILISATEUR
// ============================================================================

/**
 * Récupère les informations complètes du plan d'un utilisateur
 * Vérifie d'abord subscriptions puis users
 */
export async function getUserPlanInfo(userId: string): Promise<UserPlanInfo> {
  // Essayer d'abord la table subscriptions
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, segment, stripe_customer_id, stripe_subscription_id, status, current_period_start, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (subscription) {
    return {
      userId,
      plan: subscription.plan.toUpperCase() as PlanName,
      segment: subscription.segment || 'shopify',
      stripeCustomerId: subscription.stripe_customer_id,
      stripeSubscriptionId: subscription.stripe_subscription_id,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      status: subscription.status,
      isActive: subscription.status === 'active',
    };
  }

  // Fallback sur la table users
  const { data: user } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  const planName = (user?.plan || 'FREE').toUpperCase() as PlanName;

  return {
    userId,
    plan: planName,
    segment: 'shopify', // Par défaut
    status: 'active',
    isActive: true,
  };
}

// ============================================================================
// COMPTAGE DES UTILISATIONS ACTUELLES
// ============================================================================

/**
 * Compte le nombre de comptes email actifs de l'utilisateur
 */
export async function countEmailAccounts(userId: string): Promise<number> {
  const { count } = await supabase
    .from('mail_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true);

  return count || 0;
}

/**
 * Compte les réponses automatiques envoyées ce mois
 */
export async function countAutoRepliesThisMonth(userId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('email_automations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', 'auto_reply_sent')
    .gte('created_at', startOfMonth.toISOString());

  return count || 0;
}

/**
 * Compte les boutiques Shopify connectées
 */
export async function countShopifyStores(userId: string): Promise<number> {
  const { count } = await supabase
    .from('shopify_stores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true);

  return count || 0;
}

// ============================================================================
// VÉRIFICATIONS DE LIMITES
// ============================================================================

/**
 * Vérifie si l'utilisateur peut ajouter un nouveau compte email
 */
export async function canAddEmailAccount(userId: string): Promise<EnforcementResult> {
  const planInfo = await getUserPlanInfo(userId);
  const limits = getPlanLimits(planInfo.plan, planInfo.segment);
  const currentCount = await countEmailAccounts(userId);

  // Illimité
  if (limits.emailAccounts === -1) {
    return { allowed: true };
  }

  const allowed = currentCount < limits.emailAccounts;

  if (!allowed) {
    const suggestedPlans = getSuggestedPlansForFeature(planInfo.plan, planInfo.segment, 'emailAccounts');
    
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${limits.emailAccounts} compte(s) email pour le plan ${planInfo.plan}`,
      currentUsage: currentCount,
      limit: limits.emailAccounts,
      usagePercentage: 100,
      suggestedPlans,
      requiresUpgrade: true,
    };
  }

  return {
    allowed: true,
    currentUsage: currentCount,
    limit: limits.emailAccounts,
    usagePercentage: Math.round((currentCount / limits.emailAccounts) * 100),
  };
}

/**
 * Vérifie si l'utilisateur peut envoyer une réponse automatique
 */
export async function canSendAutoReply(userId: string): Promise<EnforcementResult> {
  const planInfo = await getUserPlanInfo(userId);
  const limits = getPlanLimits(planInfo.plan, planInfo.segment);
  const currentCount = await countAutoRepliesThisMonth(userId);

  // Illimité
  if (limits.autoRepliesPerMonth === -1) {
    return { allowed: true };
  }

  const allowed = currentCount < limits.autoRepliesPerMonth;

  if (!allowed) {
    const suggestedPlans = getSuggestedPlansForFeature(planInfo.plan, planInfo.segment, 'autoRepliesPerMonth');
    
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${limits.autoRepliesPerMonth} réponses automatiques ce mois pour le plan ${planInfo.plan}`,
      currentUsage: currentCount,
      limit: limits.autoRepliesPerMonth,
      usagePercentage: 100,
      suggestedPlans,
      requiresUpgrade: true,
    };
  }

  return {
    allowed: true,
    currentUsage: currentCount,
    limit: limits.autoRepliesPerMonth,
    usagePercentage: Math.round((currentCount / limits.autoRepliesPerMonth) * 100),
  };
}

/**
 * Vérifie si l'utilisateur peut connecter une boutique Shopify
 */
export async function canAddShopifyStore(userId: string): Promise<EnforcementResult> {
  const planInfo = await getUserPlanInfo(userId);
  const limits = getPlanLimits(planInfo.plan, planInfo.segment);
  const currentCount = await countShopifyStores(userId);

  // Pas d'accès Shopify
  if (limits.multiShops === 0) {
    const suggestedPlans = getSuggestedPlansForFeature(planInfo.plan, planInfo.segment, 'multiShops');
    
    return {
      allowed: false,
      reason: `Les intégrations Shopify nécessitent un plan E-commerce`,
      currentUsage: currentCount,
      limit: 0,
      suggestedPlans,
      requiresUpgrade: true,
    };
  }

  // Illimité
  if (limits.multiShops === -1) {
    return { allowed: true };
  }

  const allowed = currentCount < limits.multiShops;

  if (!allowed) {
    const suggestedPlans = getSuggestedPlansForFeature(planInfo.plan, planInfo.segment, 'multiShops');
    
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${limits.multiShops} boutique(s) Shopify pour le plan ${planInfo.plan}`,
      currentUsage: currentCount,
      limit: limits.multiShops,
      usagePercentage: 100,
      suggestedPlans,
      requiresUpgrade: true,
    };
  }

  return {
    allowed: true,
    currentUsage: currentCount,
    limit: limits.multiShops,
    usagePercentage: Math.round((currentCount / limits.multiShops) * 100),
  };
}

/**
 * Vérifie l'accès à une fonctionnalité spécifique
 */
export async function canAccessFeature(
  userId: string,
  feature: 'aiTemplates' | 'prioritySupport' | 'analytics' | 'whiteLabel' | 'customApi' | 'signatureDynamique' | 'upsellAuto' | 'orderTracking'
): Promise<EnforcementResult> {
  const planInfo = await getUserPlanInfo(userId);
  const limits = getPlanLimits(planInfo.plan, planInfo.segment); // ✅ Ajout du segment

  const hasAccess = limits[feature] as boolean;

  if (!hasAccess) {
    const suggestedPlans = getSuggestedPlansForFeature(planInfo.plan, planInfo.segment, feature);
    
    const featureNames: Record<string, string> = {
      aiTemplates: 'templates IA avancés',
      prioritySupport: 'support prioritaire',
      analytics: 'analytics avancées',
      whiteLabel: 'white-label',
      customApi: 'API personnalisée',
      signatureDynamique: 'signatures dynamiques',
      upsellAuto: 'upsell automatique',
      orderTracking: 'tracking des commandes',
    };

    return {
      allowed: false,
      reason: `La fonctionnalité "${featureNames[feature]}" nécessite un plan supérieur`,
      suggestedPlans,
      requiresUpgrade: true,
    };
  }

  return { allowed: true };
}

// ============================================================================
// SUGGESTIONS D'UPGRADE INTELLIGENTES
// ============================================================================

/**
 * Retourne les plans suggérés pour accéder à une fonctionnalité
 */
function getSuggestedPlansForFeature(
  currentPlan: PlanName,
  currentSegment: SegmentType,
  feature: string
): string[] {
  const segment = PRICING_SEGMENTS.find(s => s.id === currentSegment);
  if (!segment) return [];

  const currentPlanIndex = segment.plans.findIndex(p => p.name === currentPlan);
  
  // Retourner les plans supérieurs du même segment
  return segment.plans
    .slice(currentPlanIndex + 1)
    .map(p => p.name);
}

/**
 * Obtient le plan suivant dans le segment actuel
 */
export function getNextPlan(currentPlan: PlanName, currentSegment: SegmentType): string | null {
  const suggested = getSuggestedPlansForFeature(currentPlan, currentSegment, 'upgrade');
  return suggested[0] || null;
}

// ============================================================================
// RÉSUMÉ COMPLET DES LIMITES
// ============================================================================

export interface UsageSummary {
  plan: PlanName;
  segment: SegmentType;
  limits: {
    emailAccounts: {
      used: number;
      limit: number;
      percentage: number;
      unlimited: boolean;
    };
    autoReplies: {
      used: number;
      limit: number;
      percentage: number;
      unlimited: boolean;
    };
    shopifyStores?: {
      used: number;
      limit: number;
      percentage: number;
      unlimited: boolean;
    };
  };
  features: {
    aiTemplates: boolean;
    prioritySupport: boolean;
    analytics: boolean;
    whiteLabel: boolean;
    customApi: boolean;
    signatureDynamique: boolean;
    upsellAuto: boolean;
    orderTracking: boolean;
  };
  suggestedUpgrade?: string;
}

/**
 * Obtient un résumé complet de l'utilisation et des limites
 */
export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const planInfo = await getUserPlanInfo(userId);
  const limits = getPlanLimits(planInfo.plan, planInfo.segment); // ✅ Ajout du segment

  const emailAccountsCount = await countEmailAccounts(userId);
  const autoRepliesCount = await countAutoRepliesThisMonth(userId);
  const shopifyStoresCount = await countShopifyStores(userId);

  const emailAccountsUnlimited = limits.emailAccounts === -1;
  const autoRepliesUnlimited = limits.autoRepliesPerMonth === -1;
  const shopifyStoresUnlimited = limits.multiShops === -1;

  return {
    plan: planInfo.plan,
    segment: planInfo.segment,
    limits: {
      emailAccounts: {
        used: emailAccountsCount,
        limit: limits.emailAccounts,
        percentage: emailAccountsUnlimited ? 0 : Math.round((emailAccountsCount / limits.emailAccounts) * 100),
        unlimited: emailAccountsUnlimited,
      },
      autoReplies: {
        used: autoRepliesCount,
        limit: limits.autoRepliesPerMonth,
        percentage: autoRepliesUnlimited ? 0 : Math.round((autoRepliesCount / limits.autoRepliesPerMonth) * 100),
        unlimited: autoRepliesUnlimited,
      },
      ...(limits.multiShops > 0 && {
        shopifyStores: {
          used: shopifyStoresCount,
          limit: limits.multiShops,
          percentage: shopifyStoresUnlimited ? 0 : Math.round((shopifyStoresCount / limits.multiShops) * 100),
          unlimited: shopifyStoresUnlimited,
        },
      }),
    },
    features: {
      aiTemplates: limits.aiTemplates,
      prioritySupport: limits.prioritySupport,
      analytics: limits.analytics,
      whiteLabel: limits.whiteLabel,
      customApi: limits.customApi,
      signatureDynamique: limits.signatureDynamique,
      upsellAuto: limits.upsellAuto,
      orderTracking: limits.orderTracking,
    },
    suggestedUpgrade: getNextPlan(planInfo.plan, planInfo.segment) || undefined,
  };
}

// ============================================================================
// HELPERS ADDITIONNELS
// ============================================================================

/**
 * Vérifie rapidement si l'utilisateur est sur un plan premium
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  const planInfo = await getUserPlanInfo(userId);
  return !['FREE', 'SOLO'].includes(planInfo.plan);
}

/**
 * Vérifie si l'utilisateur a un abonnement actif
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const planInfo = await getUserPlanInfo(userId);
  return planInfo.isActive && planInfo.plan !== 'FREE';
}
