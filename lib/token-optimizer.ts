/**
 * Token Optimizer - Système d'optimisation des tokens IA
 * 
 * Ce module compresse et synthétise tous les paramètres IA de l'utilisateur
 * (config IA, base de connaissances, fichiers techniques, règles métier)
 * en un seul prompt optimisé pour minimiser la consommation de tokens.
 */

import OpenAI from 'openai';
import { supabase } from './db';
import { AIPromptConfig } from './ai-prompt-config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Cache en mémoire pour les synthèses (évite de regénérer à chaque requête)
const synthesisCache = new Map<string, {
  synthesis: string;
  hash: string;
  createdAt: Date;
  expiresAt: Date;
}>();

// Durée de validité du cache (1 heure)
const CACHE_DURATION_MS = 60 * 60 * 1000;

export interface UserAIContext {
  aiConfig?: AIPromptConfig;
  knowledgeBase?: any;
  customFilters?: any[];
  companyInfo?: {
    name?: string;
    signature?: string;
    businessRules?: string[];
  };
}

export interface OptimizedPrompt {
  systemPrompt: string;
  contextSummary: string;
  tokensEstimated: number;
  originalTokensEstimated: number;
  compressionRatio: number;
  cacheHit: boolean;
}

/**
 * Génère un hash simple pour détecter les changements de configuration
 */
function generateConfigHash(context: UserAIContext): string {
  const content = JSON.stringify({
    aiConfig: context.aiConfig,
    knowledgeBase: context.knowledgeBase,
    customFilters: context.customFilters?.map(f => ({ id: f.id, keywords: f.keywords })),
    companyInfo: context.companyInfo,
  });
  
  // Hash simple basé sur la longueur et quelques caractères clés
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `h${Math.abs(hash).toString(36)}_${content.length}`;
}

/**
 * Estime le nombre de tokens d'un texte (approximation)
 * Règle approximative: 1 token ≈ 4 caractères en anglais, 3 en français
 */
function estimateTokens(text: string): number {
  if (!text) return 0;
  // Approximation: 1 token = ~3.5 caractères en moyenne pour le français
  return Math.ceil(text.length / 3.5);
}

/**
 * Compresse la base de connaissances en extrayant les informations essentielles
 */
function compressKnowledgeBase(kb: any): string {
  if (!kb) return '';
  
  const parts: string[] = [];
  
  // Informations entreprise (compressées)
  if (kb.companyInfo) {
    const ci = kb.companyInfo;
    if (ci.name) parts.push(`Entreprise: ${ci.name}`);
    if (ci.description) parts.push(`Description: ${ci.description.substring(0, 200)}`);
    if (ci.policies?.returns) parts.push(`Retours: ${ci.policies.returns.substring(0, 100)}`);
    if (ci.policies?.shipping) parts.push(`Livraison: ${ci.policies.shipping.substring(0, 100)}`);
  }
  
  // Produits (résumés)
  if (kb.products && Array.isArray(kb.products)) {
    const productSummaries = kb.products.slice(0, 10).map((p: any) => {
      return `- ${p.name}: ${p.price || 'N/A'}€${p.description ? ` (${p.description.substring(0, 50)}...)` : ''}`;
    });
    if (productSummaries.length > 0) {
      parts.push(`Produits:\n${productSummaries.join('\n')}`);
    }
  }
  
  // FAQ (les 5 plus importantes)
  if (kb.faq && Array.isArray(kb.faq)) {
    const faqSummaries = kb.faq.slice(0, 5).map((f: any) => {
      return `Q: ${f.question}\nR: ${(f.answer || '').substring(0, 100)}`;
    });
    if (faqSummaries.length > 0) {
      parts.push(`FAQ:\n${faqSummaries.join('\n')}`);
    }
  }
  
  return parts.join('\n\n');
}

/**
 * Compresse la configuration IA en instructions concises
 */
function compressAIConfig(config: AIPromptConfig): string {
  if (!config) return '';
  
  const parts: string[] = [];
  
  // Ton et style
  if (config.tone) parts.push(`Ton: ${config.tone}`);
  if (config.style) parts.push(`Style: ${config.style}`);
  if (config.creativity !== undefined) parts.push(`Créativité: ${config.creativity}/10`);
  
  // Longueur des réponses
  if (config.length) parts.push(`Longueur: ${config.length}`);
  
  // Instructions clés (compressées)
  if (config.doList && config.doList.length > 0) {
    parts.push(`À FAIRE: ${config.doList.slice(0, 5).join(', ')}`);
  }
  
  if (config.dontList && config.dontList.length > 0) {
    parts.push(`À ÉVITER: ${config.dontList.slice(0, 5).join(', ')}`);
  }
  
  // Signature
  if (config.signature?.enabled && config.signature?.name) {
    parts.push(`Signature: ${config.signature.name}${config.signature.role ? ` - ${config.signature.role}` : ''}`);
  }
  
  // Nom entreprise
  if (config.companyName) {
    parts.push(`Entreprise: ${config.companyName}`);
  }
  
  return parts.join(' | ');
}

