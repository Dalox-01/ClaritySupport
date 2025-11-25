# 🚀 GUIDE COMPLET - FINALISATION MAILWIZ

## ✅ ÉTAPE 1 : CONFIGURATION GOOGLE CLOUD (OAuth Gmail)

### 1.1 - Créer/Configurer le projet Google Cloud
1. Va sur https://console.cloud.google.com
2. Sélectionne ton projet existant ou crée-en un nouveau "MailWiz"
3. Dans la barre de recherche, tape "Gmail API" → Clique sur "Enable"

### 1.2 - Configurer OAuth 2.0
1. Menu hamburger → **APIs & Services** → **Credentials**
2. Si tu as déjà un OAuth Client ID :
   - Clique dessus pour l'éditer
   - Dans **Authorized redirect URIs**, ajoute :
     - `http://localhost:3000/api/gmail/callback`
     - `https://ton-domaine.com/api/gmail/callback` (pour production)
   - Dans **Scopes**, assure-toi d'avoir :
     - `https://www.googleapis.com/auth/gmail.send`
     - Tous les scopes existants de NextAuth
3. Si tu n'as pas d'OAuth Client ID :
   - Clique sur **Create Credentials** → **OAuth client ID**
   - Application type : **Web application**
   - Name : "MailWiz OAuth"
   - Authorized redirect URIs :
     - `http://localhost:3000/api/auth/callback/google` (NextAuth)
     - `http://localhost:3000/api/gmail/callback` (Gmail API)
     - `https://ton-domaine.com/api/auth/callback/google`
     - `https://ton-domaine.com/api/gmail/callback`
   - Clique sur **Create**
   - **COPIE** le Client ID et Client Secret

### 1.3 - Vérifier les scopes OAuth
1. OAuth consent screen → Edit App
2. Dans "Scopes", ajoute :
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `https://www.googleapis.com/auth/gmail.send`
3. Save and Continue

---

## ✅ ÉTAPE 2 : CONFIGURATION MICROSOFT AZURE (OAuth Outlook)

### 2.1 - Créer une application Azure
1. Va sur https://portal.azure.com
2. **Azure Active Directory** → **App registrations** → **New registration**
3. Name : "MailWiz Outlook"
4. Supported account types : **Accounts in any organizational directory and personal Microsoft accounts**
5. Redirect URI : 
   - Platform : **Web**
   - URI : `http://localhost:3000/api/outlook/callback`
6. Clique sur **Register**

### 2.2 - Configurer les permissions
1. Dans ton app → **API permissions** → **Add a permission**
2. **Microsoft Graph** → **Delegated permissions**
3. Sélectionne :
   - `Mail.Send`
   - `Mail.ReadWrite`
   - `offline_access`
4. Clique sur **Add permissions**
5. Clique sur **Grant admin consent** (si disponible)

### 2.3 - Créer un Client Secret
1. **Certificates & secrets** → **New client secret**
2. Description : "MailWiz Production"
3. Expires : 24 months (ou jamais)
4. Clique sur **Add**
5. **COPIE IMMÉDIATEMENT** le secret (tu ne pourras plus le voir)

### 2.4 - Copier l'Application (client) ID
1. Retourne sur **Overview**
2. **COPIE** l'Application (client) ID

---

## ✅ ÉTAPE 3 : CONFIGURATION SUPABASE (Base de données)

### 3.1 - Exécuter les migrations SQL
1. Va sur https://supabase.com → Ton projet
2. **SQL Editor** → **New query**
3. Copie-colle et exécute la migration Gmail :

```sql
-- Migration Gmail OAuth
ALTER TABLE users
ADD COLUMN IF NOT EXISTS gmail_access_token TEXT,
ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS gmail_token_expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_users_gmail_token ON users(gmail_access_token);
```

4. Exécute la migration Outlook :

```sql
-- Migration Outlook OAuth
ALTER TABLE users
ADD COLUMN IF NOT EXISTS outlook_access_token TEXT,
ADD COLUMN IF NOT EXISTS outlook_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS outlook_token_expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_users_outlook_token ON users(outlook_access_token);
```

