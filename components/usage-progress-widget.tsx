'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageProgressBarProps {
  currentUsage: number;
  maxUsage: number;
  bonusCredits?: number;
  planName: string;
  className?: string;
}

export function UsageProgressBar({
  currentUsage,
  maxUsage,
  bonusCredits = 0,
  planName,
  className,
}: UsageProgressBarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  const totalAvailable = maxUsage + bonusCredits;
  const percentage = Math.min((currentUsage / totalAvailable) * 100, 100);
  const remaining = Math.max(totalAvailable - currentUsage, 0);

  // Animation du pourcentage
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Couleur basée sur l'utilisation
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getGlowColor = () => {
    if (percentage >= 90) return 'shadow-red-500/50';
    if (percentage >= 70) return 'shadow-orange-500/50';
    if (percentage >= 50) return 'shadow-yellow-500/50';
    return 'shadow-emerald-500/50';
  };

  return (
    <div 
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Barre de progression compacte */}
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", getProgressColor())}
            initial={{ width: 0 }}
            animate={{ width: `${animatedPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Popup Terminal Style */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute top-full right-0 mt-3 z-50",
              "w-64 rounded-lg overflow-hidden",
              "bg-gradient-to-br from-blue-950/95 via-slate-900/95 to-blue-950/95",
              "backdrop-blur-xl border border-blue-500/30",
              "shadow-2xl shadow-blue-500/20"
            )}
          >
            {/* Header Terminal */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border-b border-blue-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="ml-2 text-[10px] font-mono text-blue-300/70">quota_status.sh</span>
            </div>

            {/* Content Terminal */}
            <div className="p-3 font-mono text-xs space-y-2">
              {/* Plan Info */}
              <div className="flex items-center gap-2">
                <span className="text-blue-400">$</span>
                <span className="text-gray-300">plan</span>
                <span className="text-emerald-400 ml-auto">{planName}</span>
              </div>

              {/* Barre visuelle */}
              <div className="py-2">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full shadow-lg", getProgressColor(), getGlowColor())}
                    initial={{ width: 0 }}
                    animate={{ width: `${animatedPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> utilisés
                  </span>
                  <span className="text-white font-semibold">{currentUsage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> restants
                  </span>
                  <span className="text-emerald-400 font-semibold">{remaining.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">total</span>
                  <span className="text-blue-400">{totalAvailable.toLocaleString()}</span>
                </div>
                {bonusCredits > 0 && (
                  <div className="flex justify-between pt-1 border-t border-blue-500/20">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Gift className="w-3 h-3 text-purple-400" /> bonus
                    </span>
                    <span className="text-purple-400">+{bonusCredits.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-blue-500/20">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="text-green-400">●</span>
                  <span>sync</span>
                  <span className="text-gray-600 ml-auto">ce mois</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Garder l'ancien export pour compatibilité (mais on ne l'utilisera plus)
export function UsageProgressWidget(props: UsageProgressBarProps & { onUpgrade?: () => void }) {
  return <UsageProgressBar {...props} />;
}
