/**
 * EXEMPLE D'INTÉGRATION DU SYSTÈME DE LIMITES
 * 
 * Ce fichier montre comment utiliser le système de limites dans vos composants
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UpgradeModal } from '@/components/upgrade-modal';
import { UsageWidget } from '@/components/usage-widget';
import type { PlanType } from '@/lib/pricing-plans';
import type { LimitError } from '@/lib/limit-helpers';

/**
 * EXEMPLE 1 : Générer une réponse avec gestion des limites
 */
export function GenerateReplyButton({ emailId }: { emailId: string }) {
  const { data: session } = useSession();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitError, setLimitError] = useState<LimitError | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanType>('starter');

  const handleGenerateReply = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/mail-center/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId }),
      });

      const data = await response.json();

      // 🔒 Vérifier si c'est une erreur de limite
      if (!response.ok && response.status === 403 && data.error === 'Limite atteinte') {
        console.log('🚫 Limite atteinte:', data.reason);
        
        // Sauvegarder les détails de la limite
        setLimitError(data);
        
        // Ouvrir la modal d'upgrade
        setShowUpgradeModal(true);
        
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erreur génération');
      }

      // ✅ Succès : utiliser la réponse générée
      console.log('✅ Réponse générée:', data);
      
      // Afficher la réponse dans l'UI, etc.
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleGenerateReply}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Génération...' : 'Générer réponse IA'}
      </button>

      {/* Modal d'upgrade si limite atteinte */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setLimitError(null);
        }}
        currentPlan={currentPlan}
        reason={limitError?.reason}
        limitReached={limitError?.limitReached}
      />
    </>
  );
}

/**
 * EXEMPLE 2 : Ajouter un compte avec vérification préalable
 */
export function AddEmailAccountButton() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanType>('starter');
  const [limitError, setLimitError] = useState<LimitError | null>(null);

  const handleAddAccount = async (provider: 'gmail' | 'outlook') => {
    setChecking(true);

    try {
      // 🔒 Vérifier d'abord si on peut ajouter un compte
      const checkResponse = await fetch('/api/subscription/check-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_email_account' }),
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok && checkResponse.status === 403) {
        // Limite atteinte
        console.log('🚫 Impossible d\'ajouter un compte:', checkData.reason);
        
        setLimitError(checkData);
        setShowUpgradeModal(true);
        
        return;
      }

      // ✅ OK, on peut ajouter un compte
      // Rediriger vers l'OAuth
      const authUrl = provider === 'gmail' 
        ? '/api/mail-center/gmail/auth'
        : '/api/mail-center/outlook/auth';
      
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la vérification');
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <div className="flex gap-4">
        <button
          onClick={() => handleAddAccount('gmail')}
          disabled={checking}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
        >
          {checking ? 'Vérification...' : 'Connecter Gmail'}
        </button>

        <button
          onClick={() => handleAddAccount('outlook')}
          disabled={checking}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {checking ? 'Vérification...' : 'Connecter Outlook'}
        </button>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setLimitError(null);
        }}
        currentPlan={currentPlan}
        reason={limitError?.reason}
        limitReached={limitError?.limitReached}
      />
    </>
  );
}

/**
 * EXEMPLE 3 : Afficher l'usage dans une sidebar
 */
export function MailCenterSidebar() {
  return (
    <aside className="w-80 bg-gray-900 border-r border-gray-800 p-6 space-y-6">
      {/* Logo, navigation, etc. */}
      
      {/* Widget d'usage - Mode compact */}
      <UsageWidget compact={true} />
      
      {/* Autres éléments de la sidebar */}
    </aside>
  );
}

/**
 * EXEMPLE 4 : Page dédiée à l'utilisation
 */
export function UsagePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Mon utilisation
      </h1>
      
      {/* Widget d'usage - Mode complet */}
      <UsageWidget compact={false} className="mb-8" />
      
      {/* Autres statistiques, graphiques, etc. */}
    </div>
  );
}

/**
 * EXEMPLE 5 : Gérer les erreurs de limite dans URL params
 * (Après redirection depuis Gmail/Outlook callback)
 */
export function MailCenterPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitError, setLimitError] = useState<{
    reason: string;
    current: number;
    limit: number;
  } | null>(null);

  // Au chargement du composant, vérifier les params URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    
    if (error === 'limit_reached') {
      const reason = params.get('reason');
      const current = parseInt(params.get('current') || '0');
      const limit = parseInt(params.get('limit') || '0');
      
      // Afficher la modal
      setLimitError({
        reason: decodeURIComponent(reason || ''),
        current,
        limit,
      });
      setShowUpgradeModal(true);
      
      // Nettoyer l'URL
      window.history.replaceState({}, '', '/mail-center');
    }
  }, []);

  return (
    <div className="...">
      {/* Contenu Mail Center */}
      
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setLimitError(null);
        }}
        currentPlan="starter" // À récupérer dynamiquement
        reason={limitError?.reason}
        limitReached={limitError ? {
          feature: 'Comptes email',
          current: limitError.current,
          max: limitError.limit,
        } : undefined}
      />
    </div>
  );
}

/**
 * EXEMPLE 6 : Utiliser le helper useLimitHandler
 */
import { useLimitHandler } from '@/lib/limit-helpers';

export function EmailActionsPanel({ emailId }: { emailId: string }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitError, setLimitError] = useState<LimitError | null>(null);
  const currentPlan: PlanType = 'pro'; // À récupérer dynamiquement

  // Utiliser le helper
  const { callAPI } = useLimitHandler(currentPlan, setShowUpgradeModal, setLimitError);

  const handleGenerateReply = async () => {
    // Appel avec gestion automatique des limites
    const result = await callAPI<{ subject: string; body: string }>(
      () => fetch('/api/mail-center/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId }),
      })
    );

    if (!result) {
      // Limite atteinte, modal affichée automatiquement
      console.log('Action bloquée par limite');
      return;
    }

    // ✅ Succès
    console.log('Réponse générée:', result);
  };

  return (
    <>
      <button onClick={handleGenerateReply}>
        Générer réponse
      </button>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        reason={limitError?.reason}
        limitReached={limitError?.limitReached}
      />
    </>
  );
}

/**
 * EXEMPLE 7 : Vérifier l'accès à une fonctionnalité premium
 */
export function AdvancedAnalyticsButton() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitError, setLimitError] = useState<LimitError | null>(null);
  const currentPlan: PlanType = 'starter';

  const handleOpenAnalytics = async () => {
    // Vérifier l'accès à la fonctionnalité
    const response = await fetch('/api/subscription/check-limit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'access_feature',
        feature: 'advancedAnalytics',
      }),
    });

    const data = await response.json();

    if (!response.ok && response.status === 403) {
      // Fonctionnalité non disponible
      setLimitError(data);
      setShowUpgradeModal(true);
      return;
    }

    // ✅ Accès autorisé
    // Ouvrir la page analytics
    window.location.href = '/mail-center/analytics';
  };

  return (
    <>
      <button onClick={handleOpenAnalytics}>
        📊 Analytics Avancées
      </button>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        reason={limitError?.reason}
      />
    </>
  );
}
