/**
 * EXEMPLE D'INTÉGRATION: Restriction d'ajout de compte email
 * 
 * Ce fichier montre comment intégrer le système de restrictions
 * dans vos composants React existants.
 * 
 * À intégrer dans: app/mail-center/page.tsx
 */

'use client';

import React, { useState } from 'react';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { UpgradeModal } from '@/components/plan/UpgradeModal';

// Dans votre composant MailCenter
export function MailCenterWithLimits() {
  const [userPlan, setUserPlan] = useState('STARTER'); // À récupérer depuis votre session/API
  const [userSegment, setUserSegment] = useState<'shopify'>('shopify');

  const {
    checkLimit,
    showUpgradeModal,
    setShowUpgradeModal,
    limitReached,
  } = usePlanLimits(userPlan, userSegment);

  /**
   * EXEMPLE 1: Vérifier avant d'ajouter un compte Gmail
   */
  const handleAddGmailAccount = async () => {
    // Vérifier la limite
    const allowed = await checkLimit('add_email_account');
    
    if (!allowed) {
      // La modal s'affiche automatiquement
      console.log('Ajout bloqué - limite atteinte');
      return;
    }

    // Continuer avec l'ajout du compte
    window.location.href = '/api/mail-center/gmail/auth';
  };

  /**
   * EXEMPLE 2: Vérifier avant d'ajouter un compte Outlook
   */
  const handleAddOutlookAccount = async () => {
    const allowed = await checkLimit('add_email_account');
    
    if (!allowed) {
      return; // Modal affichée automatiquement
    }

    window.location.href = '/api/mail-center/outlook/auth';
  };

  /**
   * EXEMPLE 3: Vérifier avant d'envoyer une réponse automatique
   */
  const handleSendAutoReply = async (emailId: string) => {
    const allowed = await checkLimit('send_auto_reply');
    
    if (!allowed) {
      return;
    }

    // Envoyer la réponse
    const response = await fetch('/api/mail-center/process-auto-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId }),
    });

    if (response.status === 403) {
      // Gérer la limite atteinte (au cas où)
      const data = await response.json();
      console.log('Limite atteinte:', data);
    }
  };

  /**
   * EXEMPLE 4: Vérifier l'accès à une fonctionnalité
   */
  const handleAccessPremiumFeature = async () => {
    const allowed = await checkLimit('access_feature', 'aiTemplates');
    
    if (!allowed) {
      return;
    }

    // Afficher la fonctionnalité premium
    console.log('Accès à AI Templates autorisé');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mail Center</h1>

      {/* Boutons d'ajout de compte */}
      <div className="space-y-4 mb-8">
        <button
          onClick={handleAddGmailAccount}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Ajouter un compte Gmail
        </button>

        <button
          onClick={handleAddOutlookAccount}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          + Ajouter un compte Outlook
        </button>
      </div>

      {/* Modal d'upgrade */}
      {limitReached && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={userPlan}
          currentSegment={userSegment}
          limitReached={limitReached.limitReached!}
          suggestedPlans={limitReached.suggestedPlans || []}
        />
      )}
    </div>
  );
}

/**
 * EXEMPLE 5: Utilisation avec executeWithCheck (version simplifiée)
 */
import { useActionWithLimitCheck } from '@/hooks/usePlanLimits';

export function MailCenterSimplified() {
  const [userPlan] = useState('SOLO');
  const [userSegment] = useState<'shopify'>('shopify');

  const {
    executeWithCheck,
    showUpgradeModal,
    setShowUpgradeModal,
    limitReached,
  } = useActionWithLimitCheck(userPlan, userSegment);

  const handleAddAccount = async () => {
    const result = await executeWithCheck(
      'add_email_account',
      async () => {
        // Cette fonction ne s'exécute que si la limite le permet
        window.location.href = '/api/mail-center/gmail/auth';
        return true;
      }
    );

    if (!result) {
      console.log('Action bloquée par limite');
    }
  };

  return (
    <div>
      <button onClick={handleAddAccount}>
        Ajouter un compte
      </button>

      {limitReached && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={userPlan}
          currentSegment={userSegment}
          limitReached={limitReached.limitReached!}
          suggestedPlans={limitReached.suggestedPlans || []}
        />
      )}
    </div>
  );
}
