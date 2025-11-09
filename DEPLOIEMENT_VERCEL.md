# 🚀 Déploiement Vercel - ClaritySupport

## Étape 1 : Préparer le projet

### ✅ Vérifications avant déploiement

```bash
# Vérifier qu'il n'y a pas d'erreurs
npm run build

# Si tout compile sans erreur, vous êtes prêt !
```

## Étape 2 : Pousser sur GitHub

```bash
# Ajouter tous les fichiers
git add .

# Commit
git commit -m "feat: Complete Stripe payment integration"

# Pousser vers GitHub
git push origin feat-secure-mail-sync-56cf6
```

## Étape 3 : Déployer sur Vercel

### Option A : Via l'interface Vercel (Recommandé)

1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. Cliquer sur **"Add New Project"**
4. Sélectionner le repo `Dalox-01/mailwizard`
5. Configurer le projet :
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Root Directory** : `project` (important !)
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`

### Option B : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer (depuis le dossier project/)
cd project
vercel

# Suivre les instructions :
# - Link to existing project? No
# - What's your project's name? clarity-support (ou autre)
# - In which directory is your code located? ./
# - Auto-detected Project Settings (Next.js) OK
```

## Étape 4 : Configurer les Variables d'Environnement

Dans **Vercel Dashboard** > **Settings** > **Environment Variables**, ajouter :

### 🔐 Database (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://xzeujbctwaqnxouvdedd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZXVqYmN0d2FxbnhvdXZkZWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTE5MTcsImV4cCI6MjA3NzMyNzkxN30.O3RvBvC6HL_P4nuLo-8KPdbzXpcBvl_mniKbk8tX70w
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZXVqYmN0d2FxbnhvdXZkZWRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc1MTkxNywiZXhwIjoyMDc3MzI3OTE3fQ.45bbV6WUEC9i60Ztuc40O1IlRsFHKORsJ6jOZ5sq43I
DATABASE_URL=postgresql://postgres.xzeujbctwaqnxouvdedd:your-password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### 🔑 NextAuth
```
NEXTAUTH_URL=https://votre-domaine.vercel.app
NEXTAUTH_SECRET=development-secret-change-in-production-minimum-32-chars
```

**⚠️ IMPORTANT** : Générer un nouveau secret pour production :
```bash
openssl rand -base64 32
# Ou utiliser : https://generate-secret.vercel.app/32
```

### 🔐 Google OAuth
```
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YOUR_GOOGLE_CLIENT_SECRET
```

