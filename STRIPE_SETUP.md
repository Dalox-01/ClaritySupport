# Configuration Stripe pour ClaritySupport

Ce document explique comment configurer Stripe pour activer le système de paiement et d'abonnements.

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Clés API Stripe
STRIPE_SECRET_KEY=sk_test_...           # Clé secrète Stripe (test ou live)
STRIPE_PUBLISHABLE_KEY=pk_test_...      # Clé publique Stripe (test ou live)
STRIPE_WEBHOOK_SECRET=whsec_...         # Secret pour vérifier les webhooks

# Price IDs Stripe - Plan STARTER
STRIPE_PRICE_STARTER_MONTHLY=price_...  # Price ID pour Starter mensuel
STRIPE_PRICE_STARTER_YEARLY=price_...   # Price ID pour Starter annuel

# Price IDs Stripe - Plan PRO
STRIPE_PRICE_PRO_MONTHLY=price_...      # Price ID pour Pro mensuel
STRIPE_PRICE_PRO_YEARLY=price_...       # Price ID pour Pro annuel

# Price IDs Stripe - Plan ENTERPRISE
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...  # Price ID pour Enterprise mensuel
STRIPE_PRICE_ENTERPRISE_YEARLY=price_...   # Price ID pour Enterprise annuel

# Price IDs Stripe - Plan FREE (optionnel, généralement non utilisé)
STRIPE_PRICE_FREE_MONTHLY=price_...     # Price ID pour Free (si nécessaire)
STRIPE_PRICE_FREE_YEARLY=price_...      # Price ID pour Free (si nécessaire)
```

## Configuration Stripe Dashboard

### 1. Créer les produits

Dans le Stripe Dashboard (https://dashboard.stripe.com):

1. Aller dans **Products** > **Add product**
2. Créer 3 produits :

#### Plan STARTER
- **Name**: ClaritySupport Starter
- **Description**: Plan Starter - 2,500 emails/mois
- **Pricing**: 
  - Mensuel: 49€/mois (recurring)
  - Annuel: 490€/an (recurring, yearly)

#### Plan PRO
- **Name**: ClaritySupport Pro
- **Description**: Plan Pro - 7,500 emails/mois
- **Pricing**:
  - Mensuel: 139€/mois (recurring)
  - Annuel: 1,390€/an (recurring, yearly)

#### Plan ENTERPRISE
- **Name**: ClaritySupport Enterprise
- **Description**: Plan Enterprise - 25,000 emails/mois
- **Pricing**:
  - Mensuel: 229€/mois (recurring)
  - Annuel: 2,290€/an (recurring, yearly)

### 2. Récupérer les Price IDs

Après avoir créé les produits et leurs prix :

1. Cliquer sur chaque prix
2. Copier le **Price ID** (commence par `price_...`)
3. Ajouter chaque Price ID dans `.env.local`

### 3. Configurer les webhooks

1. Aller dans **Developers** > **Webhooks**
2. Cliquer sur **Add endpoint**
3. URL de l'endpoint : `https://votredomaine.com/api/stripe/webhook`
4. Sélectionner les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copier le **Signing secret** (commence par `whsec_...`)
6. Ajouter dans `.env.local` comme `STRIPE_WEBHOOK_SECRET`

### 4. Tester en mode test

Pour tester avec des cartes de test Stripe :

- **Carte valide** : `4242 4242 4242 4242`
- **Date expiration** : N'importe quelle date future (ex: 12/34)
- **CVC** : N'importe quel 3 chiffres (ex: 123)
- **Paiement échoué** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0025 0000 3155`

Plus de cartes de test : https://stripe.com/docs/testing

### 5. Passer en production

Quand vous êtes prêt pour la production :

1. Activer votre compte Stripe
2. Remplacer toutes les clés `sk_test_...` par `sk_live_...`
3. Remplacer `pk_test_...` par `pk_live_...`
4. Recréer les produits en mode live (ou les activer)
5. Mettre à jour les Price IDs avec les versions live
6. Reconfigurer le webhook en production et mettre à jour `STRIPE_WEBHOOK_SECRET`

## Structure de la base de données

La table `subscriptions` doit avoir cette structure :

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  billing_period TEXT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
```

