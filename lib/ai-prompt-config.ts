/**
 * Configuration avancée des prompts IA pour le support client
 */

import type { SupportCategory } from './support-categories';

export type PromptTone = 'professionnel' | 'amical' | 'formel' | 'empathique' | 'direct';
export type ResponseStyle = 'concis' | 'détaillé' | 'bullet-points' | 'conversationnel';
export type ResponseLength = 'court' | 'moyen' | 'long';

export interface PromptTemplate {
  id: string;
  name: string;
  category: SupportCategory;
  template: string;
  variables: string[];
  description?: string;
}

export interface AIPromptConfig {
  // Configuration globale
  tone: PromptTone;
  style: ResponseStyle;
  length: ResponseLength;
  language: string;
  
  // Niveau de créativité (0 = précis/brut, 1 = créatif)
  // Se traduit en température OpenAI: 0.3 - 1.0
  creativity?: number; // 0.0 - 1.0
  
  // Informations entreprise pour le contexte
  companyName: string;
  companyValues?: string[];
  brandVoice?: string;
  
  // Instructions personnalisées
  customInstructions: string[];
  doList: string[];  // Ce que l'IA DOIT faire
  dontList: string[]; // Ce que l'IA NE DOIT PAS faire
  
  // Signature
  signature?: {
    enabled: boolean;
    name?: string;
    role?: string;
    customText?: string;
  };
  
  // Exemples de réponses pour few-shot learning
  examples?: Array<{
    category: SupportCategory;
    situation: string;
    goodResponse: string;
    badResponse?: string;
  }>;
  
  // Templates par catégorie
  categoryTemplates: Record<SupportCategory, string>;
  
  // Hashtags pour classification automatique par catégorie
  categoryHashtags: Record<SupportCategory, string[]>;
  
  // Variables contextuelles disponibles
  availableVariables: {
    customerName: boolean;
    orderNumber: boolean;
    productName: boolean;
    ticketNumber: boolean;
    date: boolean;
    customFields: Record<string, string>;
  };
}

export const DEFAULT_AI_CONFIG: AIPromptConfig = {
  tone: 'professionnel',
  style: 'détaillé',
  length: 'moyen',
  language: 'fr',
  creativity: 0.5, // Valeur par défaut: équilibre entre précision et créativité
  companyName: 'Mon Entreprise',
  companyValues: [
    'Satisfaction client prioritaire',
    'Transparence et honnêteté',
    'Réactivité et efficacité'
  ],
  customInstructions: [
    'Toujours saluer le client par son nom si disponible',
    'Reformuler la demande du client pour montrer la compréhension',
    'Proposer des solutions concrètes et actionnables',
    'Terminer par une question pour s\'assurer de la satisfaction'
  ],
  doList: [
    'Être empathique et compréhensif',
    'Utiliser un langage clair et accessible',
    'Fournir des informations précises et vérifiables',
    'Proposer des étapes concrètes',
    'Offrir une assistance supplémentaire si nécessaire'
  ],
  dontList: [
    'Ne jamais promettre ce qui ne peut être garanti',
    'Ne pas utiliser de jargon technique complexe',
    'Ne pas blâmer le client',
    'Ne pas minimiser les problèmes',
    'Ne pas donner d\'informations contradictoires'
  ],
  signature: {
    enabled: true,
    name: 'L\'équipe support',
    role: 'Service Client'
  },
  categoryTemplates: {
    'urgent': `Vous devez traiter cette demande urgente avec la plus haute priorité.
Reconnaissez l'urgence, rassurez le client, et proposez une solution immédiate ou un délai précis.`,
    
    'commande': `Le client a une question sur sa commande.
Vérifiez les détails de la commande, fournissez des informations précises sur le statut.`,
    
    'remboursement': `Le client demande un remboursement.
Expliquez la politique de remboursement, les délais, et les étapes à suivre.`,
    
    'question-produit': `Le client a une question sur un produit.
Fournissez des informations détaillées, techniques si nécessaire, et aidez à la décision d'achat.`,
    
    'suivi-commande': `Le client souhaite suivre sa commande.
Fournissez les informations de tracking, les délais estimés, et rassurez sur la livraison.`,
    
    'sav': `Le client a un problème avec un produit acheté.
Faites preuve d'empathie, proposez un diagnostic, et les solutions (réparation, échange, remboursement).`,
    
    'reclamation': `Le client fait une réclamation.
Reconnaissez le problème, présentez des excuses si approprié, et proposez une compensation ou solution.`,
    
    'information': `Le client demande une information générale.
Fournissez une réponse claire et complète, avec des liens ou ressources si pertinent.`,
    
    'facturation': `Le client a une question sur la facturation.
Expliquez clairement les montants, les méthodes de paiement, et les délais.`,
    
    'technique': `Le client a un problème technique.
Fournissez un diagnostic étape par étape, soyez pédagogue et patient.`,
    
    'autre': `Email non classifié ou divers.
Analysez le contenu et fournissez une réponse appropriée et professionnelle.`
  },
  categoryHashtags: {
    'urgent': [
      'urgent', 'urgence', 'rapidement', 'vite', 'immédiat',
      'critique', 'problème grave', 'panne', 'bloqué', 'emergency'
    ],
    'commande': [
      'commande', 'order', 'achat', 'purchase', 'acheter',
      'commander', 'panier', 'checkout', 'paiement', 'transaction'
    ],
    'remboursement': [
      'remboursement', 'refund', 'rembourser', 'annulation', 'retour',
      'argent', 'restitution', 'avoir', 'crédit', 'cancel'
    ],
    'question-produit': [
      'produit', 'article', 'product', 'caractéristiques', 'spécifications',
      'fonctionnalités', 'features', 'compatibilité', 'dimensions', 'specs'
    ],
    'suivi-commande': [
      'livraison', 'tracking', 'suivi', 'colis', 'expédition',
      'transporteur', 'délai', 'réception', 'shipping', 'delivery'
    ],
    'sav': [
      'sav', 'garantie', 'panne', 'défectueux', 'cassé',
      'réparation', 'warranty', 'broken', 'ne fonctionne pas', 'bug'
    ],
    'reclamation': [
      'réclamation', 'plainte', 'insatisfait', 'mécontent', 'déçu',
      'complaint', 'problème', 'erreur', 'mauvais', 'claim'
    ],
    'information': [
      'information', 'info', 'renseignement', 'question', 'savoir',
      'horaires', 'adresse', 'contact', 'où', 'comment'
    ],
    'facturation': [
      'facture', 'invoice', 'paiement', 'montant', 'prix',
      'devis', 'tarif', 'billing', 'charge', 'total'
    ],
    'technique': [
      'technique', 'installation', 'configuration', 'setup', 'bug',
      'erreur', 'code', 'connexion', 'login', 'paramètres'
    ],
    'autre': [
      'divers', 'autre', 'général', 'autre sujet', 'other'
    ]
  },
  availableVariables: {
    customerName: true,
    orderNumber: true,
    productName: true,
    ticketNumber: true,
    date: true,
    customFields: {}
  }
};

