# MailWizard

> Générez des emails professionnels parfaits en quelques secondes grâce à l'IA

## 📝 Description

MailWizard est une application SaaS complète qui utilise l'intelligence artificielle (OpenAI GPT-5) pour créer des emails professionnels adaptés à chaque situation : candidatures, relances, prospection B2B, support client, et bien plus.

## ✨ Fonctionnalités principales

- 🤖 **Génération IA avancée** : GPT-5 pour des emails de qualité professionnelle
- 🔐 **Authentification Google** : Connexion sécurisée via NextAuth
- 💳 **Abonnements Stripe** : Plans FREE (10 générations/mois) et PRO (1000/mois)
- 📝 **Templates réutilisables** : Créez et sauvegardez vos meilleurs emails
- 🎨 **Éditeur WYSIWYG** : Personnalisez vos emails après génération
- 📊 **Suivi d'usage** : Quotas mensuels et statistiques en temps réel
- 🌍 **Multilingue** : Français et Anglais
- 📄 **Export PDF** : Documents professionnels (watermark sur FREE uniquement)
- 📧 **Envoi direct** : Intégration Resend pour envoyer vos emails
- 🎨 **Thème clair/sombre** : Interface adaptative avec palette personnalisée
- 🔒 **Sécurité renforcée** : Rate limiting, RLS Supabase, audit logs

## 🏗️ Architecture technique

### Stack

- **Frontend**: Next.js 13.5 (App Router), React 18, TypeScript
- **UI**: TailwindCSS, shadcn/ui, next-themes
- **Authentification**: NextAuth v4 (Google OAuth)
- **Base de données**: Supabase (PostgreSQL) avec Row Level Security
- **IA**: OpenAI API (gpt-4o-mini)
- **Paiements**: Stripe (Checkout + Webhooks)
- **Email**: Resend
- **State Management**: TanStack Query v5
- **Formulaires**: React Hook Form + Zod
- **PDF**: @react-pdf/renderer
- **Logs**: Pino

### Structure

```
project/
├── app/
│   ├── api/                  # API Routes
│   │   ├── auth/            # NextAuth routes
│   │   ├── ai/              # Génération IA
│   │   ├── templates/       # CRUD templates
│   │   ├── history/         # Historique emails
│   │   ├── usage/           # Quotas
│   │   ├── billing/         # Stripe checkout/portal
│   │   ├── stripe/          # Webhooks Stripe
│   │   └── emails/          # Envoi emails
│   ├── (marketing)/         # Pages publiques
│   └── (app)/               # Pages protégées (dashboard, compose, etc.)
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── providers.tsx        # Context providers
│   └── theme-toggle.tsx     # Toggle dark mode
├── lib/
│   ├── auth.ts              # Configuration NextAuth
│   ├── db.ts                # Client Supabase + types
│   ├── ai.ts                # Service OpenAI
│   ├── stripe.ts            # Client Stripe
│   ├── email.ts             # Service Resend
│   ├── pdf.ts               # Génération PDF
│   ├── logger.ts            # Pino logger
│   └── rate-limit.ts        # Rate limiting in-memory
└── scripts/
    ├── migrate.js           # Migrations Supabase
    └── seed.js              # Données de test
```

## 🚀 Installation locale

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase (gratuit)
- Compte Google Cloud (pour OAuth)
- Compte OpenAI (API key)
- Compte Stripe (mode test)
- Compte Resend (optionnel pour emails)

### 1. Cloner et installer

```bash
git clone https://github.com/votre-repo/mailwizard.git
cd mailwizard
npm install
```

### 2. Configuration des variables d'environnement

Copiez `.env.example` vers `.env` et remplissez toutes les valeurs:

```bash
cp .env.example .env
```

#### Variables requises:

**Supabase**
- `NEXT_PUBLIC_SUPABASE_URL`: URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clé service role (pour les opérations serveur)
- `DATABASE_URL`: URL de connexion PostgreSQL

**NextAuth**
- `NEXTAUTH_URL`: http://localhost:3000 (en dev)
- `NEXTAUTH_SECRET`: Générez avec `openssl rand -base64 32`

