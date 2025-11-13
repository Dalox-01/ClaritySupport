# ClaritySupport - Mail Center IA

> Plateforme intelligente de gestion d'emails avec réponses automatiques par IA

## 📝 Description

ClaritySupport est une application SaaS innovante qui révolutionne la gestion du support client par email. Grâce à l'intelligence artificielle (OpenAI GPT-4), la plateforme analyse automatiquement vos emails entrants, les catégorise, détecte leur sentiment et leur urgence, puis génère des réponses adaptées que vous pouvez valider avant envoi.

**Mail Center** est le cœur de l'application : un centre de gestion unifié pour tous vos comptes emails (Gmail, Outlook) avec automatisation intelligente complète.

## ✨ Fonctionnalités principales - Mail Center

### 🎯 Gestion Multi-Comptes
- 📧 **Connexion Gmail & Outlook** : OAuth sécurisé avec refresh automatique des tokens
- 🔐 **Chiffrement AES-256** : Tokens d'accès stockés de manière sécurisée
- 🔄 **Synchronisation automatique** : 50 derniers emails par compte (système FIFO)
- 📱 **Interface unifiée** : Gérez tous vos comptes depuis un seul endroit

### 🤖 Intelligence Artificielle Avancée
- 🏷️ **Classification automatique** : Support, Vente, Urgent, Spam, Partenariat, Remboursement...
- 😊 **Analyse de sentiment** : Positif, Neutre, Négatif, Urgent
- ⚡ **Score d'urgence** : De 0 à 10 pour prioriser vos réponses
- 🎯 **Extraction d'entités** : Produit, problème, date, montant automatiquement identifiés
- 📊 **Détection de contexte** : L'IA comprend le sujet et le ton de chaque email

### ⚙️ Automatisation Intelligente
- 🔧 **Règles personnalisables** : Définissez vos propres triggers et actions
- 📝 **Templates de réponses** : Bibliothèque de modèles adaptés à chaque type de demande
- ✅ **Validation obligatoire** : Les emails sensibles nécessitent votre approbation
- 🚀 **Réponses automatiques 24/7** : Ne manquez plus jamais une demande client
- 🎨 **Ton personnalisable** : Professionnel, cordial ou direct selon vos besoins

### 📊 Analytics & Statistiques
- 📈 **Dashboard temps réel** : Volumes traités, temps de réponse, taux de satisfaction
- 📉 **Tendances** : Visualisez l'évolution de votre support client
- 🎯 **KPIs détaillés** : Par catégorie, sentiment, urgence
- 📅 **Historique** : Statistiques agrégées par jour

### 🎨 Interface Moderne
- 🌓 **Thème clair/sombre** : Interface adaptative personnalisée
- ⚡ **Animations fluides** : Framer Motion pour une UX premium
- 📱 **100% Responsive** : Desktop, tablette, mobile
- 🎨 **Design moderne** : UI inspirée des meilleurs SaaS actuels
- 🔍 **Filtres puissants** : Par catégorie, sentiment, compte, date
- 🗑️ **Soft delete** : Les emails supprimés ne réapparaissent plus

### 🔒 Sécurité & Conformité
- 🔐 **OAuth 2.0** : Authentification sécurisée Google & Microsoft
- 🔑 **NextAuth** : Sessions sécurisées avec JWT chiffrés
- 🛡️ **Row Level Security** : Isolation stricte des données utilisateur (Supabase RLS)
- 📝 **Audit logs** : Traçabilité complète des actions
- 🔒 **RGPD compliant** : Respect total de la vie privée
- 🚨 **Rate limiting** : Protection contre les abus

### 💳 Système d'Abonnement Stripe
- 💰 **3 plans flexibles** : FREE (10 emails/mois), STARTER (100 emails/mois), PRO (1000 emails/mois)
- 💳 **Paiement sécurisé** : Stripe Checkout (PCI compliant)
- 🔄 **Webhooks configurés** : Activation automatique des abonnements
- 📊 **Customer Portal** : Gestion autonome (factures, carte, annulation)
- ⬆️ **Upgrade/Downgrade** : Changement de plan avec proration automatique
- 📄 **Historique factures** : Accès à toutes vos factures