5. Vérifie que les colonnes ont été créées :
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE '%token%';
```

---

## ✅ ÉTAPE 4 : CONFIGURATION STRIPE (Paiements)

### 4.1 - Récupérer les clés Stripe
1. Va sur https://dashboard.stripe.com
2. Mode **Test** → **Developers** → **API keys**
3. **COPIE** :
   - Publishable key (commence par `pk_test_...`)
   - Secret key (clique sur "Reveal test key", commence par `sk_test_...`)

### 4.2 - Créer les produits et prix
1. **Products** → **Add product**
2. Crée 3 produits :

**FREE Plan** (pour référence, pas de paiement)
- Name : "MailWiz Free"
- Price : 0€

**STARTER Plan**
- Name : "MailWiz Starter"
- Price : 9.99€/mois
- Recurring : Monthly
- **COPIE** le Price ID (commence par `price_...`)

**PRO Plan**
- Name : "MailWiz Pro"
- Price : 29.99€/mois
- Recurring : Monthly
- **COPIE** le Price ID

### 4.3 - Configurer le webhook
1. **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL : `http://localhost:3000/api/stripe/webhook` (ou ton domaine en prod)
3. Events to send :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Clique sur **Add endpoint**
5. **COPIE** le Signing secret (commence par `whsec_...`)

---

## ✅ ÉTAPE 5 : CONFIGURATION OPENAI

### 5.1 - Récupérer la clé API
1. Va sur https://platform.openai.com/api-keys
2. **Create new secret key**
3. Name : "MailWiz Production"
4. **COPIE** la clé (commence par `sk-...`)

### 5.2 - Vérifier les crédits
1. **Settings** → **Billing** → Vérifie que tu as des crédits
2. Ajoute une méthode de paiement si nécessaire

---

## ✅ ÉTAPE 6 : CONFIGURATION RESEND (Emails)

