# 🔐 SYSTÈME DE RESTRICTIONS PAR PLAN - DOCUMENTATION COMPLÈTE

**Date de création**: 13 novembre 2025  
**Version**: 1.0.0  
**Auteur**: Assistant Backend Principal

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Plans et limites](#plans-et-limites)
4. [API Endpoints](#api-endpoints)
5. [Intégration Frontend](#intégration-frontend)
6. [Workflow complet](#workflow-complet)
7. [Tests et validation](#tests-et-validation)
8. [Maintenance](#maintenance)

---

## 🎯 VUE D'ENSEMBLE

### Objectif

Ce système implémente un **contrôle granulaire et autonome** des restrictions basées sur les plans d'abonnement. Il garantit que:

- ✅ Chaque utilisateur ne peut pas dépasser les limites de son plan
- ✅ Des messages clairs indiquent quelle limite est atteinte
- ✅ Des suggestions d'upgrade sont proposées automatiquement
- ✅ Le frontend et le backend sont synchronisés

### Principes de conception

1. **Défense en profondeur**: Vérifications à multiple niveaux (OAuth callback, API routes, Frontend)
2. **Expérience utilisateur optimale**: Messages clairs, suggestions pertinentes
3. **Performance**: Vérifications rapides avec mise en cache si nécessaire
4. **Maintenabilité**: Code centralisé et réutilisable

---

## 🏗️ ARCHITECTURE

### Composants principaux

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ usePlanLimits Hook                                   │   │
│  │ ├─ checkLimit()                                      │   │
│  │ ├─ executeWithCheck()                                │   │
│  │ └─ showUpgradeModal state                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ UpgradeModal Component                               │   │
│  │ ├─ Affichage limite atteinte                         │   │
│  │ ├─ Plans suggérés                                    │   │
│  │ └─ Redirection vers billing                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER (Next.js)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ /api/plan/check-limit                                │   │
│  │ POST { action, feature? }                            │   │
│  │ → 200: { allowed, usage, limit }                     │   │
│  │ → 403: { allowed: false, reason, suggestedPlans }    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ /api/plan/usage-summary                              │   │
│  │ GET → Résumé complet utilisation + limites           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Protected Routes (Gmail/Outlook callback, etc.)      │   │
│  │ ├─ Vérification via canAddEmailAccount()             │   │
│  │ └─ Redirection avec erreur si limite atteinte        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                 BUSINESS LOGIC (lib/)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ plan-enforcement.ts                                  │   │
│  │ ├─ getUserPlanInfo(userId)                           │   │
│  │ ├─ canAddEmailAccount(userId)                        │   │
│  │ ├─ canSendAutoReply(userId)                          │   │
│  │ ├─ canAddShopifyStore(userId)                        │   │
│  │ ├─ canAccessFeature(userId, feature)                 │   │
│  │ └─ getUsageSummary(userId)                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ plan-limits.ts                                       │   │
│  │ ├─ PLAN_LIMITS configuration                         │   │
│  │ ├─ getPlanLimits(planName)                           │   │
│  │ └─ hasFeature(planName, feature)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ usage-tracking.ts                                    │   │
│  │ ├─ trackAutoReplySent()                              │   │
│  │ ├─ trackManualReplySent()                            │   │
│  │ └─ getMonthlyUsageSummary()                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (Supabase)                       │
│  ├─ subscriptions (plan, segment, status)                   │
│  ├─ users (plan, stripe_customer_id)                        │
│  ├─ mail_accounts (user_id, provider, is_active)            │
│  ├─ email_automations (user_id, action_type, created_at)    │
│  └─ shopify_stores (user_id, is_active)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 PLANS ET LIMITES

### Plans E-commerce (Shopify)

#### STARTER (49€/mois)
- 3 comptes email
- 5 000 réponses automatiques/mois
- 1 boutique Shopify
- ❌ Templates IA
- ❌ Support prioritaire
- ❌ Analytics avancées

#### PRO (99€/mois)
- 10 comptes email
- 20 000 réponses automatiques/mois
- 3 boutiques Shopify
- ✅ Templates IA avancés
- ✅ Support prioritaire 24/7
- ✅ Analytics avancées
- ✅ Upsell automatique

#### SCALE (199€/mois)
- **Comptes email illimités**
- 50 000 réponses automatiques/mois
- **Boutiques Shopify illimitées**
- ✅ Toutes les fonctionnalités PRO
- ✅ White-label
- ✅ API complète

### Plans Freelance

#### SOLO (19€/mois)
- 1 compte email
- 500 réponses automatiques/mois
- ❌ Templates IA
- ❌ Shopify

#### PRO (39€/mois)
- 1 compte email
- 2 000 réponses automatiques/mois
- ✅ Templates IA professionnels
- ✅ Signatures dynamiques

#### UNLIMITED (69€/mois)
- 1 compte email
- **Réponses automatiques illimitées**
- ✅ IA personnalisée
- ✅ API personnalisée

---

## 🔌 API ENDPOINTS

### POST /api/plan/check-limit

Vérifie si une action est autorisée.

**Request:**
```json
{
  "action": "add_email_account" | "send_auto_reply" | "add_shopify_store" | "access_feature",
  "feature": "aiTemplates" // optionnel, requis pour access_feature
}
```

**Response (200 - Autorisé):**
```json
{
  "allowed": true,
  "currentUsage": 2,
  "limit": 3,
  "usagePercentage": 67
}
```

**Response (403 - Limite atteinte):**
```json
{
  "allowed": false,
  "reason": "Vous avez atteint la limite de 3 compte(s) email pour le plan STARTER",
  "currentUsage": 3,
  "limit": 3,
  "usagePercentage": 100,
  "suggestedPlans": ["PRO", "SCALE"],
  "requiresUpgrade": true
}
```

### GET /api/plan/usage-summary

Retourne un résumé complet de l'utilisation.

**Response (200):**
```json
{
  "plan": "STARTER",
  "segment": "shopify",
  "limits": {
    "emailAccounts": {
      "used": 2,
      "limit": 3,
      "percentage": 67,
      "unlimited": false
    },
    "autoReplies": {
      "used": 1250,
      "limit": 5000,
      "percentage": 25,
      "unlimited": false
    },
    "shopifyStores": {
      "used": 1,
      "limit": 1,
      "percentage": 100,
      "unlimited": false
    }
  },
  "features": {
    "aiTemplates": false,
    "prioritySupport": false,
    "analytics": false,
    "whiteLabel": false,
    "customApi": false
  },
  "suggestedUpgrade": "PRO"
}
```

---

## ⚛️ INTÉGRATION FRONTEND

### 1. Utiliser le hook usePlanLimits

```tsx
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { UpgradeModal } from '@/components/plan/UpgradeModal';

function MonComposant() {
  const { checkLimit, showUpgradeModal, setShowUpgradeModal, limitReached } = 
    usePlanLimits('STARTER', 'shopify');

  const handleAction = async () => {
    const allowed = await checkLimit('add_email_account');
    
    if (!allowed) {
      // La modal s'affiche automatiquement
      return;
    }

    // Continuer avec l'action
    console.log('Action autorisée !');
  };

  return (
    <>
      <button onClick={handleAction}>Ajouter un compte</button>
      
      {limitReached && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan="STARTER"
          currentSegment="shopify"
          limitReached={limitReached.limitReached!}
          suggestedPlans={limitReached.suggestedPlans || []}
        />
      )}
    </>
  );
}
```

### 2. Utiliser useActionWithLimitCheck (version simplifiée)

```tsx
import { useActionWithLimitCheck } from '@/hooks/usePlanLimits';

function MonComposant() {
  const { executeWithCheck, showUpgradeModal, setShowUpgradeModal, limitReached } = 
    useActionWithLimitCheck('STARTER', 'shopify');

  const handleAction = async () => {
    await executeWithCheck(
      'add_email_account',
      async () => {
        // Ce code s'exécute SEULEMENT si autorisé
        window.location.href = '/api/mail-center/gmail/auth';
      }
    );
  };

  return <button onClick={handleAction}>Ajouter Gmail</button>;
}
```

---

## 🔄 WORKFLOW COMPLET

### Scénario 1: Ajout d'un compte email (Limite atteinte)

```
1. USER clique sur "Ajouter Gmail"
   ↓
2. Frontend: checkLimit('add_email_account')
   ↓
3. API: POST /api/plan/check-limit
   ↓
4. plan-enforcement.ts:
   - getUserPlanInfo(userId) → Plan: STARTER
   - countEmailAccounts(userId) → Count: 3
   - getPlanLimits('STARTER') → Limit: 3
   - Comparaison: 3 >= 3 → BLOQUÉ
   ↓
5. API renvoie 403:
   {
     "allowed": false,
     "reason": "Limite de 3 comptes atteinte",
     "suggestedPlans": ["PRO", "SCALE"]
   }
   ↓
6. Frontend: 
   - setLimitReached(data)
   - setShowUpgradeModal(true)
   ↓
7. UpgradeModal s'affiche avec:
   - Message: "Limite de 3 comptes atteinte"
   - Plans suggérés: PRO (10 comptes), SCALE (illimité)
   - CTA: "Passer au plan PRO"
   ↓
8. USER clique sur "Passer au plan PRO"
   ↓
9. Redirection vers /mail-center/billing?upgrade=pro
```

### Scénario 2: Envoi réponse automatique (Autorisé)

```
1. Système détecte nouvel email
   ↓
2. API: POST /api/mail-center/process-auto-reply
   ↓
3. Backend: canSendAutoReply(userId)
   - getUserPlanInfo(userId) → Plan: PRO
   - countAutoRepliesThisMonth(userId) → Count: 1500
   - getPlanLimits('PRO') → Limit: 20000
   - Comparaison: 1500 < 20000 → AUTORISÉ
   ↓
4. Génération de la réponse IA
   ↓
5. Envoi via Gmail API
   ↓
6. Incrémentation du compteur:
   trackAutoReplySent(userId, emailId)
   ↓
7. Mise à jour BDD:
   email_automations.insert({ action_type: 'auto_reply_sent' })
```

---

## ✅ TESTS ET VALIDATION

### Tests manuels à effectuer

1. **Test limite comptes email:**
   - Plan STARTER (3 comptes max)
   - Connecter 3 comptes Gmail/Outlook
   - Essayer d'en ajouter un 4ème
   - ✅ Modal d'upgrade doit s'afficher

2. **Test limite réponses automatiques:**
   - Plan SOLO (500/mois)
   - Envoyer 500 réponses
   - Essayer d'en envoyer une 501ème
   - ✅ API doit renvoyer 403

3. **Test boutiques Shopify:**
   - Plan STARTER (1 boutique)
   - Connecter 1 boutique
   - Essayer d'en ajouter une 2ème
   - ✅ Blocage + suggestion PRO (3 boutiques)

4. **Test fonctionnalités premium:**
   - Plan SOLO (pas de templates IA)
   - Tenter d'accéder aux templates IA
   - ✅ Modal suggérant PRO

### Tests automatisés (à implémenter)

```typescript
// tests/plan-enforcement.test.ts
import { canAddEmailAccount, canSendAutoReply } from '@/lib/plan-enforcement';

describe('Plan Enforcement', () => {
  it('should block adding 4th email account on STARTER plan', async () => {
    const result = await canAddEmailAccount('user-with-3-accounts');
    expect(result.allowed).toBe(false);
    expect(result.suggestedPlans).toContain('PRO');
  });

  it('should allow unlimited auto replies on UNLIMITED plan', async () => {
    const result = await canSendAutoReply('user-unlimited-plan');
    expect(result.allowed).toBe(true);
  });
});
```

---

## 🛠️ MAINTENANCE

### Ajouter une nouvelle limite

1. **Mettre à jour `lib/plan-limits.ts`:**
```typescript
export interface PlanLimits {
  // ... limites existantes
  newFeatureLimit: number; // Ajouter ici
}

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  STARTER: {
    // ... 
    newFeatureLimit: 10,
  },
  // ...
};
```

2. **Créer la fonction de vérification dans `lib/plan-enforcement.ts`:**
```typescript
export async function canUseNewFeature(userId: string): Promise<EnforcementResult> {
  const planInfo = await getUserPlanInfo(userId);
  const limits = getPlanLimits(planInfo.plan);
  const currentCount = await countNewFeatureUsage(userId);

  // Logique de vérification
  // ...
}
```

3. **Ajouter le endpoint dans `/api/plan/check-limit/route.ts`:**
```typescript
case 'use_new_feature':
  result = await canUseNewFeature(session.user.id);
  break;
```

4. **Utiliser dans le frontend:**
```tsx
const allowed = await checkLimit('use_new_feature');
```

### Modifier les limites d'un plan

Éditer directement `lib/plan-limits.ts`:

```typescript
PRO: {
  emailAccounts: 15, // Ancienne valeur: 10
  autoRepliesPerMonth: 25000, // Ancienne valeur: 20000
  // ...
}
```

**Important**: Les changements sont effectifs immédiatement pour tous les utilisateurs.

---

## 📈 MÉTRIQUES ET MONITORING

### Requêtes à surveiller

```sql
-- Utilisateurs proche de la limite (>80%)
SELECT 
  u.id, 
  u.plan,
  COUNT(ma.id) as email_accounts,
  pl.emailAccounts as limit
FROM users u
LEFT JOIN mail_accounts ma ON ma.user_id = u.id AND ma.is_active = true
JOIN plan_limits pl ON pl.plan = u.plan
WHERE (COUNT(ma.id) / pl.emailAccounts) > 0.8
GROUP BY u.id, u.plan, pl.emailAccounts;

-- Réponses automatiques ce mois par plan
SELECT 
  u.plan,
  COUNT(ea.id) as auto_replies,
  COUNT(DISTINCT u.id) as users
FROM users u
LEFT JOIN email_automations ea ON ea.user_id = u.id 
  AND ea.action_type = 'auto_reply_sent'
  AND ea.created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY u.plan;
```

---

## 🎯 AMÉLIORATIONS FUTURES

1. **Cache Redis** pour les vérifications fréquentes
2. **Webhooks** pour notifier les utilisateurs proches de la limite
3. **Dashboard admin** pour visualiser l'utilisation globale
4. **Alertes automatiques** quand 80% de la limite est atteinte
5. **A/B testing** des messages d'upgrade

---

## 📝 CHANGELOG

### Version 1.0.0 (13 novembre 2025)
- ✅ Système de vérification centralisé
- ✅ Restrictions OAuth Gmail/Outlook
- ✅ Restrictions réponses automatiques
- ✅ Composant UpgradeModal
- ✅ Hook usePlanLimits
- ✅ Documentation complète

---

## 🤝 SUPPORT

Pour toute question ou problème:
- Consulter les exemples dans `INTEGRATION_LIMITS_EXAMPLES.tsx`
- Vérifier les logs API dans `/api/plan/*`
- Tester les endpoints avec Postman/Insomnia

---

**Système conçu pour être autonome, maintenable et évolutif.**
