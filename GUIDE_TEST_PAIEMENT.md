# 💳 Guide de Test - Système de Paiement Stripe

## 🎯 Vue d'ensemble

Ce guide vous permet de tester COMPLÈTEMENT le système de paiement de MailWiz en mode test Stripe.

---

## 📋 Prérequis

### 1. Compte Stripe (Mode Test)

1. **Créer un compte Stripe** : https://dashboard.stripe.com/register
2. **Activer le mode TEST** (toggle en haut à droite du dashboard)
3. **Récupérer les clés API** :
   - Dashboard → Developers → API keys
   - `Publishable key` (commence par `pk_test_`)
   - `Secret key` (commence par `sk_test_`)

### 2. Créer les Produits et Prix

Dans le **Dashboard Stripe (mode TEST)** :

#### **Produit 1 : Starter**
```
1. Products → + Add product
2. Name: MailWiz Starter
3. Description: Plan Starter pour professionnels
4. Pricing: Recurring
5. Price: 7.99 EUR
6. Billing period: Monthly
7. Save → Copier le Price ID (commence par price_...)
```

#### **Produit 2 : Pro**
```
1. Products → + Add product
2. Name: MailWiz Pro
3. Description: Plan Pro pour power users
4. Pricing: Recurring
5. Price: 18.99 EUR
6. Billing period: Monthly
7. Save → Copier le Price ID (commence par price_...)
```

### 3. Configurer les Webhooks

**Important pour que les abonnements soient activés automatiquement !**

```
1. Dashboard Stripe → Developers → Webhooks
2. + Add endpoint
3. Endpoint URL: http://localhost:3000/api/stripe/webhook
   (ou votre URL de production)
4. Description: MailWiz Webhooks
5. Select events to listen to:
   ✅ checkout.session.completed
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
6. Add endpoint
7. Copier le Signing secret (commence par whsec_...)
```

### 4. Configuration .env

Mettez à jour votre fichier `.env` ou `.env.local` :

```bash
# Stripe (MODE TEST)
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET

# Prix IDs (copiés depuis Stripe Dashboard)
STRIPE_PRICE_FREE=price_free # Pas nécessaire, juste un placeholder
STRIPE_PRICE_STARTER_MONTHLY=price_VOTRE_PRIX_STARTER
STRIPE_PRICE_PRO_MONTHLY=price_VOTRE_PRIX_PRO

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **Redémarrez le serveur après avoir modifié .env !**

```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

---

## 🧪 Tests à Effectuer

### Test 1 : Acheter le Plan STARTER ✅

1. **Connexion** : Connectez-vous à votre compte MailWiz
2. **Accéder aux tarifs** : `/dashboard/pricing`
3. **Cliquer sur "Passer à Starter"**
4. **Redirection vers Stripe Checkout**
5. **Utiliser une carte de test** :
   ```
   Numéro: 4242 4242 4242 4242
   Date: n'importe quelle date future (ex: 12/25)
   CVC: n'importe quel 3 chiffres (ex: 123)
   ```
6. **Compléter le paiement**
7. **Vérifier la redirection** vers `/dashboard/billing/success`
8. **Vérifier que le plan a changé** : Votre plan doit être "STARTER"

**Attendu:**
- ✅ Checkout Stripe s'ouvre
- ✅ Paiement accepté
- ✅ Redirection vers page de succès
- ✅ Plan mis à jour vers STARTER
- ✅ Abonnement visible dans Dashboard Stripe

### Test 2 : Acheter le Plan PRO ✅

**Si vous avez déjà STARTER, testez avec un autre compte.**

1. **Connexion** avec un nouveau compte
2. **Accéder aux tarifs** : `/dashboard/pricing`
3. **Cliquer sur "Passer à Pro"**
4. **Utiliser la carte de test** : `4242 4242 4242 4242`
5. **Compléter le paiement**
6. **Vérifier le plan** : Doit être "PRO"

### Test 3 : Upgrade STARTER → PRO ⬆️

1. **Avec un compte STARTER**
2. **Aller sur** `/dashboard/pricing`
3. **Cliquer sur "Gérer mon abonnement"** (sur la carte Starter)
4. **Portail Stripe s'ouvre**
5. **Update subscription** → Choisir Pro
6. **Vérifier le changement** de plan

### Test 4 : Gérer l'Abonnement (Customer Portal) 🎛️

1. **Avec un compte payant** (STARTER ou PRO)
2. **Aller sur** `/dashboard/pricing`
3. **Cliquer sur "Gérer mon abonnement Stripe"** (bouton en bas)
4. **Portal Billing Stripe s'ouvre**
5. **Vérifier les options** :
   - Voir les factures
   - Mettre à jour la carte
   - Annuler l'abonnement
   - Changer de plan

### Test 5 : Annuler l'Abonnement ❌

1. **Customer Portal** (comme Test 4)
2. **Cancel subscription**
3. **Confirmer l'annulation**
4. **Vérifier** :
   - Plan revient à FREE
   - Accès restreint aux features
   - Email de confirmation (si configuré)

### Test 6 : Webhooks ✅

**Tester que les webhooks fonctionnent correctement :**

1. **Faire un paiement** (Test 1 ou 2)
2. **Aller dans Stripe Dashboard** → Developers → Webhooks
3. **Cliquer sur votre webhook**
4. **Vérifier les événements reçus** :
   - `checkout.session.completed` ✅
   - `customer.subscription.updated` ✅

**Si les webhooks ne sont PAS reçus :**
- Vérifier l'URL du webhook dans Stripe
- Vérifier que `STRIPE_WEBHOOK_SECRET` est correct
- Pour local, utiliser Stripe CLI (voir section Tests Locaux Avancés)

