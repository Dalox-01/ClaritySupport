# 💳 Système de Paiement MailWiz - Documentation Complète

## 🎯 Vue d'Ensemble

MailWiz utilise **Stripe** pour gérer les abonnements et paiements. Le système gère 3 plans :

| Plan | Prix | Générations/mois | Features |
|------|------|------------------|----------|
| **FREE** | 0€ | 10 | Templates par défaut, PDF avec watermark |
| **STARTER** | 7.99€ | 100 | 3 signatures, 10 templates perso, dictée vocale |
| **PRO** | 18.99€ | 1000 | Tout illimité + Chatbot IA |

---

## 🏗️ Architecture

### Fichiers Clés

```
├── lib/
│   ├── stripe.ts                    # Client Stripe, fonctions utilitaires
│   └── plan-features.ts             # Limites et features des plans
├── app/api/
│   ├── billing/
│   │   ├── checkout/route.ts        # Créer session de paiement
│   │   ├── portal/route.ts          # Portail de gestion abonnement
│   │   └── verify/route.ts          # Vérifier statut paiement
│   └── stripe/
│       └── webhook/route.ts         # Recevoir événements Stripe
├── app/dashboard/
│   ├── pricing/page.tsx             # Page de choix des plans
│   └── billing/
│       └── success/page.tsx         # Page de confirmation paiement
├── scripts/
│   └── test-payment.ts              # Script de test automatisé
└── GUIDE_TEST_PAIEMENT.md           # Guide de test détaillé
```

---

## 🔧 Configuration

### 1. Variables d'Environnement

```bash
# .env ou .env.local

# Stripe API Keys (MODE TEST)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Prix IDs (créés dans Stripe Dashboard)
STRIPE_PRICE_FREE=price_free
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Stripe Dashboard

**Produits à créer :**

1. **MailWiz Starter** - 7.99€/mois
2. **MailWiz Pro** - 18.99€/mois

**Webhooks à configurer :**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## 🔄 Flux de Paiement

### Achat d'un Abonnement

```
1. Utilisateur clique "Passer à Pro" sur /dashboard/pricing
   ↓
2. Frontend appelle POST /api/billing/checkout { priceId }
   ↓
3. Backend crée une session Stripe Checkout
   ↓
4. Utilisateur redirigé vers Stripe (formulaire de paiement)
   ↓
5. Paiement effectué sur Stripe
   ↓
6. Stripe envoie webhook checkout.session.completed
   ↓
7. Backend met à jour le plan utilisateur en base
   ↓
8. Utilisateur redirigé vers /dashboard/billing/success
   ↓
9. Frontend vérifie le paiement via GET /api/billing/verify
   ↓
10. Confirmation + Redirection vers /dashboard
```

### Gestion de l'Abonnement

```
1. Utilisateur clique "Gérer mon abonnement"
   ↓
2. Frontend appelle POST /api/billing/portal
   ↓
3. Backend crée une session Customer Portal Stripe
   ↓
4. Utilisateur redirigé vers le portail Stripe
   ↓
5. Actions possibles:
   - Changer de plan
   - Annuler l'abonnement
   - Mettre à jour la carte
   - Télécharger les factures
   ↓
6. Modifications envoyées via webhooks
   ↓
