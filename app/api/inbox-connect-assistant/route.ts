import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { z } from 'zod';
import { logError, logInfo } from '@/lib/logger';

const REQUEST_SCHEMA = z.object({
  message: z.string().min(1, 'Le message est obligatoire'),
  history: z
    .array(
      z.object({
        role: z.enum(['assistant', 'user']),
        content: z.string().min(1),
      })
    )
    .optional(),
});

const TOPICS = [
  {
    id: 'routing_generation',
    label: 'génération de l\'adresse de routage',
    keywords: ['routing', 'routage', 'adresse', 'generate', 'génère', 'étape 1', 'etape 1', 'uuid'],
    fallback:
      'Pour générer l\'adresse de routage, clique sur « Générer une adresse » dans l\'Étape 1. Nous créons une adresse Resend unique du type support+xxxx@mail.clarity.support. Copie-la ensuite pour l\'utiliser dans la redirection.',
  },
  {
    id: 'redirection_errors',
    label: 'erreurs de redirection',
    keywords: [
      'redirection',
      'transfert',
      'gmail',
      'ovh',
      'outlook',
      'forward',
      'erreur',
      'pending',
      'waiting',
      'étape 2',
      'etape 2',
      'bounce',
    ],
    fallback:
      'Vérifie la section « Configurez la redirection » : choisis ton fournisseur (Google Workspace, Gmail perso, OVH ou Outlook) et suis les étapes listées. Assure-toi que l\'adresse Resend est bien en destination et qu\'une copie est conservée si besoin.',
  },
  {
    id: 'status_verification',
    label: 'vérification du statut (Étape 3)',
    keywords: ['statut', 'status', 'étape 3', 'etape 3', 'check status', 'connected', 'waiting test', 'verifier'],
    fallback:
      'Après avoir envoyé un email test via ta redirection, clique sur « Vérifier le statut » dans l\'Étape 3. Le badge passe à « Connecté » dès que le premier email arrive. Si tu restes en pending, renvoie un test et confirme que la règle de transfert est active.',
  },
] as const;

type TopicId = (typeof TOPICS)[number]['id'];

const KNOWLEDGE_BASE: Record<TopicId | 'shared', string> = {
  routing_generation:
    'Étape 1 : cliquer sur « Générer une adresse de routage ». Resend renvoie une adresse unique (ex: support+abcd@mail.clarity.support). Cette adresse est celle à fournir dans tous les formulaires de transfert Gmail/OVH/Outlook.',
  redirection_errors:
    'Étape 2 : choisir le fournisseur puis suivre les chemins détaillés (Google Admin, Gmail.com, OVH Manager, Outlook Web). Toujours coller l\'adresse Resend en destination et conserver une copie locale si souhaité.',
  status_verification:
    'Étape 3 : après un email test réel depuis le domaine support, cliquer sur « Vérifier le statut ». Le badge passe à « Connecté » lorsque nous détectons l\'email via Resend. Inclure l\'adresse support configurée à l\'Étape 1.',
  shared:
    'Tu ne réponds qu\'aux questions liées à Inbox Connect (génération d\'adresse, redirections, statut). Toute autre question doit recevoir « Je ne peux répondre qu\'aux questions sur Inbox Connect (adresse de routage, redirections, Vérifier le statut). ». Adopte un ton concis, tutoriel, en français.',
};

const OUT_OF_SCOPE_MESSAGE =
  'Je ne peux répondre qu\'aux questions liées à la page Inbox Connect (adresse de routage, redirections ou vérification du statut). Reformule ta question en précisant le bloc concerné.';

function detectTopic(message: string): TopicId | null {
  const normalized = message.toLowerCase();
  for (const topic of TOPICS) {
    if (topic.keywords.some((keyword) => normalized.includes(keyword))) {
      return topic.id;
    }
  }
  return null;
}

function buildSystemPrompt(topic: TopicId): string {
  return [
    'Tu es l\'assistant Inbox Connect intégré à Clarity Support.',
    'Tu réponds UNIQUEMENT aux questions concernant :',
    '- Génération (Étape 1) de l\'adresse de routage Resend',
    '- Redirections / transferts (Étape 2)',
    '- Vérification du statut (Étape 3)',
    'Tu refuses toute autre requête.',
    '',
    `Connaissances communes : ${KNOWLEDGE_BASE.shared}`,
    `Connaissances spécifiques (${topic}) : ${KNOWLEDGE_BASE[topic]}`,
    'Lorsque tu proposes une solution, indique les menus exacts et rappelle d\'utiliser l\'adresse de routage générée à l\'Étape 1.',
    'Réponds en français, en 3-4 phrases maximum, avec des étapes numérotées si nécessaire.',
  ].join('\n');
}

function buildFallbackAnswer(topic: TopicId | null): string {
  if (!topic) return OUT_OF_SCOPE_MESSAGE;
  const topicConfig = TOPICS.find((entry) => entry.id === topic);
  return topicConfig?.fallback ?? OUT_OF_SCOPE_MESSAGE;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = REQUEST_SCHEMA.parse(body);

    const topic = detectTopic(message);
    if (!topic) {
      return NextResponse.json({ answer: OUT_OF_SCOPE_MESSAGE, type: 'out_of_scope' });
    }

    if (!process.env.OPENAI_API_KEY) {
      logInfo('[InboxAssistant] OPENAI_API_KEY manquant, réponse fallback renvoyée.');
      return NextResponse.json({ answer: buildFallbackAnswer(topic), type: 'fallback' });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const historyMessages: ChatCompletionMessageParam[] = (history ?? [])
      .slice(-6)
      .map((entry) => ({
        role: entry.role,
        content: entry.content.slice(0, 800),
      }));

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: buildSystemPrompt(topic) },
      ...historyMessages,
      {
        role: 'user',
        content: `Contexte utilisateur (topic: ${topic}):\n${message}\n\nRappelle-lui les boutons/menus exacts de la page Inbox Connect.`,
      },
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 350,
      messages,
    });

    const answer = completion.choices[0]?.message?.content?.trim() || buildFallbackAnswer(topic);

    return NextResponse.json({ answer, type: 'ai' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Requête invalide', details: error.flatten() }, { status: 400 });
    }

    logError('[InboxAssistant] Erreur serveur', error);
    return NextResponse.json(
      {
        answer: 'Impossible de répondre pour le moment. Réessaie dans quelques instants.',
        type: 'error',
      },
      { status: 500 }
    );
  }
}
