# 🎯 Flux de Paiement Complet - MailWiz

## Vue d'ensemble

Ce document décrit le parcours complet de paiement et de gestion d'abonnement pour MailWiz, de la sélection du plan jusqu'à la résiliation.

## 🛣️ Parcours Utilisateur

### 1️⃣ Sélection du Plan (Page Tarifs)
**Fichier:** `app/dashboard/pricing/page.tsx`

- L'utilisateur voit 3 plans : FREE, STARTER (7,99€/mois), PRO (18,99€/mois)
- Bouton d'action pour les plans payants : **"Commencer"**
- Clic sur "Commencer" → Appel à `/api/billing/checkout`

**Comportement:**
```typescript
const handleUpgrade = async (plan: 'STARTER' | 'PRO') => {
  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      priceId: PLANS[plan].priceId,
      planName: plan 
    }),
  });
  
  if (data.success) {
    window.location.href = data.url; // Redirection vers Stripe Checkout
  }
};
```

### 2️⃣ Paiement Stripe
**Fichier:** `app/api/billing/checkout/route.ts`

- Création ou récupération du client Stripe
- Génération d'une session Checkout Stripe
- URLs de retour configurées :
  - **Succès:** `/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`
  - **Annulation:** `/dashboard/pricing`

**Code clé:**
```typescript
const session = await stripe.checkout.sessions.create({
  customer: stripeCustomerId,
  payment_method_types: ['card'],
  mode: 'subscription',
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pricing`,
  metadata: { userId: session.user.email, plan: planName },
});
```

### 3️⃣ Page de Félicitations
**Fichier:** `app/dashboard/billing/success/page.tsx`

**Caractéristiques:**
- ✨ Animation de confettis (20 particules colorées)
- 🎉 Message de félicitations personnalisé
- 📋 Affichage des fonctionnalités du plan souscrit
- ⏱️ Redirection automatique après 5 secondes vers `/dashboard`
- ✅ Vérification du paiement via `/api/billing/verify`

**Animations:**
```typescript
// Confettis avec Framer Motion
{[...Array(20)].map((_, i) => (
  <motion.div
    key={i}
    className="absolute w-3 h-3 rounded-full"
    initial={{
      top: '50%',
      left: '50%',
      opacity: 1,
      backgroundColor: colors[i % colors.length],
    }}
    animate={{
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: 0,
      rotate: Math.random() * 360,
    }}
    transition={{
      duration: 2,
      delay: i * 0.05,
      ease: "easeOut",
    }}
  />
))}
```

**Fonctionnalités affichées:**

**STARTER:**
- ✓ 100 générations par mois
- ✓ Templates personnalisés
- ✓ Extension Chrome/Edge
- ✓ Support email

**PRO:**
- ✓ 1000 générations par mois
- ✓ Tout de STARTER
- ✓ Variables personnalisées illimitées
- ✓ Analyse avancée
- ✓ Support prioritaire
- ✓ Signatures multiples

### 4️⃣ Accès au Dashboard PRO
**Fichier:** `app/dashboard/page.tsx`

- L'utilisateur voit immédiatement son nouveau plan actif
- Quota mis à jour automatiquement
- Badge "Plan Pro" ou "Plan Starter" affiché
- Accès aux fonctionnalités premium débloquées

### 5️⃣ Gestion de l'Abonnement (Paramètres)
**Fichier:** `app/dashboard/settings/page.tsx`

**Section "Abonnement et facturation":**

**Affichage:**
- 📊 Plan actuel (FREE / STARTER / PRO)
- 🟢 Statut de l'abonnement (Actif)
- 💰 Prix mensuel

**Actions disponibles:**

1. **"Gérer mon abonnement"** (bouton outline)
   - Ouvre le portail Stripe Customer Portal
   - Permet de modifier les informations de paiement
   - Consulter l'historique des factures

2. **"Résilier l'abonnement"** (bouton destructive rouge)
   - Confirmation obligatoire avant résiliation
   - Annule le renouvellement automatique
   - L'abonnement reste actif jusqu'à la fin de la période payée

**Code de la section:**
```typescript
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <CreditCard className="h-5 w-5" />
      Abonnement et facturation
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Affichage du plan actuel */}
    <div className="rounded-lg border p-4">
      <Badge variant={plan === 'PRO' ? 'default' : 'secondary'}>
        {plan === 'PRO' ? 'Premium' : 'Intermédiaire'}
      </Badge>
    </div>

    {/* Boutons d'action */}
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleManageSubscription}>
        <CreditCard className="h-4 w-4 mr-2" />
        Gérer mon abonnement
      </Button>
      <Button variant="destructive" onClick={handleCancelSubscription}>
        <XCircle className="h-4 w-4 mr-2" />
        Résilier l'abonnement
      </Button>
    </div>
  </CardContent>
</Card>
```

### 6️⃣ Résiliation d'Abonnement
**Fichier:** `app/api/billing/cancel/route.ts`

**Processus:**
1. Vérification de l'authentification
2. Récupération du `stripe_customer_id` depuis Supabase
3. Recherche de l'abonnement actif dans Stripe
4. Annulation à la fin de la période : `cancel_at_period_end: true`
5. Log d'audit dans Supabase
6. Notification à l'utilisateur

**Code de résiliation:**
```typescript
// Annuler à la fin de la période (l'utilisateur garde l'accès jusqu'à la date de renouvellement)
const canceledSubscription = await stripe.subscriptions.update(subscription.id, {
  cancel_at_period_end: true,
});

