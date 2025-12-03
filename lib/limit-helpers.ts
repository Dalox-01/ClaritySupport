/**
 * Helper pour gérer les limites d'abonnement côté client
 */

import { PlanType } from '@/lib/pricing-plans';

export interface LimitError {
  error: string;
  reason?: string;
  currentUsage?: number;
  limit?: number;
  upgradePlans?: PlanType[];
  limitReached?: {
    feature: string;
    current: number;
    max: number;
  };
}

/**
 * Vérifier si une réponse est une erreur de limite
 */
export function isLimitError(response: any): response is LimitError {
  return response && response.error === 'Limite atteinte';
}

/**
 * Formater un message d'erreur de limite
 */
export function formatLimitError(error: LimitError): string {
  if (error.reason) {
    return error.reason;
  }
  
  if (error.limitReached) {
    return `Vous avez atteint la limite de ${error.limitReached.max} ${error.limitReached.feature}`;
  }
  
  return "Vous avez atteint une limite de votre plan actuel";
}

/**
 * Afficher un toast d'erreur de limite et ouvrir la modal d'upgrade
 */
export function handleLimitError(
  error: LimitError,
  currentPlan: PlanType,
  showUpgradeModal: (plan: PlanType, reason?: string, limitReached?: any) => void
) {
  const message = formatLimitError(error);
  
  // Afficher un toast si disponible
  if (typeof window !== 'undefined' && (window as any).toast) {
    (window as any).toast.error(message);
  }
  
  // Ouvrir la modal d'upgrade
  showUpgradeModal(
    currentPlan,
    message,
    error.limitReached
  );
}

/**
 * Wrapper pour appeler une API avec gestion automatique des limites
 */
export async function callWithLimitCheck<T>(
  apiCall: () => Promise<Response>,
  currentPlan: PlanType,
  onLimitReached: (error: LimitError) => void
): Promise<T | null> {
  try {
    const response = await apiCall();
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 403 && isLimitError(data)) {
        onLimitReached(data);
        return null;
      }
      
      throw new Error(data.error || 'Erreur API');
    }
    
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur inconnue');
  }
}

/**
 * Hook React pour gérer les limites (à utiliser dans les composants)
 */
export function useLimitHandler(currentPlan: PlanType, setShowUpgradeModal: (show: boolean) => void, setLimitError: (error: LimitError | null) => void) {
  return {
    handleLimitError: (error: LimitError) => {
      setLimitError(error);
      setShowUpgradeModal(true);
    },
    
    callAPI: async <T,>(apiCall: () => Promise<Response>): Promise<T | null> => {
      return callWithLimitCheck<T>(
        apiCall,
        currentPlan,
        (error) => {
          setLimitError(error);
          setShowUpgradeModal(true);
        }
      );
    },
  };
}
