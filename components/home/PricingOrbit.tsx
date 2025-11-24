'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

type PaidPlan = 'STARTER' | 'PRO';

interface PricingOrbitProps {
  sessionPlan?: string | null;
  loadingPlan: PaidPlan | null;
  handleUpgrade: (plan: PaidPlan) => void;
  handleGetStarted: () => void;
  isAuthenticated: boolean;
}

const tiers = [
  {
    id: 'free',
    name: 'Explorateur',
    price: '0€',
    cadence: '/mois',
    description: 'Entrez dans le vortex de MailWizard sans carte bancaire.',
    accent: 'from-[#3bffd9]/35 to-transparent',
    features: [
      '10 emails/mois',
      'Templates professionnels',
      'Export PDF (watermark)',
      'Historique 30 jours',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '7,99€',
    cadence: '/mois',
    description: 'Le hub idéal pour les créateurs en solo et consultants.',
    accent: 'from-[#8f6dff]/35 to-transparent',
    badge: '⭐ Populaire',
    plan: 'STARTER' as PaidPlan,
    features: [
      '500 emails/mois',
      '3 signatures personnalisées',
      'Variables dynamiques illimitées',
      '10 templates privés',
      'Dictée vocale',
      'Export PDF sans watermark',
      'Historique illimité',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '18,99€',
    cadence: '/mois',
    description: 'Pensé pour les équipes performantes et le support premium.',
    accent: 'from-[#ff8ed1]/35 to-transparent',
    badge: '🔥 Best Value',
    plan: 'PRO' as PaidPlan,
    features: [
      '5000 emails/mois',
      'Signatures illimitées',
      'Variables illimitées',
      'Templates illimités',
      'Dictée vocale avancée',
      'Chatbot IA expert',
      'Historique illimité',
      'Support prioritaire 24/7',
    ],
  },
];

export function PricingOrbit({
  sessionPlan,
  loadingPlan,
  handleUpgrade,
  handleGetStarted,
  isAuthenticated,
}: PricingOrbitProps) {
  return (
    <section id="pricing" className="relative overflow-hidden bg-[#06020d] py-32 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(46,255,221,0.2),transparent_60%)]" />
      <motion.div
        className="pointer-events-none absolute inset-y-0 left-1/2 h-[120%] w-[110%] -translate-x-1/2 rounded-full bg-[conic-gradient(from_120deg_at_50%_50%,rgba(98,255,233,0.25),rgba(125,84,255,0.35),rgba(255,126,208,0.28),rgba(98,255,233,0.25))] blur-[120px] opacity-70"
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:px-12">
        <div className="flex flex-col gap-6 text-center">
          <motion.div
            className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.5em] text-white/55"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="h-4 w-4 text-[#62ffe9]" />
            Orbit Pricing
          </motion.div>
          <motion.h2
            className="text-balance text-4xl font-semibold md:text-5xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Choisissez l&rsquo;orbite qui correspond à vos ambitions.
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl text-base text-white/65"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.65, delay: 0.15 }}
          >
            Commencez gratuitement, montez en puissance quand vous êtes prêt. Résiliation en un clic, accès immédiat à toutes les fonctionnalités avancées.
          </motion.p>
        </div>

        <div className="relative grid gap-10 md:grid-cols-3">
          {tiers.map((tier, index) => {
            const isCurrent = tier.plan && sessionPlan === tier.plan;
            const isLoading = tier.plan && loadingPlan === tier.plan;
            const isFree = tier.id === 'free';

            return (
              <motion.article
                key={tier.id}
                className="group relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-white/10/30 p-10 backdrop-blur-3xl shadow-[0_30px_120px_rgba(86,73,255,0.26)]"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: index * 0.12 }}
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tier.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                <div className="relative flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/45">{tier.id === 'free' ? 'Exploration' : 'Subscription'}</p>
                      <h3 className="mt-3 text-3xl font-semibold text-white">{tier.name}</h3>
                    </div>
                    {tier.badge && (
                      <Badge className="rounded-full bg-white/15 px-4 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-white/70" variant="outline">
                        {tier.badge}
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge className="rounded-full bg-[#38ffd8]/20 px-4 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-[#38ffd8]">
                        Plan actuel
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-end gap-2 text-white">
                    <span className="text-5xl font-bold">{tier.price}</span>
                    <span className="text-sm text-white/60">{tier.cadence}</span>
                  </div>
                  <p className="text-sm text-white/65">{tier.description}</p>

                  <ul className="space-y-3 text-sm text-white/70">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="mt-1 h-4 w-4 text-[#62ffe9]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2">
                    {isFree ? (
                      <Button
                        onClick={handleGetStarted}
                        variant="outline"
                        className="w-full rounded-full border-white/25 bg-white/10 py-4 text-sm text-white transition-all duration-500 hover:border-white hover:bg-white/20"
                      >
                        {isAuthenticated ? 'Accéder au dashboard' : 'Commencer gratuitement'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => tier.plan && handleUpgrade(tier.plan)}
                        disabled={isCurrent || isLoading}
                        className="w-full rounded-full bg-gradient-to-r from-[#34ffe0] via-[#745dff] to-[#34ffe0] py-4 text-sm font-semibold text-black shadow-[0_18px_60px_rgba(97,255,233,0.45)] transition-transform duration-500 hover:scale-[1.02]"
                      >
                        {isCurrent ? '✓ Plan actuel' : isLoading ? 'Redirection…' : 'Activer maintenant'}
                      </Button>
                    )}
                    <p className="mt-3 text-center text-xs uppercase tracking-[0.35em] text-white/35">
                      Activation immédiate • Sans engagement
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


