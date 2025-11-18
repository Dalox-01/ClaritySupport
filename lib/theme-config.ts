// Configuration des thèmes par segment d'abonnement

export type ThemeType = 'ecommerce' | 'default';

// Mapping des plans vers les segments
export const PLAN_TO_SEGMENT: Record<string, ThemeType> = {
  // E-commerce (Shopify)
  'starter': 'ecommerce',
  'pro': 'ecommerce', 
  'scale': 'ecommerce',
  
  // Default
  'free': 'default',
};

// Détection du segment basé sur le nom du plan
export function detectSegmentFromPlan(planName: string | null | undefined): ThemeType {
  if (!planName) return 'default';
  
  const normalizedPlan = planName.toLowerCase().trim();
  
  // Recherche directe
  if (PLAN_TO_SEGMENT[normalizedPlan]) {
    return PLAN_TO_SEGMENT[normalizedPlan];
  }
  
  // Recherche par mots-clés
  if (normalizedPlan.includes('starter') || normalizedPlan.includes('scale')) {
    return 'ecommerce';
  }
  if (normalizedPlan.includes('pro')) {
    // Si c'est juste "pro", on doit deviner - par défaut ecommerce
    return 'ecommerce';
  }
  
  return 'default';
}

// Configuration des couleurs par thème
export const THEME_COLORS = {
  ecommerce: {
    name: 'E-commerce',
    primary: 'rgb(22, 163, 74)', // green-600
    primaryHover: 'rgb(21, 128, 61)', // green-700
    secondary: 'rgb(16, 185, 129)', // emerald-500
    gradient: 'from-green-600 to-emerald-600',
    gradientHover: 'from-green-700 to-emerald-700',
    bg: {
      light: 'bg-gradient-to-br from-green-50 via-white to-emerald-50',
      dark: 'bg-gradient-to-br from-[#0A0E27] via-[#0F1629] to-[#0A0E27]',
      class: 'bg-green-500/10', // Pour les éléments inline
    },
    border: 'border-green-500/30',
    text: 'text-green-600 dark:text-green-400',
    glow: 'shadow-green-500/50',
    badge: 'bg-green-600',
    rgb: { r: 22, g: 163, b: 74 }, // Pour les styles inline
  },
  default: {
    name: 'Standard',
    primary: 'rgb(59, 130, 246)', // blue-500
    primaryHover: 'rgb(37, 99, 235)', // blue-600
    secondary: 'rgb(96, 165, 250)', // blue-400
    gradient: 'from-blue-600 to-cyan-600',
    gradientHover: 'from-blue-700 to-cyan-700',
    bg: {
      light: 'bg-gradient-to-br from-blue-50 via-white to-cyan-50',
      dark: 'bg-gradient-to-br from-[#0A0E27] via-[#0F1629] to-[#0A0E27]',
      class: 'bg-blue-500/10',
    },
    border: 'border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    glow: 'shadow-blue-500/50',
    badge: 'bg-blue-600',
    rgb: { r: 59, g: 130, b: 246 },
  },
};

// Export type pour TypeScript
export type ThemeColors = typeof THEME_COLORS[ThemeType];
