import OpenAI from 'openai';
import { logError, logInfo } from './logger';

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openaiClient;
}

export type EmailGenerationInput = {
  type: 'candidature' | 'relance' | 'prospection' | 'support' | 'reponse' | 'negociation';
  tone: 'pro' | 'cordial' | 'direct';
  style?: 'formel' | 'creatif' | 'technique' | 'commercial';
  language: 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'nl' | 'pl' | 'ru' | 'ar' | 'zh' | 'ja' | 'ko';
  length?: 'court' | 'moyen' | 'long';
  context: string;
  attachments?: boolean;
  keyPoints?: string[];
  constraints?: string;
  variables?: Record<string, string>;
  target?: {
    role?: string;
    company?: string;
    sector?: string;
  };
  customPrompt?: string;
};

export type EmailGenerationOutput = {
  html: string;
  text: string;
  tokensUsed: number;
  subject?: string;
};

function buildSystemPrompt(language: string): string {
  const languageNames: Record<string, string> = {
    'fr': 'Français',
    'en': 'English',
    'es': 'Español',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'nl': 'Nederlands',
    'pl': 'Polski',
    'ru': 'Русский',
    'ar': 'العربية',
    'zh': '中文',
    'ja': '日本語',
    'ko': '한국어'
  };

  const langName = languageNames[language] || 'English';

  if (language === 'fr') {
    return `Tu es MailWizard, un assistant expert en rédaction et correction d'emails professionnels.

Ton objectif est de produire des emails **parfaits, clairs, polis, professionnels et percutants** en ${langName}.

LANGUE OBLIGATOIRE : ${langName}
- Tu DOIS rédiger l'email ENTIÈREMENT en ${langName}
- AUCUN mot dans une autre langue (sauf noms propres)
- Respecte PARFAITEMENT la grammaire, l'orthographe et la ponctuation du ${langName}

PRIORITÉ ABSOLUE - DÉVELOPPEMENT RICHE ET DÉTAILLÉ :
- DÉVELOPPE un contenu COMPLET, RICHE et PROFESSIONNEL
- Utilise les "Instructions supplémentaires" comme base pour CONSTRUIRE un email détaillé
- Ces instructions sont des DONNÉES CLÉS à DÉVELOPPER et VALORISER dans l'email
- NE JAMAIS copier les instructions telles quelles, mais les TRANSFORMER en contenu professionnel

EXEMPLES D'INTÉGRATION RICHE :
  * INSTRUCTION: "j'ai 18 ans et je suis en BTS CIEL"
    → EMAIL DÉVELOPPÉ: "Actuellement en deuxième année de BTS Cybersécurité, Informatique et Réseaux, ÉLectronique (CIEL), je développe au quotidien des compétences techniques approfondies en programmation, systèmes embarqués et réseaux informatiques. Malgré mon jeune âge (18 ans), ma formation m'a permis d'acquérir une expertise solide en développement logiciel, notamment en Python, C++ et dans la gestion de bases de données. Mon parcours académique rigoureux et mes projets pratiques m'ont préparé à relever les défis techniques du monde professionnel."

  * INSTRUCTION: "5 ans d'expérience en React"
    → EMAIL DÉVELOPPÉ: "Fort de cinq années d'expérience en développement React, j'ai eu l'opportunité de concevoir et déployer des applications web complexes pour des clients variés. Ma maîtrise approfondie de l'écosystème React (Hooks, Context API, Redux, Next.js) me permet d'architecturer des solutions performantes et maintenables. J'ai notamment piloté la refonte complète d'interfaces utilisateur, améliorant significativement l'expérience client et les performances applicatives."

- DÉVELOPPE chaque point avec des détails concrets, des exemples et de la valeur ajoutée
- EXPLIQUE le contexte, les compétences, les réalisations potentielles
- VALORISE l'expérience, la formation, les qualités professionnelles
- CRÉE un contenu qui VEND vraiment la personne ou le message

Règles ESSENTIELLES :
- Respecte TOUJOURS la langue demandée (français ou anglais)
- Respecte le ton demandé (professionnel, cordial, ou direct)
- Respecte la longueur demandée

CORRECTION AUTOMATIQUE ULTRA-STRICTE (ZÉRO TOLÉRANCE) :
- Orthographe : AUCUNE faute tolérée (vérifie chaque mot)
- Grammaire : conjugaison parfaite (temps, modes, personnes)
- Accords : genre et nombre TOUJOURS corrects (ex: "la réponse envoyée" pas "envoyé")
- Ponctuation française OBLIGATOIRE :
  * Espace insécable AVANT : ; ! ? (ex: "Bonjour !" jamais "Bonjour!")
  * Espace normal APRÈS : ; ! ? ,
  * PAS d'espace avant la virgule (ex: "Bonjour, merci" pas "Bonjour , merci")
  * PAS d'espace avant le point (ex: "Merci." pas "Merci .")
- Guillemets : TOUJOURS français « texte » avec espaces (jamais "texte")
- Apostrophes : TOUJOURS typographiques ' (ex: "l'email" jamais "l'email")
- Majuscules : après point, début de phrase, noms propres
- Répétitions : SUPPRIME tous les mots/expressions répétés
- Phrases : reformule TOUTES les tournures maladroites ou confuses
- Vérification finale : relis 2 fois pour garantir ZÉRO ERREUR

STRUCTURE PARFAITE ET DÉVELOPPÉE :
- Objet : court, percutant, incitatif (5-8 mots max)
- Salutation : appropriée au contexte (Madame/Monsieur, Bonjour, Cher/Chère)
- Introduction : DÉVELOPPÉE avec contexte clair et accrocheur (2-3 phrases)
- Corps principal : 3-4 paragraphes RICHES ET DÉTAILLÉS
  * Paragraphe 1 : Présentation approfondie (formation, expérience, contexte)
  * Paragraphe 2 : Compétences et réalisations concrètes avec exemples
  * Paragraphe 3 : Valeur ajoutée et motivations détaillées
  * Paragraphe 4 (optionnel) : Projets, références ou informations complémentaires
- Appel à l'action : clair, précis et motivant
- Formule de politesse : adaptée au ton (Cordialement, Bien à vous, Respectueusement)
- Signature : générique mais professionnelle ([Votre nom])

LONGUEUR ET RICHESSE :
- Pour "court" : 150-200 mots minimum (pas moins !)
- Pour "moyen" : 250-350 mots
- Pour "long" : 400-500 mots
- TOUJOURS privilégier la RICHESSE du contenu plutôt que la brièveté
- Chaque phrase doit apporter de la VALEUR et des DÉTAILS concrets

OPTIMISATIONS :
- Utilise des mots de transition pour la fluidité
- Varie la structure des phrases
- Privilégie la voix active
- Sois concis : chaque mot doit avoir un objectif
- Adapte le vocabulaire au destinataire
- Crée un sentiment d'urgence ou d'intérêt quand approprié
- Personnalise autant que possible avec les informations fournies

ÉVITER ABSOLUMENT :
- Jargon technique incompréhensible
- Phrases trop longues (>25 mots)
- Ton trop familier ou trop pompeux
- Informations personnelles réelles (utilise des placeholders : [Votre nom], [Entreprise])
- Promesses impossibles à tenir

Format de réponse STRICT :
SUBJECT: [Objet percutant de l'email]
---
[Corps de l'email parfaitement structuré et corrigé]`;
  }

  return `You are MailWizard, an expert assistant in writing and correcting professional emails.

Your goal is to produce **perfect, clear, polite, professional, and impactful emails** in ${langName}.

MANDATORY LANGUAGE: ${langName}
- You MUST write the email ENTIRELY in ${langName}
- NO words in other languages (except proper nouns)
- Respect PERFECTLY the grammar, spelling and punctuation of ${langName}

Your goal is to produce **perfect, clear, polite, professional, and impactful emails**.

ABSOLUTE PRIORITY - RICH AND DETAILED DEVELOPMENT:
- DEVELOP COMPLETE, RICH and PROFESSIONAL content
- Use "Additional instructions" as a foundation to BUILD a detailed email
- These instructions are KEY DATA to DEVELOP and ENHANCE in the email
- NEVER copy instructions as-is, but TRANSFORM them into professional content

RICH INTEGRATION EXAMPLES:
  * INSTRUCTION: "I'm 18 years old studying Computer Science"
    → DEVELOPED EMAIL: "Currently in my second year of Computer Science studies, I have been developing comprehensive technical skills in programming, algorithms, and software architecture. Despite my young age (18), my rigorous academic training has allowed me to gain solid expertise in multiple programming languages including Python, Java, and JavaScript. My hands-on projects and coursework have prepared me to tackle real-world technical challenges with confidence and creativity."

  * INSTRUCTION: "5 years of React experience"
    → DEVELOPED EMAIL: "With five years of professional experience in React development, I have had the opportunity to design and deploy complex web applications for diverse clients across various industries. My deep mastery of the React ecosystem (Hooks, Context API, Redux, Next.js) enables me to architect performant and maintainable solutions. I have notably led complete UI refactoring projects, significantly improving user experience and application performance metrics."

- DEVELOP each point with concrete details, examples, and added value
- EXPLAIN the context, skills, potential achievements
- HIGHLIGHT experience, training, professional qualities
- CREATE content that truly SELLS the person or message

ESSENTIAL RULES:
- ALWAYS respect the requested language (French or English)
- Respect the requested tone (professional, cordial, or direct)
- Respect the requested length

ULTRA-STRICT AUTOMATIC CORRECTION (ZERO TOLERANCE):
- Spelling: NO mistakes tolerated (check every word)
- Grammar: perfect conjugation (tenses, modes, persons)
- Agreements: gender and number ALWAYS correct
- English punctuation MANDATORY:
  * NO space before punctuation : ; ! ? ,
  * Space AFTER : ; ! ? , .
  * Comma: "Hello, thanks" never "Hello , thanks"
  * Period: "Thanks." never "Thanks ."
- Quotes: ALWAYS standard "text" with proper spacing
- Apostrophes: ALWAYS standard ' (ex: "it's" never "it's")
- Capitalization: after period, start of sentence, proper nouns
- Repetitions: REMOVE all repeated words/expressions
- Sentences: rephrase ALL awkward or confusing constructions
- Final check: reread twice to guarantee ZERO ERRORS

PERFECT AND DEVELOPED STRUCTURE:
- Subject: short, punchy, engaging (5-8 words max)
- Greeting: appropriate to context (Dear Sir/Madam, Hello, Dear)
- Introduction: DEVELOPED with clear and engaging context (2-3 sentences)
- Main body: 3-4 RICH AND DETAILED paragraphs
  * Paragraph 1: Thorough presentation (education, experience, context)
  * Paragraph 2: Concrete skills and achievements with examples
  * Paragraph 3: Detailed added value and motivations
  * Paragraph 4 (optional): Projects, references or additional information
- Call-to-action: clear, precise and motivating
- Closing: adapted to tone (Best regards, Sincerely, Kind regards)
- Signature: generic but professional ([Your name])

LENGTH AND RICHNESS:
- For "short": 150-200 words minimum (no less!)
- For "medium": 250-350 words
- For "long": 400-500 words
- ALWAYS prioritize content RICHNESS over brevity
- Each sentence must bring VALUE and concrete DETAILS

OPTIMIZATIONS:
- Use transition words for flow
- Vary sentence structure
- Prefer active voice
- Be concise: every word must have a purpose
- Adapt vocabulary to recipient
- Create sense of urgency or interest when appropriate
- Personalize as much as possible with provided information

ABSOLUTELY AVOID:
- Incomprehensible technical jargon
- Too long sentences (>25 words)
- Too casual or too pompous tone
- Real personal information (use placeholders: [Your name], [Company])
- Impossible promises

STRICT response format:
SUBJECT: [Punchy email subject]
---
[Perfectly structured and corrected email body]`;
}

