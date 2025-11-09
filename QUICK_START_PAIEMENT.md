# 🚀 Quick Start - Système de Paiement

## Configuration Rapide (15 minutes)

### 1️⃣ Créer un Compte Stripe (2 min)

1. Aller sur https://dashboard.stripe.com/register
2. S'inscrire avec votre email
3. **Activer le mode TEST** (toggle en haut à droite)

### 2️⃣ Créer les Produits (5 min)

**Dans Stripe Dashboard → Products → + Add product**

**Produit 1 - Starter:**
- Name: `MailWiz Starter`
- Price: `7.99 EUR` / `Monthly`
- Save → **Copier le Price ID** (price_...)

**Produit 2 - Pro:**
- Name: `MailWiz Pro`
- Price: `18.99 EUR` / `Monthly`
- Save → **Copier le Price ID** (price_...)

### 3️⃣ Récupérer les Clés API (1 min)

**Stripe Dashboard → Developers → API keys**

- Copier **Publishable key** (pk_test_...)
- Copier **Secret key** (sk_test_...)

### 4️⃣ Configurer les Webhooks (3 min)

**Stripe Dashboard → Developers → Webhooks → + Add endpoint**

- Endpoint URL: `http://localhost:3000/api/stripe/webhook`
- Select events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Add endpoint
- **Copier le Signing secret** (whsec_...)

### 5️⃣ Mettre à Jour .env (2 min)

Créer/éditer `.env.local` :

```bash
# Stripe (MODE TEST)
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_ICI
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_ICI
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_ICI

# Prix (copiés depuis Stripe)
STRIPE_PRICE_FREE=price_free
STRIPE_PRICE_STARTER_MONTHLY=price_VOTRE_STARTER_ICI
STRIPE_PRICE_PRO_MONTHLY=price_VOTRE_PRO_ICI

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6️⃣ Tester la Configuration (2 min)

```bash
# Vérifier la config
npm run payment:test

# Si tout est ✅, lancer le serveur
npm run dev
```

---

## 🧪 Premier Test de Paiement

### Étape par Étape

1. **Ouvrir** http://localhost:3000
2. **Se connecter** (créer un compte si nécessaire)
3. **Aller sur** `/dashboard/pricing`
4. **Cliquer** "Passer à Starter" ou "Passer à Pro"
5. **Remplir** avec la carte de test:
   ```
   Numéro: 4242 4242 4242 4242
   Date:   12/25
   CVC:    123
   ```
6. **Cliquer** "Payer"
7. **Vérifier** la redirection vers la page de succès
8. **Confirmer** que votre plan a changé

### Résultat Attendu

✅ Paiement accepté
✅ Redirection vers `/dashboard/billing/success`
✅ Plan mis à jour (STARTER ou PRO)
✅ Vous pouvez voir votre abonnement dans Stripe Dashboard

---

## 🎯 Actions Suivantes

### Tester Tous les Scénarios

Voir `GUIDE_TEST_PAIEMENT.md` pour tester :
- Achat STARTER
- Achat PRO  
- Upgrade STARTER → PRO
- Gérer l'abonnement (Customer Portal)
- Annuler l'abonnement
- Cartes refusées

### Consulter la Documentation

- `SYSTEME_PAIEMENT.md` - Documentation complète
- `GUIDE_TEST_PAIEMENT.md` - Guide de test détaillé

---

## 🐛 Problèmes Courants

### ❌ "Configuration incomplète"

```bash
npm run payment:test
```

Vérifiez que toutes les variables .env sont remplies.

### ❌ "Invalid API key"

- Vérifiez que vous êtes en mode TEST
- Clés commencent par `pk_test_` et `sk_test_`

### ❌ "Webhooks non reçus"

En local, utilisez Stripe CLI :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copiez le webhook secret affiché et mettez-le dans .env.

---

## ✅ Checklist

- [ ] Compte Stripe créé
- [ ] Mode TEST activé
- [ ] 2 produits créés (Starter + Pro)
- [ ] Clés API copiées dans .env
- [ ] Webhooks configurés
- [ ] `npm run payment:test` passe ✅
- [ ] Premier paiement test réussi

---

**Temps total : ~15 minutes**

**Prêt à tester !** 🚀
