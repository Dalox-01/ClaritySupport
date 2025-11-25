'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useState } from 'react';

type PaidPlan = 'STARTER' | 'PRO';

interface ClarityPricingProps {
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
  },
];

export function ClarityPricing({
  sessionPlan,
  loadingPlan,
  handleUpgrade,
  handleGetStarted,
  isAuthenticated,
}: ClarityPricingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section id="pricing" className="relative overflow-hidden bg-gray-50 py-16 dark:bg-gray-950 sm:py-20 lg:py-24">
      {/* Animated background */}
      <motion.div 
        className="pointer-events-none absolute inset-0 opacity-40"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.1) 1px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
      />
      
      <motion.div 
        className="pointer-events-none absolute left-1/4 top-20 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <motion.h2 
            className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent dark:from-white dark:via-blue-400 dark:to-white">
              Tarifs simples et transparents.
            </span>
          </motion.h2>
          <motion.p 
            className="mx-auto mb-8 max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:text-lg"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Commencez gratuitement. Évoluez quand vous êtes prêt.
          </motion.p>

          <motion.div 
            className="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.button
              onClick={() => setBillingCycle('monthly')}
              className={`relative rounded-full px-6 py-2 text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Mensuel
            </motion.button>
            <motion.button
              onClick={() => setBillingCycle('annual')}
              className={`relative rounded-full px-6 py-2 text-sm font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Annuel
              <motion.span 
                className="ml-2 text-xs text-green-600 dark:text-green-400"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                -17%
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const isCurrent = plan.plan && sessionPlan === plan.plan;
            const isLoading = plan.plan && loadingPlan === plan.plan;
            const isFree = plan.id === 'free';
            const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual / 12;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ 
                  y: -10, 
                  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } 
                }}
                className={`group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-md transition-all hover:shadow-2xl dark:bg-gray-900 ${
                  plan.popular
                    ? 'border-blue-600 shadow-xl shadow-blue-500/20 dark:border-blue-500 dark:shadow-blue-500/30'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
                }`}
              >
                {/* Animated gradient background on hover */}
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background: plan.popular
                      ? "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1), transparent 70%)"
                      : "radial-gradient(circle at 50% 0%, rgba(156, 163, 175, 0.05), transparent 70%)",
                  }}
                />
                
                {/* Shimmer effect on hover */}
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
                  }}
                />
                {plan.popular && (
                  <motion.div 
                    className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1 text-xs font-medium text-white shadow-lg dark:from-blue-500 dark:to-blue-600"
                    initial={{ opacity: 0, scale: 0, rotate: -10 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(59, 130, 246, 0.4)",
                        "0 0 0 8px rgba(59, 130, 246, 0)",
                      ],
                    }}
                    transition={{
                      duration: 0.5,
                      delay: 0.3,
                      type: "spring",
                      stiffness: 200,
                      boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                    }}
                  >
                    Populaire
                  </motion.div>
                )}

                {isCurrent && (
                  <motion.div 
                    className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-1 text-xs font-medium text-white shadow-lg"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                  >
                    Plan actuel
                  </motion.div>
                )}

                <div className="relative mb-8">
                  <motion.h3 
                    className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {plan.name}
                  </motion.h3>
                  <motion.p 
                    className="text-sm text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                  >
                    {plan.description}
                  </motion.p>
                </div>

                <motion.div 
                  className="relative mb-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="flex items-baseline gap-2">
                    <motion.span 
                      className="bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-5xl font-semibold text-transparent dark:from-white dark:to-blue-400"
                      key={price}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {price.toFixed(2)}€
                    </motion.span>
                    <span className="text-gray-600 dark:text-gray-400">/mois</span>
                  </div>
                  {billingCycle === 'annual' && !isFree && (
                    <motion.p 
                      className="mt-2 text-sm text-gray-600 dark:text-gray-400"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      Facturé {plan.price.annual}€ par an
                    </motion.p>
                  )}
                </motion.div>

                <ul className="relative mb-8 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li 
                      key={feature} 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.4 + featureIndex * 0.05,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    >
                      <motion.div
                        whileHover={{ 
                          scale: 1.2, 
                          rotate: 360,
                          transition: { duration: 0.4 }
                        }}
                      >
                        <Check className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                      </motion.div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {isFree ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Button
                      onClick={handleGetStarted}
                      variant="outline"
                      className="group relative h-12 w-full overflow-hidden rounded-full border-gray-300 text-base font-medium transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <motion.span
                        className="relative z-10"
                        whileHover={{ scale: 1.05 }}
                      >
                        {isAuthenticated ? 'Accéder au dashboard' : 'Commencer gratuitement'}
                      </motion.span>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Button
                      onClick={() => plan.plan && handleUpgrade(plan.plan)}
                      disabled={isCurrent || isLoading}
                      className={`group relative h-12 w-full overflow-hidden rounded-full text-base font-medium transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/50 dark:from-blue-500 dark:to-blue-600'
                          : 'bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 dark:from-white dark:to-gray-100 dark:text-gray-900'
                      }`}
                    >
                      <motion.span
                        className="relative z-10 flex items-center justify-center"
                        whileHover={{ scale: isCurrent || isLoading ? 1 : 1.05 }}
                        whileTap={{ scale: isCurrent || isLoading ? 1 : 0.95 }}
                      >
                        {isCurrent ? 'Plan actuel' : isLoading ? 'Redirection...' : 'Commencer'}
                      </motion.span>
                      
                      {/* Button shine effect */}
                      {!isCurrent && !isLoading && (
                        <motion.div
                          className="pointer-events-none absolute inset-0"
                          initial={{ x: "-100%", opacity: 0 }}
                          whileHover={{ x: "200%", opacity: 0.3 }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          style={{
                            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
                          }}
                        />
                      )}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400"
        >
          Tous les plans incluent une période d&rsquo;essai gratuite de 30 jours. Aucune carte bancaire requise.
        </motion.p>
      </div>
    </section>
  );
}

