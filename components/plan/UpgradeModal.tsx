/**
 * COMPOSANT: Modal d'Upgrade de Plan
 * 
 * Affiche une modal professionnelle quand un utilisateur atteint une limite de son plan.
 * Suggère intelligemment les plans supérieurs avec leurs avantages.
 * 
 * @component
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ArrowRight, Check } from 'lucide-react';
import { PRICING_SEGMENTS, SegmentType } from '@/lib/constants/pricing';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  currentSegment: SegmentType;
  limitReached: {
    feature: string;
    current: number;
    max: number;
  };
  suggestedPlans: string[];
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  currentSegment,
  limitReached,
  suggestedPlans,
}: UpgradeModalProps) {
  const segment = PRICING_SEGMENTS.find(s => s.id === currentSegment);
  const availablePlans = segment?.plans.filter(p => suggestedPlans.includes(p.name)) || [];

  const handleUpgrade = (planName: string) => {
    // Rediriger vers la page de facturation avec le plan sélectionné
    window.location.href = `/mail-center/billing?upgrade=${planName.toLowerCase()}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-300" />
                <h2 className="text-2xl font-bold text-white">
                  Limite atteinte
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Message limite */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 font-medium">
                  Vous avez atteint la limite de <span className="font-bold">{limitReached.feature}</span>
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Utilisation actuelle: <span className="font-bold text-white">{limitReached.current}/{limitReached.max}</span>
                </p>
              </div>

              {/* Plan actuel */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Plan actuel</p>
                <p className="text-white font-bold text-lg">{currentPlan}</p>
                <p className="text-gray-500 text-sm">Segment: {segment?.label}</p>
              </div>

              {/* Plans suggérés */}
              <div>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Passez à un plan supérieur
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availablePlans.map((plan, index) => {
                    const isPopular = plan.popular;
                    
                    return (
                      <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all hover:scale-105 ${
                          isPopular
                            ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10'
                            : 'border-gray-700 bg-gray-800/30 hover:border-purple-500/50'
                        }`}
                        onClick={() => handleUpgrade(plan.name)}
                      >
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            RECOMMANDÉ
                          </div>
                        )}

                        {/* Nom du plan */}
                        <h4 className="text-white font-bold text-xl mb-2">{plan.name}</h4>
                        <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                        {/* Prix */}
                        <div className="mb-4">
                          <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {plan.price}€
                          </span>
                          <span className="text-gray-400 text-sm ml-2">/{plan.period}</span>
                        </div>

                        {/* Fonctionnalités */}
                        <ul className="space-y-2 mb-6">
                          {plan.features.slice(0, 4).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              {feature.included ? (
                                <>
                                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-300">{feature.text}</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-600 line-through">{feature.text}</span>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <button
                          onClick={() => handleUpgrade(plan.name)}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                            isPopular
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                              : 'bg-gray-700 hover:bg-gray-600 text-white'
                          }`}
                        >
                          {plan.cta}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-gray-500 text-sm">
                <p>✨ Changez de plan à tout moment • Annulation facile</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
