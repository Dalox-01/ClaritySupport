'use client';

import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PricingPlan } from '@/lib/constants/pricing';
import { Button } from '@/components/ui/button';

interface PlanCardProps {
  plan: PricingPlan;
  index: number;
}

export default function PlanCard({ plan, index }: PlanCardProps) {
  const isPopular = plan.popular;
  const router = useRouter();

  const handleSubscribe = async () => {
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
      transition={{ delay: index * 0.1 }}
      className={`relative flex flex-col h-full rounded-2xl border-2 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl ${
        isPopular
          ? 'border-purple-500 scale-105 md:scale-110 z-10'
          : 'border-gray-200 hover:border-purple-300'
      }`}
    >
      {/* Badge Recommandé */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
            <Sparkles className="h-3.5 w-3.5" />
            Recommandé
          </div>
        </div>
      )}

      {/* Fond gradient subtil */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50/50 via-transparent to-pink-50/50 opacity-20 transition-opacity duration-500" />

      <div className="relative flex flex-col h-full p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <p className="text-sm text-gray-600 min-h-[40px]">{plan.description}</p>
        </div>

        {/* Prix */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {plan.price}€
            </span>
            <span className="text-gray-600 font-medium">/{plan.period}</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleSubscribe}
          className={`w-full mb-6 h-12 text-base font-semibold transition-all duration-300 ${
            isPopular
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
              : 'bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
          }`}
        >
          {plan.cta}
        </Button>

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
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gray-200'
                  }`}
                >
                  {feature.included ? (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" strokeWidth={2} />
                  )}
                </div>
                <span
                  className={`text-sm leading-relaxed ${
                    feature.included
                      ? 'text-gray-700 font-medium'
                      : 'text-gray-400 line-through'
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
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-b-2xl" />
        )}
      </div>
    </motion.div>
  );
}