function buildUserPrompt(input: EmailGenerationInput): string {
  const parts: string[] = [];

  const languageNames: Record<string, string> = {
    'fr': 'Français',
    'en': 'English',
    'es': 'Español',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'nl': 'Nederlands',
    'pl': 'Polski',
    'ru': 'Русский',
    'ar': 'العربية',
    'zh': '中文',
    'ja': '日本語',
    'ko': '한국어'
  };

  const typeLabels: Record<string, { fr: string; en: string }> = {
    candidature: { fr: 'Candidature spontanée', en: 'Job application' },
    relance: { fr: 'Relance / Suivi', en: 'Follow-up' },
    prospection: { fr: 'Prospection B2B', en: 'B2B Cold outreach' },
    support: { fr: 'Support client', en: 'Customer support' },
    reponse: { fr: 'Réponse client', en: 'Customer response' },
    negociation: { fr: 'Négociation', en: 'Negotiation' },
  };

  const labelLang = (input.language === 'fr' || input.language === 'en') ? input.language : 'en';
  const label = typeLabels[input.type]?.[labelLang] || input.type;

  if (input.language === 'fr') {
    parts.push(`Type d'email : ${label}`);
    parts.push(`Ton : ${input.tone}`);
    if (input.style) parts.push(`Style d'écriture : ${input.style}`);
    parts.push(`Langue OBLIGATOIRE : ${languageNames[input.language]}`);
    parts.push(`IMPORTANT : Rédige l'email ENTIÈREMENT en ${languageNames[input.language]}, sans aucun mot dans une autre langue.`);
    if (input.length) parts.push(`Longueur : ${input.length}`);
    if (input.attachments) parts.push(`Note : Cet email comportera des pièces jointes. Mentionne-le de manière professionnelle dans le corps de l'email.`);
  } else {
    parts.push(`Email type: ${label}`);
    parts.push(`Tone: ${input.tone}`);
    if (input.style) parts.push(`Writing style: ${input.style}`);
    parts.push(`MANDATORY Language: ${languageNames[input.language]}`);
    parts.push(`IMPORTANT: Write the email ENTIRELY in ${languageNames[input.language]}, with no words in other languages.`);
    if (input.length) parts.push(`Length: ${input.length}`);
    if (input.attachments) parts.push(`Note: This email will include attachments. Mention them professionally in the email body.`);
  }

  if (input.context) {
    parts.push(input.language === 'fr' ? `\nContexte :\n${input.context}` : `\nContext:\n${input.context}`);
  }

  if (input.keyPoints && input.keyPoints.length > 0) {
    parts.push(
      input.language === 'fr'
        ? `\nPoints clés à inclure :\n${input.keyPoints.map((p) => `- ${p}`).join('\n')}`
        : `\nKey points to include:\n${input.keyPoints.map((p) => `- ${p}`).join('\n')}`
    );
  }

  if (input.constraints) {
    parts.push(
      input.language === 'fr' ? `\nContraintes :\n${input.constraints}` : `\nConstraints:\n${input.constraints}`
    );
  }

  if (input.target) {
    const targetParts: string[] = [];
    if (input.target.role) targetParts.push(input.target.role);
    if (input.target.company) targetParts.push(input.target.company);
    if (input.target.sector) targetParts.push(input.target.sector);

    if (targetParts.length > 0) {
      parts.push(
        input.language === 'fr'
          ? `\nCible : ${targetParts.join(', ')}`
          : `\nTarget: ${targetParts.join(', ')}`
      );
    }
  }

  if (input.customPrompt) {
    parts.push(
      input.language === 'fr'
        ? `\nInstructions supplémentaires :\n${input.customPrompt}`
        : `\nAdditional instructions:\n${input.customPrompt}`
    );
  }

  return parts.join('\n');
}

