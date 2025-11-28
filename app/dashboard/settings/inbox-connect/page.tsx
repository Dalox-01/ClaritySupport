'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bot, Copy, ExternalLink, Loader2, MailCheck, MailPlus, MessageCircleQuestion, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  'waiting_test': 'bg-amber-100 text-amber-800',
  connected: 'bg-emerald-100 text-emerald-800',
  error: 'bg-red-100 text-red-800',
};

type InboxResponse = {
  routingEmail: string | null;
  supportEmail: string | null;
  status: 'pending' | 'waiting_test' | 'connected' | 'error';
  lastInboundAt: string | null;
  verificationCode?: string | null;
};
type Provider = 'google' | 'ovh' | 'outlook' | 'gmail_personal';

type ProviderStep = {
  title: string;
  helper: string;
};

type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

const PROVIDERS: Provider[] = ['google', 'gmail_personal', 'ovh', 'outlook'];

const PROVIDER_LABELS: Record<Provider, string> = {
  google: 'Google Workspace',
  gmail_personal: 'Gmail.com',
  ovh: 'OVH',
  outlook: 'Outlook',
};

const PROVIDER_HIGHLIGHTS: Record<Provider, string> = {
  google: 'Super Admin requis',
  gmail_personal: 'Compte Gmail individuel',
  ovh: 'MX Plan / Redirection',
  outlook: 'Outlook Web / Exchange',
};

const PROVIDER_DOCS: Record<Provider, { label: string; href: string }> = {
  google: {
    label: 'Doc Google Workspace',
    href: 'https://support.google.com/a/answer/2368153?hl=fr',
  },
  gmail_personal: {
    label: 'Doc Gmail.com transfert',
    href: 'https://support.google.com/mail/answer/10957?hl=fr',
  },
  ovh: {
    label: 'Doc OVH redirection',
    href: 'https://help.ovhcloud.com/csm/fr-email-configurer-une-redirection?id=kb_article_view&sysparm_article=KB0046174',
  },
  outlook: {
    label: 'Doc Microsoft Outlook',
    href: 'https://support.microsoft.com/fr-fr/office/5189176c-2a5d-45b1-815b-970a5499164e',
  },
};

const PROVIDER_STEPS: Record<Provider, ProviderStep[]> = {
  google: [
    {
      title: '🎛️ Parcours Admin précis',
      helper:
        'Admin.google.com → Menu ☰ → Apps → Google Workspace → Gmail → Paramètres → Routage. Tu dois être Super Admin pour voir le menu.',
    },
    {
      title: '✉️ Ajoute la règle de transfert',
      helper:
        'Dans Routage, clique sur “Ajouter une autre règle”. Choisis ton adresse support en expéditeur, ajoute la destination = adresse Resend, conserve “Conserver une copie dans la boîte d\'origine”.',
    },
    {
      title: '🧪 Email test express',
      helper:
        'Apps → Gmail → Routage → section “Règles de réception” > vérifie que ta règle est active, puis envoie un email “Ping Resend” depuis support@votredomaine.',
    },
  ],
  gmail_personal: [
    {
      title: '⚙️ Paramètres Gmail.com',
      helper:
        'Ouvre mail.google.com → engrenage → “Afficher tous les paramètres” → onglet “Transfert et POP/IMAP”. Tu dois être connecté avec le compte Gmail concerné.',
    },
    {
      title: '📤 Ajouter l’adresse Resend',
      helper:
        'Clique sur “Ajouter une adresse de transfert”, colle l’adresse de routage affichée à l’Étape 1 dans Clarity, puis surveille le Mail Center: Google envoie un mail « Gmail Forwarding Confirmation » avec un code.',
    },
    {
      title: '✅ Activer le transfert',
      helper:
        'Ouvre l’email Google dans Clarity → copie le code → valide la fenêtre Gmail. Ensuite coche “Transférer une copie des messages entrants vers…” + adresse Resend, et choisis quoi faire de la copie Gmail (conserver, archiver, etc.).',
    },
  ],
  ovh: [
    {
      title: '⚙️ Manager OVHcloud',
      helper:
        'manager.ovhcloud.com → E-mails → ton service MX Plan → onglet « Redirections ». Clique sur “Créer une redirection” en haut à droite.',
    },
    {
      title: '🔁 Source et destination',
      helper:
        'Source = ton adresse support (ex: support@domaine.com). Destination = adresse Resend générée. Décoche “Conserver une copie” si tu ne veux pas saturer OVH.',
    },
    {
      title: '🧪 Validation côté OVH',
      helper:
        'Retourne dans MX Plan → Journaux pour voir le transfert, puis envoie un email depuis ton domaine principal (ex: contact@) pour vérifier la remontée dans Clarity.',
    },
  ],
  outlook: [
    {
      title: '📬 Outlook on the web',
      helper:
        'outlook.office.com/mail → icône engrenage → “Afficher tous les paramètres d’Outlook” → Courrier → Règles. Clique sur “Ajouter une nouvelle règle”.',
    },
    {
      title: '🧲 Paramètres de la règle',
      helper:
        'Nom de la règle = “Redirection Resend”. Conditions: « Appliquer à tous les messages ». Actions: “Rediriger vers” + adresse Resend. Laisse la case “Arrêter le traitement” cochée.',
    },
    {
      title: '✅ Sauvegarde & test',
      helper:
        'Clique sur “Enregistrer”, vérifie que la règle est activée (toggle bleu). Envoie un mail test depuis ton compte Outlook, puis clique sur « Vérifier le statut » côté Clarity.',
    },
  ],
};

