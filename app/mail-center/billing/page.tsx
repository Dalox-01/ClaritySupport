'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PRICING_SEGMENTS, type SegmentType, type PricingPlan } from '@/lib/constants/pricing';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Loader2, 
  Settings, 
  AlertCircle,
  CheckCircle2,
  Shield,
  Check,
  X,
  Sparkles,
  ShoppingCart,
  User,
  Building2,
  ArrowLeft
} from 'lucide-react';
import { UsageWidget } from '@/components/usage-widget';

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  current_period_start: string;
  current_period_end: string;
  billing_period: 'monthly' | 'yearly';
  cancel_at_period_end: boolean;
}

// Thèmes de couleur par segment
const SEGMENT_COLORS = {
  shopify: {
    primary: 'from-green-600 to-emerald-600',
    secondary: 'from-green-400 to-emerald-400',
    border: 'border-green-500',
    borderHover: 'hover:border-green-300/50',
    bg: 'from-green-50/50 to-emerald-50/50',
    badge: 'from-green-600 to-emerald-600',
    button: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
    buttonBorder: 'border-green-600/50 text-green-300 hover:bg-green-500/20',
    checkmark: 'from-green-500 to-emerald-500',
    footer: 'from-green-600 via-emerald-600 to-green-600',
  },
  freelance: {
    primary: 'from-blue-600 to-cyan-600',
    secondary: 'from-blue-400 to-cyan-400',
    border: 'border-blue-500',
    borderHover: 'hover:border-blue-300/50',
    bg: 'from-blue-50/50 to-cyan-50/50',
    badge: 'from-blue-600 to-cyan-600',
    button: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
    buttonBorder: 'border-blue-600/50 text-blue-300 hover:bg-blue-500/20',
    checkmark: 'from-blue-500 to-cyan-500',
    footer: 'from-blue-600 via-cyan-600 to-blue-600',
  },
  tpe: {
    primary: 'from-purple-600 to-pink-600',
    secondary: 'from-purple-400 to-pink-400',
    border: 'border-purple-500',
    borderHover: 'hover:border-purple-300/50',
    bg: 'from-purple-50/50 to-pink-50/50',
    badge: 'from-purple-600 to-pink-600',
    button: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    buttonBorder: 'border-purple-600/50 text-purple-300 hover:bg-purple-500/20',
    checkmark: 'from-purple-500 to-pink-500',
    footer: 'from-purple-600 via-pink-600 to-purple-600',
  },
};