7. Base de données mise à jour automatiquement
```

---

## 📡 Webhooks Stripe

### Événements Gérés

**`checkout.session.completed`**
- Déclenché quand un paiement est réussi
- Actions:
  - Créer le customer Stripe si nécessaire
  - Activer l'abonnement
  - Mettre à jour le plan utilisateur
  - Créer l'entrée subscription en base
  - Envoyer email de confirmation

**`customer.subscription.updated`**
- Déclenché quand un abonnement change
- Actions:
  - Mettre à jour le statut de subscription
  - Mettre à jour current_period_end
  - Si canceled/unpaid: downgrade vers FREE

**`customer.subscription.deleted`**
- Déclenché quand un abonnement est annulé
- Actions:
  - Mettre le plan utilisateur à FREE
  - Marquer subscription comme canceled
  - Logger l'événement

### Implémentation

Fichier: `app/api/stripe/webhook/route.ts`

```typescript
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  
  // Vérifier la signature
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  // Traiter l'événement
  switch (event.type) {
    case 'checkout.session.completed':
      // Activer l'abonnement
      break;
    case 'customer.subscription.updated':
      // Mettre à jour l'abonnement
      break;
    case 'customer.subscription.deleted':
      // Annuler l'abonnement
      break;
  }
}
```

---

## 🎨 Interface Utilisateur

### Page de Pricing

Fichier: `app/dashboard/pricing/page.tsx`

**Features:**
- Affiche les 3 plans (FREE, STARTER, PRO)
- Highlight du plan actuel
- Boutons d'upgrade/downgrade
- Lien vers le portail de gestion

**Logique:**
```typescript
const handleUpgrade = async (plan: 'STARTER' | 'PRO') => {
  const priceId = plan === 'STARTER' 
    ? process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY
    : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;

  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ priceId }),
  });

  const { url } = await response.json();
  window.location.href = url; // Redirection vers Stripe
};
```

### Page de Succès

Fichier: `app/dashboard/billing/success/page.tsx`

**Fonctionnalités:**
- Récupère le `session_id` de l'URL
- Vérifie le statut du paiement via `/api/billing/verify`
- Affiche un message de succès/erreur
- Redirige vers le dashboard après 3s

---

## 🧪 Tests

### Script Automatisé

```bash
npm run payment:test
```

**Ce script vérifie:**
- ✅ Configuration .env complète
- ✅ Clés Stripe valides
- ✅ Mode TEST/LIVE
- ✅ Prix Starter et Pro accessibles
- ✅ Webhooks configurés
- ✅ Création de customer de test

### Tests Manuels

Voir `GUIDE_TEST_PAIEMENT.md` pour :
- Achat plan STARTER
- Achat plan PRO
- Upgrade STARTER → PRO
- Annulation abonnement
- Test cartes Stripe
- Vérification webhooks

### Cartes de Test

```
✅ Succès:           4242 4242 4242 4242
❌ Refusé:           4000 0000 0000 0002
💰 Fonds insuffis.:  4000 0000 0000 9995
🔐 3D Secure:        4000 0027 6000 3184
```

---

## 🔒 Sécurité

### Protection Implémentée

1. **Validation des entrées**
   - Vérification du priceId
   - Validation de l'authentification
   - Sanitization des données

2. **Webhooks sécurisés**
   - Vérification de la signature Stripe
   - Protection contre replay attacks
   - Logging de tous les événements

3. **Rate Limiting**
   - Middleware protège les routes billing
   - Limite les tentatives de paiement

4. **Customer Portal**
   - Géré par Stripe (PCI compliant)
   - Pas de gestion de cartes côté serveur

---

## 📊 Base de Données

### Table `users`

```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  plan VARCHAR DEFAULT 'FREE',  -- FREE | STARTER | PRO
  stripe_customer_id VARCHAR,
  ...
)
```

### Table `subscriptions`

```sql
subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stripe_subscription_id VARCHAR UNIQUE,
  status VARCHAR,  -- active | canceled | past_due
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Table `audit_logs`

```sql
audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR,  -- checkout_initiated, subscription_created, etc.
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## 🚀 Déploiement

### En Production

1. **Basculer en mode LIVE** sur Stripe
2. **Recréer les produits** en mode LIVE
3. **Configurer les webhooks** avec l'URL de production
4. **Mettre à jour .env.production** :
   ```bash
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_live_...
   STRIPE_PRICE_STARTER_MONTHLY=price_live_...
   STRIPE_PRICE_PRO_MONTHLY=price_live_...
   ```
5. **Activer le Customer Portal** dans Stripe
6. **Configurer les emails** de facturation

### Vérifications Post-Déploiement

- [ ] Test d'achat avec vraie carte (petit montant)
- [ ] Webhooks reçus et traités
- [ ] Plan mis à jour correctement
- [ ] Customer Portal accessible
- [ ] Emails de confirmation envoyés
- [ ] Logs d'erreur vérifiés

---

## 📈 Monitoring

### Logs à Surveiller

```typescript
// Logs importants
logInfo('Checkout session created', { userId, sessionId });
logInfo('Payment verified', { userId, plan });
logError('Webhook processing failed', error);
```

### Métriques Stripe Dashboard

- Nombre d'abonnements actifs
- Taux de churn
- Revenus mensuels (MRR)
- Taux de succès des paiements

### Alertes à Configurer

- Webhook en échec
- Paiement refusé
- Abonnement annulé
- Erreur 500 sur routes billing

---

## 🐛 Résolution de Problèmes

### Le paiement ne fonctionne pas

**Causes:**
- Prix ID incorrect
- Clés Stripe invalides
- Mode TEST/LIVE mismatch

**Solution:**
```bash
npm run payment:test  # Vérifie la config
```

### Webhooks non reçus

**Causes:**
- URL incorrecte
- Webhook secret invalide
- Serveur non accessible

**Solution:**
- Utiliser Stripe CLI en local
- Vérifier les logs Stripe Dashboard
- Tester avec `stripe trigger`

### Plan non mis à jour

**Causes:**
- Webhook non traité
- Erreur en base de données
- Session utilisateur non rafraîchie

**Solution:**
- Vérifier les logs du webhook
- Forcer le refresh de la session
- Vérifier la base de données

---

## ✅ Checklist

Avant de considérer le système comme prêt :

- [ ] Configuration Stripe complète
- [ ] Produits créés (Starter + Pro)
- [ ] Webhooks configurés
- [ ] Tests passés (`npm run payment:test`)
- [ ] Tests manuels réussis
- [ ] Customer Portal activé
- [ ] Emails configurés
- [ ] Documentation lue
- [ ] Logs monitoring en place

---

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Next.js + Stripe](https://stripe.com/docs/payments/checkout/how-checkout-works)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)

---

**Dernière mise à jour :** 3 novembre 2025  
**Version :** 1.0.0  
**Statut :** ✅ Production Ready
