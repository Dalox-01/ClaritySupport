'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Zap, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UpgradeModal } from './upgrade-modal';
import type { PlanType } from '@/lib/pricing-plans';

interface UsageWidgetProps {
  className?: string;
  compact?: boolean;
}

interface UsageData {
  plan: string;
  planDisplay: string; // Nom human-readable
  segment: string;
  limits: {
    emailAccounts: {
      used: number;
      limit: number;
      percentage: number;
      unlimited: boolean;
    };
    autoReplies: {
      used: number;
      limit: number;
      percentage: number;
      unlimited: boolean;
    };
    shopifyStores?: {
      used: number;
      limit: number;
      percentage: number;
      unlimited: boolean;
    };
  };
  features: {
    aiTemplates: boolean;
    prioritySupport: boolean;
    analytics: boolean;
    whiteLabel: boolean;
    customApi: boolean;
    signatureDynamique: boolean;
    upsellAuto: boolean;
    orderTracking: boolean;
  };
}

export function UsageWidget({ className, compact = false }: UsageWidgetProps) {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState<{
    feature: string;
    current: number;
    max: number;
  } | null>(null);

  useEffect(() => {
    fetchUsageData();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchUsageData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/subscription/usage');
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-orange-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleLimitClick = (feature: string, current: number, max: number) => {
    setSelectedLimit({ feature, current, max });
    setShowUpgradeModal(true);
  };

  if (loading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="h-2 bg-gray-700 rounded"></div>
          <div className="h-2 bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const usageItems = [
    {
      icon: Mail,
      label: 'Comptes email',
      current: data.limits.emailAccounts.used,
      max: data.limits.emailAccounts.unlimited ? 99999 : data.limits.emailAccounts.limit,
      percentage: data.limits.emailAccounts.percentage,
      unit: '',
    },
    {
      icon: Zap,
      label: 'Réponses auto',
      current: data.limits.autoReplies.used,
      max: data.limits.autoReplies.unlimited ? 99999 : data.limits.autoReplies.limit,
      percentage: data.limits.autoReplies.percentage,
      unit: '',
    },
  ];

  if (compact) {
    return (
      <>
        <Card className={cn('p-4 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700', className)}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Utilisation</h3>
            <Badge variant="outline" className="text-xs">
              {data.planDisplay}
            </Badge>
          </div>

          <div className="space-y-3">
            {usageItems.map((item) => {
              const Icon = item.icon;
              const isNearLimit = item.percentage >= 80;

              return (
                <div
                  key={item.label}
                  className="cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                  onClick={() => isNearLimit && handleLimitClick(item.label, item.current, item.max)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-4 h-4', getStatusColor(item.percentage))} />
                      <span className="text-xs text-gray-400">{item.label}</span>
                    </div>
                    <span className="text-xs font-medium text-white">
                      {item.current} / {item.max === 99999 ? '∞' : item.max}
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={cn('h-full', getProgressColor(item.percentage))}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(item.percentage, 100)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  {isNearLimit && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                      <span className="text-xs text-orange-500">
                        {item.percentage >= 100 ? 'Limite atteinte' : 'Proche de la limite'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {usageItems.some(item => item.percentage >= 80) && (
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Passer au plan supérieur
            </Button>
          )}
        </Card>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={data.plan as PlanType}
          reason={selectedLimit ? `Vous avez atteint ${selectedLimit.current} sur ${selectedLimit.max} pour ${selectedLimit.feature}` : undefined}
          limitReached={selectedLimit || undefined}
        />
      </>
    );
  }

  // Version complète (non-compact)
  return (
    <>
      <Card className={cn('p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700', className)}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Utilisation du plan</h2>
            <p className="text-sm text-gray-400">
              Plan actuel : <span className="font-semibold text-white">{data.planDisplay}</span>
            </p>
          </div>
          <Badge
            variant="default"
            className="text-sm px-3 py-1"
          >
            ✅ Actif
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {usageItems.map((item, index) => {
            const Icon = item.icon;
            const isNearLimit = item.percentage >= 80;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  isNearLimit
                    ? 'border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                )}
                onClick={() => isNearLimit && handleLimitClick(item.label, item.current, item.max)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    isNearLimit ? 'bg-orange-500/20' : 'bg-blue-500/20'
                  )}>
                    <Icon className={cn(
                      'w-5 h-5',
                      isNearLimit ? 'text-orange-400' : 'text-blue-400'
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-300">{item.label}</p>
                    <p className="text-xs text-gray-500">
                      {item.percentage >= 100 ? 'Limite atteinte' : `${item.percentage.toFixed(0)}% utilisé`}
                    </p>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-end justify-between mb-1">
                    <span className={cn('text-2xl font-bold', getStatusColor(item.percentage))}>
                      {item.current.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {item.max === 99999 ? '∞' : item.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={cn('h-full', getProgressColor(item.percentage))}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(item.percentage, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {isNearLimit && (
                  <div className="flex items-center gap-2 text-xs text-orange-400 mt-2">
                    <AlertTriangle className="w-3 h-3" />
                    <span>
                      {item.percentage >= 100 ? 'Limite atteinte' : 'Proche de la limite'}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {usageItems.some(item => item.percentage >= 80) && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-white mb-1">Besoin de plus de capacité ?</p>
                <p className="text-sm text-gray-300 mb-3">
                  Passez au plan supérieur pour débloquer plus de comptes email, d&apos;emails et de réponses automatiques.
                </p>
                <Button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Voir les plans supérieurs
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={data.plan as PlanType}
        reason={selectedLimit ? `Vous avez atteint ${selectedLimit.current} sur ${selectedLimit.max} pour ${selectedLimit.feature}` : undefined}
        limitReached={selectedLimit || undefined}
      />
    </>
  );
}