### Test 7 : Cartes de Test - Différents Scénarios 💳

Stripe fournit plusieurs cartes de test :

#### **Paiement réussi**
```
4242 4242 4242 4242
```

#### **Paiement refusé (insufficient funds)**
```
4000 0000 0000 9995
```

#### **Paiement refusé (generic decline)**
```
4000 0000 0000 0002
```

#### **3D Secure requis**
```
4000 0027 6000 3184
```

Testez chaque carte pour vérifier que les erreurs sont bien gérées.

### Test 8 : Limites des Plans 🎯

Vérifiez que les limites sont respectées :

#### **Plan FREE**
1. Générer 10 emails ✅
2. Essayer d'en générer un 11ème ❌ → Doit afficher un message d'upgrade

#### **Plan STARTER**
1. Créer 3 signatures ✅
2. Essayer d'en créer une 4ème ❌ → Doit bloquer

#### **Plan PRO**
1. Signatures illimitées ✅
2. Templates illimités ✅

---

## 🔧 Tests Locaux Avancés

### Utiliser Stripe CLI pour les Webhooks Locaux

Si vous testez en local et que les webhooks ne fonctionnent pas :

```bash
# 1. Installer Stripe CLI
# Windows (avec Scoop)
scoop install stripe

# macOS
brew install stripe/stripe-cli/stripe

# 2. Login
stripe login

# 3. Forward webhooks vers localhost
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# 4. Copier le webhook secret affiché
# whsec_...

# 5. Mettre à jour .env
STRIPE_WEBHOOK_SECRET=whsec_...

# 6. Relancer le serveur
npm run dev
```

Maintenant tous les webhooks Stripe seront forwarded vers votre local !

### Déclencher des Webhooks Manuellement

```bash
# Déclencher checkout.session.completed
stripe trigger checkout.session.completed

# Déclencher subscription.deleted
stripe trigger customer.subscription.deleted
```

---

## 📊 Vérifications après Tests

### Dans le Dashboard MailWiz

- [ ] Plan utilisateur mis à jour correctement
- [ ] Historique des paiements visible
- [ ] Features débloquées selon le plan
- [ ] Limites respectées

### Dans le Dashboard Stripe

- [ ] Customer créé
- [ ] Subscription active
- [ ] Paiement enregistré
- [ ] Webhooks reçus (Developers → Webhooks → See logs)

### Dans la Base de Données (Supabase)

```sql
-- Vérifier le plan de l'utilisateur
SELECT id, email, plan, stripe_customer_id 
FROM users 
WHERE email = 'votre@email.com';

-- Vérifier l'abonnement
SELECT * FROM subscriptions 
WHERE user_id = 'USER_ID';

-- Vérifier les logs d'audit
SELECT * FROM audit_logs 
WHERE user_id = 'USER_ID' 
ORDER BY created_at DESC;
```

---

## 🐛 Résolution de Problèmes

### Le paiement ne fonctionne pas

**Vérifier :**
1. ✅ Clés Stripe correctes dans .env
2. ✅ Mode TEST activé dans Stripe
3. ✅ Prix IDs corrects
4. ✅ Serveur redémarré après changement .env

**Console navigateur (F12)** pour voir les erreurs.

### Le plan n'est pas mis à jour après paiement

**Causes possibles :**
1. ❌ Webhooks non configurés
2. ❌ `STRIPE_WEBHOOK_SECRET` incorrect
3. ❌ URL du webhook incorrecte

**Solution :**
- Vérifier les logs des webhooks dans Stripe Dashboard
- Utiliser Stripe CLI en local
- Vérifier les logs serveur

### Redirection après paiement ne fonctionne pas

**Vérifier :**
- `NEXT_PUBLIC_APP_URL` dans .env
- URLs de succès/annulation dans checkout.ts

### Les limites de plan ne sont pas respectées

**Vérifier :**
- Fonction `canUse*()` dans `lib/plan-features.ts`
- Vérification du plan avant chaque action
- Mise à jour de la session utilisateur

---

## ✅ Checklist Finale

Avant de passer en production :

- [ ] Tous les tests passent en mode TEST
- [ ] Webhooks reçus et traités correctement
- [ ] Plans et prix configurés dans Stripe
- [ ] Customer Portal activé
- [ ] Emails de confirmation configurés (Resend)
- [ ] Gestion des erreurs de paiement
- [ ] Logs d'audit enregistrés
- [ ] Documentation lue et comprise

---

## 🚀 Passage en Production

Une fois les tests réussis en mode TEST :

1. **Basculer en mode LIVE** dans Stripe Dashboard
2. **Recréer les produits et prix** en mode LIVE
3. **Mettre à jour .env** avec les clés LIVE :
   ```bash
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PRICE_STARTER_MONTHLY=price_live_...
   STRIPE_PRICE_PRO_MONTHLY=price_live_...
   ```
4. **Reconfigurer les webhooks** avec l'URL de production
5. **Tester avec une VRAIE carte** (petite somme)
6. **Annuler immédiatement** le test

---

## 📞 Support

Si vous rencontrez un problème :

1. Consultez les logs serveur
2. Vérifiez les webhooks Stripe logs
3. Testez avec Stripe CLI
4. Documentations :
   - [Stripe Testing](https://stripe.com/docs/testing)
   - [Stripe Webhooks](https://stripe.com/docs/webhooks)
   - [Next.js + Stripe](https://stripe.com/docs/checkout/quickstart)

---

**Dernière mise à jour :** 3 novembre 2025  
**Version :** 1.0.0  
**Statut :** ✅ Prêt pour les tests
