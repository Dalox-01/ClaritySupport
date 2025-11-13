'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, ShoppingCart, User, Building2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PRICING_SEGMENTS, type SegmentType, type PricingPlan } from '@/lib/constants/pricing';

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

// Component pour une carte de plan individuelle
function PlanCard({ plan, index, segment }: { plan: PricingPlan; index: number; segment: SegmentType }) {
  const isPopular = plan.popular;
  const colors = SEGMENT_COLORS[segment];
  const router = useRouter();

  const handleSubscribe = () => {
    // Si c'est un plan "Contactez-nous", rediriger vers la page contact
    if (plan.cta === 'Contactez-nous') {
      router.push('/contact');
      return;
    }

    // Sinon, rediriger vers le checkout Stripe avec le priceId
    if (plan.stripePriceId) {
      router.push(`/checkout?priceId=${plan.stripePriceId}`);
    }
  };

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
          onClick={handleSubscribe}
          className={`w-full mb-6 h-12 text-base font-semibold rounded-xl transition-all duration-300 ${
            isPopular
              ? `bg-gradient-to-r ${colors.button} text-white shadow-lg hover:shadow-xl hover:scale-105`
              : `bg-white/5 border-2 ${colors.buttonBorder}`
          }`}
        >
          {plan.cta}
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
                layoutId="activeSegment"
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

// Component principal
export function DarkPricing() {
  const [activeSegment, setActiveSegment] = useState<SegmentType>('shopify');

  const currentPlans =
    PRICING_SEGMENTS.find((s) => s.id === activeSegment)?.plans || [];

  return (
    <section id="pricing" className="relative overflow-hidden bg-gradient-to-br from-[#0A0E27] via-[#0f1629] to-[#0A0E27] py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className={`absolute left-1/4 top-1/4 h-96 w-96 rounded-full blur-3xl ${
            activeSegment === 'shopify' ? 'bg-green-500/30' :
            activeSegment === 'freelance' ? 'bg-blue-500/30' :
            'bg-purple-500/30'
          }`}
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
          className={`absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full blur-3xl ${
            activeSegment === 'shopify' ? 'bg-emerald-500/30' :
            activeSegment === 'freelance' ? 'bg-cyan-500/30' :
            'bg-pink-500/30'
          }`}
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
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Tarifs simples et transparents
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-400"
          >
            Choisissez le plan parfait pour votre entreprise. Changez ou annulez à tout moment, sans engagement.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-400"
          >
            {[
              'Essai gratuit 14 jours',
              'Sans carte bancaire',
              'Annulation en 1 clic'
            ].map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{badge}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Segment Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SegmentSelector
            activeSegment={activeSegment}
            onSegmentChange={setActiveSegment}
          />
        </motion.div>

        {/* Pricing Plans with 3D rotation */}
        <div
          className="relative"
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
              {currentPlans.map((plan, index) => (
                <div
                  key={`${activeSegment}-${plan.name}`}
                  className={`flex ${plan.popular ? 'md:my-0' : 'md:my-4'}`}
                >
                  <PlanCard plan={plan} index={index} segment={activeSegment} />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Essai Gratuit Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-8 sm:p-12 shadow-lg border border-blue-500/30 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
              Essayez gratuitement pendant 14 jours
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              Découvrez la puissance de ClaritySupport sans risque. Toutes les fonctionnalités incluses, aucune carte bancaire requise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/checkout">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  Commencer l'essai gratuit
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-3 bg-white/5 border-2 border-blue-500/50 text-blue-300 font-semibold rounded-xl hover:bg-blue-500/20 transition-all duration-300">
                  Contacter un conseiller
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Garantie satisfaction */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center text-gray-500"
        >
          <p className="text-sm">
            🛡️ Garantie satisfait ou remboursé 30 jours • 🔒 Paiement sécurisé • 🇫🇷 Support en français
          </p>
        </motion.div>
      </div>
    </section>
  );
}
