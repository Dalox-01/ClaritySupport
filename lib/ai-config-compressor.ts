// Utilitaire: Génération de synthèse compacte de la configuration IA
// Optimise la consommation de tokens en créant un résumé intelligent

import { AIPromptConfig } from './ai-prompt-config';

export type CompactAIConfig = {
  // Version ultra-compacte pour économiser les tokens
  tone: string; // "pro" | "ami" | "form"
  style: string; // "bullet" | "para" | "court" | "long"
  creativity: number; // 0-1
  maxTokens: number;
  
  // Instructions condensées (max 200 caractères)
  rules: string; // "DO: X, Y, Z | DON'T: A, B, C"
  
  // Prompts par catégorie (version ultra-courte)
  categoryRules: Record<string, string>; // max 100 char par catégorie
  
  // Contexte entreprise (ultra-compact)
  company: string; // "Nom | Valeurs: X, Y | Voix: Z"
  
  // Signature (si activée)
  signature?: string; // "Nom - Rôle"
};

/**
 * Compresse une AIPromptConfig complète en version ultra-compacte
 * Objectif: Réduire de 80-90% la consommation de tokens
 */
export function compressAIConfig(config: AIPromptConfig): CompactAIConfig {
  // Compression du ton
  const toneMap: Record<string, string> = {
    'professionnel': 'pro',
    'amical': 'ami',
    'formel': 'form',
  };

  // Compression du style
  const styleMap: Record<string, string> = {
    'bullet-points': 'bullet',
    'paragraphes': 'para',
    'concis': 'court',
    'détaillé': 'long',
    'conversationnel': 'conv',
  };

  // Condensation des règles DO/DON'T
  const doList = config.doList?.slice(0, 3).join(', ') || 'Soyez clair et utile';
  const dontList = config.dontList?.slice(0, 3).join(', ') || 'Pas d\'emojis ni symboles';
  const rules = `DO: ${doList} | DON'T: ${dontList}`;

  // Compression des prompts par catégorie (garder l'essentiel)
  const categoryRules: Record<string, string> = {};
  Object.entries(config.categoryTemplates || {}).forEach(([cat, prompt]) => {
    // Extraire les mots-clés essentiels (max 100 caractères)
    const keywords = extractKeywords(prompt as string, 100);
    categoryRules[cat] = keywords;
  });

  // Compression du contexte entreprise
  const companyValues = config.companyValues?.slice(0, 3).join(', ') || '';
  const company = `${config.companyName}${companyValues ? ` | ${companyValues}` : ''}${config.brandVoice ? ` | Voix: ${config.brandVoice.substring(0, 30)}` : ''}`;

  // Signature ultra-compacte
  const signature = config.signature?.enabled 
    ? `${config.signature.name || ''}${config.signature.role ? ' - ' + config.signature.role : ''}`
    : undefined;

  return {
    tone: toneMap[config.tone || 'professionnel'] || 'pro',
    style: styleMap[config.style || 'paragraphes'] || 'para',
    creativity: config.creativity || 0.5,
    maxTokens: config.maxTokens || 300,
    rules: rules.substring(0, 200), // Max 200 caractères
    categoryRules,
    company: company.substring(0, 150), // Max 150 caractères
    signature,
  };
}

/**
 * Extrait les mots-clés essentiels d'un texte long
 * Garde uniquement l'information critique
 */
function extractKeywords(text: string, maxLength: number): string {
  if (!text) return '';
  
  // Supprimer les phrases d'introduction communes
  const cleaned = text
    .replace(/^(Le client|Vous devez|Il faut|Assurez-vous de|N'oubliez pas de)\s+/gi, '')
    .replace(/\.\s*$/g, '')
    .trim();

  // Si déjà court, retourner tel quel
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Extraire la première phrase pertinente
  const firstSentence = cleaned.split(/[.!?]/)[0];
  
  if (firstSentence.length <= maxLength) {
    return firstSentence;
  }

  // Tronquer et ajouter ellipse
  return firstSentence.substring(0, maxLength - 3) + '...';
}

/**
 * Génère un prompt ultra-compact à partir de la config compressée
 * Consomme ~80% de tokens en moins qu'un prompt classique
 */
export function generateCompactPrompt(compact: CompactAIConfig, category?: string): string {
  const parts: string[] = [];

  // 1. Contexte entreprise (1 ligne)
  parts.push(`Contexte: ${compact.company}`);

  // 2. Règles essentielles (1 ligne)
  parts.push(`Règles: ${compact.rules}`);

  // 3. Prompt catégorie si disponible (1 ligne)
  if (category && compact.categoryRules[category]) {
    parts.push(`Catégorie ${category}: ${compact.categoryRules[category]}`);
  }

  // 4. Style et ton (1 ligne)
  parts.push(`Ton: ${compact.tone} | Style: ${compact.style}`);

  // 5. Signature si présente
  if (compact.signature) {
    parts.push(`Signer: ${compact.signature}`);
  }

  return parts.join('\n');
}

/**
 * Calcule la réduction de tokens (estimation)
 */
export function estimateTokenReduction(original: string, compressed: string): {
  originalTokens: number;
  compressedTokens: number;
  reduction: number;
  reductionPercent: number;
} {
  // Estimation: 1 token ≈ 4 caractères en moyenne
  const originalTokens = Math.ceil(original.length / 4);
  const compressedTokens = Math.ceil(compressed.length / 4);
  const reduction = originalTokens - compressedTokens;
  const reductionPercent = Math.round((reduction / originalTokens) * 100);

  return {
    originalTokens,
    compressedTokens,
    reduction,
    reductionPercent,
  };
}

/**
 * Enregistre la synthèse compacte dans la DB
 * Stockée dans un champ séparé pour accès ultra-rapide
 */
export async function saveCompactConfig(
  userId: string,
  fullConfig: AIPromptConfig,
  supabase: any
): Promise<CompactAIConfig> {
  const compact = compressAIConfig(fullConfig);

  // Sauvegarder dans un champ dédié 'compact_config'
  await supabase
    .from('ai_configurations')
    .update({ 
      compact_config: compact,
      compact_updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return compact;
}

/**
 * Récupère la synthèse compacte depuis la DB
 * Beaucoup plus rapide que de charger toute la config
 */
export async function loadCompactConfig(
  userId: string,
  supabase: any
): Promise<CompactAIConfig | null> {
  const { data } = await supabase
    .from('ai_configurations')
    .select('compact_config')
    .eq('user_id', userId)
    .single();

  return data?.compact_config || null;
}
