'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PLANS, type PlanType } from '@/lib/pricing-plans';
import { Button } from '@/components/ui/button';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [planType, setPlanType] = useState<PlanType>('starter');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceId, setPriceId] = useState<string | null>(null);

  useEffect(() => {
    // Nouveau système avec priceId
    const price = searchParams.get('priceId');
    if (price) {
      setPriceId(price);
      setIsLoading(true);
      // Créer immédiatement la session Stripe avec le priceId
      handleCheckoutWithPriceId(price);
      return;
    }

    // Ancien système avec plan et period (pour rétrocompatibilité)
    const plan = searchParams.get('plan') as PlanType;
    const period = searchParams.get('period') as 'monthly' | 'yearly';

    if (plan && (plan === 'starter' || plan === 'pro' || plan === 'scale')) {
      setPlanType(plan);
    }
    if (period && (period === 'monthly' || period === 'yearly')) {
      setBillingPeriod(period);
    }
  }, [searchParams]);

  const handleCheckoutWithPriceId = async (stripePriceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: stripePriceId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création de la session');
      }

      const { url } = await response.json();
      
      // Rediriger vers Stripe Checkout
      window.location.href = url;

    } catch (err) {
      console.error('Erreur checkout:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsLoading(false);
    }
  };

  const selectedPlan = PLANS[planType];

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planType,
          billingPeriod,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création de la session');
      }

      const { url } = await response.json();
      
      // Rediriger vers Stripe Checkout
      window.location.href = url;

    } catch (err) {
      console.error('Erreur checkout:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsLoading(false);
    }
  };

  const monthlyPrice = selectedPlan.prices.monthly;
  const yearlyPrice = selectedPlan.prices.yearly;
  const displayPrice = billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice;
  const savings = billingPeriod === 'yearly' ? monthlyPrice * 12 - yearlyPrice : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Finaliser votre abonnement
          </h1>
          <p className="text-slate-400 text-lg">
            Vous avez choisi le plan <span className="text-blue-400 font-semibold">{selectedPlan.name}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Détails du plan */}
          <Card className="bg-slate-900/50 border-slate-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Détails du plan</h2>

            {/* Sélection période */}
            <div className="mb-8">
              <label className="text-sm font-medium text-slate-300 mb-3 block">
                Période de facturation
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    billingPeriod === 'monthly'
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all relative ${
                    billingPeriod === 'yearly'
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  Annuel
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    -17%
                  </span>
                </button>
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-white">Ce qui est inclus :</h3>
              <div className="space-y-3">
                {selectedPlan.featureList.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Économies */}
            {billingPeriod === 'yearly' && savings > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <p className="text-green-400 font-medium text-center">
                  ✨ Économisez {savings}€ par an avec la facturation annuelle
                </p>
              </div>
            )}
          </Card>

          {/* Récapitulatif */}
          <Card className="bg-slate-900/50 border-slate-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Récapitulatif</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400">Plan</span>
                <span className="text-white font-semibold">{selectedPlan.name}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400">Facturation</span>
                <span className="text-white">
                  {billingPeriod === 'monthly' ? 'Mensuelle' : 'Annuelle'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400">Emails / mois</span>
                <span className="text-white">{selectedPlan.limits.emailsPerMonth.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400">Réponses auto / mois</span>
                <span className="text-white">{selectedPlan.limits.autoRepliesPerMonth.toLocaleString()}</span>
              </div>
            </div>

            {/* Prix total */}
            <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 text-lg">Total</span>
                <div className="text-right">
                  <div className="text-4xl font-bold text-white">
                    {displayPrice}€
                  </div>
                  <div className="text-slate-400 text-sm mt-1">
                    {billingPeriod === 'monthly' ? 'par mois' : 'par an'}
                  </div>
                  {billingPeriod === 'yearly' && (
                    <div className="text-slate-500 text-sm">
                      Soit {(yearlyPrice / 12).toFixed(2)}€/mois
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Bouton paiement */}
            <Button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirection vers le paiement...
                </>
              ) : (
                'Procéder au paiement'
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center mt-4">
              Paiement sécurisé via Stripe. Vos données sont protégées.
            </p>
          </Card>
        </div>

        {/* Garantie */}
        <div className="mt-12 text-center">
          <p className="text-slate-400">
            💳 Paiement sécurisé • 🔒 Données chiffrées • ✅ Annulation à tout moment
          </p>
        </div>
      </div>
    </div>
  );
}
