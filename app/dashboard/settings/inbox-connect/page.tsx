'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Loader2, MailCheck, MailPlus, RefreshCw, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

const PROVIDER_STEPS: Record<string, string[]> = {
  google: [
    'Ouvrez Google Workspace → Gmail → "Transfert".',
    'Ajoutez l\'adresse de routage générée ci-dessus comme destination de transfert.',
    'Conservez votre adresse support comme adresse d\'envoi par défaut.',
  ],
  ovh: [
    'Connectez-vous à OVH → Emails → Redirections.',
    'Créez une redirection de votre adresse support vers l\'adresse Resend.',
    'Envoyez un email test depuis votre domaine pour vérifier le flux.',
  ],
  outlook: [
    'Outlook Web → Paramètres → Courrier → Règles.',
    'Créez une règle "Transférer" vers l\'adresse Resend.',
    'Ajoutez une exemption pour éviter les boucles et envoyez un test.',
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
  const [activeTab, setActiveTab] = useState<'google' | 'ovh' | 'outlook'>('google');

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
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Étape 2 — Configurez la redirection</CardTitle>
            <CardDescription>
              Copiez l\'adresse Resend dans votre fournisseur. Choisissez votre plateforme pour suivre la procédure détaillée.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'google' | 'ovh' | 'outlook')}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="google">Google Workspace</TabsTrigger>
                <TabsTrigger value="ovh">OVH</TabsTrigger>
                <TabsTrigger value="outlook">Outlook</TabsTrigger>
              </TabsList>
              {Object.entries(PROVIDER_STEPS).map(([provider, steps]) => (
                <TabsContent key={provider} value={provider} className="space-y-4 rounded-md border p-4">
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    {steps.map((step, index) => (
                      <li key={step} className="flex gap-3">
                        <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/10 text-center text-xs font-semibold leading-5 text-primary">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="text-xs text-muted-foreground">
                    Astuce : envoyez un email test depuis votre domaine vers {inbox?.routingEmail || '...'} pour vérifier le transfert.
                  </p>
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
