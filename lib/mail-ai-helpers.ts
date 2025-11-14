// Helpers pour l'analyse IA des emails

import OpenAI from 'openai';
import { EmailCategory, EmailSentiment, type EmailCache } from './mail-center-types';
import { SupportCategory } from './support-categories';
import { AIPromptConfig, AIPromptBuilder, DEFAULT_AI_CONFIG } from './ai-prompt-config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export type EmailAnalysisResult = {
  category: EmailCategory;
  sentiment: EmailSentiment;
  urgency_score: number; // 0-10
  requires_validation: boolean;
  detected_entities: {
    product?: string;
    problem?: string;
    desired_date?: string;
    contact_info?: string;
    price_mentioned?: string;
    [key: string]: any;
  };
  suggested_template_category?: EmailCategory;
  reasoning?: string; // Explication du raisonnement de l'IA
  detected_hashtags?: string[]; // Hashtags détectés dans l'email
  support_category?: SupportCategory; // Catégorie de support assignée
};

export type ReplyGenerationOptions = {
  email: EmailCache;
  template_body?: string;
  custom_prompt?: string;
  user_context?: {
    company_name?: string;
    user_name?: string;
    signature?: string;
    [key: string]: any;
  };
  tone?: 'professionnel' | 'amical' | 'formel';
  aiConfig?: AIPromptConfig; // Configuration du prompt IA (créativité, style, etc.)
  language?: 'fr' | 'en';
};

export type GeneratedReply = {
  subject: string;
  body_text: string;
  body_html: string;
  tokens_used: number;
  model_used: string;
};

/**
 * Classifie un email en fonction des hashtags détectés
 * Scanne le sujet et le contenu pour trouver des mots-clés correspondant aux hashtags
 */