// Component pour une carte de plan
function PlanCard({ 
  plan, 
  index, 
  segment,
  isCurrentPlan,
  onUpgrade,
  isUpgrading
}: { 
  plan: PricingPlan; 
  index: number; 
  segment: SegmentType;
  isCurrentPlan: boolean;
  onUpgrade: () => void;
  isUpgrading: boolean;
}) {
  const isPopular = plan.popular;
  const colors = SEGMENT_COLORS[segment];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className={`relative flex flex-col h-full rounded-2xl border-2 bg-gradient-to-br from-[#1a1f3a] to-[#0f1320] shadow-lg transition-all duration-300 hover:shadow-2xl ${
        isPopular
          ? `${colors.border} scale-105 md:scale-110 z-10`
          : `border-blue-500/20 ${colors.borderHover}`
      }`}
    >
      {/* Badge Recommandé */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${colors.badge} px-4 py-1.5 text-xs font-semibold text-white shadow-lg`}>
            <Sparkles className="h-3.5 w-3.5" />
            Recommandé
          </div>
        </div>
      )}

      {/* Badge Plan Actuel */}
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4 z-20">
          <div className="flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Plan actuel
          </div>
        </div>
      )}

      {/* Fond gradient subtil */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.bg} via-transparent opacity-20 transition-opacity duration-500`} />

      <div className="relative flex flex-col h-full p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
          <p className="text-sm text-gray-400 min-h-[40px]">{plan.description}</p>
        </div>

        {/* Prix */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl font-extrabold bg-gradient-to-r ${colors.secondary} bg-clip-text text-transparent`}>
              {plan.price}€
            </span>
            <span className="text-gray-400 font-medium">/{plan.period}</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onUpgrade}
          disabled={isCurrentPlan || isUpgrading}
          className={`w-full mb-6 h-12 text-base font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            isCurrentPlan
              ? 'bg-green-600 text-white'
              : isPopular
              ? `bg-gradient-to-r ${colors.button} text-white shadow-lg hover:shadow-xl hover:scale-105`
              : `bg-white/5 border-2 ${colors.buttonBorder}`
          }`}
        >
          {isUpgrading ? (
            <>
              <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : isCurrentPlan ? (
            <>
              <CheckCircle2 className="inline-block mr-2 h-4 w-4" />
              Plan actuel
            </>
          ) : (
            plan.cta
          )}
        </button>

        {/* Features List */}
        <div className="flex-1">
          <div className="space-y-3">
            {plan.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 group/feature"
              >
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-transform duration-200 group-hover/feature:scale-110 ${
                    feature.included
                      ? `bg-gradient-to-br ${colors.checkmark}`
                      : 'bg-gray-700'
                  }`}
                >
                  {feature.included ? (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  ) : (
                    <X className="h-3 w-3 text-gray-500" strokeWidth={2} />
                  )}
                </div>
                <span
                  className={`text-sm leading-relaxed ${
                    feature.included
                      ? 'text-gray-200 font-medium'
                      : 'text-gray-500 line-through'
                  }`}
                >
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer gradient bar (only for popular) */}
        {isPopular && (
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.footer} rounded-b-2xl`} />
        )}
      </div>
    </motion.div>
  );
}

// Component pour le sélecteur de segment
function SegmentSelector({
  activeSegment,
  onSegmentChange,
}: {
  activeSegment: SegmentType;
  onSegmentChange: (segment: SegmentType) => void;
}) {
  // Couleurs des boutons par segment
  const getSegmentColors = (segmentId: SegmentType) => {
    const colors = {
      shopify: { active: 'from-green-600 to-emerald-600', shadow: 'shadow-green-400/50', glow: 'from-green-600 to-emerald-600' },
      freelance: { active: 'from-blue-600 to-cyan-600', shadow: 'shadow-blue-400/50', glow: 'from-blue-600 to-cyan-600' },
      tpe: { active: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-400/50', glow: 'from-purple-600 to-pink-600' },
    };
    return colors[segmentId];
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
      {PRICING_SEGMENTS.map((segment) => {
        const Icon = segment.icon;
        const isActive = activeSegment === segment.id;
        const segmentColors = getSegmentColors(segment.id);

        return (
          <motion.button
            key={segment.id}
            onClick={() => onSegmentChange(segment.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-base
              transition-all duration-300 shadow-md hover:shadow-lg
              w-full sm:w-auto min-w-[180px] justify-center
              ${
                isActive
                  ? `bg-gradient-to-r ${segmentColors.active} text-white scale-105 ${segmentColors.shadow}`
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border-2 border-blue-500/20'
              }
            `}
          >
            {/* Background glow for active */}
            {isActive && (
              <motion.div
                layoutId="activeSegmentBilling"
                className={`absolute inset-0 rounded-xl bg-gradient-to-r ${segmentColors.glow} blur-sm opacity-50`}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            {/* Icon */}
            <Icon
              className={`h-5 w-5 transition-transform duration-300 relative z-10 ${
                isActive ? 'rotate-12' : ''
              }`}
            />

            {/* Label */}
            <span className="relative z-10">{segment.label}</span>

            {/* Active indicator dot */}
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0A0E27] shadow-sm"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentPlanDisplay, setCurrentPlanDisplay] = useState<string>('Gratuit');
  const [currentSegment, setCurrentSegment] = useState<SegmentType>('shopify');
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<SegmentType>('shopify');

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

      // Charger le plan actuel depuis plan-enforcement
      const planResponse = await fetch('/api/plan/current');
      if (planResponse.ok) {
        const planData = await planResponse.json();
        setCurrentPlanDisplay(planData.planDisplay || 'Gratuit');
        setCurrentSegment(planData.segment || 'shopify');
        setActiveSegment(planData.segment || 'shopify');
      }

      // Charger la subscription Stripe
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

  const handleUpgrade = async (planName: string) => {
    try {
      setIsUpgrading(planName);
      setError(null);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planName.toLowerCase(),
          billingPeriod: 'monthly',
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

  const currentPlanName = subscription?.plan || 'free';
  const periodEnd = subscription ? new Date(subscription.current_period_end) : null;
  const currentPlans = PRICING_SEGMENTS.find((s) => s.id === activeSegment)?.plans || [];
  
  // Vérifier si le plan correspond au segment actif
  const isCurrentPlan = (planName: string) => {
    // Comparer en fonction du segment actuel de l'utilisateur ET du segment sélectionné
    if (currentSegment !== activeSegment) return false;
    return currentPlanDisplay.toUpperCase().includes(planName.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0f1629] to-[#0A0E27] py-12 px-4">
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
            Choisissez le plan parfait pour votre activité
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
                <div className="text-2xl font-bold text-white">{currentPlanDisplay}</div>
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

        {/* Segment Selector */}
        <SegmentSelector
          activeSegment={activeSegment}
          onSegmentChange={setActiveSegment}
        />

        {/* Pricing Plans with 3D rotation */}
        <div
          className="relative mb-12"
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d',
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeSegment}
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{
                duration: 0.3,
                ease: [0.32, 0.72, 0, 1],
                rotateY: { duration: 0.3 },
                opacity: { duration: 0.2 },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-6"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {currentPlans.map((plan, index) => {
                const isPlanCurrent = isCurrentPlan(plan.name);
                
                return (
                  <div
                    key={`${activeSegment}-${plan.name}`}
                    className={`flex ${plan.popular ? 'md:my-0' : 'md:my-4'}`}
                  >
                    <PlanCard 
                      plan={plan} 
                      index={index} 
                      segment={activeSegment}
                      isCurrentPlan={isPlanCurrent}
                      onUpgrade={() => handleUpgrade(plan.name)}
                      isUpgrading={isUpgrading === plan.name}
                    />
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
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