export async function generateEmail(input: EmailGenerationInput): Promise<EmailGenerationOutput> {
  try {
    const systemPrompt = buildSystemPrompt(input.language);
    const userPrompt = buildUserPrompt(input);

    logInfo('Generating email with AI', {
      type: input.type,
      language: input.language,
      tone: input.tone,
    });

    let content = '';
    let tokensUsed = 0;

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
      logInfo('No OpenAI API key found, using DEMO mode generation');
      content = generateMockEmail(input);
      tokensUsed = 150;
    } else {
      try {
        logInfo('Calling OpenAI API with model: ' + (process.env.DEFAULT_AI_MODEL || 'gpt-4o-mini'));
        const completion = await getOpenAI().chat.completions.create({
          model: process.env.DEFAULT_AI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 2500,
        });

        content = completion.choices[0]?.message?.content || '';
        tokensUsed = completion.usage?.total_tokens || 0;
        logInfo('OpenAI API success', { tokensUsed });
      } catch (apiError: any) {
        logError('OpenAI API error (quota exceeded or invalid key), using DEMO mode', {
          error: apiError.message,
          status: apiError.status,
          type: apiError.type
        });
        content = generateMockEmail(input);
        tokensUsed = 150;
      }
    }

    const [subjectPart, ...bodyParts] = content.split('---');
    const subject = subjectPart.replace('SUBJECT:', '').trim();
    const body = bodyParts.join('---').trim();

    let html = body
      .split('\n\n')
      .filter(para => para.trim().length > 0)
      .map((para) => {
        const cleanPara = para.replace(/\n/g, '<br>').trim();
        return `<p style="margin-bottom: 1.2em; line-height: 1.8;">${cleanPara}</p>`;
      })
      .join('');

    if (input.variables) {
      Object.entries(input.variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'gi');
        html = html.replace(regex, value);
      });
    }

    logInfo('Email generated successfully', { tokensUsed });

    return {
      html,
      text: body,
      tokensUsed,
      subject,
    };
  } catch (error) {
    logError('Failed to generate email', error);
    throw new Error('Failed to generate email. Please try again.');
  }
}