## Flow de paiement

### Nouveau client

1. **Frontend** : Utilisateur clique sur "Choisir ce plan"
2. **Redirect** : `/checkout?plan=starter&period=monthly`
3. **Page Checkout** : Affiche récapitulatif + bouton "Procéder au paiement"
4. **API Call** : `POST /api/stripe/create-checkout-session`
5. **Redirect Stripe** : Utilisateur redirigé vers Stripe Checkout
6. **Paiement** : Utilisateur entre ses coordonnées de paiement
7. **Webhook** : `checkout.session.completed` → Création de l'abonnement dans DB
8. **Redirect** : `/mail-center?checkout=success`

### Gestion de l'abonnement

1. **Page Billing** : `/mail-center/billing`
2. **Bouton** : "Gérer l'abonnement"
3. **API Call** : `POST /api/stripe/create-portal-session`
4. **Redirect** : Customer Portal Stripe
5. **Actions possibles** :
   - Mettre à jour moyen de paiement
   - Voir factures et les télécharger
   - Changer de plan (upgrade/downgrade)
   - Annuler l'abonnement
6. **Webhooks** : `customer.subscription.updated` → Mise à jour DB
7. **Redirect** : `/mail-center/billing`

## Limites et quotas

Les limites sont définies dans `lib/pricing-plans.ts` :

| Plan       | Prix      | Emails/mois | Réponses auto/mois | Comptes | Templates |
|------------|-----------|-------------|-------------------|---------|-----------|
| FREE       | 0€        | 100         | 40                | 1       | 3         |
| STARTER    | 49€/mois  | 2,500       | 2,500             | 5       | 50        |
| PRO        | 139€/mois | 7,500       | 7,500             | 15      | 200       |
| ENTERPRISE | 229€/mois | 25,000      | 25,000            | -1 (∞)  | -1 (∞)    |

Les limites sont vérifiées automatiquement via :
- `lib/subscription-limits.ts` : Fonctions de vérification serveur
- `app/api/subscription/check-limit/route.ts` : API de vérification
- Webhooks Stripe mettent à jour le plan automatiquement

## Sécurité

✅ **Bonnes pratiques** :
- Ne jamais exposer `STRIPE_SECRET_KEY` côté client
- Toujours vérifier la signature des webhooks
- Utiliser HTTPS en production
- Valider les métadonnées des sessions de paiement
- Logger tous les événements webhook pour debugging

❌ **À éviter** :
- Faire confiance aux données client sans vérification serveur
- Modifier les plans côté client
- Exposer les Price IDs sensibles (pas critique mais mieux de les garder serveur)

## Support et documentation

- **Stripe Docs** : https://stripe.com/docs
- **Stripe Dashboard** : https://dashboard.stripe.com
- **Stripe CLI** (testing local) : https://stripe.com/docs/stripe-cli
- **Webhooks Testing** : `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Troubleshooting

### Webhook non reçu
1. Vérifier que l'URL est accessible publiquement
2. Vérifier le `STRIPE_WEBHOOK_SECRET`
3. Vérifier les logs Stripe Dashboard > Developers > Webhooks > Logs

### Abonnement non créé
1. Vérifier les logs serveur (console.log dans webhook)
2. Vérifier que les métadonnées sont bien passées
3. Vérifier la structure de la table `subscriptions`

### Price ID non trouvé
1. Vérifier que le Price ID existe dans Stripe
2. Vérifier qu'il est bien dans `.env.local`
3. Redémarrer le serveur après modification de `.env.local`

### Paiement échoue en test
1. Utiliser les cartes de test Stripe officielles
2. Vérifier que vous êtes en mode test (`sk_test_...`)
3. Vérifier les logs Stripe Dashboard