/**
 * Génère une synthèse optimisée via l'IA
 * Cette synthèse compresse tous les paramètres en un contexte minimal
 */
async function generateAISynthesis(context: UserAIContext): Promise<string> {
  const rawContent: string[] = [];
  
  // Collecter tout le contenu brut
  if (context.aiConfig) {
    rawContent.push('=== CONFIGURATION IA ===');
    rawContent.push(compressAIConfig(context.aiConfig));
  }
  
  if (context.knowledgeBase) {
    rawContent.push('=== BASE DE CONNAISSANCES ===');
    rawContent.push(compressKnowledgeBase(context.knowledgeBase));
  }
  
  if (context.customFilters && context.customFilters.length > 0) {
    rawContent.push('=== FILTRES PERSONNALISÉS ===');
    const filterSummaries = context.customFilters.slice(0, 10).map(f => 
      `${f.name}: ${(f.keywords || []).slice(0, 5).join(', ')}`
    );
    rawContent.push(filterSummaries.join('\n'));
  }
  
  if (context.companyInfo) {
    rawContent.push('=== INFOS ENTREPRISE ===');
    if (context.companyInfo.name) rawContent.push(`Nom: ${context.companyInfo.name}`);
    if (context.companyInfo.signature) rawContent.push(`Signature: ${context.companyInfo.signature}`);
    if (context.companyInfo.businessRules) {
      rawContent.push(`Règles: ${context.companyInfo.businessRules.slice(0, 5).join('; ')}`);
    }
  }
  
  const fullContent = rawContent.join('\n\n');
  
  // Si le contenu est déjà court, pas besoin de synthèse IA
  if (estimateTokens(fullContent) < 500) {
    return fullContent;
  }
  
  // Utiliser GPT-3.5 Turbo pour la synthèse (moins cher)
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant spécialisé dans la compression d'informations.
Ta tâche: Synthétiser les informations suivantes en un contexte ULTRA-CONCIS mais COMPLET.
Règles:
- Maximum 400 mots
- Garder TOUTES les informations essentielles (ton, style, règles métier, produits clés)
- Utiliser des abréviations si possible
- Format: phrases courtes, mots-clés
- Ne pas perdre d'informations critiques pour le support client`
        },
        {
          role: 'user',
          content: `Synthétise ce contexte d'entreprise pour un assistant support client:\n\n${fullContent}`
        }
      ],
      max_tokens: 600,
      temperature: 0.3,
    });
    
    return response.choices[0]?.message?.content || fullContent;
  } catch (error) {
    console.error('❌ Erreur synthèse IA:', error);
    // Fallback: retourner le contenu compressé manuellement
    return fullContent.substring(0, 2000);
  }
}

/**
 * Récupère ou génère le prompt optimisé pour un utilisateur
 */
