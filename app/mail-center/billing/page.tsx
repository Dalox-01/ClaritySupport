'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PLANS, type PlanType } from '@/lib/pricing-plans';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CreditCard, 
  Loader2, 
  Download, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Calendar,
  TrendingUp,
  Shield
} from 'lucide-react';
import { UsageWidget } from '@/components/usage-widget';

interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  current_period_start: string;
  current_period_end: string;
  billing_period: 'monthly' | 'yearly';
  cancel_at_period_end: boolean;
}

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadSubscription();
    }
  }, [status, router]);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/current');
      
      if (!response.ok) {
        if (response.status === 404) {
          setSubscription(null);
          return;
        }
        throw new Error('Erreur lors du chargement de l\'abonnement');
      }

      const data = await response.json();
      setSubscription(data.subscription);

    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      setIsOpeningPortal(true);
      setError(null);

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'ouverture du portail');
      }

      const { url } = await response.json();
      window.location.href = url;

    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsOpeningPortal(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const currentPlan = subscription ? PLANS[subscription.plan] : PLANS.free;
  const periodEnd = subscription ? new Date(subscription.current_period_end) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Gestion de l'abonnement
          </h1>
          <p className="text-slate-400">
            Gérez votre abonnement et consultez votre utilisation
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="md:col-span-2 space-y-6">
            {/* Abonnement actuel */}
            <Card className="bg-slate-900/50 border-slate-800 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {currentPlan.name}
                  </h2>
                  <p className="text-slate-400">
                    {subscription ? 'Votre plan actuel' : 'Plan gratuit'}
                  </p>
                </div>
                {subscription && (
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    subscription.status === 'active'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {subscription.status === 'active' ? (
                      <>
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Actif
                      </>
                    ) : (
                      subscription.status
                    )}
                  </div>
                )}
              </div>

              {subscription && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Période de facturation</div>
                      <div className="font-medium">
                        {subscription.billing_period === 'monthly' ? 'Mensuelle' : 'Annuelle'}
                      </div>
                    </div>
                  </div>

                  {periodEnd && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <TrendingUp className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="text-sm text-slate-500">
                          {subscription.cancel_at_period_end ? 'Se termine le' : 'Prochain renouvellement'}
                        </div>
                        <div className="font-medium">
                          {periodEnd.toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-slate-300">
                    <CreditCard className="w-5 h-5 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Prix</div>
                      <div className="font-medium text-2xl text-white">
                        {subscription.billing_period === 'monthly' 
                          ? currentPlan.prices.monthly 
                          : currentPlan.prices.yearly
                        }€
                        <span className="text-base text-slate-400 ml-2">
                          / {subscription.billing_period === 'monthly' ? 'mois' : 'an'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {subscription?.cancel_at_period_end && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Votre abonnement sera annulé à la fin de la période en cours
                  </p>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-3">
                {subscription ? (
                  <Button
                    onClick={openCustomerPortal}
                    disabled={isOpeningPortal}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isOpeningPortal ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ouverture...
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4 mr-2" />
                        Gérer l'abonnement
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push('/#pricing')}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Passer à un plan payant
                  </Button>
                )}
              </div>

              {subscription && (
                <p className="text-xs text-slate-500 mt-4 text-center">
                  Le portail Stripe vous permet de mettre à jour votre moyen de paiement,
                  consulter vos factures, changer de plan ou annuler votre abonnement.
                </p>
              )}
            </Card>

            {/* Caractéristiques du plan */}
            <Card className="bg-slate-900/50 border-slate-800 p-8">
              <h3 className="text-xl font-bold text-white mb-6">
                Caractéristiques de votre plan
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-slate-400 text-sm mb-2">Emails par mois</div>
                  <div className="text-3xl font-bold text-white">
                    {currentPlan.limits.emailsPerMonth.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-sm mb-2">Réponses automatiques</div>
                  <div className="text-3xl font-bold text-white">
                    {currentPlan.limits.autoRepliesPerMonth.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-sm mb-2">Comptes email</div>
                  <div className="text-3xl font-bold text-white">
                    {currentPlan.limits.emailAccounts === -1 
                      ? 'Illimité' 
                      : currentPlan.limits.emailAccounts
                    }
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-sm mb-2">Templates</div>
                  <div className="text-3xl font-bold text-white">
                    {currentPlan.limits.templates === -1 
                      ? 'Illimité' 
                      : currentPlan.limits.templates
                    }
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Widget d'utilisation */}
            <UsageWidget compact={false} />

            {/* Sécurité */}
            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Sécurité</h3>
              </div>
              
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Paiements sécurisés par Stripe</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Données chiffrées end-to-end</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Conformité RGPD</span>
                </div>
              </div>
            </Card>

            {/* Besoin d'aide */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 p-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Besoin d'aide ?
              </h3>
              <p className="text-sm text-slate-300 mb-4">
                Notre équipe est là pour vous aider avec votre abonnement.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-blue-500/30 hover:bg-blue-500/10"
                onClick={() => router.push('/contact')}
              >
                Contacter le support
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