## 🏗️ Architecture technique

### Stack Technologique

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **UI**: TailwindCSS, shadcn/ui, Framer Motion, next-themes
- **Authentification**: NextAuth v4 (Google OAuth, Outlook OAuth)
- **Base de données**: Supabase (PostgreSQL) avec Row Level Security
- **IA**: OpenAI API (gpt-4o-mini) pour analyse et génération
- **Email**: 
  - Gmail API (googleapis) pour Gmail
  - Microsoft Graph API (@microsoft/microsoft-graph-client) pour Outlook
  - Resend pour envoi sortant
- **Paiements**: Stripe (Checkout + Webhooks + Customer Portal)
- **Sécurité**: AES-256 encryption, bcryptjs
- **State Management**: TanStack Query v5
- **Formulaires**: React Hook Form + Zod
- **Logs**: Pino avec pino-pretty

### Structure du Projet

```
project/
├── app/
│   ├── api/                          # API Routes
│   │   ├── auth/                     # NextAuth routes
│   │   ├── mail-center/              # 🎯 Mail Center Core
│   │   │   ├── gmail/
│   │   │   │   ├── auth/route.ts     # OAuth Gmail
│   │   │   │   └── callback/route.ts # Callback + sync initial
│   │   │   ├── outlook/
│   │   │   │   ├── auth/route.ts     # OAuth Outlook
│   │   │   │   └── callback/route.ts # Callback + sync
│   │   │   ├── accounts/route.ts     # Liste comptes connectés
│   │   │   ├── emails/
│   │   │   │   ├── route.ts          # GET emails + filtres
│   │   │   │   └── [id]/route.ts     # DELETE email (soft)
│   │   │   ├── sync/route.ts         # Sync manuelle
│   │   │   ├── auto-sync/route.ts    # Sync automatique
│   │   │   ├── check-new/route.ts    # Check nouveaux emails
│   │   │   ├── rules/route.ts        # CRUD règles automation
│   │   │   ├── templates/route.ts    # CRUD templates réponses
│   │   │   ├── pending-replies/      # Réponses en attente validation
│   │   │   └── stats/route.ts        # Statistiques
│   │   ├── stripe/                   # Stripe webhooks
│   │   ├── subscription/             # Gestion abonnements
│   │   └── usage/                    # Quotas
│   ├── mail-center/                  # 🎯 Pages Mail Center
│   │   ├── page.tsx                  # Interface principale
│   │   ├── billing/page.tsx          # Gestion abonnement
│   │   └── analytics/page.tsx        # Dashboard stats
│   ├── checkout/page.tsx             # Page paiement Stripe
│   └── (marketing)/                  # Pages publiques
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── home/                         # Composants homepage
│   └── providers.tsx                 # Context providers
├── lib/
│   ├── auth.ts                       # Configuration NextAuth
│   ├── db.ts                         # Client Supabase + types
│   ├── stripe.ts                     # Client Stripe + helpers
│   ├── security.ts                   # Encrypt/Decrypt AES-256
│   ├── gmail-helpers.ts              # 🎯 Intégration Gmail API
│   ├── outlook-helpers.ts            # 🎯 Intégration Outlook/Graph
│   ├── mail-ai-helpers.ts            # 🎯 Analyse IA emails
│   ├── mail-center-types.ts          # 🎯 Types TypeScript
│   └── logger.ts                     # Pino logger
├── supabase/
│   └── migrations/                   # Migrations SQL
└── scripts/
    └── test-payment.ts               # Script test paiement
```

### Base de données Supabase - Schema Mail Center

