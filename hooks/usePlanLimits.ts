/**
 * HOOK: Gestion des limites de plan
 * 
 * Hook React personnalisé pour vérifier les limites avant une action
 * et afficher automatiquement une modal d'upgrade si nécessaire.
 * 
 * @hook
 */

'use client';

import { useState, useCallback } from 'react';
import { SegmentType } from '@/lib/constants/pricing';

interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
  suggestedPlans?: string[];
  requiresUpgrade?: boolean;
  limitReached?: {
    feature: string;
    current: number;
    max: number;
  };
}

interface UsePlanLimitsReturn {
  checkLimit: (action: string, feature?: string) => Promise<boolean>;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  limitReached: LimitCheckResult | null;
}

export function usePlanLimits(currentPlan: string, currentSegment: SegmentType = 'shopify'): UsePlanLimitsReturn {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitReached, setLimitReached] = useState<LimitCheckResult | null>(null);

  /**
   * Vérifie si une action est autorisée
   * Affiche automatiquement la modal si limite atteinte
   */
  const checkLimit = useCallback(async (action: string, feature?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/plan/check-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, feature }),
      });

      const data: LimitCheckResult = await response.json();

      if (!data.allowed && response.status === 403) {
        // Limite atteinte
        setLimitReached(data);
        setShowUpgradeModal(true);
        return false;
      }

      return data.allowed;
    } catch (error) {
      console.error('Erreur vérification limite:', error);
      return true; // En cas d'erreur, on autorise par défaut
    }
  }, []);

  return {
    checkLimit,
    showUpgradeModal,
    setShowUpgradeModal,
    limitReached,
  };
}

/**
 * Hook simplifié pour wrapper une action avec vérification de limite
 */
export function useActionWithLimitCheck(
  currentPlan: string,
  currentSegment: SegmentType = 'shopify'
) {
  const { checkLimit, showUpgradeModal, setShowUpgradeModal, limitReached } = usePlanLimits(currentPlan, currentSegment);

  /**
   * Exécute une action seulement si la limite le permet
   */
  const executeWithCheck = useCallback(
    async <T,>(
      action: string,
      callback: () => Promise<T>,
      feature?: string
    ): Promise<T | null> => {
      const allowed = await checkLimit(action, feature);
      
      if (!allowed) {
        return null;
      }

      return await callback();
    },
    [checkLimit]
  );

  return {
    executeWithCheck,
    showUpgradeModal,
    setShowUpgradeModal,
    limitReached,
  };
}