function formatRelativeDate(input?: string | null) {
  if (!input) return 'Aucun email reçu pour l\'instant';
  const value = new Date(input).getTime();
  const diff = Date.now() - value;
  if (diff < 60_000) return 'Reçu il y a quelques secondes';
  if (diff < 3_600_000) return `Reçu il y a ${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `Reçu il y a ${Math.floor(diff / 3_600_000)} h`;
  return new Date(input).toLocaleString('fr-FR');
}

export default function InboxConnectPage() {
  const [inbox, setInbox] = useState<InboxResponse | null>(null);
  const [supportEmailInput, setSupportEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<Provider>('google');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Salut 👋 Je suis l’assistant Inbox Connect (GPT-4o mini). Je réponds uniquement aux questions sur la génération de l’adresse de routage, la configuration des redirections ou la vérification du statut (Étape 3). Dis-moi où tu bloques.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const statusBadgeClass = useMemo(() => {
    if (!inbox) return 'bg-slate-100 text-slate-700';
    return STATUS_COLORS[inbox.status] || 'bg-slate-100 text-slate-700';
  }, [inbox]);

  const handleSendMessage = async (event?: React.FormEvent, presetMessage?: string) => {
    if (event) event.preventDefault();
    if (isAssistantTyping) return;

    const userContent = (presetMessage ?? chatInput).trim();
    if (!userContent) return;

    const historySnapshot = chatMessages.slice(-6);
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userContent }]);
    setIsAssistantTyping(true);

    try {
      const response = await fetch('/api/inbox-connect-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userContent,
          history: historySnapshot,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.answer) {
        throw new Error(data?.message || 'Je n’ai pas pu répondre. Réessaie en précisant l’étape.');
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.answer as string }]);
    } catch (error) {
      const fallback = error instanceof Error ? error.message : 'Erreur inconnue';
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Impossible de répondre pour le moment (${fallback}). Réessaie dans quelques instants.`,
        },
      ]);
    } finally {
      setIsAssistantTyping(false);
    }
  };

  const quickPrompts = [
    'Je ne trouve pas Gmail dans mon admin',
    'Comment transférer depuis Gmail.com ?',
    'Le statut reste en pending',
    'Comment vérifier OVH ?',
    'Erreur webhook ou signature',
  ];

  const handleQuickPrompt = (prompt: string) => {
    setIsHelpOpen(true);
    void handleSendMessage(undefined, prompt);
  };

  const initializeInbox = async (supportEmail?: string) => {
    try {
      if (!supportEmail) {
        setIsLoading(true);
      } else {
        setIsSaving(true);
      }

      const response = await fetch('/api/inboxes/generate-uuid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supportEmail ? { supportEmail } : {}),
      });

      if (!response.ok) {
        throw new Error('Impossible de générer l\'inbox');
      }

      const result = await response.json();
      setInbox(result.inbox);
      setSupportEmailInput(result.inbox.supportEmail || '');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la génération de l\'adresse');
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  useEffect(() => {
    initializeInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const response = await fetch('/api/inboxes/check-status');
      if (!response.ok) {
        throw new Error('Échec de la vérification');
      }
      const result = await response.json();
      setInbox(result.inbox);
      toast.success('Statut mis à jour');
    } catch (error) {
      console.error(error);
      toast.error('Impossible de récupérer le statut');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const copyRoutingEmail = async () => {
    if (!inbox?.routingEmail || typeof navigator === 'undefined') return;
    await navigator.clipboard.writeText(inbox.routingEmail);
    toast.success('Adresse copiée dans le presse-papier');
  };

  const handleSaveSupportEmail = async () => {
    if (!supportEmailInput) {
      toast.error('Entrez l\'adresse support de votre marque');
      return;
    }
    await initializeInbox(supportEmailInput);
    toast.success('Adresse support enregistrée');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col gap-8 bg-white py-10 px-4 sm:px-8 lg:px-16">
      <div>
        <p className="text-sm uppercase text-muted-foreground">Connexion Mail Center</p>
        <h1 className="text-3xl font-semibold tracking-tight">Connecter votre boîte via Resend</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Remplacez la connexion Gmail/Outlook par une redirection simple. Trois étapes suffisent pour activer la réception
          et l\'envoi depuis le Mail Center.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MailPlus className="h-5 w-5 text-primary" />
            Étape 1 — Générez votre adresse de routage
          </CardTitle>
          <CardDescription>
            Cette adresse unique reçoit tous les emails transférés par votre fournisseur (Google Workspace, OVH, Outlook...).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Adresse de routage Resend</p>
            <div className="flex flex-col gap-3 md:flex-row">
              <Input readOnly value={inbox?.routingEmail || 'Génération en cours...'} className="font-mono text-sm" />
              <Button variant="outline" onClick={copyRoutingEmail} disabled={!inbox?.routingEmail}>
                <Copy className="mr-2 h-4 w-4" /> Copier
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Adresse support de votre marque</p>
            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                value={supportEmailInput}
                onChange={(event) => setSupportEmailInput(event.target.value)}
                placeholder="ex: support@votredomaine.com"
                className="md:flex-1"
              />
              <Button onClick={handleSaveSupportEmail} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Enregistrer
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cette adresse peut être n'importe quelle boîte existante (Gmail, OVH, Outlook...). Elle n'est pas hébergée par Clarity : nous l'utilisons uniquement comme « Reply-To » pour que vos clients voient votre adresse habituelle.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          id="instructions"
          className="relative overflow-hidden border-blue-100 bg-gradient-to-br from-white via-sky-50 to-blue-100/40"
        >
          <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
            <div className="absolute -top-10 right-8 h-32 w-32 rounded-full bg-blue-200 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-indigo-200 blur-3xl" />
          </div>
          <CardHeader className="relative">
            <CardTitle className="text-xl">Étape 2 — Configurez la redirection</CardTitle>
            <CardDescription>
              Copiez l'adresse Resend vers votre fournisseur préféré. Les étapes sont guidées pour chaque plateforme.
            </CardDescription>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
              <Sparkles className="h-4 w-4" /> 3 gestes suffisent pour activer la redirection
            </div>
          </CardHeader>
          <CardContent className="relative">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Provider)}>
              <TabsList className="grid grid-cols-2 gap-2 rounded-full bg-white/80 p-1 shadow-inner sm:grid-cols-4">
                {PROVIDERS.map((provider) => (
                  <TabsTrigger
                    key={provider}
                    value={provider}
                    className="rounded-full text-xs font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    {PROVIDER_LABELS[provider]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {PROVIDERS.map((provider) => (
                <TabsContent
                  key={provider}
                  value={provider}
                  className="mt-4 space-y-4 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-blue-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>{PROVIDER_LABELS[provider]}</span>
                    <span className="text-blue-400">{PROVIDER_HIGHLIGHTS[provider]}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-blue-600">
                    <span className="uppercase tracking-wide text-blue-300">Ressource officielle</span>
                    <Link
                      href={PROVIDER_DOCS[provider].href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      {PROVIDER_DOCS[provider].label}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  {provider === 'google' && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Chemin détaillé dans Google Admin</p>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-blue-900">
                        <li>
                          Depuis Gmail, ouvre le lanceur d'applications (9 points) &rarr; <span className="font-semibold">Admin</span>. Si tu ne vois pas l'icône, tape directement
                          <span className="font-mono"> admin.google.com </span> et connecte-toi avec un Super Admin.
                        </li>
                        <li>
                          Dans la console, va sur <span className="font-semibold">Menu ☰ → Apps → Google Workspace → Gmail</span>. Le menu « Routage » apparaît dans la section « Paramètres avancés ».
                        </li>
                        <li>
                          Clique sur <span className="font-semibold">Routage</span> &rarr; « Gérer » &rarr; « Ajouter une autre règle ». Choisis « Sécurité & conformité &gt; Routage des messages » si on te propose plusieurs catégories.
                        </li>
                      </ol>
                    </div>
                  )}
                  {provider === 'gmail_personal' && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Chemin Gmail.com classique</p>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs">
                        <li>
                          Connecte-toi à <span className="font-mono">https://mail.google.com</span> avec le compte à rediriger, clique sur l’icône engrenage puis sur <span className="font-semibold">Afficher tous les paramètres</span>.
                        </li>
                        <li>
                          Onglet <span className="font-semibold">Transfert et POP/IMAP</span> &rarr; section « Transfert » &rarr; bouton « Ajouter une adresse de transfert ». Colle exactement l’adresse de routage Resend affichée dans l’Étape 1 ci-dessus (pas besoin d’aller sur resend.com).
                        </li>
                        <li>
                          Gmail envoie un message « Gmail Forwarding Confirmation » vers l’adresse Resend : ouvre Clarity &gt; Mail Center pour le lire, copie le code, valide la fenêtre Gmail, puis sélectionne « Transférer une copie vers… » + adresse Resend et choisis quoi faire de la copie originale (conserver, archiver...).
                        </li>
                      </ol>
                    </div>
                  )}
                  {provider === 'ovh' && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chemin précis dans le Manager OVHcloud</p>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs">
                        <li>
                          Connecte-toi sur <span className="font-mono">https://www.ovh.com/manager</span> &rarr; sélectionne ton organisation &rarr; menu <span className="font-semibold">Emails</span>.
                        </li>
                        <li>
                          Choisis ton service MX Plan &rarr; onglet <span className="font-semibold">Redirections</span> &rarr; bouton « Créer une redirection ».
                        </li>
                        <li>
                          Renseigne <span className="font-semibold">Adresse source</span> = support@tondomaine et <span className="font-semibold">Adresse de destination</span> = adresse Resend. Valide, puis vérifie l'apparition de la ligne dans le tableau.
                        </li>
                      </ol>
                    </div>
                  )}
                  {provider === 'outlook' && (
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-sm text-indigo-900">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Chemin Outlook / Exchange Online</p>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs">
                        <li>
                          Ouvre <span className="font-mono">https://outlook.office.com/mail</span> &rarr; icône engrenage &rarr; lien « Afficher tous les paramètres d'Outlook » en bas du panneau.
                        </li>
                        <li>
                          Va dans <span className="font-semibold">Courrier → Règles</span>, clique sur « Ajouter une nouvelle règle », donne-lui un nom puis choisis « Appliquer à tous les messages » dans la section Conditions.
                        </li>
                        <li>
                          Dans Actions, sélectionne <span className="font-semibold">Rediriger vers</span> et colle l'adresse Resend, puis coche « Arrêter le traitement d'autres règles ». Sauvegarde et vérifie que le toggle de la règle est activé.
                        </li>
                      </ol>
                    </div>
                  )}
                  <div className="space-y-3">
                    {PROVIDER_STEPS[provider].map((step, index) => (
                      <div key={step.title} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                        <div className="flex gap-3">
                          <span className="mt-0.5 h-6 w-6 rounded-full bg-blue-600/10 text-center text-sm font-semibold leading-6 text-blue-600">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">{step.title}</p>
                            <p className="text-sm text-muted-foreground">{step.helper}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-dashed border-blue-200 bg-white/90 p-4 text-xs text-blue-900">
                    <p className="flex items-center gap-2 font-semibold">
                      <ArrowRight className="h-4 w-4" /> Mini mission de validation
                    </p>
                    <p className="mt-1">
                      Envoie un email test vers {inbox?.routingEmail || 'ton adresse Resend'}, attends 30 secondes puis clique sur « Vérifier le statut ».
                    </p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MailCheck className="h-5 w-5 text-primary" /> Étape 3 — Vérifiez le statut
            </CardTitle>
            <CardDescription>
              Envoyez un email test depuis votre adresse support, puis cliquez sur « Vérifier le statut » pour confirmer la connexion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={cn('px-3 py-1 text-sm capitalize', statusBadgeClass)}>
                {inbox?.status === 'connected' ? 'Connecté' : inbox?.status?.replace('_', ' ') || 'En attente'}
              </Badge>
              <span className="text-sm text-muted-foreground">{formatRelativeDate(inbox?.lastInboundAt)}</span>
            </div>

            <div className="rounded-md border border-primary/20 bg-white/70 p-4 text-sm text-muted-foreground shadow-sm">
              <p className="font-medium text-primary">Comment valider ?</p>
              <ul className="mt-2 list-disc space-y-2 pl-4">
                <li>Transférez un email réel vers l\'adresse Resend générée.</li>
                <li>Attendez ~30 secondes, puis cliquez sur « Vérifier le statut ».</li>
                <li>Le statut passe à « Connecté » dès que l\'IA détecte l\'email.</li>
              </ul>
            </div>

            <Button onClick={checkStatus} disabled={isCheckingStatus || isLoading}>
              {isCheckingStatus ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Vérifier le statut
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-xl">Checklist finale</CardTitle>
          <CardDescription>
            Dès que le statut passe à « Connecté », la collecte automatique continue (24/7) et vous pouvez répondre via Resend.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Redirection active',
              description: 'Votre fournisseur renvoie bien tous les emails entrants.',
            },
            {
              title: 'Email test reçu',
              description: 'Le Mail Center affiche au moins un email provenant de votre domaine.',
            },
            {
              title: 'Réponse IA prête',
              description: 'Les réponses sortantes utiliseront Resend + votre adresse Reply-To.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border bg-white/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {item.title}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="pointer-events-none fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <div
          className={cn(
            'flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200',
            isHelpOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
          )}
        >
          <div className="flex items-center justify-between border-b bg-slate-50/80 px-4 py-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="h-4 w-4 text-primary" /> Assistant Inbox Connect
              </p>
              <p className="text-xs text-muted-foreground">Docs Resend + guides internes</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setIsHelpOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 border-b bg-slate-50 px-4 py-3">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-full border border-slate-200 bg-white text-xs text-slate-900 shadow-sm hover:bg-slate-100"
                onClick={() => handleQuickPrompt(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>

          <div className="flex max-h-[45vh] flex-col gap-3 overflow-y-auto px-4 py-4">
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn('flex', message.role === 'assistant' ? 'justify-start' : 'justify-end')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                    message.role === 'assistant'
                      ? 'bg-slate-100 text-slate-800'
                      : 'bg-primary text-white'
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isAssistantTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Assistant en train d'écrire…
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 border-t bg-white px-4 py-3">
            <Input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Décris-moi l'étape ou l'erreur"
              className="flex-1"
            />
            <Button type="submit" disabled={!chatInput.trim()}>
              Envoyer
            </Button>
          </form>
        </div>

        <Button
          type="button"
          onClick={() => setIsHelpOpen((prev) => !prev)}
          className="pointer-events-auto rounded-full bg-primary px-6 py-3 text-white shadow-lg hover:bg-primary/90"
        >
          <MessageCircleQuestion className="mr-2 h-4 w-4" /> Où êtes-vous bloqués ?
        </Button>
      </div>
    </div>
  );
}