function generateMockEmail(input: EmailGenerationInput): string {
  const isFrench = input.language === 'fr';
  
  // Fonction pour personnaliser le contenu selon le ton
  const getToneGreeting = (tone: string): string => {
    if (!isFrench) {
      if (tone === 'pro') return 'Dear Sir/Madam';
      if (tone === 'cordial') return 'Hello';
      return 'Hi';
    }
    if (tone === 'pro') return 'Madame, Monsieur';
    if (tone === 'cordial') return 'Bonjour';
    return 'Salut';
  };

  const getToneClosing = (tone: string): string => {
    if (!isFrench) {
      if (tone === 'pro') return 'Best regards';
      if (tone === 'cordial') return 'Kind regards';
      return 'Regards';
    }
    if (tone === 'pro') return 'Cordialement';
    if (tone === 'cordial') return 'Bien à vous';
    return 'À bientôt';
  };

  const greeting = getToneGreeting(input.tone);
  const closing = getToneClosing(input.tone);

  const subjects: Record<string, string> = {
    candidature: isFrench 
      ? `Candidature ${input.tone === 'pro' ? 'pour un poste au sein de votre entreprise' : 'motivée'}` 
      : `${input.tone === 'pro' ? 'Application for a Position' : 'Job Application'}`,
    relance: isFrench 
      ? 'Relance - Candidature en cours' 
      : 'Follow-up - Pending Application',
    prospection: isFrench 
      ? 'Opportunité de partenariat B2B' 
      : 'B2B Partnership Opportunity',
    support: isFrench 
      ? 'Réponse à votre demande' 
      : 'Response to Your Request',
    reponse: isFrench 
      ? 'Suite à votre message' 
      : 'Regarding Your Message',
    negociation: isFrench 
      ? 'Proposition commerciale' 
      : 'Business Proposal',
  };

  // Générer un corps d'email plus personnalisé et détaillé
  const generateBody = (): string => {
    const contextLines = input.context.split('\n').filter(line => line.trim());
    const hasCustomPrompt = input.customPrompt && input.customPrompt.trim();
    
    if (isFrench) {
      let body = `${greeting},\n\n`;
      
      // Introduction selon le type
      if (input.type === 'candidature') {
        body += `Je me permets de vous adresser ma candidature ${input.tone === 'pro' ? 'spontanée' : ''} pour rejoindre votre entreprise.\n\n`;
      } else if (input.type === 'relance') {
        body += `Je me permets de revenir vers vous concernant ${contextLines[0] || 'ma précédente demande'}.\n\n`;
      } else if (input.type === 'prospection') {
        body += `Je vous contacte afin d'explorer une opportunité de collaboration entre nos entreprises.\n\n`;
      } else if (input.type === 'support') {
        body += `Nous avons bien pris en compte votre demande et vous en remercions.\n\n`;
      } else if (input.type === 'reponse') {
        body += `Je vous remercie pour votre message concernant ${contextLines[0] || 'votre demande'}.\n\n`;
      } else {
        body += `Suite à nos échanges, je souhaite vous présenter une proposition.\n\n`;
      }

      // Contenu principal basé sur le contexte
      body += `**Contexte :**\n${input.context}\n\n`;

      // Instructions personnalisées si présentes
      if (hasCustomPrompt) {
        body += `**Précisions supplémentaires :**\n${input.customPrompt}\n\n`;
      }

      // Appel à l'action
      if (input.type === 'candidature') {
        body += `Je serais ravi(e) d'échanger avec vous pour discuter de mes compétences et de la manière dont je pourrais contribuer à vos projets.\n\n`;
      } else if (input.type === 'prospection') {
        body += `Seriez-vous disponible pour un échange afin d'explorer cette opportunité de collaboration ?\n\n`;
      } else {
        body += `Je reste à votre entière disposition pour tout complément d'information.\n\n`;
      }

      body += `${closing},\n\n[Votre nom]`;
      
      return body;
    } else {
      let body = `${greeting},\n\n`;
      
      if (input.type === 'candidature') {
        body += `I am writing to express my strong interest in joining your organization.\n\n`;
      } else if (input.type === 'relance') {
        body += `I am following up on ${contextLines[0] || 'my previous inquiry'}.\n\n`;
      } else if (input.type === 'prospection') {
        body += `I am reaching out to explore a potential partnership between our companies.\n\n`;
      } else if (input.type === 'support') {
        body += `We have received your request and appreciate you reaching out.\n\n`;
      } else if (input.type === 'reponse') {
        body += `Thank you for your message regarding ${contextLines[0] || 'your inquiry'}.\n\n`;
      } else {
        body += `Following our discussions, I would like to present a proposal.\n\n`;
      }

      body += `**Context:**\n${input.context}\n\n`;

      if (hasCustomPrompt) {
        body += `**Additional Details:**\n${input.customPrompt}\n\n`;
      }

      if (input.type === 'candidature') {
        body += `I would be delighted to discuss how my skills and experience could contribute to your team.\n\n`;
      } else if (input.type === 'prospection') {
        body += `Would you be available for a call to explore this collaboration opportunity?\n\n`;
      } else {
        body += `I remain at your disposal for any further information you may need.\n\n`;
      }

      body += `${closing},\n\n[Your name]`;
      
      return body;
    }
  };

  const subject = subjects[input.type] || (isFrench ? 'Votre demande' : 'Your request');
  const body = generateBody();

  return `SUBJECT: ${subject}\n---\n${body}`;
}

export async function* streamEmailGeneration(input: EmailGenerationInput): AsyncGenerator<string> {
  try {
    const systemPrompt = buildSystemPrompt(input.language);
    const userPrompt = buildUserPrompt(input);

    const stream = await getOpenAI().chat.completions.create({
      model: process.env.DEFAULT_AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2500,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    logError('Failed to stream email generation', error);
    throw new Error('Failed to generate email. Please try again.');
  }
}
