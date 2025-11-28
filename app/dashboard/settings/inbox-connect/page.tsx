'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Copy, ExternalLink, Loader2, MailCheck, MailPlus, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
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
type Provider = 'google' | 'ovh' | 'outlook';

type ProviderStep = {
  title: string;
  helper: string;
};

const PROVIDERS: Provider[] = ['google', 'ovh', 'outlook'];

const PROVIDER_HIGHLIGHTS: Record<Provider, string> = {
  google: 'Admin console + Gmail',
  ovh: 'Manager OVHcloud',
  outlook: 'Outlook Web & règles',
};

const PROVIDER_LABELS: Record<Provider, string> = {
  google: 'Google Workspace',
  ovh: 'OVH',
  outlook: 'Outlook',
};

const PROVIDER_DOCS: Record<Provider, { label: string; href: string }> = {
  google: {
    label: 'Documentation Google Workspace',
    href: 'https://support.google.com/a/answer/2368153?hl=fr',
  },
  ovh: {
    label: 'Guide redirection OVHcloud',
    href: 'https://help.ovhcloud.com/csm/fr-email-hosting-redirection?id=kb_article_view&sysparm_article=KB0043696',
  },
  outlook: {
    label: 'Créer une règle dans Outlook',
    href: 'https://support.microsoft.com/fr-fr/office/cr%C3%A9er-des-r%C3%A8gles-dans-outlook-pour-windows-ccfba861-5123-4f1f-9a00-9b0b9b38b563',
  },
};

const PROVIDER_STEPS: Record<Provider, ProviderStep[]> = {
  google: [
    {
      title: '🎛️ Console Google Workspace',
      helper: 'Apps → Gmail → Routage. Clique sur “Ajouter une redirection” et sélectionne ton adresse support.',
    },
    {
      title: '✉️ Colle l\'adresse Resend',
      helper: 'Utilise l\'adresse générée ci-dessus, garde “Conserver une copie dans Gmail” activé pour archivage.',
    },
    {
      title: '🧪 Email test express',
      helper: 'Depuis support@votredomaine, envoie un mail intitulé « Ping Resend » vers n\'importe quel contact.',
    },
  ],
  ovh: [
    {
      title: '⚙️ OVHcloud > Emails > Redirections',
      helper: 'Sélectionne ton domaine, clique sur “Ajouter une redirection” et choisis ton adresse support source.',
    },
    {
      title: '🔁 Ajoute la destination Resend',
      helper: 'Colle l\'adresse Resend générée, valide, puis attends quelques secondes que la règle apparaisse.',
    },
    {
      title: '🧪 Test côté domaine',
      helper: 'Envoie un email depuis ton domaine principal (ex: contact@) pour vérifier que la redirection s\'active.',
    },
  ],
  outlook: [
    {
      title: '📬 Outlook Web > Paramètres > Règles',
      helper: 'Ouvre Courrier → Règles de boîte de réception → “Ajouter une nouvelle règle”.',
    },
    {
      title: '🧲 Règle de transfert',
      helper: 'Condition: “Tous les messages”. Action: “Rediriger vers” + l\'adresse Resend fournie.',
    },
    {
      title: '✅ Sauvegarde & test',
      helper: 'Sauvegarde la règle puis envoie un email test depuis ton adresse support pour voir le statut évoluer.',
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

  const statusBadgeClass = useMemo(() => {
    if (!inbox) return 'bg-slate-100 text-slate-700';
    return STATUS_COLORS[inbox.status] || 'bg-slate-100 text-slate-700';
  }, [inbox]);

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
    <div className="mx-auto flex max-w-5xl flex-col gap-8 py-10">
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
              Nous utilisons cette adresse comme « Reply-To » afin que vos clients continuent à voir votre domaine.
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
              <TabsList className="grid grid-cols-3 gap-2 rounded-full bg-white/80 p-1 shadow-inner">
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
    </div>
  );
}
