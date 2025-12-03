'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { LiquidButton } from '@/components/ui/liquid-button';
import { ElasticCard } from '@/components/ui/elastic-card';

type PaidPlan = 'STARTER' | 'PRO';

interface RevolutionaryPricingProps {
  sessionPlan?: string | null;
  loadingPlan: PaidPlan | null;
  handleUpgrade: (plan: PaidPlan) => void;
  handleGetStarted: () => void;
  isAuthenticated: boolean;
}

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: { monthly: 0, annual: 0 },
    description: 'Pour découvrir le Mail Center',
    features: [
      '1 compte Gmail ou Outlook',
      '50 emails générés par mois',
      'Organisation par statuts basique',
      'Historique 30 jours',
    ],
    gradient: 'from-gray-400 to-gray-600',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: { monthly: 7.99, annual: 79.9 },
    description: 'Pour les indépendants',
    plan: 'STARTER' as PaidPlan,
    popular: true,
    features: [
      '3 comptes Gmail/Outlook',
      '500 emails générés/mois',
      'Organisation complète par statuts',
      '5 réponses automatiques',
      'Filtres et recherche avancée',
      'Analytics & rapports',
      'Export PDF sans watermark',
    ],
    gradient: 'from-[#1E6F5C] to-[#26AB8C]',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 18.99, annual: 189.9 },
    description: 'Pour les équipes performantes',
    plan: 'PRO' as PaidPlan,
    features: [
      'Comptes illimités Gmail/Outlook',
      '5000 emails générés/mois',
      'Réponses automatiques illimitées',
      'Chatbot IA expert intégré',
      'Templates & signatures illimités',
      'Analytics avancés en temps réel',
      'API & intégrations',
      'Support prioritaire 24/7',
    ],
    gradient: 'from-purple-600 to-pink-600',
  },
];

export function RevolutionaryPricing({
  sessionPlan,
  loadingPlan,
  handleUpgrade,
  handleGetStarted,
  isAuthenticated,
}: RevolutionaryPricingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-gradient-to-br from-[#F5F1E7] via-white to-[#E8E2D0] py-24 sm:py-32 lg:py-40"
    >
      {/* Decorative blobs */}
      <motion.div
        className="pointer-events-none absolute left-0 top-1/4 h-96 w-96 rounded-full bg-[#1E6F5C]/5 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-1/4 right-0 h-96 w-96 rounded-full bg-[#26AB8C]/5 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center"
        >
          <motion.h2
            className="mb-6 text-4xl font-bold tracking-tight text-[#6B4F3A] sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Tarifs simples et{' '}
            <span className="bg-gradient-to-r from-[#1E6F5C] to-[#26AB8C] bg-clip-text text-transparent">
              transparents.
            </span>
          </motion.h2>
          <motion.p
            className="mx-auto mb-10 max-w-2xl text-lg text-[#6B4F3A]/70 sm:text-xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Commencez gratuitement. Évoluez quand vous êtes prêt.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            className="inline-flex items-center gap-3 rounded-full border-2 border-[#1E6F5C]/20 bg-white p-1.5 shadow-md"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {(['monthly', 'annual'] as const).map((cycle) => (
              <motion.button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`relative rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                  billingCycle === cycle
                    ? 'text-white'
                    : 'text-[#6B4F3A]/60 hover:text-[#6B4F3A]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {billingCycle === cycle && (
                  <motion.div
                    layoutId="billing-bg"
                    className="absolute inset-0 rounded-full bg-[#1E6F5C]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {cycle === 'monthly' ? 'Mensuel' : 'Annuel'}
                  {cycle === 'annual' && (
                    <motion.span
                      className="ml-2 text-xs text-[#26AB8C]"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      -17%
                    </motion.span>
                  )}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const isCurrent = plan.plan && sessionPlan === plan.plan;
            const isLoading = plan.plan && loadingPlan === plan.plan;
            const isFree = plan.id === 'free';
            const price =
              billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual / 12;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative"
              >
                <ElasticCard
                  className={`h-full p-8 ${
                    plan.popular
                      ? 'border-2 border-[#1E6F5C] shadow-xl shadow-[#1E6F5C]/20'
                      : ''
                  }`}
                  hoverLift={!isCurrent}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <motion.div
                      className="absolute -top-4 left-1/2 -translate-x-1/2"
                      initial={{ opacity: 0, scale: 0, rotate: -10 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    >
                      <div
                        className={`rounded-full bg-gradient-to-r ${plan.gradient} px-4 py-1.5 text-xs font-bold text-white shadow-lg`}
                      >
                        Populaire
                      </div>
                    </motion.div>
                  )}

                  {isCurrent && (
                    <motion.div
                      className="absolute -top-4 left-1/2 -translate-x-1/2"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                        Plan actuel
                      </div>
                    </motion.div>
                  )}

                  {/* Plan name & description */}
                  <div className="mb-6">
                    <h3 className="mb-2 text-2xl font-bold text-[#6B4F3A]">{plan.name}</h3>
                    <p className="text-sm text-[#6B4F3A]/60">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <motion.span
                        className={`text-5xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}
                        key={price}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {price.toFixed(2)}€
                      </motion.span>
                      <span className="text-[#6B4F3A]/60">/mois</span>
                    </div>
                    {billingCycle === 'annual' && !isFree && (
                      <motion.p
                        className="mt-2 text-sm text-[#6B4F3A]/60"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        Facturé {plan.price.annual}€ par an
                      </motion.p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={feature}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.4,
                          delay: 0.5 + i * 0.05,
                        }}
                        whileHover={{ x: 5 }}
                      >
                        <motion.div whileHover={{ scale: 1.3, rotate: 360 }}>
                          <Check className="h-5 w-5 flex-shrink-0 text-[#26AB8C]" strokeWidth={3} />
                        </motion.div>
                        <span className="text-sm text-[#6B4F3A]/80">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <LiquidButton
                    variant={plan.popular ? 'primary' : isFree ? 'outline' : 'secondary'}
                    size="md"
                    onClick={() =>
                      isFree
                        ? handleGetStarted()
                        : plan.plan && handleUpgrade(plan.plan)
                    }
                    disabled={isCurrent || isLoading}
                    magnetic={!isCurrent && !isLoading}
                    ripple
                    className="w-full"
                  >
                    {isCurrent
                      ? 'Plan actuel'
                      : isLoading
                      ? 'Redirection...'
                      : isFree
                      ? isAuthenticated
                        ? 'Accéder au dashboard'
                        : 'Commencer gratuitement'
                      : 'Commencer'}
                    {!isCurrent && !isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </LiquidButton>
                </ElasticCard>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center text-sm text-[#6B4F3A]/60"
        >
          Tous les plans incluent une période d&rsquo;essai gratuite de 30 jours. Aucune carte
          bancaire requise.
        </motion.p>
      </div>
    </section>
  );
}
