// Plan features and restrictions

export type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'SCALE';

export const PLAN_FEATURES: Record<PlanType, {
  generations: number;
  signatures: number;
  variables: boolean;
  customTemplates: number;
  voiceDictation: boolean;
  pdfWatermark: boolean;
  historyDays: number;
  chatbot: boolean;
  trialDays?: number;
}> = {
  FREE: {
    generations: 500,       // 500 réponses max pendant l'essai
    signatures: 1,
    variables: false,
    customTemplates: 5,
    voiceDictation: false,
    pdfWatermark: true,
    historyDays: 7,         // Historique limité à 7 jours
    chatbot: false,
    trialDays: 7,           // Essai de 7 jours
  },
  STARTER: {
    generations: 2000,
    signatures: 3,
    variables: true,
    customTemplates: 10,
    voiceDictation: true,
    pdfWatermark: false,
    historyDays: 30,
    chatbot: false,
  },
  PRO: {
    generations: 7500,
    signatures: -1, // -1 = unlimited
    variables: true,
    customTemplates: -1, // -1 = unlimited
    voiceDictation: true,
    pdfWatermark: false,
    historyDays: -1, // -1 = unlimited
    chatbot: true,
  },
  SCALE: {
    generations: 25000,
    signatures: -1,
    variables: true,
    customTemplates: -1,
    voiceDictation: true,
    pdfWatermark: false,
    historyDays: -1,
    chatbot: true,
  },
};

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
  const names: Record<PlanType, string> = {
    FREE: 'Free',
    STARTER: 'Starter',
    PRO: 'Pro',
    SCALE: 'Scale',
  };
  return names[plan];
}

export function getPlanPrice(plan: PlanType): number {
  const prices: Record<PlanType, number> = {
    FREE: 0,
    STARTER: 49,
    PRO: 99,
    SCALE: 199,
  };
  return prices[plan];
}

export function getStripePriceId(plan: 'STARTER' | 'PRO' | 'SCALE'): string {
  const priceIds = {
    STARTER: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_1SPOtVGeKr4cNZzUxyF5ME26',
    PRO: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_1SPOuDGeKr4cNZzUNParjwcy',
    SCALE: process.env.STRIPE_PRICE_SCALE_MONTHLY || 'price_1ST1iLGJn0NQpREzIdkg9x2N',
  };
  return priceIds[plan];
}