### 6.1 - Créer un compte Resend
1. Va sur https://resend.com/signup
2. Crée un compte (gratuit jusqu'à 3000 emails/mois)

### 6.2 - Récupérer la clé API
1. **API Keys** → **Create API Key**
2. Name : "MailWiz"
3. Permission : **Full Access**
4. **COPIE** la clé (commence par `re_...`)

### 6.3 - Vérifier le domaine (optionnel mais recommandé)
1. **Domains** → **Add Domain**
2. Entre ton domaine (ex: `mailwiz.com`)
3. Ajoute les records DNS fournis (SPF, DKIM, DMARC)
4. Vérifie le domaine

Si tu n'as pas de domaine, utilise l'email par défaut : `onboarding@resend.dev`

---

## ✅ ÉTAPE 7 : CONFIGURATION DU FICHIER .ENV

### 7.1 - Créer le fichier .env.local
1. Dans le dossier du projet, crée un fichier `.env.local`
2. Copie-colle et remplis avec TES clés :

```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=génère-avec-openssl-rand-base64-32

# Google OAuth (pour NextAuth ET Gmail API)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Microsoft OAuth (pour Outlook API)
MICROSOFT_CLIENT_ID=xxxxx-xxxx-xxxx-xxxx-xxxxx
MICROSOFT_CLIENT_SECRET=xxxxx~xxxxx

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx
DEFAULT_AI_MODEL=gpt-4o-mini

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_FREE=price_free_id
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxx
STRIPE_PRICE_PRO_MONTHLY=price_xxxxx

# Resend (Email)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@tondomaine.com

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 7.2 - Générer NEXTAUTH_SECRET
Dans le terminal PowerShell :
```powershell
openssl rand -base64 32
```
Copie le résultat dans `NEXTAUTH_SECRET`

---

## ✅ ÉTAPE 8 : INSTALLATION ET DÉMARRAGE

### 8.1 - Installer les dépendances
```powershell
npm install
```

### 8.2 - Vérifier que tout compile
```powershell
npm run build
```

Si erreurs TypeScript → Les corriger avant de continuer

### 8.3 - Démarrer le serveur de développement
```powershell
npm run dev
```

Le site devrait être accessible sur http://localhost:3000

---

## ✅ ÉTAPE 9 : TESTS FONCTIONNELS

### 9.1 - Test de l'authentification
1. Va sur http://localhost:3000
2. Clique sur "Se connecter avec Google"
3. Vérifie que tu arrives sur le dashboard

### 9.2 - Test de génération d'email
1. Dans le dashboard, remplis le formulaire
2. Clique sur "Générer l'email"
3. Vérifie que l'email est généré

### 9.3 - Test d'envoi Gmail
1. Génère un email
2. Clique sur "Envoyer Gmail"
3. Si première fois → Popup OAuth Gmail → Accepte les permissions
4. Entre un email de test (le tien)
5. Vérifie que l'email arrive dans ta boîte Gmail

### 9.4 - Test d'envoi Outlook
1. Génère un email
2. Clique sur "Envoyer Outlook"
3. Si première fois → Popup OAuth Microsoft → Accepte
4. Vérifie que le brouillon est créé dans Outlook

### 9.5 - Test des quotas
1. Génère plusieurs emails
2. Vérifie que le compteur augmente
3. Teste avec un compte FREE (limite 10)
4. Vérifie que le message "Quota atteint" apparaît

### 9.6 - Test du paiement Stripe
1. Clique sur "Upgrade"
2. Choisis le plan STARTER
3. Utilise la carte de test : `4242 4242 4242 4242`
4. Date : n'importe quelle date future
5. CVC : 123
6. Vérifie la redirection vers le dashboard
7. Vérifie que le plan a changé

---

## ✅ ÉTAPE 10 : VÉRIFICATION FINALE

### Checklist complète :

**Backend :**
- [ ] Toutes les routes API fonctionnent sans erreur 500
- [ ] Les migrations SQL sont exécutées
- [ ] Les tokens OAuth sont stockés en DB
- [ ] Les webhooks Stripe fonctionnent

**Frontend :**
- [ ] Pas d'erreurs dans la console navigateur
- [ ] Tous les boutons du dock fonctionnent
- [ ] Les modals s'ouvrent et se ferment correctement
- [ ] Le thème dark/light fonctionne

**Intégrations :**
- [ ] Gmail OAuth → Email envoyé depuis ton compte Gmail
- [ ] Outlook OAuth → Brouillon créé dans Outlook
- [ ] OpenAI → Génération d'emails fonctionne
- [ ] Stripe → Paiement et upgrade fonctionnent
- [ ] Supabase → Données sauvegardées correctement

**Performance :**
- [ ] Temps de génération < 10 secondes
- [ ] Pas de ralentissement dans l'UI
- [ ] Les images se chargent rapidement

---

## 🔧 DÉPANNAGE COURANT

### Erreur : "Invalid client"
→ Vérifie que `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont corrects
→ Vérifie les Redirect URIs dans Google Cloud Console

### Erreur : "Gmail non connecté"
→ L'utilisateur doit d'abord se connecter via `/api/gmail/auth`
→ Vérifie que les colonnes `gmail_access_token` existent en DB

### Erreur Stripe : "No such price"
→ Vérifie que `STRIPE_PRICE_STARTER_MONTHLY` correspond à un vrai Price ID
→ Utilise le mode Test de Stripe

### Erreur OpenAI : "Insufficient quota"
→ Ajoute des crédits sur https://platform.openai.com/account/billing

### Email Resend non reçu
→ Vérifie les spam
→ Vérifie que `RESEND_FROM_EMAIL` est valide
→ Vérifie les logs Resend sur https://resend.com/emails

---

## 📱 EXTENSION CHROME (Bonus)

### Installation de l'extension
1. Ouvre Chrome → `chrome://extensions/`
2. Active le "Mode développeur" (coin supérieur droit)
3. Clique sur "Charger l'extension non empaquetée"
4. Sélectionne le dossier `extension/`
5. L'extension apparaît dans la barre Chrome

### Configuration de l'extension
1. Ouvre `extension/popup.js`
2. Change `API_URL` vers ton domaine en production
3. Recharge l'extension

---

## 🚀 DÉPLOIEMENT EN PRODUCTION (Optionnel)

### Via Vercel (Recommandé)
1. Va sur https://vercel.com
2. Importe le projet depuis GitHub
3. Configure les variables d'environnement (toutes celles du .env)
4. Change `NEXTAUTH_URL` vers `https://ton-domaine.vercel.app`
5. Change toutes les redirect URIs (Google, Microsoft, Stripe webhook)
6. Deploy !

---

## 📞 SUPPORT

Si tu bloques sur une étape :
1. Vérifie les logs dans le terminal
2. Vérifie la console du navigateur (F12)
3. Vérifie que toutes les clés API sont correctes
4. Redémarre le serveur (`Ctrl+C` puis `npm run dev`)

---

# ✅ BON COURAGE ! Le site sera prêt à 100% demain ! 🎉
