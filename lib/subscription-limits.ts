/**
 * Système de vérification des limites d'abonnement
 * Gère les quotas et restrictions selon le plan de l'utilisateur
 */

import { createClient } from '@supabase/supabase-js';
import { PlanType, PRICING_PLANS, getPlanByType } from './pricing-plans';
import { getPlanLimits, canAddEmailAccount as checkEmailAccountLimit, canGenerateReply } from './plan-limits';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserSubscription {
  user_id: string;
  plan: PlanType;
  segment?: 'shopify';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  emailAccountsCount: number;
  emailsThisMonth: number;
  autoRepliesThisMonth: number;
  teamMembersCount: number;
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
  upgradePlans?: PlanType[];
}

/**
 * Récupérer l'abonnement actif d'un utilisateur
 * Compatible avec les anciens et nouveaux noms de plans
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    // Si pas d'abonnement dans subscriptions, récupérer le plan depuis users
    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('id', userId)
      .single();

    // Normaliser le plan (compatibilité ancien/nouveau système)
    const userPlan = userData?.plan || 'FREE';
    const normalizedPlan = normalizePlanName(userPlan);

    return {
      user_id: userId,
      plan: normalizedPlan as PlanType,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Normaliser le plan récupéré de la table subscriptions
  return {
    ...data,
    plan: normalizePlanName(data.plan) as PlanType,
  } as UserSubscription;
}

/**
 * Normaliser le nom du plan (compatibilité ancien/nouveau système)
 * Nouveaux plans: STARTER, PRO, SCALE, SOLO, UNLIMITED, FREE
 * Anciens plans: starter, pro, scale, free
 */
function normalizePlanName(plan: string): string {
  const planUpper = (plan || 'FREE').toUpperCase();
  
  // Mapping ancien → nouveau
  const planMapping: Record<string, string> = {
    'STARTER': 'starter',   // Nouveau → Ancien pour subscription-limits.ts
    'PRO': 'pro',
    'SCALE': 'scale',  // SCALE équivaut à scale
    'SOLO': 'starter',      // SOLO équivaut à starter (niveau similaire)
    'UNLIMITED': 'scale', // UNLIMITED équivaut à scale
    'FREE': 'free',
    'ENTERPRISE': 'scale',
  };

  return planMapping[planUpper] || 'free';
}

/**
 * Récupérer les statistiques d'utilisation actuelles
 */
export async function getUserUsageStats(userId: string): Promise<UsageStats> {
  // Nombre de comptes email
  const { count: emailAccountsCount } = await supabase
    .from('mail_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true);

  // Emails ce mois
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: emailsThisMonth } = await supabase
    .from('emails_cache')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  // Réponses automatiques ce mois
  const { count: autoRepliesThisMonth } = await supabase
    .from('email_automations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', 'auto_reply_sent')
    .gte('created_at', startOfMonth.toISOString());

  return {
    emailAccountsCount: emailAccountsCount || 0,
    emailsThisMonth: emailsThisMonth || 0,
    autoRepliesThisMonth: autoRepliesThisMonth || 0,
    teamMembersCount: 1, // À implémenter si besoin
  };
}

/**
 * Vérifier si l'utilisateur peut ajouter un compte email
 */
