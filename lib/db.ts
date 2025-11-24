import { createClient } from '@supabase/supabase-js';
import { PRICING_PLANS, type PlanType } from './pricing-plans';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: 'USER' | 'ADMIN';
  provider: string;
  stripe_customer_id: string | null;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ADMIN';
  usage_month: number;
  usage_count: number;
  tokens_used: number;
  created_at: string;
  updated_at: string;
};

export type Template = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tags: string[];
  language: 'fr' | 'en';
  tone: 'pro' | 'cordial' | 'direct';
  type: 'candidature' | 'relance' | 'prospection' | 'support' | 'reponse' | 'negociation';
  variables: Record<string, any>;
  prompt: string;
  content: string | null;
  is_global: boolean;
  created_at: string;
  updated_at: string;
};

export type Email = {
  id: string;
  user_id: string;
  template_id: string | null;
  title: string;
  type: string;
  language: string;
  tone: string;
  variables: Record<string, any>;
  prompt_used: string;
  html: string;
  text: string;
  tokens_used: number;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  status: 'active' | 'past_due' | 'canceled' | 'inactive';
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  meta: Record<string, any>;
  created_at: string;
};

export async function getCurrentUsageMonth(): Promise<number> {
  const now = new Date();
  return parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`);
}

export async function checkAndResetQuota(userId: string): Promise<void> {
  const currentMonth = await getCurrentUsageMonth();

  const { data: user } = await supabase
    .from('users')
    .select('usage_month')
    .eq('id', userId)
    .single();

  if (user && user.usage_month !== currentMonth) {
    await supabase
      .from('users')
      .update({
        usage_month: currentMonth,
        usage_count: 0,
      })
      .eq('id', userId);
  }
}

export async function getUserQuota(userId: string): Promise<{
  plan: string;
  limit: number;
  used: number;
  remaining: number;
}> {
  console.log(`📊 [DB] getUserQuota called for user: ${userId}`);
  
  await checkAndResetQuota(userId);

  const { data: user, error } = await supabase
    .from('users')
    .select('plan, usage_count')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('❌ [DB] Error fetching user:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!user) {
    console.error('❌ [DB] User not found');
    throw new Error('User not found');
  }

  console.log(`📊 [DB] User found - Plan: ${user.plan}, Usage: ${user.usage_count}`);

  // Convertir le plan DB (uppercase) en PlanType (lowercase)
  const planType = user.plan.toLowerCase() as PlanType;
  
  // Récupérer les limites depuis pricing-plans.ts
  const planConfig = PRICING_PLANS[planType] || PRICING_PLANS.free;
  const limit = planConfig.limits.emailsPerMonth;
  
  const used = user.usage_count || 0;
  const remaining = Math.max(0, limit - used);

  console.log(`📊 [DB] Quota calculated - Plan: ${planType}, Limit: ${limit}, Used: ${used}, Remaining: ${remaining}`);

  return {
    plan: planType,
    limit,
    used,
    remaining,
  };
}

export async function incrementUsage(userId: string, tokensUsed: number = 0): Promise<void> {
  await checkAndResetQuota(userId);

  const { data: user } = await supabase
    .from('users')
    .select('usage_count, tokens_used')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  await supabase
    .from('users')
    .update({
      usage_count: (user.usage_count || 0) + 1,
      tokens_used: (user.tokens_used || 0) + tokensUsed,
    })
    .eq('id', userId);
}

export async function createAuditLog(
  userId: string | null,
  action: string,
  meta: Record<string, any> = {}
): Promise<void> {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    meta,
  });
}
