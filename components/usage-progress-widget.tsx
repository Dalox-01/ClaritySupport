'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Eye, 
  EyeOff,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Clock,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageProgressWidgetProps {
  used: number;
  limit: number;
  bonusCredits?: number;
  plan: 'free' | 'starter' | 'pro' | 'scale';
  trialDaysRemaining?: number;
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
  onUpgradeClick?: () => void;
}

const PLAN_COLORS = {
  free: {
    primary: 'from-gray-500 to-gray-600',
    secondary: 'bg-gray-500/20',
    text: 'text-gray-400',
    glow: 'shadow-gray-500/20',
    ring: 'ring-gray-500/30',
  },
  starter: {
    primary: 'from-blue-500 to-cyan-500',
    secondary: 'bg-blue-500/20',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    ring: 'ring-blue-500/30',
  },
  pro: {
    primary: 'from-purple-500 to-pink-500',
    secondary: 'bg-purple-500/20',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20',
    ring: 'ring-purple-500/30',
  },
  scale: {
    primary: 'from-amber-500 to-orange-500',
    secondary: 'bg-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    ring: 'ring-amber-500/30',
  },
};

const PLAN_LIMITS = {
  free: 500,
  starter: 5000,
  pro: 20000,
  scale: 60000,
};

export function UsageProgressWidget({
  used,
  limit,
  bonusCredits = 0,
  plan,
  trialDaysRemaining,
  className,
  variant = 'full',
  onUpgradeClick,
}: UsageProgressWidgetProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [animatedUsed, setAnimatedUsed] = useState(0);

  const colors = PLAN_COLORS[plan];
  const totalAvailable = limit + bonusCredits;
  const remaining = Math.max(0, totalAvailable - used);
  const percentage = Math.min(100, (used / totalAvailable) * 100);
  const isLow = percentage >= 80;
  const isCritical = percentage >= 95;
  const isFree = plan === 'free';

  // Animation du compteur
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = used / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= used) {
        setAnimatedUsed(used);
        clearInterval(timer);
      } else {
        setAnimatedUsed(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [used]);

  if (!isVisible) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsVisible(true)}
        className={cn(
          "fixed bottom-4 right-4 p-3 rounded-full",
          "bg-slate-800 border border-slate-700",
          "hover:bg-slate-700 transition-colors",
          "shadow-lg z-50"
        )}
      >
        <Eye className="h-5 w-5 text-slate-400" />
      </motion.button>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="relative h-2 w-24 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r",
              isCritical ? "from-red-500 to-red-600" : 
              isLow ? "from-yellow-500 to-orange-500" : 
              colors.primary
            )}
          />
        </div>
        <span className="text-xs text-slate-400">
          {remaining.toLocaleString()} restants
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-3 rounded-xl border",
          "bg-slate-900/80 backdrop-blur-sm border-slate-800",
          className
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Mail className={cn("h-4 w-4", colors.text)} />
            <span className="text-sm font-medium text-white">
              {animatedUsed.toLocaleString()} / {totalAvailable.toLocaleString()}
            </span>
          </div>
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            isCritical ? "bg-red-500/20 text-red-400" :
            isLow ? "bg-yellow-500/20 text-yellow-400" :
            colors.secondary, colors.text
          )}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={cn(
              "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r",
              isCritical ? "from-red-500 to-red-600" : 
              isLow ? "from-yellow-500 to-orange-500" : 
              colors.primary
            )}
          />
        </div>
      </motion.div>
    );
  }

  // Variant FULL
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border",
        "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800",
        "border-slate-700/50",
        colors.glow,
        "shadow-xl",
        className
      )}
    >
      {/* Glow effect */}
      <div className={cn(
        "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20",
        `bg-gradient-to-br ${colors.primary}`
      )} />

      {/* Header */}
      <div className="relative p-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-xl bg-gradient-to-br",
              colors.primary
            )}>
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Utilisation des emails
              </h3>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  colors.secondary, colors.text
                )}>
                  Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </span>
                {isFree && trialDaysRemaining !== undefined && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {trialDaysRemaining}j restants
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <EyeOff className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Circular Progress */}
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  {/* Background circle */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-800"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className={cn(
                        isCritical ? "text-red-500" :
                        isLow ? "text-yellow-500" :
                        plan === 'scale' ? "text-amber-500" :
                        plan === 'pro' ? "text-purple-500" :
                        plan === 'starter' ? "text-blue-500" :
                        "text-gray-500"
                      )}
                      initial={{ strokeDasharray: "0 264" }}
                      animate={{ 
                        strokeDasharray: `${(percentage / 100) * 264} 264` 
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{
                        filter: isCritical ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' :
                               isLow ? 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.5))' :
                               'none'
                      }}
                    />
                  </svg>
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                      className={cn(
                        "text-2xl font-bold",
                        isCritical ? "text-red-400" :
                        isLow ? "text-yellow-400" :
                        "text-white"
                      )}
                      key={animatedUsed}
                    >
                      {Math.round(percentage)}%
                    </motion.span>
                    <span className="text-xs text-slate-400">utilisé</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-400">Utilisés</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {animatedUsed.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className={cn("h-4 w-4", colors.text)} />
                    <span className="text-xs text-slate-400">Restants</span>
                  </div>
                  <span className={cn("text-lg font-bold", colors.text)}>
                    {remaining.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bonus credits */}
              {bonusCredits > 0 && (
                <div className={cn(
                  "p-3 rounded-xl border",
                  "bg-amber-500/10 border-amber-500/30"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-amber-300">Bonus affiliation</span>
                    </div>
                    <span className="text-sm font-bold text-amber-400">
                      +{bonusCredits.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Warning */}
              {(isLow || isCritical) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-3 rounded-xl border",
                    isCritical 
                      ? "bg-red-500/10 border-red-500/30" 
                      : "bg-yellow-500/10 border-yellow-500/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn(
                      "h-4 w-4",
                      isCritical ? "text-red-400" : "text-yellow-400"
                    )} />
                    <span className={cn(
                      "text-sm",
                      isCritical ? "text-red-300" : "text-yellow-300"
                    )}>
                      {isCritical 
                        ? "Quota presque épuisé !" 
                        : "Quota bas - pensez à upgrader"
                      }
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Upgrade button */}
              {(plan === 'free' || plan === 'starter' || isLow) && onUpgradeClick && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onUpgradeClick}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl font-medium",
                    "bg-gradient-to-r",
                    plan === 'free' ? "from-blue-600 to-cyan-600" :
                    plan === 'starter' ? "from-purple-600 to-pink-600" :
                    "from-amber-600 to-orange-600",
                    "text-white shadow-lg",
                    "hover:opacity-90 transition-opacity",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  <Crown className="h-4 w-4" />
                  <span>
                    {plan === 'free' ? "Passer à un plan payant" :
                     plan === 'starter' ? "Passer à Pro" :
                     "Passer à Scale"}
                  </span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Linear progress bar at bottom */}
      <div className="h-1 bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn(
            "h-full bg-gradient-to-r",
            isCritical ? "from-red-500 to-red-600" : 
            isLow ? "from-yellow-500 to-orange-500" : 
            colors.primary
          )}
        />
      </div>
    </motion.div>
  );
}

// Export d'un hook pour récupérer les données d'usage
export function useUsageData() {
  const [data, setData] = useState<{
    used: number;
    limit: number;
    bonusCredits: number;
    plan: 'free' | 'starter' | 'pro' | 'scale';
    trialDaysRemaining?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/usage');
        if (response.ok) {
          const result = await response.json();
          setData({
            used: result.used || 0,
            limit: result.limit || PLAN_LIMITS[result.plan as keyof typeof PLAN_LIMITS] || 500,
            bonusCredits: result.bonusCredits || 0,
            plan: result.plan || 'free',
            trialDaysRemaining: result.trialDaysRemaining,
          });
        }
      } catch (error) {
        console.error('Erreur chargement usage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  return { data, loading };
}
