'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { PRICING_SEGMENTS, type SegmentType } from '@/lib/constants/pricing';
import { useRouter } from 'next/navigation';

export function LightPricing() {
  const [activeSegment, setActiveSegment] = useState<SegmentType>('shopify');
  const router = useRouter();

  const currentSegment = PRICING_SEGMENTS.find((seg) => seg.id === activeSegment);

  return (
    <section id="pricing" className="relative overflow-hidden bg-gray-50 py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Header magnétique */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-blue-600">
              💰 Investissement qui se rembourse en 1 semaine
            </p>
            <h2 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Un prix.<br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Une révolution.
              </span>
            </h2>
            <p className="text-xl leading-relaxed text-gray-700">
              <span className="font-bold text-gray-900">Pas de frais cachés.</span> Pas de pièges.{' '}
              Juste un ROI qui fait rêver vos concurrents.
            </p>
          </motion.div>
        </div>

        {/* Segment Toggle avec couleurs différenciées */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex rounded-full border-2 border-gray-200 bg-white p-1 shadow-lg">
            {PRICING_SEGMENTS.map((segment) => {
              const isActive = activeSegment === segment.id;
              const isEcommerce = segment.id === 'shopify';
              
              return (
                <button
                  key={segment.id}
                  onClick={() => setActiveSegment(segment.id)}
                  className={`rounded-full px-10 py-3.5 text-sm font-bold transition-all ${
                    isActive
                      ? isEcommerce
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl shadow-emerald-500/30'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-xl shadow-blue-500/30'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {segment.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description persuasive */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`desc-${activeSegment}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 text-center text-lg font-semibold text-gray-700"
          >
            {activeSegment === 'shopify' 
              ? '🛒 Shopify, WooCommerce, Prestashop : votre boutique mérite le meilleur support' 
              : '💼 Freelances & Pros : reprenez le contrôle de votre inbox'}
          </motion.p>
        </AnimatePresence>

        {/* Pricing Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSegment}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-16 grid gap-8 lg:grid-cols-3"
          >
            {currentSegment?.plans.map((plan, index) => {
              const isPopular = plan.popular;

              const isEcommerce = activeSegment === 'shopify';
              const accentColor = isEcommerce ? 'emerald' : 'blue';
              
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col overflow-hidden rounded-3xl border-2 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
                    isPopular
                      ? isEcommerce
                        ? 'border-emerald-600 ring-4 ring-emerald-100'
                        : 'border-blue-600 ring-4 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Popular badge - couleur dynamique */}
                  {isPopular && (
                    <div className={`absolute -right-12 top-8 rotate-45 px-12 py-1.5 text-xs font-black uppercase text-white shadow-xl ${
                      isEcommerce 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-600'
                    }`}>
                      ⭐ Populaire
                    </div>
                  )}

                  <div className="p-8">
                    {/* Header */}
                    <div className="mb-6">
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-gray-900">€{plan.price}</span>
                        <span className="text-gray-600">/{plan.period}</span>
                      </div>
                    </div>

                    {/* CTA avec couleur dynamique */}
                    <button
                      onClick={() => {
                        if (plan.stripePriceId) {
                          router.push(`/checkout?priceId=${plan.stripePriceId}`);
                        }
                      }}
                      className={`group relative mb-8 w-full overflow-hidden rounded-full py-4 text-base font-bold transition-all hover:scale-105 active:scale-100 ${
                        isPopular
                          ? isEcommerce
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40'
                          : 'border-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50 shadow-md'
                      }`}
                    >
                      <span className="relative z-10">{plan.cta}</span>
                      {isPopular && (
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      )}
                    </button>

                    {/* Features avec couleur dynamique */}
                    <div className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                              feature.included
                                ? isEcommerce
                                  ? 'bg-emerald-100'
                                  : 'bg-blue-100'
                                : 'bg-gray-100'
                            }`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 ${
                                feature.included 
                                  ? isEcommerce 
                                    ? 'text-emerald-600' 
                                    : 'text-blue-600' 
                                  : 'text-gray-400'
                              }`}
                              strokeWidth={3}
                            />
                          </div>
                          <span
                            className={`text-sm ${
                              feature.included
                                ? 'text-gray-900 font-semibold'
                                : 'text-gray-400 line-through'
                            }`}
                          >
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600">
            Besoin d'un plan sur mesure ?{' '}
            <a href="/contact" className="font-semibold text-blue-600 hover:text-blue-700">
              Contactez-nous
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
