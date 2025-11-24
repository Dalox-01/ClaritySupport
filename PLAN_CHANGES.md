# MailWiz - Mise à jour des plans tarifaires

## 📋 Résumé de mise à jour

Mise en place de 3 plans tarifaires avec restrictions par fonctionnalité.

## 💰 Structure des plans

### FREE (0€/mois)
- ✅ 10 générations/mois
- ❌ Templates par défaut uniquement
- ❌ Export PDF avec watermark
- ❌ Pas de signatures personnalisées
- ❌ Pas de variables auto-remplissables  
- ❌ Pas de templates personnalisés
- ❌ Pas de dictée vocale
- ❌ Pas de chatbot IA

### STARTER (7.99€/mois)
- ✅ 100 générations/mois
- ✅ 3 signatures personnalisées max
- ✅ Variables auto-remplissables activées
- ✅ 10 templates personnalisés max
- ✅ Dictée vocale activée
- ✅ Export PDF sans watermark
- ✅ Historique 30 jours
- ❌ Pas de chatbot IA

### PRO (18.99€/mois)
- ✅ 1000 générations/mois
- ✅ Signatures illimitées
- ✅ Variables auto-remplissables activées
- ✅ Templates personnalisés illimités
- ✅ Dictée vocale activée
- ✅ Chatbot IA pour améliorer emails
- ✅ Export PDF sans watermark
- ✅ Historique illimité
- ✅ Support prioritaire
- ✅ Accès anticipé aux nouvelles fonctionnalités

## 🔧 Fichiers modifiés

### 1. Base de données
- ✅ `supabase/migrations/20251031_add_starter_plan.sql` - Migration pour ajouter STARTER

### 2. Types et utilitaires
- ✅ `lib/db.ts` - Type User modifié (plan: 'FREE' | 'STARTER' | 'PRO')
- ✅ `lib/db.ts` - Fonction getUserQuota() mise à jour avec 3 limites
- ✅ `lib/auth.ts` - Session type mis à jour
- ✅ `lib/stripe.ts` - Plans STARTER ajouté avec limites
- ✅ `lib/plan-features.ts` - **NOUVEAU** Utilitaires de vérification des permissions

### 3. API Routes
- ✅ `app/api/signatures/route.ts` - Restrictions par plan (FREE=0, STARTER=3, PRO=illimité)
- ✅ `app/api/user-templates/route.ts` - Restrictions par plan (FREE=0, STARTER=10, PRO=illimité)
- ✅ `app/api/stripe/webhook/route.ts` - Détection du plan selon price_id Stripe

### 4. Pages
- ✅ `app/dashboard/pricing/page.tsx` - **NOUVEAU** Page de pricing avec 3 plans
- ⏳ `app/dashboard/page.tsx` - Ajout des vérifications canAccessSignatures, canAccessVariables, canAccessVoice

### 5. Components
- ⏳ Boutons dictée vocale - Ajout tooltip "Plan STARTER requis" si FREE
- ⏳ Boutons signatures - Disabled + message si FREE
- ⏳ Boutons variables - Disabled + message si FREE

## 🎯 TODO restants

### 1. Exécuter migration Supabase
```sql
-- Dans le SQL Editor de Supabase
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE users ADD CONSTRAINT users_plan_check CHECK (plan IN ('FREE', 'STARTER', 'PRO'));
```

### 2. Variables d'environnement Stripe
Ajouter dans `.env` :
```env
STRIPE_PRICE_STARTER_MONTHLY=price_xxx  # À créer dans Stripe Dashboard
STRIPE_PRICE_PRO_MONTHLY=price_yyy      # Mettre à jour avec nouveau prix 18.99€
```

### 3. Créer produits Stripe

#### Plan STARTER - 7.99€
1. Aller sur https://dashboard.stripe.com/test/products
2. Créer produit "MailWiz Starter"
3. Prix : 7.99€/mois récurrent
4. Copier `price_id` dans `.env` → `STRIPE_PRICE_STARTER_MONTHLY`

#### Plan PRO - 18.99€
1. Modifier ou créer nouveau produit "MailWiz Pro"
2. Prix : 18.99€/mois récurrent  
3. Copier `price_id` dans `.env` → `STRIPE_PRICE_PRO_MONTHLY`

### 4. Finaliser restrictions UI
- [ ] Dashboard page.tsx - Ajouter restrictions sur tous les boutons dictée
- [ ] Signature buttons - Montrer plan requis si FREE
- [ ] Variables buttons - Montrer plan requis si FREE
- [ ] Custom templates button - Montrer plan requis si FREE
- [ ] PDF export - Ajouter watermark pour FREE

### 5. Testing
- [ ] Tester création signature avec FREE (doit bloquer)
- [ ] Tester création signature avec STARTER (max 3)
- [ ] Tester création signature avec PRO (illimité)
- [ ] Tester création template avec FREE (doit bloquer)
- [ ] Tester création template avec STARTER (max 10)
- [ ] Tester variables avec FREE (doit bloquer)
- [ ] Tester dictée avec FREE (doit bloquer)
- [ ] Tester upgrade FREE → STARTER
- [ ] Tester upgrade STARTER → PRO
- [ ] Vérifier quotas (10/100/1000)

## 📊 Page de pricing

Accessible via `/dashboard/pricing`

Features :
- Cards pour les 3 plans
- Highlight sur PRO ("Le plus populaire")
- Badge "Votre plan actuel" 
- Bouton upgrade avec redirection Stripe Checkout
- Bouton "Gérer mon abonnement" pour plans payants

## 🔍 Fonctions utilitaires

`lib/plan-features.ts` expose :

```typescript
canUseSignatures(plan: PlanType): boolean
canUseVariables(plan: PlanType): boolean  
canUseCustomTemplates(plan: PlanType): boolean
canUseVoiceDictation(plan: PlanType): boolean
getMaxSignatures(plan: PlanType): number  // 0, 3, ou -1 (illimité)
getMaxCustomTemplates(plan: PlanType): number  // 0, 10, ou -1
hasPdfWatermark(plan: PlanType): boolean
getGenerationsLimit(plan: PlanType): number  // 10, 100, ou 1000
getPlanName(plan: PlanType): string
getPlanPrice(plan: PlanType): number
```

Usage dans components :
```typescript
import { canUseSignatures, type PlanType } from '@/lib/plan-features';

const userPlan: PlanType = session?.user?.plan || 'FREE';

if (!canUseSignatures(userPlan)) {
  toast.error('Fonctionnalité disponible à partir du plan STARTER');
  return;
}
```

## 🚀 Déploiement

1. Exécuter migration SQL dans Supabase
2. Créer produits Stripe (STARTER + PRO mis à jour)
3. Ajouter variables d'environnement
4. Déployer sur Vercel
5. Tester tous les scénarios

## 💡 Recommandations business

- **Prix actuel FREE** : Gardé à 0€ pour acquisition
- **STARTER à 7.99€** : Sweet spot pour freelances/petites entreprises
- **PRO à 18.99€** : Pour professionnels intensifs

ROI estimé par utilisateur PRO :
- Coût OpenAI : ~0.75€/mois (1000 générations)
- Coût infra : ~0.30€/mois
- Stripe fees : ~0.80€/mois
- **Marge nette : ~17.14€/mois (90%)**

ROI estimé par utilisateur STARTER :
- Coût OpenAI : ~0.10€/mois (100 générations)
- Coût infra : ~0.15€/mois
- Stripe fees : ~0.48€/mois
- **Marge nette : ~7.26€/mois (91%)**

---

**Date de mise à jour** : 31 octobre 2025
**Auteur** : GitHub Copilot
