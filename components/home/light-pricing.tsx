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
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Tarification
            </p>
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Simple et transparent
            </h2>
            <p className="text-xl text-gray-600">
              Choisissez le plan adapté à votre activité
            </p>
          </motion.div>
        </div>

        {/* Segment Toggle */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex rounded-full border-2 border-gray-200 bg-white p-1 shadow-sm">
            {PRICING_SEGMENTS.map((segment) => (
              <button
                key={segment.id}
                onClick={() => setActiveSegment(segment.id)}
                className={`rounded-full px-8 py-3 text-sm font-semibold transition-all ${
                  activeSegment === segment.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {segment.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={activeSegment}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 text-center text-gray-600"
          >
            {currentSegment?.description}
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

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col overflow-hidden rounded-3xl border-2 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl ${
                    isPopular
                      ? 'border-blue-600 scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <div className="absolute -right-12 top-8 rotate-45 bg-blue-600 px-12 py-1 text-xs font-bold text-white shadow-lg">
                      Populaire
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

                    {/* CTA */}
                    <button
                      onClick={() => {
                        if (plan.stripePriceId) {
                          router.push(`/checkout?priceId=${plan.stripePriceId}`);
                        }
                      }}
                      className={`mb-8 w-full rounded-full py-4 text-base font-semibold transition-all active:scale-[0.98] ${
                        isPopular
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700'
                          : 'border-2 border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {plan.cta}
                    </button>

                    {/* Features */}
                    <div className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                              feature.included
                                ? 'bg-blue-100'
                                : 'bg-gray-100'
                            }`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 ${
                                feature.included ? 'text-blue-600' : 'text-gray-400'
                              }`}
                              strokeWidth={3}
                            />
                          </div>
                          <span
                            className={`text-sm ${
                              feature.included
                                ? 'text-gray-900 font-medium'
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
