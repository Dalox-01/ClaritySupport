// Types pour le système de filtres personnalisés

export type FilterPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' | 'SCALE' | 'ADMIN';

export interface DetectionRules {
  matchMode: 'any' | 'all';
  caseSensitive: boolean;
  regexPatterns?: string[];
  excludeKeywords?: string[];
}

export interface ResponseConfig {
  tone?: 'pro' | 'cordial' | 'empathique' | 'technique';
  language?: 'fr' | 'en';
  customInstructions?: string;
  responseTemplate?: string;
  autoReplyEnabled?: boolean;
  priorityLevel?: 'high' | 'normal' | 'low';
}

export interface UserFilter {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  is_default: boolean;
  filter_key: string;
  keywords: string[];
  detection_rules: DetectionRules | null;
  response_config: ResponseConfig | null;
  usage_count: number;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FilterUpsertPayload {
  id?: string;
  filter_key?: string;
  name: string;
  description?: string | null;
  color: string;
  icon: string;
  keywords: string[];
  detection_rules: DetectionRules;
  response_config: ResponseConfig;
  is_active: boolean;
}

export interface FilterLimits {
  canCreate: boolean;
  current: number;
  max: number;
  remaining: number;
  plan: FilterPlan;
}

export interface FilterUsage {
  totalClassifications: number;
  filtersCount: number;
  defaultFiltersCount: number;
  customFiltersCount: number;
  mostUsedFilter: {
    name: string;
    key: string;
    count: number;
  } | null;
}

export interface FilterColor {
  name: string;
  value: string;
  class: string;
}

export const FILTER_COLORS: FilterColor[] = [
  { name: 'Bleu', value: '#3B82F6', class: 'bg-blue-500' },
  { name: 'Vert', value: '#10B981', class: 'bg-green-500' },
  { name: 'Rouge', value: '#EF4444', class: 'bg-red-500' },
  { name: 'Jaune', value: '#F59E0B', class: 'bg-amber-500' },
  { name: 'Violet', value: '#8B5CF6', class: 'bg-purple-500' },
  { name: 'Rose', value: '#EC4899', class: 'bg-pink-500' },
  { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
  { name: 'Emeraude', value: '#059669', class: 'bg-emerald-600' },
];

export const TONE_OPTIONS = [
  { value: 'pro', label: 'Professionnel' },
  { value: 'cordial', label: 'Cordial' },
  { value: 'empathique', label: 'Empathique' },
  { value: 'technique', label: 'Technique' },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
] as const;

export const PRIORITY_OPTIONS = [
  { value: 'high', label: 'Haute' },
  { value: 'normal', label: 'Normale' },
  { value: 'low', label: 'Basse' },
] as const;