export async function getOptimizedPrompt(userId: string): Promise<OptimizedPrompt> {
  // 1. Récupérer toutes les données utilisateur
  const { data: userData, error } = await supabase
    .from('users')
    .select('ai_prompt_config, knowledge_base, optimized_ai_context, optimized_ai_hash')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('❌ Erreur récupération données utilisateur:', error);
    return {
      systemPrompt: '',
      contextSummary: '',
      tokensEstimated: 0,
      originalTokensEstimated: 0,
      compressionRatio: 1,
      cacheHit: false,
    };
  }
  
  // 2. Récupérer les filtres personnalisés
  const { data: filters } = await supabase
    .from('user_filters')
    .select('id, name, keywords, response_config')
    .eq('user_id', userId)
    .eq('is_active', true);
  
  // 3. Construire le contexte
  const context: UserAIContext = {
    aiConfig: userData?.ai_prompt_config,
    knowledgeBase: userData?.knowledge_base,
    customFilters: filters || [],
    companyInfo: {
      name: userData?.ai_prompt_config?.companyName,
      signature: userData?.ai_prompt_config?.signature,
    },
  };
  
  // 4. Calculer le hash de la config actuelle
  const currentHash = generateConfigHash(context);
  
  // 5. Vérifier le cache en mémoire
  const cachedSynthesis = synthesisCache.get(userId);
  if (cachedSynthesis && cachedSynthesis.hash === currentHash && cachedSynthesis.expiresAt > new Date()) {
    console.log(`✅ Cache hit pour user ${userId}`);
    return {
      systemPrompt: buildSystemPrompt(cachedSynthesis.synthesis, context.aiConfig),
      contextSummary: cachedSynthesis.synthesis,
      tokensEstimated: estimateTokens(cachedSynthesis.synthesis),
      originalTokensEstimated: estimateTokens(JSON.stringify(context)),
      compressionRatio: estimateTokens(JSON.stringify(context)) / Math.max(1, estimateTokens(cachedSynthesis.synthesis)),
      cacheHit: true,
    };
  }
  
  // 6. Vérifier le cache en base de données
  if (userData?.optimized_ai_hash === currentHash && userData?.optimized_ai_context) {
    console.log(`✅ Cache DB hit pour user ${userId}`);
    
    // Mettre en cache mémoire
    synthesisCache.set(userId, {
      synthesis: userData.optimized_ai_context,
      hash: currentHash,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_DURATION_MS),
    });
    
    return {
      systemPrompt: buildSystemPrompt(userData.optimized_ai_context, context.aiConfig),
      contextSummary: userData.optimized_ai_context,
      tokensEstimated: estimateTokens(userData.optimized_ai_context),
      originalTokensEstimated: estimateTokens(JSON.stringify(context)),
      compressionRatio: estimateTokens(JSON.stringify(context)) / Math.max(1, estimateTokens(userData.optimized_ai_context)),
      cacheHit: true,
    };
  }
  
  // 7. Générer une nouvelle synthèse
  console.log(`🔄 Génération nouvelle synthèse pour user ${userId}`);
  const synthesis = await generateAISynthesis(context);
  
  // 8. Sauvegarder en base de données
  await supabase
    .from('users')
    .update({
      optimized_ai_context: synthesis,
      optimized_ai_hash: currentHash,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  
  // 9. Mettre en cache mémoire
  synthesisCache.set(userId, {
    synthesis,
    hash: currentHash,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + CACHE_DURATION_MS),
  });
  
  const originalTokens = estimateTokens(JSON.stringify(context));
  const optimizedTokens = estimateTokens(synthesis);
  
  console.log(`✅ Synthèse générée: ${originalTokens} → ${optimizedTokens} tokens (ratio: ${(originalTokens / Math.max(1, optimizedTokens)).toFixed(2)}x)`);
  
  return {
    systemPrompt: buildSystemPrompt(synthesis, context.aiConfig),
    contextSummary: synthesis,
    tokensEstimated: optimizedTokens,
    originalTokensEstimated: originalTokens,
    compressionRatio: originalTokens / Math.max(1, optimizedTokens),
    cacheHit: false,
  };
}

/**
 * Construit le prompt système final avec la synthèse
 */
function buildSystemPrompt(synthesis: string, aiConfig?: AIPromptConfig): string {
  const tone = aiConfig?.tone || 'professionnel';
  const language = aiConfig?.language || 'fr';
  
  return `Tu es un assistant de support client ${tone}.
Langue: ${language === 'fr' ? 'Français' : 'English'}

=== CONTEXTE ENTREPRISE (SYNTHÈSE) ===
${synthesis}

=== INSTRUCTIONS ===
- Réponds de manière concise et utile
- Utilise les informations du contexte entreprise
- Reste cohérent avec le ton et le style définis
- Si tu ne sais pas, dis-le honnêtement`;
}

/**
 * Invalide le cache pour un utilisateur (à appeler quand la config change)
 */
export async function invalidateOptimizedCache(userId: string): Promise<void> {
  // Supprimer du cache mémoire
  synthesisCache.delete(userId);
  
  // Supprimer le hash en base (force la régénération)
  await supabase
    .from('users')
    .update({
      optimized_ai_hash: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  
  console.log(`🗑️ Cache invalidé pour user ${userId}`);
}

/**
 * Statistiques de compression pour le monitoring
 */
export function getCompressionStats(): {
  cacheSize: number;
  averageCompressionRatio: number;
} {
  let totalRatio = 0;
  let count = 0;
  
  synthesisCache.forEach((entry) => {
    count++;
  });
  
  return {
    cacheSize: synthesisCache.size,
    averageCompressionRatio: count > 0 ? totalRatio / count : 0,
  };
}