export class AIPromptBuilder {
  private config: AIPromptConfig;

  constructor(config?: Partial<AIPromptConfig>) {
    this.config = { ...DEFAULT_AI_CONFIG, ...config };
  }

  updateConfig(updates: Partial<AIPromptConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getConfig(): AIPromptConfig {
    return this.config;
  }

  /**
   * Génère le prompt système pour l'IA
   */
  generateSystemPrompt(category?: SupportCategory, knowledgeBaseContext?: string): string {
    const parts: string[] = [];

    // Rôle et contexte
    parts.push(`Tu es un assistant IA professionnel du service client de ${this.config.companyName}.`);
    parts.push('');

    // Valeurs de l'entreprise
    if (this.config.companyValues && this.config.companyValues.length > 0) {
      parts.push('## Valeurs de l\'entreprise');
      this.config.companyValues.forEach(value => parts.push(`- ${value}`));
      parts.push('');
    }

    // Ton et style
    parts.push('## Style de communication');
    parts.push(`Ton: ${this.config.tone}`);
    parts.push(`Style: ${this.config.style}`);
    parts.push(`Longueur de réponse: ${this.config.length}`);
    parts.push(`Langue: ${this.config.language}`);
    parts.push('');

    // Voice de marque
    if (this.config.brandVoice) {
      parts.push('## Voice de marque');
      parts.push(this.config.brandVoice);
      parts.push('');
    }

    // Instructions personnalisées
    if (this.config.customInstructions.length > 0) {
      parts.push('## Instructions');
      this.config.customInstructions.forEach(inst => parts.push(`- ${inst}`));
      parts.push('');
    }

    // À faire
    if (this.config.doList.length > 0) {
      parts.push('## Tu DOIS');
      this.config.doList.forEach(item => parts.push(`✓ ${item}`));
      parts.push('');
    }

    // À ne pas faire
    if (this.config.dontList.length > 0) {
      parts.push('## Tu NE DOIS PAS');
      this.config.dontList.forEach(item => parts.push(`✗ ${item}`));
      parts.push('');
    }

    // Template spécifique à la catégorie
    if (category && this.config.categoryTemplates[category]) {
      parts.push('## Instructions pour cette catégorie');
      parts.push(this.config.categoryTemplates[category]);
      parts.push('');
    }

    // Base de connaissances
    if (knowledgeBaseContext) {
      parts.push('## Base de connaissances');
      parts.push(knowledgeBaseContext);
      parts.push('');
    }

    // Exemples
    if (this.config.examples && category) {
      const relevantExamples = this.config.examples.filter(ex => ex.category === category);
      if (relevantExamples.length > 0) {
        parts.push('## Exemples de bonnes réponses');
        relevantExamples.forEach((ex, idx) => {
          parts.push(`### Exemple ${idx + 1}`);
          parts.push(`Situation: ${ex.situation}`);
          parts.push(`Bonne réponse: ${ex.goodResponse}`);
          if (ex.badResponse) {
            parts.push(`Mauvaise réponse (à éviter): ${ex.badResponse}`);
          }
          parts.push('');
        });
      }
    }

    // Format de réponse
    parts.push('## Format de réponse');
    switch (this.config.style) {
      case 'bullet-points':
        parts.push('Utilise des bullet points pour structurer ta réponse.');
        break;
      case 'concis':
        parts.push('Sois bref et va droit au but.');
        break;
      case 'détaillé':
        parts.push('Fournis une réponse complète et détaillée.');
        break;
      case 'conversationnel':
        parts.push('Utilise un style conversationnel naturel.');
        break;
    }
    parts.push('');

    // Signature
    if (this.config.signature?.enabled) {
      parts.push('## Signature');
      if (this.config.signature.customText) {
        parts.push(`Termine toujours par: ${this.config.signature.customText}`);
      } else {
        const sig = [];
        if (this.config.signature.name) sig.push(this.config.signature.name);
        if (this.config.signature.role) sig.push(this.config.signature.role);
        if (sig.length > 0) {
          parts.push(`Termine toujours par: ${sig.join(' - ')}`);
        }
      }
    }

    return parts.join('\n');
  }

  /**
   * Génère le prompt utilisateur avec variables remplacées
   */
  generateUserPrompt(
    emailContent: {
      from: string;
      subject: string;
      body: string;
      category?: SupportCategory;
    },
    variables?: Record<string, string>
  ): string {
    let prompt = `Email reçu de ${emailContent.from}:\n`;
    prompt += `Objet: ${emailContent.subject}\n`;
    if (emailContent.category) {
      prompt += `Catégorie: ${emailContent.category}\n`;
    }
    prompt += `\nContenu:\n${emailContent.body}\n\n`;
    prompt += `Génère une réponse professionnelle à cet email.`;

    // Remplacer les variables si fournies
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    }

    return prompt;
  }

