// Plan features and restrictions

export type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'ADMIN';

export const PLAN_FEATURES = {
  FREE: {
    generations: 10,
    signatures: 0,
    variables: false,
    customTemplates: 0,
    voiceDictation: false,
    pdfWatermark: true,
    historyDays: 30,
    chatbot: false,
  },
  STARTER: {
    generations: 500,
    signatures: 3,
    variables: true,
    customTemplates: 10,
    voiceDictation: true,
    pdfWatermark: false,
    historyDays: 30,
    chatbot: false,
  },
  PRO: {
    generations: 5000,
    signatures: -1, // -1 = unlimited
    variables: true,
    customTemplates: -1, // -1 = unlimited
    voiceDictation: true,
    pdfWatermark: false,
    historyDays: -1, // -1 = unlimited
    chatbot: true,
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
  },
} as const;

export function canUseSignatures(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].signatures !== 0;
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
  const names = {
    FREE: 'Gratuit',
    STARTER: 'Starter',
    PRO: 'Pro',
    ADMIN: 'Admin',
  };
  return names[plan];
}

export function getPlanPrice(plan: PlanType): number {
  const prices = {
    FREE: 0,
    STARTER: 7.99,
    PRO: 18.99,
    ADMIN: 0,
  };
  return prices[plan];
}

export function getStripePriceId(plan: 'STARTER' | 'PRO'): string {
  const priceIds = {
    STARTER: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_1SPOtVGeKr4cNZzUxyF5ME26',
    PRO: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_1SPOuDGeKr4cNZzUNParjwcy',
  };
  return priceIds[plan];
}
