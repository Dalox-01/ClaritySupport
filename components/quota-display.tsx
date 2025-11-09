'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface QuotaDisplayProps {
  isLightMode?: boolean;
}

interface QuotaData {
  emailsUsed: number;
  emailsLimit: number;
  autoRepliesUsed: number;
  autoRepliesLimit: number;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  percentage: number;
}

export function QuotaDisplay({ isLightMode = true }: QuotaDisplayProps) {
  const router = useRouter();
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    try {
      const response = await fetch('/api/subscription/usage');
      if (response.ok) {
        const result = await response.json();
        const summary = result.data;
        
        setQuotaData({
          emailsUsed: summary.usage.emailsThisMonth || 0,
          emailsLimit: summary.limits.emailsPerMonth.max || 100,
          autoRepliesUsed: summary.usage.autoRepliesThisMonth || 0,
          autoRepliesLimit: summary.limits.autoRepliesPerMonth.max || 40,
          plan: summary.subscription.plan.toLowerCase(),
          percentage: summary.limits.autoRepliesPerMonth.percentage || 0,
        });
        
        // Afficher le prompt d'upgrade si quota atteint
        if (summary.limits.autoRepliesPerMonth.percentage >= 100) {
          setShowUpgradePrompt(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du quota:', error);
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'free': return 'Gratuit';
      case 'starter': return 'Starter';
      case 'pro': return 'Pro';
      case 'enterprise': return 'Enterprise';
      default: return 'Free';
    }
  };

  const getQuotaColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600 dark:text-red-400';
    if (percentage >= 80) return 'text-orange-600 dark:text-orange-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  if (!quotaData) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-lg border transition-all",
          isLightMode
            ? "bg-white border-blue-200/50 shadow-sm"
            : "bg-[#1a1f3a]/70 border-blue-500/20"
        )}
      >
        <div className="flex items-center gap-2">
          <Sparkles className={cn("w-4 h-4", getQuotaColor(quotaData.percentage))} />
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className={cn("text-sm font-bold", getQuotaColor(quotaData.percentage))}>
                {quotaData.autoRepliesUsed.toLocaleString()}
              </span>
              <span className={cn("text-xs", isLightMode ? "text-gray-500" : "text-gray-400")}>
                / {quotaData.autoRepliesLimit.toLocaleString()}
              </span>
            </div>
            <span className={cn("text-xs", isLightMode ? "text-gray-500" : "text-gray-400")}>
              {getPlanLabel(quotaData.plan)} - Réponses IA
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(quotaData.percentage, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn("h-full", getProgressColor(quotaData.percentage))}
          />
        </div>

        {quotaData.percentage >= 80 && quotaData.plan !== 'enterprise' && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="sm"
              onClick={() => router.push('/mail-center/billing')}
              className="h-7 px-3 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Upgrade Modal quand quota atteint */}
      {showUpgradePrompt && quotaData.plan !== 'enterprise' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "max-w-md w-full rounded-2xl p-6 shadow-2xl",
              isLightMode
                ? "bg-white"
                : "bg-[#1a1f3a] border border-blue-500/20"
            )}
          >
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>

              <div>
                <h3 className={cn(
                  "text-2xl font-bold mb-2",
                  isLightMode ? "text-gray-900" : "text-white"
                )}>
                  Quota atteint !
                </h3>
                <p className={cn(
                  "text-sm",
                  isLightMode ? "text-gray-600" : "text-gray-400"
                )}>
                  Vous avez utilisé {quotaData.autoRepliesUsed} / {quotaData.autoRepliesLimit} réponses automatiques.
                  Passez au plan supérieur pour continuer à utiliser l'IA.
                </p>
              </div>

              {quotaData.plan === 'free' && (
                <div className={cn(
                  "p-4 rounded-xl border-2",
                  isLightMode
                    ? "bg-blue-50 border-blue-200"
                    : "bg-blue-500/10 border-blue-500/30"
                )}>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      Plan Starter
                    </span>
                  </div>
                  <div className="text-left space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className={isLightMode ? "text-gray-700" : "text-gray-300"}>
                        <strong>2,500</strong> réponses IA / mois
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className={isLightMode ? "text-gray-700" : "text-gray-300"}>
                        5 comptes email
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {quotaData.plan === 'starter' && (
                <div className={cn(
                  "p-4 rounded-xl border-2",
                  isLightMode
                    ? "bg-blue-50 border-blue-200"
                    : "bg-blue-500/10 border-blue-500/30"
                )}>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      Plan Pro
                    </span>
                  </div>
                  <div className="text-left space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className={isLightMode ? "text-gray-700" : "text-gray-300"}>
                        <strong>7,500</strong> réponses IA / mois
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className={isLightMode ? "text-gray-700" : "text-gray-300"}>
                        15 comptes email + Analytics avancées
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradePrompt(false)}
                  className="flex-1"
                >
                  Plus tard
                </Button>
                <Button
                  onClick={() => {
                    setShowUpgradePrompt(false);
                    router.push('/mail-center/billing');
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  Passer au plan {quotaData.plan === 'free' ? 'Starter' : quotaData.plan === 'starter' ? 'Pro' : 'Enterprise'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