**⚠️ Ajouter l'URL Vercel dans Google Console** :
- Aller sur [console.cloud.google.com](https://console.cloud.google.com)
- APIs & Services > Credentials
- Modifier l'OAuth Client
- Ajouter dans **Authorized redirect URIs** :
  ```
  https://votre-domaine.vercel.app/api/auth/callback/google
  ```

### 🔐 Microsoft OAuth
```
MICROSOFT_CLIENT_ID=YOUR_MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET=YOUR_MICROSOFT_CLIENT_SECRET
```

**⚠️ Ajouter l'URL Vercel dans Azure Portal** :
- Aller sur [portal.azure.com](https://portal.azure.com)
- Azure Active Directory > App registrations
- Sélectionner votre app
- Authentication > Add a platform > Web
- Ajouter :
  ```
  https://votre-domaine.vercel.app/api/auth/callback/azure-ad
  ```

### 🤖 OpenAI
```
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
DEFAULT_AI_MODEL=gpt-4o-mini
```

### 💳 Stripe (Paiements)
```
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET_DE_VERCEL
```

**Price IDs Stripe** :
```
STRIPE_PRICE_STARTER_MONTHLY=price_1SRZnAGJn0NQpREzi7BPOUHo
STRIPE_PRICE_STARTER_YEARLY=price_1SRZqtGJn0NQpREzYuOzUHzr
STRIPE_PRICE_PRO_MONTHLY=price_1SRZtWGJn0NQpREz0gNLKR4f
STRIPE_PRICE_PRO_YEARLY=price_1SRZxdGJn0NQpREzmfljBgDr
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_1SRa0kGJn0NQpREzTuH4lAXq
STRIPE_PRICE_ENTERPRISE_YEARLY=price_1SRa2tGJn0NQpREzwxIJTK9t
STRIPE_PRICE_FREE_MONTHLY=
STRIPE_PRICE_FREE_YEARLY=
```

### 📧 Resend (Email)
```
RESEND_API_KEY=re_CoWKgtSm_AQdKCWDSFR2sTgVA8a1756uk
RESEND_FROM_EMAIL=noreply@mailwizard.app
```

### 🌐 App Config
```
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
NODE_ENV=production
```

## Étape 5 : Configurer le Webhook Stripe

1. Aller sur [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquer sur **"Add endpoint"**
3. URL de l'endpoint :
   ```
   https://votre-domaine.vercel.app/api/stripe/webhook
   ```
4. Sélectionner les événements :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Cliquer sur **"Add endpoint"**
6. **Copier le Signing Secret** (commence par `whsec_...`)
7. L'ajouter dans Vercel comme variable d'environnement :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
8. **Redéployer** sur Vercel pour prendre en compte la nouvelle variable

## Étape 6 : Vérifications Post-Déploiement

### ✅ Checklist

- [ ] Le site est accessible (https://votre-domaine.vercel.app)
- [ ] La connexion Google fonctionne
- [ ] La connexion Microsoft fonctionne
- [ ] Les pages se chargent sans erreur
- [ ] Le système de paiement redirige vers Stripe
- [ ] Test de paiement avec carte test réussit
- [ ] Le webhook Stripe reçoit les événements
- [ ] L'abonnement est créé dans Supabase après paiement
- [ ] La page /mail-center/billing affiche l'abonnement

### 🧪 Tester le paiement

1. Aller sur `https://votre-domaine.vercel.app`
2. Se connecter
3. Cliquer sur "Choisir ce plan" (Starter/Pro/Enterprise)
4. Cliquer sur "Procéder au paiement"
5. Utiliser la carte de test :
   - **Numéro** : `4242 4242 4242 4242`
   - **Date** : `12/34`
   - **CVC** : `123`
6. Vérifier que :
   - La redirection vers `/mail-center?checkout=success` fonctionne
   - L'abonnement apparaît dans `/mail-center/billing`
   - Le webhook a bien été reçu (voir Stripe Dashboard > Webhooks > Logs)

## Étape 7 : Configurer un Domaine Personnalisé (Optionnel)

1. Dans Vercel Dashboard > **Settings** > **Domains**
2. Ajouter votre domaine (ex: `clarity-support.com`)
3. Suivre les instructions pour configurer les DNS
4. Mettre à jour les variables :
   ```
   NEXTAUTH_URL=https://clarity-support.com
   NEXT_PUBLIC_APP_URL=https://clarity-support.com
   ```
5. Mettre à jour les OAuth redirects (Google, Microsoft)
6. Mettre à jour l'URL du webhook Stripe

## 🐛 Troubleshooting

### Le site ne se charge pas
- Vérifier les logs Vercel (Dashboard > Deployments > Logs)
- Vérifier que toutes les variables d'environnement sont configurées

### OAuth ne fonctionne pas
- Vérifier que les redirect URIs sont bien configurés dans Google/Microsoft
- Vérifier que `NEXTAUTH_URL` pointe vers le bon domaine

### Webhook Stripe ne fonctionne pas
- Vérifier que l'URL du webhook est correcte
- Vérifier que `STRIPE_WEBHOOK_SECRET` est bien configuré
- Voir les logs du webhook dans Stripe Dashboard

### Erreurs de base de données
- Vérifier que `DATABASE_URL` est correct
- Vérifier que la table `subscriptions` existe
- Vérifier les permissions Supabase

## 📊 Monitoring

### Vercel Analytics
Activer dans **Settings** > **Analytics** pour voir :
- Nombre de visiteurs
- Temps de chargement
- Web Vitals

### Stripe Dashboard
Surveiller :
- **Payments** : Paiements réussis/échoués
- **Subscriptions** : Abonnements actifs
- **Webhooks** : Événements reçus/manqués

## 🎉 C'est prêt !

Votre application est maintenant en production avec :
- ✅ Paiements Stripe fonctionnels
- ✅ OAuth Google & Microsoft
- ✅ Base de données Supabase
- ✅ IA OpenAI
- ✅ Webhooks configurés
- ✅ HTTPS automatique
- ✅ CDN global Vercel

**URL de l'application** : https://votre-domaine.vercel.app

---

## 📝 Notes Importantes

### Passer en mode LIVE (Production réelle)

Quand vous serez prêt à accepter de vrais paiements :

1. **Activer votre compte Stripe** (vérification d'identité)
2. **Remplacer les clés TEST par LIVE** :
   - `pk_test_...` → `pk_live_...`
   - `sk_test_...` → `sk_live_...`
3. **Recréer les produits en mode LIVE** ou les activer
4. **Mettre à jour les Price IDs** avec les versions LIVE
5. **Reconfigurer le webhook** en mode LIVE
6. **Mettre à jour `STRIPE_WEBHOOK_SECRET`** avec le nouveau secret

### Sauvegardes

- Configurer des backups automatiques sur Supabase
- Exporter régulièrement les données importantes

### Scaling

Vercel scale automatiquement, mais pour une charge très élevée :
- Envisager un plan Vercel Pro
- Optimiser les requêtes Supabase
- Ajouter du caching (Redis)
