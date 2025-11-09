'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const plans = [
  {
    id: 'starter',
    name: 'STARTER',
    price: 49,
    period: 'mois',
    description: 'Pour les petites équipes',
    icon: Rocket,
    iconColor: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
    borderGradient: 'from-blue-500/50 to-cyan-500/50',
    features: [
      '3 comptes email',
      '2,500 emails/mois',
      '2,500 réponses automatiques',
      'IA de base',
      'Base de connaissances',
      '2 membres d\'équipe',
      '10 templates personnalisés',
    ],
    cta: 'Démarrer avec Starter',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'PRO',
    price: 139,
    period: 'mois',
    description: 'Pour les équipes en croissance',
    icon: Crown,
    iconColor: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-500',
    borderGradient: 'from-purple-500/50 to-pink-500/50',
    features: [
      '10 comptes email',
      '7,500 emails/mois',
      '7,500 réponses automatiques',
      'IA avancée + personnalisation',
      'Base de connaissances complète',
      'Analytics détaillées',
      'Branding personnalisé',
      '5 membres d\'équipe',
      '50 templates personnalisés',
      'Support prioritaire',
    ],
    cta: 'Choisir Pro - Recommandé',
    highlighted: true,
    badge: 'PLUS POPULAIRE',
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: 229,
    period: 'mois',
    description: 'Pour les grandes équipes',
    icon: Zap,
    iconColor: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-500',
    borderGradient: 'from-amber-500/50 to-orange-500/50',
    features: [
      'Comptes email illimités',
      '25,000 emails/mois',
      '25,000 réponses automatiques',
      'IA premium + personnalisation avancée',
      'Base de connaissances illimitée',
      'Analytics avancées',
      'Branding personnalisé',
      '20 membres d\'équipe',
      'Templates illimités',
      'Support dédié (prioritaire)',
      'Gestionnaire de compte dédié',
    ],
    cta: 'Passer à Enterprise',
    highlighted: false,
  },
];

export function DarkPricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();
  const { data: session } = useSession();

  const handlePlanClick = async (planId: string) => {
    // If user is not authenticated, redirect to sign in
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingPeriod,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session:', data.error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A0E27] via-[#0f1629] to-[#0A0E27] py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Des tarifs{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              transparents et flexibles
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-400"
          >
            Choisissez le plan qui correspond à vos besoins. Changez ou annulez à tout moment.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
              Mensuel
            </span>
            <motion.button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative h-8 w-16 rounded-full border border-blue-500/30 bg-blue-500/10"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50"
                animate={{
                  x: billingPeriod === 'monthly' ? 2 : 34,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
            <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
              Annuel
              <span className="ml-2 rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                -20%
              </span>
            </span>
          </motion.div>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const finalPrice = billingPeriod === 'yearly' ? plan.price * 0.8 : plan.price;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  scale: plan.highlighted ? 1.05 : 1.03,
                  rotateY: plan.highlighted ? 3 : 2,
                  transition: { duration: 0.3 },
                }}
                className={`group relative ${plan.highlighted ? 'lg:-mt-4' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Badge */}
                {plan.badge && (
                  <motion.div
                    className="absolute -top-4 left-1/2 z-20 -translate-x-1/2"
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.span
                      className="inline-block rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/50"
                      animate={{
                        boxShadow: [
                          '0 10px 30px rgba(59, 130, 246, 0.3)',
                          '0 10px 50px rgba(59, 130, 246, 0.5)',
                          '0 10px 30px rgba(59, 130, 246, 0.3)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {plan.badge}
                    </motion.span>
                  </motion.div>
                )}

                <div
                  className={`relative h-full overflow-hidden rounded-3xl border ${
                    plan.highlighted ? 'border-blue-500/30' : 'border-blue-500/10'
                  } bg-gradient-to-br from-[#1a1f3a] to-[#0f1320] p-8 transition-all duration-300 ${
                    plan.highlighted ? 'shadow-2xl shadow-blue-500/20' : ''
                  } group-hover:border-blue-500/50`}
                >
                  {/* Animated border on hover */}
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, transparent 0%, ${
                        plan.highlighted ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)'
                      } 50%, transparent 100%)`,
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${plan.gradient} p-4`}
                    whileHover={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: 1.15,
                      transition: { duration: 0.5 },
                    }}
                    animate={
                      plan.highlighted
                        ? {
                            boxShadow: [
                              '0 0 0 0 rgba(59, 130, 246, 0)',
                              '0 0 40px 10px rgba(59, 130, 246, 0.4)',
                              '0 0 0 0 rgba(59, 130, 246, 0)',
                            ],
                          }
                        : {}
                    }
                    transition={{
                      boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                    }}
                  >
                    <Icon className={`h-7 w-7 ${plan.iconColor}`} />
                  </motion.div>

                  {/* Plan name */}
                  <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="mb-6 text-sm text-gray-400">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <motion.div
                      className="flex items-baseline gap-2"
                      key={billingPeriod}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-5xl font-bold text-white">
                        {finalPrice === 0 ? 'Gratuit' : `${finalPrice.toFixed(2)}€`}
                      </span>
                      {finalPrice > 0 && <span className="text-gray-400">/{plan.period}</span>}
                    </motion.div>
                    {billingPeriod === 'yearly' && finalPrice > 0 && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 text-sm text-green-400"
                      >
                        Soit {(finalPrice * 12).toFixed(2)}€/an au lieu de {(plan.price * 12).toFixed(2)}€
                      </motion.p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mb-8 space-y-4">
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
                        </motion.div>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.button
                    onClick={() => handlePlanClick(plan.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group/btn relative w-full overflow-hidden rounded-full py-4 font-bold transition-all ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/70'
                        : 'border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:border-blue-500/50 hover:bg-blue-500/20'
                    }`}
                  >
                    <span className="relative z-10">{plan.cta}</span>
                    {plan.highlighted && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </motion.button>
                </div>

                {/* Glow effect */}
                {plan.highlighted && (
                  <motion.div
                    className={`absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${plan.gradient} opacity-0 blur-2xl group-hover:opacity-30 transition-opacity duration-500`}
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-sm text-gray-500"
        >
          Tous les plans incluent une période d&apos;essai de 30 jours. Aucune carte bancaire requise.
        </motion.p>
      </div>
    </section>
  );
}
