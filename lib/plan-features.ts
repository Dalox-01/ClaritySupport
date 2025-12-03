// Plan features and restrictions

export type PlanType = 'free' | 'starter' | 'pro' | 'scale' | 'ADMIN';

export const PLAN_FEATURES = {
  free: {
    generations: 500,       // 500 réponses max pendant l'essai
    signatures: 1,
    variables: false,
    customTemplates: 0,
    voiceDictation: false,
    pdfWatermark: true,
    historyDays: 7,         // Historique limité à 7 jours
    chatbot: false,
    maxEmailAccounts: 1,
    maxShopifyStores: 1,
    maxKnowledgeFiles: 0,
    affiliateEnabled: false,
    trialDays: 7,           // Essai de 7 jours
  },
  starter: {
    generations: 5000,
    signatures: 3,
    variables: true,
    customTemplates: 5,
    voiceDictation: true,
    pdfWatermark: false,
    historyDays: 30,
    chatbot: false,
    maxEmailAccounts: 3,
    maxShopifyStores: 1,
    maxKnowledgeFiles: 0,
    affiliateEnabled: false,
  },
  pro: {
    generations: 20000,
    signatures: -1, // -1 = unlimited
    variables: true,
    customTemplates: -1, // -1 = unlimited
    voiceDictation: true,
    pdfWatermark: false,
    historyDays: -1, // -1 = unlimited
    chatbot: true,
    maxEmailAccounts: 10,
    maxShopifyStores: 3,
    maxKnowledgeFiles: 5,
    affiliateEnabled: true,
  },
  scale: {
    generations: 60000,
    signatures: -1, // -1 = unlimited
    variables: true,
    customTemplates: -1, // -1 = unlimited
    voiceDictation: true,
    pdfWatermark: false,
    historyDays: -1, // -1 = unlimited
    chatbot: true,
    maxEmailAccounts: 99999, // Illimité
    maxShopifyStores: 99999, // Illimité
    maxKnowledgeFiles: 99999, // Illimité
    affiliateEnabled: true,
  },
  ADMIN: {
    generations: 999999,
    signatures: -1, // -1 = unlimited
    variables: true,
    customTemplates: -1, // -1 = unlimited
    voiceDictation: true,
    pdfWatermark: false,
    historyDays: -1, // -1 = unlimited
    chatbot: true,
    maxEmailAccounts: 99999,
    maxShopifyStores: 99999,
    maxKnowledgeFiles: 99999,
    affiliateEnabled: true,
  },
} as const;

export function canUseSignatures(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].signatures >= 1 || PLAN_FEATURES[plan].signatures === -1;
}

export function canUseVariables(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].variables;
}

export function canUseCustomTemplates(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].customTemplates !== 0;
}

export function canUseVoiceDictation(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].voiceDictation;
}

export function canUseChatbot(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].chatbot;
}

export function getMaxSignatures(plan: PlanType): number {
  return PLAN_FEATURES[plan].signatures;
}

export function getMaxCustomTemplates(plan: PlanType): number {
  return PLAN_FEATURES[plan].customTemplates;
}

export function hasPdfWatermark(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].pdfWatermark;
}

export function getGenerationsLimit(plan: PlanType): number {
  return PLAN_FEATURES[plan].generations;
}

export function getPlanName(plan: PlanType): string {
  const names: Record<PlanType, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    scale: 'Scale',
    ADMIN: 'Admin',
  };
  return names[plan];
}

export function getPlanPrice(plan: PlanType): number {
  const prices: Record<PlanType, number> = {
    free: 0,
    starter: 49,
    pro: 99,
    scale: 199,
    ADMIN: 0,
  };
  return prices[plan];
}

export function getStripePriceId(plan: 'starter' | 'pro' | 'scale'): string {
  const priceIds = {
    starter: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_1SPOtVGeKr4cNZzUxyF5ME26',
    pro: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_1SPOuDGeKr4cNZzUNParjwcy',
    scale: process.env.STRIPE_PRICE_SCALE_MONTHLY || 'price_scale_monthly',
  };
  return priceIds[plan];
}

export function canUseAffiliate(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].affiliateEnabled;
}
