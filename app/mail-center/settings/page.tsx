'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  ArrowLeft,
  User,
  Mail,
  CreditCard,
  AlertTriangle,
  Save,
  Check,
  X,
  Shield,
  Key,
  Calendar,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  name: string;
  plan: string;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  
  const [name, setName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadUserData();
      loadSubscription();
    }
  }, [status, router]);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setName(data.user.name || '');
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/current');
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Abonnement chargé:', data.subscription);
        console.log('📅 cancel_at_period_end:', data.subscription?.cancel_at_period_end);
        console.log('🎨 État pour le rendu:', { 
          cancel_at_period_end: data.subscription?.cancel_at_period_end,
          status: data.subscription?.status,
          current_period_end: data.subscription?.current_period_end
        });
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Erreur chargement abonnement:', error);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setHasChanges(false);
        toast.success('Profil mis à jour avec succès');
        
        // Mettre à jour la session
        await update({ name });
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Abonnement résilié. Il restera actif jusqu\'à la fin de la période en cours.');
        setShowCancelConfirm(false);
        loadSubscription();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la résiliation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la résiliation');
    } finally {
      setIsCanceling(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié dans le presse-papier`);
  };

  const maskSensitiveData = (data: string) => {
    if (showSensitiveData) return data;
    return data.replace(/./g, '•');
  };

  const openCustomerPortal = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        toast.error('Erreur lors de l\'ouverture du portail');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ouverture du portail');
    }
  };

  useEffect(() => {
    if (userData && name !== userData.name) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [name, userData]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/mail-center')}
            className="mb-6 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au Mail Center
          </Button>

          <h1 className="mb-2 text-4xl font-bold text-white">
            Paramètres du compte
          </h1>
          <p className="text-slate-400">
            Gérez vos informations personnelles et votre abonnement
          </p>
        </div>

        <div className="space-y-6">
          {/* Profil */}
          <Card className="border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Profil</h2>
            </div>

            <div className="space-y-4">
              {/* Nom */}
              <div>
                <Label htmlFor="name" className="text-slate-300">
                  Nom d'affichage
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="mt-1.5 border-slate-700 bg-slate-800/50 text-white"
                />
              </div>

              {/* Email (lecture seule) */}
              <div>
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <Input
                    id="email"
                    value={userData.email}
                    disabled
                    className="border-slate-700 bg-slate-800/30 text-slate-400"
                  />
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  L'email ne peut pas être modifié
                </p>
              </div>

              {/* Bouton Sauvegarder */}
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </Card>

          {/* Informations du compte */}
          <Card className="border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <Key className="h-5 w-5 text-purple-500" />
                </div>
                <h2 className="text-xl font-bold text-white">Informations du compte</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                className="border-slate-700 hover:bg-slate-800"
              >
                {showSensitiveData ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Masquer
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Afficher
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-slate-400">ID Utilisateur</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                      <code className="text-xs text-slate-300 font-mono">
                        {maskSensitiveData(userData.id)}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(userData.id, 'ID utilisateur')}
                      className="border-slate-700 hover:bg-slate-800"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-400">Plan actuel</Label>
                  <div className="mt-1 rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                    <span className="text-sm font-semibold text-white">{userData.plan}</span>
                  </div>
                </div>

                {userData.stripe_customer_id && (
                  <div>
                    <Label className="text-slate-400">ID Client Stripe</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                        <code className="text-xs text-slate-300 font-mono">
                          {maskSensitiveData(userData.stripe_customer_id)}
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(userData.stripe_customer_id!, 'ID client Stripe')}
                        className="border-slate-700 hover:bg-slate-800"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-slate-400">Compte créé le</Label>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">
                      {new Date(userData.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Abonnement */}
          {(subscription?.stripe_subscription_id || (userData.plan !== 'FREE' && userData.stripe_customer_id)) && (
            <Card className="border-slate-800 bg-slate-900/50 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <CreditCard className="h-5 w-5 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-white">Abonnement</h2>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-slate-400">Statut</Label>
                    <div className="mt-1 rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                      <span className={`text-sm font-semibold ${
                        subscription?.cancel_at_period_end 
                          ? 'text-yellow-400' 
                          : (subscription?.status === 'active' || userData.plan !== 'FREE') 
                            ? 'text-green-400' 
                            : 'text-yellow-400'
                      }`}>
                        {subscription?.cancel_at_period_end 
                          ? '⏳ Fin de période' 
                          : (subscription?.status === 'active' || userData.plan !== 'FREE') 
                            ? '✓ Actif' 
                            : subscription?.status || 'Actif'
                        }
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-400">
                      {subscription?.cancel_at_period_end ? 'Prend fin le' : 'Renouvellement'}
                    </Label>
                    <div className="mt-1 rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                      <span className="text-sm text-slate-300">
                        {subscription?.current_period_end 
                          ? new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Non disponible'
                        }
                      </span>
                    </div>
                  </div>

                  {subscription?.stripe_subscription_id && (
                    <div className="sm:col-span-2">
                      <Label className="text-slate-400">ID Abonnement Stripe</Label>
                      <div className="mt-1 rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                        <code className="text-xs text-slate-300">{subscription.stripe_subscription_id}</code>
                      </div>
                    </div>
                  )}
                </div>

                {subscription?.cancel_at_period_end && (
                  <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-400 mb-1">
                          Abonnement en cours de résiliation
                        </p>
                        <p className="text-sm text-yellow-300">
                          Votre abonnement restera actif jusqu'au <strong>{new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}</strong>, puis sera automatiquement annulé. Vous serez alors basculé sur le plan GRATUIT.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={openCustomerPortal}
                    variant="outline"
                    className="flex-1 border-slate-700 hover:bg-slate-800"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Gérer le paiement
                  </Button>

                  {!subscription?.cancel_at_period_end && userData.plan !== 'FREE' && (
                    <Button
                      onClick={() => setShowCancelConfirm(true)}
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Résilier l'abonnement
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Zone dangereuse */}
          <Card className="border-red-500/30 bg-red-500/5 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-red-500/10 p-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Zone dangereuse</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Les actions dans cette section sont irréversibles. Soyez prudent.
              </p>

              <Button
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                    toast.error('Fonctionnalité à venir');
                  }
                }}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Supprimer mon compte
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de confirmation d'annulation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-red-500/10 p-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Résilier l'abonnement ?</h3>
            </div>

            <p className="mb-6 text-slate-400">
              Êtes-vous sûr de vouloir résilier votre abonnement <span className="font-semibold text-white">{subscription?.plan}</span> ? 
              Vous conserverez l'accès à toutes les fonctionnalités jusqu'au{' '}
              <span className="font-semibold text-white">
                {subscription && new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>.
            </p>

            <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <p className="text-sm text-yellow-400">
                ⚠️ Après cette date, votre compte passera automatiquement au plan GRATUIT avec des fonctionnalités limitées.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowCancelConfirm(false)}
                variant="outline"
                className="flex-1 border-slate-700"
                disabled={isCanceling}
              >
                Non, garder mon abonnement
              </Button>
              <Button
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Résiliation...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Oui, résilier
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