export function classifyEmailByHashtags(
  subject: string,
  body: string
): EmailAnalysisResult {
  const text = `${subject} ${body}`.toLowerCase();
  
  // Récupérer la config des hashtags (avec merge depuis localStorage si disponible)
  let categoryHashtags = DEFAULT_AI_CONFIG.categoryHashtags;
  
  // Tenter de charger la config personnalisée depuis localStorage
  if (typeof window !== 'undefined') {
    try {
      const savedConfig = localStorage.getItem('support_ai_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.categoryHashtags) {
          categoryHashtags = {
            ...DEFAULT_AI_CONFIG.categoryHashtags,
            ...parsed.categoryHashtags
          };
        }
      }
    } catch (e) {
      console.warn('Could not load custom hashtags, using defaults');
    }
  }
  
  // Compter les matches par catégorie
  const categoryScores: Record<SupportCategory, number> = {
    'urgent': 0,
    'commande': 0,
    'remboursement': 0,
    'question-produit': 0,
    'suivi-commande': 0,
    'sav': 0,
    'reclamation': 0,
    'information': 0,
    'facturation': 0,
    'technique': 0,
    'autre': 0
  };
  
  const detectedHashtags: string[] = [];
  
  // Parcourir chaque catégorie et compter les hashtags trouvés
  for (const [category, hashtags] of Object.entries(categoryHashtags)) {
    const cat = category as SupportCategory;
    
    for (const hashtag of hashtags) {
      const hashtagLower = hashtag.toLowerCase();
      
      // Recherche du hashtag dans le texte (avec bordures de mots)
      const regex = new RegExp(`\\b${hashtagLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        categoryScores[cat] += matches.length;
        if (!detectedHashtags.includes(hashtag)) {
          detectedHashtags.push(hashtag);
        }
      }
    }
  }
  
  // Trouver la catégorie avec le plus de matches
  let bestCategory: SupportCategory = 'autre'; // Défaut: autre si aucune catégorie détectée
  let bestScore = 0;
  
  for (const [category, score] of Object.entries(categoryScores)) {
    if (category !== 'autre' && score > bestScore) {
      bestScore = score;
      bestCategory = category as SupportCategory;
    }
  }
  
  // Si aucun hashtag détecté, retourner "autre"
  if (bestScore === 0) {
    bestCategory = 'autre';
  }
  
  // Calculer le score d'urgence basé sur la catégorie et les hashtags
  let urgency_score = 3; // Base
  
  if (bestCategory === 'urgent' || categoryScores['urgent'] > 0) {
    urgency_score = 9;
  } else if (bestCategory === 'reclamation' || bestCategory === 'sav') {
    urgency_score = 7;
  } else if (bestCategory === 'remboursement') {
    urgency_score = 6;
  } else if (bestCategory === 'commande' || bestCategory === 'suivi-commande') {
    urgency_score = 5;
  } else if (bestCategory === 'technique') {
    urgency_score = 6;
  } else if (bestCategory === 'facturation') {
    urgency_score = 5;
  }
  
  // Détecter le sentiment
  let sentiment: EmailSentiment = 'neutre';
  
  if (bestCategory === 'reclamation') {
    sentiment = 'negatif';
  } else if (bestCategory === 'urgent' || categoryScores['urgent'] > 0) {
    sentiment = 'urgent';
  } else if (bestCategory === 'commande' || bestCategory === 'question-produit') {
    sentiment = 'positif';
  }
  
  // Déterminer si validation nécessaire
  const requires_validation = 
    urgency_score >= 7 || 
    bestCategory === 'urgent' ||
    bestCategory === 'reclamation' ||
    (bestCategory === 'sav' && urgency_score >= 6);
  
  // Mapper vers EmailCategory (pour compatibilité)
  let emailCategory: EmailCategory = 'autre';
  if (bestCategory === 'commande' || bestCategory === 'question-produit') {
    emailCategory = 'vente';
  } else if (bestCategory === 'sav' || bestCategory === 'technique' || bestCategory === 'reclamation') {
    emailCategory = 'support';
  } else if (bestCategory === 'urgent') {
    emailCategory = 'urgent';
  }
  
  return {
    category: emailCategory,
    sentiment,
    urgency_score,
    requires_validation,
    detected_entities: {},
    suggested_template_category: emailCategory,
    reasoning: `Classifié comme "${bestCategory}" avec ${bestScore} hashtag(s) détecté(s): ${detectedHashtags.join(', ') || 'aucun'}`,
    detected_hashtags: detectedHashtags,
    support_category: bestCategory
  };
}

/**
 * Analyse un email avec l'IA pour détecter catégorie, sentiment, urgence
 */
export async function analyzeEmailWithAI(
  from: string,
  subject: string,
  body: string
): Promise<EmailAnalysisResult> {
  const startTime = Date.now();

  try {
    const prompt = `Tu es un assistant IA spécialisé dans l'analyse d'emails professionnels.

Analyse cet email et fournis une évaluation structurée :

DE: ${from}
OBJET: ${subject}
CONTENU:
${body.substring(0, 2000)} ${body.length > 2000 ? '...' : ''}

Tu dois répondre UNIQUEMENT avec un JSON valide contenant :
{
  "category": "support|vente|client|interne|partenaire|urgent|spam|autre",
  "sentiment": "positif|neutre|negatif|urgent",
  "urgency_score": 0-10,
  "requires_validation": true/false,
  "detected_entities": {
    "product": "nom du produit mentionné si applicable",
    "problem": "problème décrit si support",
    "desired_date": "date souhaitée si mentionnée",
    "contact_info": "info de contact importante",
    "price_mentioned": "prix mentionné si applicable"
  },
  "suggested_template_category": "support|vente|client|interne|partenaire|urgent|autre",
  "reasoning": "brève explication de ton analyse"
}

CATÉGORIES D'EMAILS:
- "support": Demande d'assistance technique, problème, bug, dysfonctionnement
- "vente": Demande de devis, prix, intérêt commercial, achat
- "client": Communication avec un client existant (commande, facture, livraison, satisfaction)
- "interne": Email entre collègues, équipe, communication interne à l'entreprise
- "partenaire": Communication avec partenaires, fournisseurs, prestataires
- "urgent": Email nécessitant une attention immédiate (peut se combiner avec d'autres catégories)
- "spam": Publicité non sollicitée, email indésirable
- "autre": Ne correspond à aucune catégorie ci-dessus

RÈGLES:
- "category": Catégorise selon le type de demande et la relation avec l'expéditeur
- "sentiment": Analyse le ton et l'urgence
- "urgency_score": 0 (pas urgent) à 10 (très urgent, requiert attention immédiate)
- "requires_validation": true si l'email concerne quelque chose d'important (rendez-vous, contrat, plainte grave, opportunité business)
- Détecte les entités clés dans le contenu
- "suggested_template_category": Suggère le type de template à utiliser pour répondre

Exemples de validation obligatoire:
- Demande de rendez-vous/entretien
- Plainte grave client
- Opportunité commerciale importante
- Question juridique/contractuelle
- Urgence technique critique`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Plus économique pour l'analyse
      messages: [
        { role: 'system', content: 'Tu es un expert en analyse d\'emails professionnels. Réponds toujours en JSON valide.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const analysis = JSON.parse(content) as EmailAnalysisResult;

    // Validation et normalisation
    if (!['support', 'vente', 'spam', 'urgent', 'partenariat', 'autre'].includes(analysis.category)) {
      analysis.category = 'autre';
    }
    if (!['positif', 'neutre', 'negatif', 'urgent'].includes(analysis.sentiment)) {
      analysis.sentiment = 'neutre';
    }
    analysis.urgency_score = Math.max(0, Math.min(10, analysis.urgency_score));

    const processingTime = Date.now() - startTime;
    console.log(`✅ Email analyzed in ${processingTime}ms - Category: ${analysis.category}, Urgency: ${analysis.urgency_score}/10`);

    return analysis;
  } catch (error) {
    console.error('❌ Error analyzing email:', error);
    // Fallback par défaut en cas d'erreur
    return {
      category: 'autre',
      sentiment: 'neutre',
      urgency_score: 5,
      requires_validation: true, // Par sécurité, demander validation si erreur
      detected_entities: {},
      reasoning: 'Erreur lors de l\'analyse IA, validation manuelle recommandée',
    };
  }
}

/**
 * Génère une réponse automatique avec l'IA
 */
export async function generateReplyWithAI(
  options: ReplyGenerationOptions
): Promise<GeneratedReply> {
  const {
    email,
    template_body,
    custom_prompt,
    user_context = {},
    tone = 'professionnel',
    language = 'fr',
    aiConfig, // Configuration IA de l'utilisateur
  } = options;

  const startTime = Date.now();

  try {
    // Extraction du prénom de l'expéditeur
    const senderName = email.from_name || email.from_email.split('@')[0];
    const senderFirstName = senderName.split(' ')[0];

    // INTÉGRATION DU SYSTÈME AIPromptBuilder
    let systemPrompt: string;
    
    if (aiConfig) {
      // Utiliser AIPromptBuilder avec la config utilisateur
      const builder = new AIPromptBuilder(aiConfig);
      const category = email.category || 'support_ticket';
      
      // Générer le prompt système avec la config complète
      systemPrompt = builder.generateSystemPrompt(
        category as any,
        Object.entries(user_context)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      );
      
      // Ajouter instructions anti-emojis
      systemPrompt += `\n\nFORMATAGE:
- N'utilise AUCUN emoji ou caractère spécial (✓, ✗, •, →, etc.)
- Utilise uniquement des lettres, chiffres, ponctuation standard (. , ! ? : ; - " ')
- Évite les symboles Unicode et les caractères de formatage spéciaux`;

    } else {
      // Fallback: prompt manuel (legacy)
      const contextStr = Object.entries(user_context)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      systemPrompt = `Tu es un assistant IA spécialisé dans la rédaction de réponses professionnelles aux emails.

CONTEXTE UTILISATEUR:
${contextStr || 'Entreprise professionnelle'}

INSTRUCTIONS:
- Rédige une réponse ${tone} en ${language === 'fr' ? 'français' : 'anglais'}
- Sois concis mais courtois
- Adapte le ton selon le contexte
- Utilise le prénom de l'expéditeur: ${senderFirstName}
- Personnalise la réponse en fonction du contenu de l'email reçu
- N'utilise AUCUN emoji ou caractère spécial (✓, ✗, •, →, etc.)
- Utilise uniquement des lettres, chiffres, ponctuation standard (. , ! ? : ; - " ')
- Évite les symboles Unicode et les caractères de formatage spéciaux
${custom_prompt ? `\nINSTRUCTIONS PERSONNALISÉES:\n${custom_prompt}` : ''}`;
    }

    let userPrompt = `EMAIL REÇU:
De: ${email.from_name || email.from_email}
Objet: ${email.subject || '(sans objet)'}
Contenu:
${email.body_text?.substring(0, 1500) || email.snippet || ''}

${template_body ? `TEMPLATE À UTILISER COMME BASE:\n${template_body}\n\n` : ''}

Génère une réponse appropriée. Réponds UNIQUEMENT avec un JSON valide:
{
  "subject": "Objet de la réponse (reprendre le sujet original avec 'Re:')",
  "body_text": "Corps de l'email en texte brut",
  "body_html": "Corps de l'email en HTML simple (avec <p>, <br>, <strong> uniquement)"
}`;

    // MAPPING CRÉATIVITÉ → TEMPERATURE OPENAI
    // creativity: 0 (précis/brut) → temp: 0.3
    // creativity: 1 (créatif) → temp: 1.0
    const creativity = aiConfig?.creativity ?? 0.7;
    const temperature = 0.3 + (creativity * 0.7); // Range: 0.3 - 1.0

    console.log(`🎨 AI Config - Creativity: ${creativity} → Temperature: ${temperature.toFixed(2)}`);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Modèle plus puissant pour la génération
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature, // TEMPÉRATURE DYNAMIQUE basée sur la créativité
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const reply = JSON.parse(content);
    
    // Ajouter Re: si pas déjà présent
    if (reply.subject && !reply.subject.toLowerCase().startsWith('re:')) {
      reply.subject = `Re: ${email.subject || 'Votre message'}`;
    }

    // Fonction de nettoyage des caractères spéciaux
    const cleanText = (text: string): string => {
      if (!text) return '';
      return text
        // Supprimer les emojis et symboles Unicode (simplifié pour éviter les erreurs de regex)
        .replace(/[\u2600-\u26FF]/g, '')   // Symboles divers
        .replace(/[\u2700-\u27BF]/g, '')   // Dingbats
        .replace(/[\u2B50\u2B55]/g, '')    // Étoiles
        .replace(/[\uD800-\uDFFF]/g, '')   // Supprime les surrogates (emojis)
        // Supprimer les puces et flèches
        .replace(/[•●○■□▪▫◆◇◾◽]/g, '-')
        .replace(/[→←↑↓⇒⇐⇑⇓]/g, '->')
        // Supprimer les checkmarks et croix
        .replace(/[✓✔✗✘]/g, '')
        // Nettoyer les espaces multiples
        .replace(/\s+/g, ' ')
        .trim();
    };

    const processingTime = Date.now() - startTime;
    const tokensUsed = response.usage?.total_tokens || 0;

    console.log(`✅ Reply generated in ${processingTime}ms - Tokens: ${tokensUsed}`);

    return {
      subject: cleanText(reply.subject),
      body_text: cleanText(reply.body_text),
      body_html: cleanText(reply.body_html),
      tokens_used: tokensUsed,
      model_used: 'gpt-4o',
    };
  } catch (error) {
    console.error('❌ Error generating reply:', error);
    throw new Error('Failed to generate reply with AI');
  }
}

/**
 * Détermine si un email doit obligatoirement nécessiter une validation
 */
export function shouldRequireValidation(
  analysis: EmailAnalysisResult,
  rule?: { require_validation_if_urgent: boolean; mode: string }
): boolean {
  // Si déjà marqué comme nécessitant validation par l'IA
  if (analysis.requires_validation) {
    return true;
  }

  // Si urgence très élevée (8+)
  if (analysis.urgency_score >= 8) {
    return true;
  }

  // Si sentiment négatif et urgence modérée+
  if (analysis.sentiment === 'negatif' && analysis.urgency_score >= 5) {
    return true;
  }

  // Si catégorie urgente
  if (analysis.category === 'urgent') {
    return true;
  }

  // Si règle demande validation pour emails urgents
  if (rule?.require_validation_if_urgent && analysis.urgency_score >= 7) {
    return true;
  }

  // Si mode validation forcé
  if (rule?.mode === 'validation') {
    return true;
  }

  return false;
}

/**
 * Remplace les variables dans un template
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value || '');
  }
  
  return result;
}

/**
 * Extrait les variables disponibles d'un email
 */
export function extractEmailVariables(email: EmailCache): Record<string, string> {
  const senderName = email.from_name || email.from_email.split('@')[0];
  const senderFirstName = senderName.split(' ')[0];
  const senderDomain = email.from_email.split('@')[1];

  return {
    nom_expediteur: senderName,
    prenom_expediteur: senderFirstName,
    email_expediteur: email.from_email,
    domaine_expediteur: senderDomain,
    sujet: email.subject || '(sans objet)',
    date_reception: new Date(email.received_at).toLocaleDateString('fr-FR'),
    heure_reception: new Date(email.received_at).toLocaleTimeString('fr-FR'),
    ...email.detected_entities,
  };
}

/**
 * Convertit texte brut en HTML simple
 */
export function textToSimpleHTML(text: string): string {
  return text
    .split('\n\n')
    .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/**
 * Nettoie le HTML pour éviter les injections
 */
export function sanitizeHTML(html: string): string {
  // Basique - permettre seulement les tags sûrs
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'span', 'div'];
  
  // Cette fonction basique devrait être remplacée par une lib comme DOMPurify en prod
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
             .replace(/on\w+="[^"]*"/gi, '')
             .replace(/javascript:/gi, '');
}
