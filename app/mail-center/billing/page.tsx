'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PRICING_PLANS, type PlanType } from '@/lib/pricing-plans';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Loader2, 
  Settings, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Shield,
  Check,
  Crown,
  ArrowLeft
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
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

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
      if (data.subscription) {
        setBillingPeriod(data.subscription.billing_period);
      }

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

  const handleUpgrade = async (planId: PlanType) => {
    if (planId === 'free') return;

    try {
      setIsUpgrading(planId);
      setError(null);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          billingPeriod,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création de la session');
      }

      const { url } = await response.json();
      window.location.href = url;

    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsUpgrading(null);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const currentPlanId = subscription?.plan || 'free';
  const currentPlan = PRICING_PLANS[currentPlanId];
  const periodEnd = subscription ? new Date(subscription.current_period_end) : null;

  const plans: PlanType[] = ['free', 'starter', 'pro', 'enterprise'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <Button
            variant="ghost"
            onClick={() => router.push('/mail-center')}
            className="mb-6 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au Mail Center
          </Button>

          <h1 className="mb-2 text-4xl font-bold text-white">
            Gestion de l'abonnement
          </h1>
          <p className="text-slate-400">
            Gérez votre abonnement et passez à un plan supérieur
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Abonnement actuel */}
        {subscription && (
          <Card className="mb-8 border-slate-800 bg-slate-900/50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="mb-1 text-sm text-slate-400">Plan actuel</div>
                <div className="text-2xl font-bold text-white">{currentPlan.name}</div>
              </div>

              {periodEnd && (
                <div className="text-right">
                  <div className="mb-1 text-sm text-slate-400">
                    {subscription.cancel_at_period_end ? 'Se termine le' : 'Renouvellement le'}
                  </div>
                  <div className="font-medium text-white">
                    {periodEnd.toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              )}

              <Button
                onClick={openCustomerPortal}
                disabled={isOpeningPortal}
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
              >
                {isOpeningPortal ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Gérer
                  </>
                )}
              </Button>
            </div>

            {subscription.cancel_at_period_end && (
              <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                <p className="text-sm text-yellow-400">
                  ⚠️ Votre abonnement sera annulé à la fin de la période en cours
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Toggle période */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-full bg-slate-900/50 p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annuel
              <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                -16%
              </span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((planId, index) => {
            const plan = PRICING_PLANS[planId];
            const isCurrentPlan = currentPlanId === planId;
            const price = billingPeriod === 'monthly' ? plan.prices.monthly : plan.prices.yearly;
            const isPopular = plan.highlighted;

            return (
              <motion.div
                key={planId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {isPopular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 text-xs font-medium text-white">
                      <Crown className="h-3 w-3" />
                      Recommandé
                    </div>
                  </div>
                )}

                <Card
                  className={`relative h-full overflow-hidden border p-6 transition-all ${
                    isPopular
                      ? 'border-blue-500/50 bg-gradient-to-b from-blue-500/10 to-purple-500/10'
                      : 'border-slate-800 bg-slate-900/50'
                  } ${isCurrentPlan ? 'ring-2 ring-green-500/50' : ''}`}
                >
                  {isCurrentPlan && (
                    <div className="absolute right-4 top-4">
                      <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Actif
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="mb-1 text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-slate-400">{plan.tagline}</p>
                  </div>

                  {/* Prix */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">{price}€</span>
                      {planId !== 'free' && (
                        <span className="text-slate-400">
                          /{billingPeriod === 'monthly' ? 'mois' : 'an'}
                        </span>
                      )}
                    </div>
                    {billingPeriod === 'yearly' && planId !== 'free' && (
                      <p className="mt-1 text-xs text-green-400">
                        {Math.round(price / 12)}€/mois facturé annuellement
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mb-6 space-y-3">
                    {plan.featureList.slice(0, 7).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={() => handleUpgrade(planId)}
                    disabled={isCurrentPlan || isUpgrading === planId || planId === 'free'}
                    className={`w-full ${
                      isPopular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        : isCurrentPlan
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    {isUpgrading === planId ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Chargement...
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Plan actuel
                      </>
                    ) : planId === 'free' ? (
                      'Plan gratuit'
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {plan.cta}
                      </>
                    )}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Usage & Security */}
        <div className="grid gap-6 md:grid-cols-2">
          <UsageWidget compact={false} />

          <Card className="border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Sécurité & Support</h3>
            </div>
            
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                <span>Paiements sécurisés par Stripe</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                <span>Données chiffrées end-to-end</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                <span>Conformité RGPD</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                <span>Annulation possible à tout moment</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="mt-6 w-full border-slate-700 hover:bg-slate-800"
              onClick={() => router.push('/contact')}
            >
              Contacter le support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