#### Table: `mail_accounts`
Stocke les comptes email connectés avec tokens OAuth chiffrés.

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → auth.users)
- email (text) -- Adresse email du compte
- provider (text) -- 'gmail' ou 'outlook'
- access_token (text) -- Chiffré AES-256
- refresh_token (text) -- Chiffré AES-256
- token_expiry (timestamp)
- last_sync_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Table: `emails_cache`
Cache temporaire FIFO des emails (50 max par compte, nettoyage auto 24h).

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- mail_account_id (uuid, foreign key → mail_accounts)
- message_id (text) -- ID unique de l'email (Gmail/Outlook)
- thread_id (text)
- from_email (text)
- from_name (text)
- to_email (text)
- subject (text)
- body_text (text)
- body_html (text)
- received_at (timestamp)
- is_read (boolean)
- has_attachments (boolean)
- labels (text[])
- folder (text)
- support_category (text) -- Classification IA
- sentiment (text) -- positif/neutre/negatif/urgent
- urgency_score (integer) -- 0-10
- entities (jsonb) -- {product, issue, date, amount}
- requires_validation (boolean)
- ai_summary (text)
- deleted_at (timestamp) -- Soft delete
- created_at (timestamp)
- updated_at (timestamp)
```

#### Table: `automation_rules`
Règles définies par l'utilisateur pour automatiser les réponses.

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- name (text)
- description (text)
- is_active (boolean)
- priority (integer)
- triggers (jsonb) -- Conditions de déclenchement
- actions (jsonb) -- Actions à exécuter
- created_at (timestamp)
- updated_at (timestamp)
```