export async function canAddEmailAccountWithSubscription(userId: string): Promise<LimitCheckResult> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return { allowed: false, reason: 'Abonnement non trouvé' };
  }
  
  const planLimits = getPlanLimits(subscription.plan, subscription.segment);
  const usage = await getUserUsageStats(userId);

  // -1 signifie illimité
  if (planLimits.emailAccounts === -1) {
    return { allowed: true };
  }

  const allowed = usage.emailAccountsCount < planLimits.emailAccounts;

  if (!allowed) {
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${planLimits.emailAccounts} compte(s) email pour le plan ${subscription.plan}`,
      currentUsage: usage.emailAccountsCount,
      limit: planLimits.emailAccounts,
      upgradePlans: ['pro' as PlanType, 'scale' as PlanType],
    };
  }

  return { allowed: true };
}

/**
 * Vérifier si l'utilisateur peut traiter plus d'emails ce mois
 */
export async function canProcessEmail(userId: string): Promise<LimitCheckResult> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return { allowed: false, reason: 'Abonnement non trouvé' };
  }
  const plan = getPlanByType(subscription.plan);
  const usage = await getUserUsageStats(userId);

  const allowed = usage.emailsThisMonth < plan.features.emailsPerMonth;

  if (!allowed) {
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${plan.features.emailsPerMonth} emails/mois pour le plan ${plan.name}`,
      currentUsage: usage.emailsThisMonth,
      limit: plan.features.emailsPerMonth,
      upgradePlans: subscription.plan === 'free' 
        ? ['starter', 'pro', 'scale'] as PlanType[]
        : subscription.plan === 'starter'
        ? ['pro', 'scale'] as PlanType[]
        : ['scale'] as PlanType[],
    };
  }

  return { allowed: true };
}

/**
 * Vérifier si l'utilisateur peut envoyer une réponse automatique
 */
export async function canSendAutoReplyWithSubscription(userId: string): Promise<LimitCheckResult> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return { allowed: false, reason: 'Abonnement non trouvé' };
  }
  
  const planLimits = getPlanLimits(subscription.plan, subscription.segment);
  const usage = await getUserUsageStats(userId);

  // -1 signifie illimité
  if (planLimits.autoRepliesPerMonth === -1) {
    return { allowed: true };
  }

  const allowed = usage.autoRepliesThisMonth < planLimits.autoRepliesPerMonth;

  if (!allowed) {
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${planLimits.autoRepliesPerMonth} réponses automatiques/mois pour le plan ${subscription.plan}`,
      currentUsage: usage.autoRepliesThisMonth,
      limit: planLimits.autoRepliesPerMonth,
      upgradePlans: ['pro' as PlanType, 'scale' as PlanType],
    };
  }

  return { allowed: true };
}

/**
 * Vérifier l'accès à une fonctionnalité premium
 */
export async function canAccessFeature(
  userId: string,
  feature: keyof typeof PRICING_PLANS.free.features
): Promise<LimitCheckResult> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return { allowed: false, reason: 'Abonnement non trouvé' };
  }
  const plan = getPlanByType(subscription.plan);

  const allowed = plan.features[feature] as boolean;

  if (!allowed) {
    const minPlanRequired = Object.entries(PRICING_PLANS).find(
      ([_, p]) => p.features[feature]
    )?.[0] as PlanType | undefined;

    return {
      allowed: false,
      reason: `Cette fonctionnalité nécessite le plan ${minPlanRequired ? PRICING_PLANS[minPlanRequired].name : 'supérieur'}`,
      upgradePlans: minPlanRequired ? [minPlanRequired] : ['pro'],
    };
  }

  return { allowed: true };
}

/**
 * Obtenir un résumé complet des limites et de l'utilisation
 */
export async function getSubscriptionSummary(userId: string) {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('Abonnement non trouvé');
  }
  const plan = getPlanByType(subscription.plan);
  const usage = await getUserUsageStats(userId);

  return {
    subscription,
    plan,
    usage,
    limits: {
      emailAccounts: {
        current: usage.emailAccountsCount,
        max: plan.features.maxEmailAccounts,
        percentage: (usage.emailAccountsCount / plan.features.maxEmailAccounts) * 100,
      },
      emailsPerMonth: {
        current: usage.emailsThisMonth,
        max: plan.features.emailsPerMonth,
        percentage: (usage.emailsThisMonth / plan.features.emailsPerMonth) * 100,
      },
    },
  };
}

/**
 * Créer ou mettre à jour un abonnement
 */
export async function upsertSubscription(subscription: Partial<UserSubscription> & { user_id: string }) {
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      ...subscription,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Error upserting subscription:', error);
    throw error;
  }
}

/**
 * Annuler un abonnement
 */
export async function cancelSubscription(userId: string) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}