  /**
   * Remplace les variables dans un template
   */
  replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  }
}

// Stockage localStorage
export function saveAIConfig(config: AIPromptConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('support_ai_config', JSON.stringify(config));
  }
}

export function loadAIConfig(): AIPromptConfig | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('support_ai_config');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Erreur lors du chargement de la config IA:', e);
      }
    }
  }
  return null;
}

// ============================================================================
// NOUVEAUX PROMPTS SYSTÈME (OPTIMISÉS)
// ============================================================================

export const SYSTEM_PROMPT_INGESTION = `Tu es un expert en synthèse de procédures pour support client. Voici un document brut fourni par une entreprise e-commerce. Ta mission est de le convertir en une liste de règles strictes et logiques pour qu'une IA de réponse automatique puisse s'en servir sans erreur.

Consignes de formatage :

Ignore le texte marketing, les introductions et les formules de politesse.

Transforme chaque politique en règle : 'SI [Condition] ALORS [Action/Réponse]'.

Si des délais sont mentionnés, sois précis (ex: '7 jours').

Groupe par catégorie : [LIVRAISON], [RETOURS], [REMBOURSEMENT].

Sois ultra-concis pour économiser des tokens.

Texte Brut : {{TEXTE_EXTRAIT_DU_PDF}}`;

export const SYSTEM_PROMPT_RUNTIME = `Tu es le responsable support client de la boutique {{SHOP_NAME}}.

TES DIRECTIVES (Ordre de priorité)
Sécurité & Vérité : Ne jamais inventer d'information. Si l'information n'est pas dans le CONTEXTE COMMANDE ou les RÈGLES, ne promets rien. Dis que tu transmets à un agent humain.

Empathie & Ton : Adopte un ton {{TONE}}. Sois concis. Pas de blabla inutile.

Objectif : Résoudre le problème du client immédiatement.

1. BASE DE CONNAISSANCE (Règles de la boutique)
{{KNOWLEDGE_BASE}}

2. CONTEXTE CLIENT (Données vérifiées)
{{ORDER_CONTEXT}}

3. ANALYSE REQUISE
Avant de répondre, analyse l'email du client :

Si le client semble très en colère ou menace de porter plainte -> Ajoute le tag [URGENT] au tout début de ta réponse.

Si le client demande une modification de commande impossible selon les règles -> Explique poliment le refus.

EMAIL DU CLIENT :
"{{CUSTOMER_EMAIL}}"

Génère la réponse maintenant (si tu as détecté une urgence, commence par [URGENT], sinon commence la réponse directement) :`;