#### Table: `response_templates`
Templates de réponses personnalisables avec variables.

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- name (text)
- category (text)
- subject_template (text)
- body_template (text)
- variables (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Table: `pending_replies`
Réponses IA générées en attente de validation utilisateur.

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- email_id (uuid, foreign key → emails_cache)
- generated_subject (text)
- generated_body (text)
- confidence_score (numeric)
- requires_review (boolean)
- status (text) -- pending/approved/rejected/sent
- created_at (timestamp)
- validated_at (timestamp)
```

#### Table: `mail_statistics`
Statistiques agrégées par jour pour analytics.

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- date (date)
- emails_received (integer)
- emails_sent (integer)
- avg_response_time (interval)
- categories_breakdown (jsonb)
- sentiment_breakdown (jsonb)
- created_at (timestamp)
```

#### Table: `subscriptions`
Gestion des abonnements Stripe.

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key, unique)
- plan (text) -- 'FREE', 'STARTER', 'PRO'
- status (text) -- 'active', 'canceled', 'past_due'
- stripe_customer_id (text)
- stripe_subscription_id (text)
- stripe_price_id (text)
- current_period_start (timestamp)
- current_period_end (timestamp)
- cancel_at_period_end (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

## 🚀 Installation locale

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase (gratuit)
- Compte Google Cloud (pour OAuth Gmail)
- Compte Microsoft Azure (pour OAuth Outlook)
- Compte OpenAI (API key)
- Compte Stripe (mode test)
- Compte Resend (optionnel pour envoi emails)

### 1. Cloner et installer

```bash
git clone https://github.com/Dalox-01/ClaritySupport.git
cd ClaritySupport/project
npm install
```

### 2. Configuration des variables d'environnement

Créez `.env.local` à la racine du projet :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
DATABASE_URL=postgresql://postgres...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<générez avec: openssl rand -base64 32>

# Google OAuth (Gmail)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Microsoft OAuth (Outlook)
MICROSOFT_CLIENT_ID=xxxxx
MICROSOFT_CLIENT_SECRET=xxxxx
MICROSOFT_TENANT_ID=common

# OpenAI
OPENAI_API_KEY=sk-xxxxx
DEFAULT_AI_MODEL=gpt-4o-mini

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxx
STRIPE_PRICE_PRO_MONTHLY=price_xxxxx

# Encryption (Mail Center)
ENCRYPTION_KEY=<32 caractères aléatoires pour AES-256>

# Resend (optionnel)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=support@votredomaine.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configuration Google Cloud (Gmail OAuth)

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un projet ou sélectionner existant
3. **APIs & Services > Bibliothèque** : Activer **Gmail API**
4. **APIs & Services > Identifiants** : Créer identifiants OAuth 2.0
5. **Écran de consentement OAuth** : 
   - Type: Externe
   - Scopes: `gmail.readonly`, `gmail.send`, `gmail.modify`
6. **Créer des identifiants > ID client OAuth 2.0** :
   - Type: Application Web
   - URI de redirection: `http://localhost:3000/api/mail-center/gmail/callback`
7. Copier Client ID et Client Secret dans `.env.local`

### 4. Configuration Microsoft Azure (Outlook OAuth)

1. Aller sur [Azure Portal](https://portal.azure.com)
2. **Azure Active Directory > App registrations > New registration**
3. **Nom** : ClaritySupport
4. **Types de comptes pris en charge** : Comptes dans un annuaire d'organisation et comptes personnels Microsoft
5. **URI de redirection** : 
   - Plateforme: Web
   - URI: `http://localhost:3000/api/mail-center/outlook/callback`
6. **API permissions** :
   - Microsoft Graph > Delegated permissions
   - Ajouter: `Mail.Read`, `Mail.Send`, `Mail.ReadWrite`, `offline_access`, `User.Read`
7. **Certificates & secrets** : Créer un Client Secret
8. Copier Application (client) ID et Client Secret dans `.env.local`

### 5. Configuration Supabase

Les migrations SQL sont dans `supabase/migrations/`. Exécutez-les dans l'ordre dans le SQL Editor Supabase :

```bash
# Dans le dashboard Supabase > SQL Editor
# Exécutez chaque fichier de migration dans l'ordre chronologique
```

Tables créées automatiquement :
- `mail_accounts` (comptes emails)
- `emails_cache` (cache emails)
- `automation_rules` (règles automation)
- `response_templates` (templates réponses)
- `pending_replies` (réponses en attente)
- `mail_statistics` (stats agrégées)
- `subscriptions` (abonnements Stripe)

### 6. Configuration Stripe

1. Créer deux produits dans [Stripe Dashboard](https://dashboard.stripe.com/test/products):
   - **STARTER** (7.99€/mois, récurrent)
   - **PRO** (18.99€/mois, récurrent)

2. Copier les `price_id` de chaque prix dans `.env.local`

3. **Webhooks** (pour dev local, utilisez Stripe CLI):
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copiez le webhook secret affiché dans STRIPE_WEBHOOK_SECRET
```

Événements à écouter :
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 7. Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📚 Utilisation - Mail Center

### Workflow Principal

1. **Connexion** : Se connecter avec Google OAuth
2. **Connecter un compte email** :
   - Aller sur `/mail-center`
   - Cliquer "Connecter un compte"
   - Choisir Gmail ou Outlook
   - Autoriser l'accès (OAuth sécurisé)
   - Les 50 derniers emails se synchronisent automatiquement

3. **Analyse IA automatique** :
   - Chaque email est analysé en temps réel
   - Catégorisation : Support, Vente, Urgent, Spam, etc.
   - Sentiment : Positif, Neutre, Négatif, Urgent
   - Score d'urgence : 0-10 pour prioriser
   - Extraction d'entités : Produit, problème, date, montant

4. **Interface de gestion** :
   - Vue liste avec filtres puissants
   - Badges visuels (catégorie, sentiment, urgence)
   - Tri par date, urgence, sentiment
   - Recherche instantanée
   - Suppression définitive (soft delete)

5. **Automatisation** (fonctionnalité avancée) :
   - Créer des règles personnalisées
   - Définir triggers (mots-clés, catégorie, sentiment)
   - Choisir actions (réponse auto, transfert, tag)
   - Templates de réponses personnalisables
   - Validation obligatoire pour emails sensibles

6. **Analytics** :
   - Dashboard temps réel
   - Volumes traités par jour/semaine/mois
   - Temps de réponse moyen
   - Répartition par catégorie et sentiment
   - Tendances et évolutions

### Limites selon les plans

| Fonctionnalité | FREE | STARTER | PRO |
|----------------|------|---------|-----|
| Emails synchronisés/mois | 10 | 100 | 1000 |
| Comptes email connectés | 1 | 2 | Illimité |
| Réponses automatiques/mois | 0 | 50 | 500 |
| Templates personnalisés | 3 | 10 | Illimité |
| Historique emails | 7 jours | 30 jours | 1 an |
| Analytics | Basique | Avancé | Complet |
| Support | Email | Email + Chat | Prioritaire |

### API Endpoints - Mail Center

#### Authentification OAuth
```
GET  /api/mail-center/gmail/auth         # Générer URL OAuth Gmail
GET  /api/mail-center/gmail/callback     # Callback Gmail + sync initial
GET  /api/mail-center/outlook/auth       # Générer URL OAuth Outlook
GET  /api/mail-center/outlook/callback   # Callback Outlook + sync
```

#### Gestion des comptes
```
GET    /api/mail-center/accounts         # Liste comptes connectés
DELETE /api/mail-center/accounts/:id     # Déconnecter un compte
```

#### Emails
```
GET    /api/mail-center/emails           # Liste emails (avec filtres)
  ?category=support                      # Filtrer par catégorie
  &sentiment=urgent                      # Filtrer par sentiment
  &account_id=xxx                        # Filtrer par compte
  &search=keyword                        # Recherche texte
  &limit=50                              # Pagination
  
GET    /api/mail-center/emails/:id       # Détail d'un email
DELETE /api/mail-center/emails/:id       # Supprimer (soft delete)
```

#### Synchronisation
```
POST /api/mail-center/sync               # Sync manuelle
  Body: { account_id?: string }          # Optionnel: sync un seul compte
  
GET  /api/mail-center/auto-sync          # Sync automatique (cron)
GET  /api/mail-center/check-new          # Check nouveaux emails
```

#### Automatisation (Avancé)
```
GET    /api/mail-center/rules            # Liste règles automation
POST   /api/mail-center/rules            # Créer règle
PATCH  /api/mail-center/rules/:id        # Modifier règle
DELETE /api/mail-center/rules/:id        # Supprimer règle

GET    /api/mail-center/templates        # Templates réponses
POST   /api/mail-center/templates        # Créer template
PATCH  /api/mail-center/templates/:id    # Modifier template
DELETE /api/mail-center/templates/:id    # Supprimer template

GET    /api/mail-center/pending-replies  # Réponses en attente validation
POST   /api/mail-center/pending-replies/:id/approve  # Approuver
POST   /api/mail-center/pending-replies/:id/reject   # Rejeter
```

#### Analytics
```
GET /api/mail-center/stats               # Statistiques globales
  ?period=day|week|month                 # Période
  &start_date=YYYY-MM-DD                 # Date début
  &end_date=YYYY-MM-DD                   # Date fin
  
Response: {
  total_emails: number,
  emails_by_category: { [key: string]: number },
  emails_by_sentiment: { [key: string]: number },
  avg_urgency_score: number,
  avg_response_time: string,
  trends: Array<{date, count}>
}
```

#### Stripe & Abonnements
```
POST /api/stripe/create-checkout-session # Créer session paiement
POST /api/stripe/create-portal-session   # Ouvrir Customer Portal
POST /api/stripe/webhook                 # Webhooks Stripe

GET  /api/subscription/current           # Abonnement actuel
GET  /api/usage                          # Usage quotas
```

## 🔒 Sécurité

### Implémentations de Sécurité

- **Authentification OAuth 2.0** : 
  - Google OAuth pour Gmail (scopes minimaux requis)
  - Microsoft OAuth pour Outlook (permissions déléguées)
  - Refresh automatique des tokens expirés
  
- **Chiffrement des tokens** :
  - AES-256-GCM pour chiffrer access_token et refresh_token
  - Clé de chiffrement stockée en variable d'environnement
  - Tokens jamais exposés côté client
  
- **NextAuth Sessions** : 
  - JWT chiffrés avec secret NEXTAUTH_SECRET
  - Sessions HTTP-only cookies
  - CSRF protection intégré
  
- **Row Level Security (RLS)** : 
  - Politiques Supabase strictes sur toutes les tables
  - Isolation complète des données entre utilisateurs
  - `user_id` vérifié sur chaque requête
  
- **Rate Limiting** : 
  - 30 requêtes/minute sur endpoints IA
  - 100 requêtes/minute sur endpoints emails
  - Protection DDoS basique
  
- **Validation des inputs** : 
  - Zod schemas sur tous les endpoints API
  - Sanitization HTML des emails
  - Validation TypeScript stricte
  
- **Audit Logs** : 
  - Traçabilité complète des actions sensibles
  - Logs pino avec rotation
  - Conservation 90 jours
  
- **Headers HTTP sécurisés** :
  - Content-Security-Policy (CSP)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security (HSTS) en production
  
- **Conformité RGPD** :
  - Données chiffrées au repos et en transit
  - Droit à l'oubli (suppression compte)
  - Export données personnelles
  - Consentement explicite OAuth

## 🧪 Tests

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build
```

## 📦 Déploiement

### Vercel (recommandé)

1. Push votre code sur GitHub
2. Connectez votre repo à [Vercel](https://vercel.com)
3. Configurez les variables d'environnement (toutes celles de `.env.local`)
4. Déployez !

### Variables d'environnement production

⚠️ **Important pour la production** :

- Utilisez les clés Stripe **Live** (pas Test)
- Configurez le webhook Stripe vers `https://votredomaine.com/api/stripe/webhook`
- Mettez à jour `NEXT_PUBLIC_APP_URL` et `NEXTAUTH_URL` avec votre domaine
- Vérifiez que votre domaine Resend est vérifié
- Activez HTTPS strict (Vercel le fait automatiquement)
- Configurez les URIs de redirection OAuth :
  - Google Cloud Console : `https://votredomaine.com/api/mail-center/gmail/callback`
  - Azure Portal : `https://votredomaine.com/api/mail-center/outlook/callback`
  - NextAuth : `https://votredomaine.com/api/auth/callback/google`

### Configuration Stripe Production

1. Activez votre compte Stripe (vérification identité)
2. Créez les produits en mode **Live**
3. Configurez le webhook endpoint :
   - URL: `https://votredomaine.com/api/stripe/webhook`
   - Événements: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Copiez le webhook secret dans `STRIPE_WEBHOOK_SECRET`
4. Testez avec une vraie carte (mode test Stripe en prod ne fonctionne pas)

### Base de données

Votre Supabase est déjà en production. Assurez-vous que :
- Toutes les migrations sont appliquées
- RLS est activé sur toutes les tables
- Les indexes sont créés (performance)
- Backups automatiques configurés

### Monitoring & Logs

- **Vercel Analytics** : Activez pour suivre les performances
- **Stripe Dashboard** : Surveillez les paiements et webhooks
- **Supabase Logs** : Activez pour débugger les requêtes
- **Sentry** (optionnel) : Pour tracking d'erreurs avancé

## 🎨 Technologies & Dépendances

### Frontend
- **Next.js 14+** : Framework React avec App Router, Server Components, API Routes
- **React 18** : Bibliothèque UI avec hooks modernes
- **TypeScript 5.2** : Typage statique strict
- **TailwindCSS 3.3** : Framework CSS utility-first
- **shadcn/ui** : Composants UI modernes (Radix UI + Tailwind)
- **Framer Motion 12** : Animations fluides et performantes
- **next-themes** : Gestion thème clair/sombre
- **Lucide React** : Bibliothèque d'icônes moderne

### Backend & APIs
- **NextAuth 4** : Authentification OAuth (Google, Microsoft)
- **Supabase JS 2.58** : Client PostgreSQL + Auth + Storage
- **OpenAI 6.7** : SDK pour GPT-4 (analyse IA emails)
- **Stripe 19** : SDK paiements (Checkout + Webhooks + Portal)
- **googleapis 164** : SDK Gmail API pour OAuth et emails
- **@microsoft/microsoft-graph-client 3** : SDK Microsoft Graph pour Outlook
- **@azure/msal-node 3.8** : Authentification Microsoft
- **Resend 6.3** : Service d'envoi emails transactionnels

### State & Forms
- **TanStack Query 5** : Gestion état serveur, cache, mutations
- **React Hook Form 7** : Gestion formulaires performante
- **Zod 3.25** : Validation schemas TypeScript-first

### Sécurité & Utils
- **bcryptjs 3** : Hashing mots de passe
- **nanoid 5** : Génération IDs uniques
- **date-fns 3.6** : Manipulation dates
- **clsx / tailwind-merge** : Composition classes CSS

### Dev Tools
- **Pino 10** : Logger performant avec pino-pretty
- **ESLint** : Linter JavaScript/TypeScript
- **TypeScript** : Compilation et vérification types

### UI Components (shadcn/ui)
- Accordion, Alert Dialog, Avatar, Badge, Button
- Card, Checkbox, Dialog, Dropdown Menu, Input
- Label, Popover, Progress, Radio Group, Select
- Separator, Sheet, Slider, Switch, Tabs, Toast
- Tooltip, Scroll Area, et plus...

### Animations & 3D
- **Framer Motion** : Animations déclaratives
- **GSAP 3** : Animations timeline avancées
- **Lenis 1.3** : Smooth scroll
- **Three.js 0.161** (optionnel) : Rendu 3D
- **@react-three/fiber & drei** : React pour Three.js

Package.json complet disponible dans `/project/package.json`

## 📄 Licence

Copyright © 2025 ClaritySupport. Tous droits réservés.

## 🆘 Support

- **Email** : clarityteamfr@gmail.com
- **Documentation** : Ce README + `/MAIL_CENTER_README.md`
- **GitHub Issues** : Pour signaler bugs ou demander features

## 🗺️ Roadmap

### Version 1.0 (Actuelle) ✅
- [x] Connexion multi-comptes Gmail & Outlook
- [x] Synchronisation automatique emails (FIFO 50 max)
- [x] Analyse IA complète (catégorie, sentiment, urgence, entités)
- [x] Interface moderne avec filtres et recherche
- [x] Soft delete emails
- [x] Système d'abonnement Stripe (FREE/STARTER/PRO)
- [x] Authentification OAuth sécurisée
- [x] Chiffrement AES-256 tokens

### Version 1.1 (En cours) 🚧
- [ ] Système de règles d'automatisation
- [ ] Templates de réponses personnalisables
- [ ] Génération réponses IA automatiques
- [ ] Validation obligatoire emails sensibles
- [ ] Dashboard analytics avancé
- [ ] Export données (CSV, JSON)

### Version 1.2 (À venir) 🔮
- [ ] Mode temps réel (WebSocket)
- [ ] Notifications push navigateur
- [ ] Collaboration multi-utilisateurs
- [ ] Base de connaissances IA personnalisée
- [ ] Support IMAP/SMTP (autres providers)
- [ ] Mobile app (React Native)

### Version 2.0 (Future) 💡
- [ ] Intelligence collective (learning cross-users)
- [ ] Prédiction volume support
- [ ] Détection fraude automatique
- [ ] Intégrations CRM (Salesforce, HubSpot)
- [ ] API publique pour développeurs
- [ ] White-label pour agences

## 🏆 Fonctionnalités Clés Implémentées

✅ **OAuth Multi-Provider** : Gmail + Outlook avec refresh automatique  
✅ **Analyse IA Complète** : GPT-4 pour catégorisation intelligente  
✅ **Système FIFO** : 50 emails max par compte, nettoyage auto 24h  
✅ **Soft Delete** : Emails supprimés ne réapparaissent plus  
✅ **Chiffrement Fort** : AES-256 pour tokens sensibles  
✅ **RLS Strict** : Isolation données entre utilisateurs  
✅ **Stripe Complet** : Checkout + Webhooks + Portal + Proration  
✅ **UI/UX Premium** : Animations Framer Motion, dark mode  
✅ **TypeScript 100%** : Type safety complète  
✅ **Performance** : Next.js 14 App Router optimisé  

---

**Développé avec ❤️ par l'équipe ClaritySupport**

*Transformez votre support client par email en machine à satisfaction.*
