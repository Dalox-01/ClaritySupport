'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PRICING_PLANS } from '@/lib/pricing-plans';

interface UpgradeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'emails' | 'autoReplies' | 'accounts' | 'templates';
  currentPlan: 'free' | 'starter' | 'pro' | 'enterprise';
}

const LIMIT_MESSAGES = {
  emails: {
    title: 'Limite d&apos;emails atteinte',
    description: 'Vous avez atteint votre quota mensuel d&apos;emails.',
  },
  autoReplies: {
    title: 'Limite de réponses automatiques atteinte',
    description: 'Vous avez utilisé toutes vos réponses automatiques du mois.',
  },
  accounts: {
    title: 'Limite de comptes atteinte',
    description: 'Vous avez atteint le nombre maximum de comptes email.',
  },
  templates: {
    title: 'Limite de templates atteinte',
    description: 'Vous avez atteint le nombre maximum de templates.',
  },
};

export function UpgradeLimitModal({
  isOpen,
  onClose,
  limitType,
  currentPlan,
}: UpgradeLimitModalProps) {
  const router = useRouter();

  const message = LIMIT_MESSAGES[limitType];
  
  // Déterminer le plan recommandé
  const recommendedPlan = currentPlan === 'free' ? 'pro' : 
                         currentPlan === 'starter' ? 'pro' : 'enterprise';
  
  const plan = PRICING_PLANS[recommendedPlan];

  const handleUpgrade = () => {
    onClose();
    router.push('/mail-center/billing');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-700 bg-gradient-to-b from-gray-900 to-gray-950 shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header avec gradient */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 px-8 py-12">
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%)',
                      'radial-gradient(circle at 80% 80%, rgba(120, 119, 198, 0.3), transparent 50%)',
                      'radial-gradient(circle at 40% 20%, rgba(120, 119, 198, 0.3), transparent 50%)',
                    ],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
                
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="mb-4 inline-flex rounded-full bg-white/20 p-3 backdrop-blur-sm"
                  >
                    <Zap className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <h2 className="mb-2 text-3xl font-bold text-white">
                    {message.title}
                  </h2>
                  <p className="text-blue-100">
                    {message.description}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Plan recommandé */}
                <div className="mb-6 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="mb-1 text-sm font-medium text-blue-400">
                        Plan recommandé
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {plan.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        {plan.prices.monthly}€
                      </div>
                      <div className="text-sm text-gray-400">/mois</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {plan.featureList.slice(0, 5).map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Économies annuelles */}
                {plan.prices.yearly < plan.prices.monthly * 12 && (
                  <div className="mb-6 rounded-lg bg-green-500/10 p-4 text-center">
                    <div className="text-sm text-green-400">
                      💰 Économisez{' '}
                      <span className="font-bold">
                        {plan.prices.monthly * 12 - plan.prices.yearly}€
                      </span>{' '}
                      avec l&apos;abonnement annuel
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <motion.button
                    onClick={handleUpgrade}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Passer à {plan.name}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600"
                      initial={{ x: '100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>

                  <button
                    onClick={onClose}
                    className="w-full rounded-xl border border-gray-700 px-6 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
                  >
                    Rester sur le plan actuel
                  </button>
                </div>

                {/* Info */}
                <p className="mt-4 text-center text-xs text-gray-500">
                  Passez à un plan supérieur à tout moment. Annulation possible sans engagement.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
