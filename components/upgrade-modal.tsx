'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, TrendingUp, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlanType, PRICING_PLANS, getUpgradePlans } from '@/lib/pricing-plans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanType;
  reason?: string;
  limitReached?: {
    feature: string;
    current: number;
    max: number;
  };
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  reason,
  limitReached,
}: UpgradeModalProps) {
  const upgradePlans = getUpgradePlans(currentPlan);
  const currentPlanData = PRICING_PLANS[currentPlan];

  const getPlanIcon = (planId: PlanType) => {
    switch (planId) {
      case 'starter':
        return Zap;
      case 'pro':
        return TrendingUp;
      case 'enterprise':
        return Crown;
      default:
        return Sparkles;
    }
  };

  const getPlanColor = (planId: PlanType) => {
    switch (planId) {
      case 'starter':
        return 'from-blue-500 to-cyan-500';
      case 'pro':
        return 'from-purple-500 to-pink-500';
      case 'enterprise':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 rounded-t-2xl border-b border-gray-700">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Passez au niveau supérieur</span>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                Débloquez plus de puissance
              </h2>
              
              {reason && (
                <p className="text-gray-300 text-sm max-w-2xl mx-auto">
                  {reason}
                </p>
              )}

              {limitReached && (
                <div className="mt-4 inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="text-left">
                    <p className="text-sm text-red-300 font-medium">
                      Limite atteinte : {limitReached.feature}
                    </p>
                    <p className="text-xs text-gray-400">
                      {limitReached.current} / {limitReached.max} utilisés
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Current Plan Info */}
            <div className="max-w-md mx-auto bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Votre plan actuel</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{currentPlanData.name}</p>
                  <p className="text-xs text-gray-400">{currentPlanData.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {currentPlanData.price.monthly}€
                    <span className="text-sm font-normal text-gray-400">/mois</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Plans Cards */}
          <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-b-2xl">
            <div className={cn(
              "grid gap-6",
              upgradePlans.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
            )}>
              {upgradePlans.map((plan, index) => {
                const Icon = getPlanIcon(plan.id);
                const isRecommended = plan.highlighted;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "relative p-6 border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]",
                      isRecommended
                        ? "border-purple-500 bg-gradient-to-br from-purple-950/50 to-pink-950/50 shadow-lg shadow-purple-500/20"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                    )}>
                      {/* Recommended Badge */}
                      {isRecommended && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-xs font-bold shadow-lg">
                            ⭐ RECOMMANDÉ - MEILLEUR RAPPORT
                          </Badge>
                        </div>
                      )}

                      {/* Plan Header */}
                      <div className="text-center mb-6 mt-2">
                        <div className={cn(
                          "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br mb-4",
                          getPlanColor(plan.id)
                        )}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{plan.tagline}</p>
                        
                        <div className="mb-4">
                          <span className="text-5xl font-bold text-white">
                            {plan.price.monthly}€
                          </span>
                          <span className="text-gray-400 ml-2">/mois</span>
                        </div>

                        <p className="text-sm text-gray-300 mb-6">{plan.description}</p>

                        <Button
                          onClick={() => {
                            // Rediriger vers la page de paiement avec le plan sélectionné
                            window.location.href = `/checkout?plan=${plan.id}`;
                          }}
                          className={cn(
                            "w-full py-6 text-lg font-semibold transition-all",
                            isRecommended
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50"
                              : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                          )}
                        >
                          {plan.cta}
                        </Button>
                      </div>

                      {/* Features List */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white text-sm mb-3">Inclus dans ce plan :</h4>
                        
                        <div className="space-y-2">
                          <FeatureItem
                            icon={Check}
                            text={`${plan.features.maxEmailAccounts === 99999 ? 'Comptes email illimités' : `${plan.features.maxEmailAccounts} comptes email`}`}
                            highlighted={isRecommended}
                          />
                          <FeatureItem
                            icon={Check}
                            text={`${plan.features.emailsPerMonth.toLocaleString()} emails/mois`}
                            highlighted={isRecommended}
                          />
                          <FeatureItem
                            icon={Check}
                            text={`${plan.features.autoRepliesPerMonth.toLocaleString()} réponses automatiques/mois`}
                            highlighted={isRecommended}
                          />
                          {plan.features.knowledgeBase && (
                            <FeatureItem
                              icon={Check}
                              text="Base de connaissances"
                              highlighted={isRecommended}
                            />
                          )}
                          {plan.features.advancedAnalytics && (
                            <FeatureItem
                              icon={Check}
                              text="Analytics avancées"
                              highlighted={isRecommended}
                            />
                          )}
                          {plan.features.customBranding && (
                            <FeatureItem
                              icon={Check}
                              text="Branding personnalisé"
                              highlighted={isRecommended}
                            />
                          )}
                          {plan.features.apiAccess && (
                            <FeatureItem
                              icon={Check}
                              text="Accès API"
                              highlighted={isRecommended}
                            />
                          )}
                          <FeatureItem
                            icon={Check}
                            text={`${plan.features.teamMembers} membre${plan.features.teamMembers > 1 ? 's' : ''} d'équipe`}
                            highlighted={isRecommended}
                          />
                          <FeatureItem
                            icon={Check}
                            text={`Support ${plan.features.supportLevel === 'priority' ? 'prioritaire' : plan.features.supportLevel === 'dedicated' ? 'dédié' : 'par email'} (${plan.features.responseTime})`}
                            highlighted={isRecommended}
                          />
                        </div>
                      </div>

                      {/* Savings Info */}
                      {plan.price.yearly < plan.price.monthly * 12 && (
                        <div className="mt-6 pt-4 border-t border-gray-700">
                          <p className="text-center text-sm text-gray-400">
                            💰 Économisez <span className="font-semibold text-green-400">
                              {(plan.price.monthly * 12 - plan.price.yearly).toFixed(0)}€/an
                            </span> avec l'abonnement annuel
                          </p>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer Note */}
            <p className="text-center text-sm text-gray-400 mt-6">
              🔒 Paiement sécurisé • ✅ Annulation à tout moment • 💯 Garantie satisfait ou remboursé 30 jours
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function FeatureItem({ icon: Icon, text, highlighted }: { icon: any; text: string; highlighted: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className={cn(
        "w-5 h-5 flex-shrink-0 mt-0.5",
        highlighted ? "text-purple-400" : "text-green-400"
      )} />
      <span className="text-sm text-gray-300">{text}</span>
    </div>
  );
}