**Google OAuth** ([Configuration](https://console.cloud.google.com))
- `GOOGLE_CLIENT_ID`: Client ID OAuth
- `GOOGLE_CLIENT_SECRET`: Client Secret OAuth
- Ajoutez `http://localhost:3000/api/auth/callback/google` dans les URIs de redirection autorisées

**OpenAI** ([API Keys](https://platform.openai.com/api-keys))
- `OPENAI_API_KEY`: Votre clé API OpenAI
- `DEFAULT_AI_MODEL`: gpt-4o-mini (recommandé)

**Stripe** ([Dashboard](https://dashboard.stripe.com))
- `STRIPE_PUBLISHABLE_KEY`: Clé publique (mode test)
- `STRIPE_SECRET_KEY`: Clé secrète (mode test)
- `STRIPE_WEBHOOK_SECRET`: Secret du webhook (voir ci-dessous)
- `STRIPE_PRICE_FREE`: ID du prix FREE (optionnel)
- `STRIPE_PRICE_PRO_MONTHLY`: ID du prix PRO

**Resend** ([Dashboard](https://resend.com))
- `RESEND_API_KEY`: Votre clé API Resend
- `RESEND_FROM_EMAIL`: Email expéditeur vérifié

**App**
- `NEXT_PUBLIC_APP_URL`: http://localhost:3000

### 3. Configuration Supabase

Les migrations sont déjà appliquées si vous avez utilisé le MCP Supabase. Sinon:

```bash
# Les tables sont créées automatiquement via les migrations MCP
# Vérifiez dans le dashboard Supabase que les tables existent
```

### 4. Configuration Stripe

1. Créez deux produits dans [Stripe Dashboard](https://dashboard.stripe.com/test/products):
   - **FREE** (0€) - optionnel, pour référence
   - **PRO** (18.99€/mois, récurrent)

2. Copiez les `price_id` dans `.env`

3. Pour les webhooks locaux, utilisez Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copiez le webhook secret affiché dans STRIPE_WEBHOOK_SECRET
```

### 5. Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📚 Utilisation

### Flow utilisateur

1. **Inscription** : Connexion avec Google OAuth
2. **Choix du plan** : FREE par défaut, possibilité d'upgrader vers PRO
3. **Génération d'email** :
   - Aller sur `/app/compose`
   - Choisir le type (candidature, relance, prospection, etc.)
   - Définir le ton, la langue, le contexte
   - Générer avec l'IA
   - Éditer si nécessaire
   - Sauvegarder, exporter en PDF, ou envoyer
4. **Templates** : Sauvegarder les emails réussis comme templates réutilisables
5. **Historique** : Retrouver tous les emails générés

### API Endpoints

#### Génération d'email
```
POST /api/ai/generate
Authorization: Session cookie
Body: {
  type: 'candidature' | 'relance' | 'prospection' | 'support' | 'reponse' | 'negociation',
  tone: 'pro' | 'cordial' | 'direct',
  language: 'fr' | 'en',
  context: string,
  keyPoints?: string[],
  constraints?: string,
  variables?: Record<string, string>,
  saveAsEmail?: boolean
}
```

#### Templates CRUD
```
GET    /api/templates?q=search&type=candidature&language=fr
POST   /api/templates
GET    /api/templates/:id
PATCH  /api/templates/:id
DELETE /api/templates/:id
```

#### Historique
```
GET    /api/history?page=1&limit=20&q=search&type=&language=
GET    /api/history/:id
DELETE /api/history/:id
```

#### Usage & Quotas
```
GET /api/usage
Response: {
  plan: 'FREE' | 'PRO',
  limit: number,
  used: number,
  remaining: number,
  percentage: number,
  resetAt: string
}
```

#### Billing
```
POST /api/billing/checkout
POST /api/billing/portal
```

## 🔒 Sécurité

- **Authentification** : NextAuth avec sessions JWT chiffrées
- **Row Level Security (RLS)** : Toutes les tables Supabase ont des politiques RLS strictes
- **Rate Limiting** : 30 requêtes/minute sur `/api/ai/generate`
- **Validation** : Zod sur tous les inputs API
- **Audit Logs** : Traçabilité de toutes les actions importantes
- **HTTPS only** : En production
- **Headers sécurisés** : CSP, HSTS, etc.

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
3. Ajoutez toutes les variables d'environnement
4. Déployez !

### Variables d'environnement production

- Utilisez les clés Stripe **Live** (pas Test)
- Configurez le webhook Stripe vers `https://votredomaine.com/api/stripe/webhook`
- Mettez à jour `NEXT_PUBLIC_APP_URL` et `NEXTAUTH_URL`
- Vérifiez que votre domaine Resend est vérifié

### Base de données

Votre Supabase est déjà en production. Assurez-vous que :
- Les migrations sont appliquées
- RLS est activé sur toutes les tables
- Les indexes sont créés

## 🎨 Palette de couleurs

- **Vert nature (Primary)** : `#1E6F5C` (HSL: 168, 57%, 28%)
- **Beige (Background)** : `#E8E2D0` (HSL: 41, 42%, 92%)
- **Brun (Foreground)** : `#6B4F3A` (HSL: 30, 17%, 27%)
- **Gris foncé** : `#2C2F33` (HSL: 215, 25%, 17%)

## 📄 Licence

Copyright © 2025 MailWizard. Tous droits réservés.

## 🆘 Support

- Email: clarityteamfr@gmail.com
- Documentation: Ce README
- Issues: GitHub Issues (si repo public)

## 🗺️ Roadmap

- [ ] Support de langues supplémentaires (ES, DE, IT)
- [ ] Templates d'équipe (partage entre collaborateurs)
- [ ] Intégrations (Zapier, Make)
- [ ] Analytics avancées
- [ ] API publique pour intégrations tierces
- [ ] Mode hors-ligne (PWA)
- [ ] Export en format Word (.docx)

---

**Fait avec ❤️ par l'équipe MailWizard**
