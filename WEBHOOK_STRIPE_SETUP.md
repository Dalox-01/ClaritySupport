# 🔧 Configuration du Webhook Stripe (CRITIQUE)

## ⚠️ PROBLÈME IDENTIFIÉ

Quand un utilisateur paie sur Stripe, l'abonnement N'EST PAS mis à jour dans la base de données car **le webhook Stripe n'est pas configuré**.

## ✅ SOLUTION

### 1. Configuration dans Stripe Dashboard (PRODUCTION)

1. **Aller sur** : https://dashboard.stripe.com/webhooks
2. **Cliquer sur** : "+ Add endpoint"
3. **URL du endpoint** : 
   ```
   https://claritysupport.vercel.app/api/stripe/webhook
   ```
4. **Events à sélectionner** :
   - `checkout.session.completed` (✅ CRITIQUE)
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. **Copier le signing secret** : `whsec_XXXXXXXXXXXXX`

### 2. Ajouter le secret dans Vercel

1. **Aller sur** : https://vercel.com/Dalox-01/clarity-support/settings/environment-variables
2. **Ajouter** :
   - **Name** : `STRIPE_WEBHOOK_SECRET`
   - **Value** : `whsec_XXXXXXXXXXXXX` (le secret copié depuis Stripe)
   - **Environments** : ✅ Production, ✅ Preview, ✅ Development

3. **Redéployer** l'application sur Vercel

### 3. Test en MODE TEST Stripe

1. **URL pour test (mode test)** :
   ```
   https://claritysupport.vercel.app/api/stripe/webhook
   ```

2. **Événements de test** :
   - `checkout.session.completed`
   - `customer.subscription.updated`

3. **Vérifier dans Stripe Dashboard > Webhooks** :
   - Le webhook doit afficher "Succeeded" (200) après chaque paiement

### 4. Vérification après chaque paiement

Après qu'un client paie :

1. **Stripe Dashboard > Webhooks** : Vérifier que l'événement `checkout.session.completed` est reçu (status 200)
2. **Supabase** : Vérifier la table `subscriptions` contient bien l'abonnement
3. **Mail Center** : Rafraîchir et vérifier que le compteur affiche le bon plan

## 🧪 Test Local (pour développement)

Pour tester localement AVANT de déployer en production :

### Option 1 : Stripe CLI (recommandé)

```bash
# Installer Stripe CLI
https://stripe.com/docs/stripe-cli

# Se connecter
stripe login

# Forwarder les webhooks vers localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copier le webhook secret affiché (whsec_...)
# L'ajouter dans .env.local :
STRIPE_WEBHOOK_SECRET=whsec_...

# Tester un paiement
stripe trigger checkout.session.completed
```

### Option 2 : Utiliser la route de test

En attendant que le webhook soit configuré, utiliser :

```
http://localhost:3000/test-subscription.html
```

Cette page permet de créer manuellement un abonnement dans la base.

## 📊 Logs à surveiller

Quand le webhook fonctionne correctement, vous verrez dans les logs Vercel :

```
📬 Webhook reçu: checkout.session.completed
✅ Checkout complété: cs_test_XXXXX
✅ Abonnement pro créé pour user xxx-xxx-xxx
```

Si ça échoue :

```
❌ Signature Stripe manquante
❌ Signature invalide
❌ Erreur sauvegarde abonnement
```

## 🔍 Diagnostic

### Vérifier si le webhook est actif :

```bash
# Dans Stripe Dashboard > Webhooks
# Le statut doit être : Enabled
# Les derniers événements doivent afficher "Succeeded (200)"
```

### Vérifier la table subscriptions :

```sql
-- Dans Supabase SQL Editor
SELECT * FROM subscriptions 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC 
LIMIT 1;
```

## ⚡ Actions immédiates

1. ✅ Configurer le webhook dans Stripe Dashboard
2. ✅ Ajouter `STRIPE_WEBHOOK_SECRET` dans Vercel
3. ✅ Redéployer Vercel
4. ✅ Tester un paiement
5. ✅ Vérifier la table `subscriptions` dans Supabase
6. ✅ Vérifier le Mail Center affiche le bon plan

## 🚨 TRÈS IMPORTANT

**SANS webhook configuré** :
- ❌ Les paiements Stripe fonctionnent
- ❌ MAIS l'abonnement N'EST PAS mis à jour dans la base
- ❌ L'utilisateur reste en plan gratuit
- ❌ Le compteur ne s'actualise PAS

**AVEC webhook configuré** :
- ✅ Paiement → Webhook → Base de données mise à jour
- ✅ Abonnement actif immédiatement
- ✅ Compteur affiche les bonnes limites
- ✅ Tout fonctionne parfaitement

## 📝 Notes

- Le webhook est **OBLIGATOIRE** pour que le système fonctionne
- En mode test, utiliser les clés de test Stripe
- En production, utiliser les clés de production Stripe
- Le `STRIPE_WEBHOOK_SECRET` est différent entre test et production