// L'abonnement reste actif jusqu'à cancel_at
console.log(`Actif jusqu'au ${new Date(canceledSubscription.cancel_at! * 1000).toLocaleDateString()}`);
```

**Gestion dans le frontend:**
```typescript
const handleCancelSubscription = async () => {
  if (!confirm('Êtes-vous sûr de vouloir résilier votre abonnement ?')) {
    return;
  }

  setCancelingSubscription(true);
  try {
    const response = await fetch('/api/billing/cancel', { method: 'POST' });
    const data = await response.json();

    if (data.success) {
      toast.success('Abonnement résilié. Vos avantages restent actifs jusqu\'à la fin de la période.');
      await update(); // Rafraîchir la session NextAuth
      router.refresh();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error('Erreur lors de la résiliation');
  } finally {
    setCancelingSubscription(false);
  }
};
```

## 📡 Webhooks Stripe

**Fichier:** `app/api/webhooks/stripe/route.ts`

### Événements gérés:

1. **`checkout.session.completed`**
   - Déclenché après un paiement réussi
   - Met à jour le plan de l'utilisateur dans Supabase
   - Stocke le `stripe_customer_id` et `stripe_subscription_id`
   - Réinitialise le quota mensuel

2. **`customer.subscription.updated`**
   - Déclenché lors de modifications de l'abonnement
   - Gère le changement de plan (upgrade/downgrade)
   - Détecte les annulations programmées (`cancel_at_period_end`)

3. **`customer.subscription.deleted`**
   - Déclenché à la fin de la période après résiliation
   - Rétrograde l'utilisateur au plan FREE
   - Archive les données premium

## 🎨 Expérience Utilisateur

### Messages de Confirmation

**Après paiement:**
```
🎉 Félicitations !
Votre abonnement PRO est maintenant actif !

✓ 1000 générations par mois
✓ Tout de STARTER
✓ Variables personnalisées illimitées
✓ Analyse avancée
✓ Support prioritaire
✓ Signatures multiples

Redirection automatique dans 5 secondes...
```

**Après résiliation:**
```
✅ Abonnement résilié avec succès
Vos avantages restent actifs jusqu'à la fin de la période de facturation.
```

### États de Chargement

- **Paiement en cours:** Spinner sur Stripe Checkout
- **Vérification du paiement:** Loader sur la page de succès
- **Résiliation en cours:** Bouton désactivé avec texte "Résiliation..."
- **Ouverture du portail:** Redirection immédiate

## 🔐 Sécurité

- ✅ Vérification d'authentification sur toutes les routes API
- ✅ Validation des webhooks Stripe avec signature
- ✅ Confirmation utilisateur avant résiliation
- ✅ Logs d'audit pour toutes les actions de facturation
- ✅ Protection CSRF via NextAuth
- ✅ Rate limiting sur les endpoints de paiement

## 📊 Base de Données

**Table `users`:**
```sql
- email (primary key)
- name
- plan (FREE | STARTER | PRO)
- stripe_customer_id
- stripe_subscription_id
- created_at
- updated_at
```

**Table `audit_logs`:**
```sql
- id
- user_id
- action (checkout_completed | subscription_canceled | plan_changed)
- details (JSON)
- timestamp
```

## 🧪 Tests

### Test du flux complet:

1. **Sélection du plan:**
   ```bash
   Accéder à http://localhost:3000/dashboard/pricing
   Cliquer sur "Commencer" pour le plan PRO
   ```

2. **Paiement test:**
   ```
   Carte: 4242 4242 4242 4242
   Date: 12/34
   CVC: 123
   ```

3. **Vérification de la page de succès:**
   - ✅ Confettis animés
   - ✅ Message de félicitations
   - ✅ Liste des fonctionnalités PRO
   - ✅ Redirection automatique après 5 secondes

4. **Accès au dashboard:**
   - ✅ Badge "Plan Pro" visible
   - ✅ Quota: 1000 générations

5. **Résiliation:**
   ```bash
   Accéder à http://localhost:3000/dashboard/settings
   Cliquer sur "Résilier l'abonnement"
   Confirmer la résiliation
   Vérifier le message de succès
   ```

## 📝 Variables d'Environnement Requises

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 🎯 Points Clés

1. **UX fluide:** Du clic sur "Commencer" à l'activation du plan en quelques secondes
2. **Animations:** Page de succès engageante avec confettis
3. **Transparence:** Informations claires sur le plan et la facturation
4. **Flexibilité:** Résiliation facile avec maintien de l'accès jusqu'à la fin de période
5. **Sécurité:** Toutes les actions sont authentifiées et loggées

## 🚀 Prochaines Améliorations Possibles

- [ ] Ajout d'une période d'essai gratuite
- [ ] Offres promotionnelles et codes promo
- [ ] Facturation annuelle avec réduction
- [ ] Notifications par email avant renouvellement
- [ ] Dashboard admin pour gérer les abonnements
- [ ] Analytics détaillées des conversions

---

✅ **Le flux de paiement complet est maintenant opérationnel et prêt pour la production !**
