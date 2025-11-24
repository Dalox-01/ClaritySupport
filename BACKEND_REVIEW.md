# 🔍 BACKEND REVIEW & CORRECTIONS — IA mailcenter

**Date:** 7 novembre 2025  
**Reviewer:** Lead Backend Engineer  
**Scope:** Audit sécurité, bugs critiques, optimisations, tests

---

## 📋 RÉSUMÉ EXÉCUTIF

### État global
✅ **Backend fonctionnel à 90%** — Architecture solide, routes API complètes  
⚠️ **Quelques bugs critiques** — Gestion tokens OAuth, rate limiting, validations  
❌ **Documentation manquante** — Pas de Swagger/OpenAPI  
❌ **Tests insuffisants** — Aucun test d'intégration détecté

### Priorités
1. 🔴 **P0:** Fixer bugs critiques OAuth token refresh
2. 🟡 **P1:** Créer OpenAPI documentation
3. 🟡 **P1:** Ajouter tests d'intégration (Vitest)
4. 🟢 **P2:** Optimiser performances DB (indexes)

---

## 1️⃣ CONTRAT API DÉTAILLÉ (OpenAPI)

### Fichier OpenAPI 3.0

```yaml
openapi: 3.0.3
info:
  title: IA mailcenter API
  description: |
    API complète pour la génération d'emails par IA, gestion multi-comptes (Gmail/Outlook), 
    templates, quotas, et paiements Stripe.
  version: 1.0.0
  contact:
    name: Support IA mailcenter
    email: laszlojeanpierre@gmail.com
servers:
  - url: https://mailwizard.vercel.app/api
    description: Production
  - url: http://localhost:3000/api
    description: Development

components:
  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: next-auth.session-token
  
  schemas:
    Error:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: string
          example: "Unauthorized"
        message:
          type: string
          example: "You must be logged in"
    
    EmailGeneration:
      type: object
      required:
        - type
        - tone
        - language
        - context
      properties:
        type:
          type: string
          enum: [candidature, relance, prospection, support, reponse, negociation]
          example: "candidature"
        tone:
          type: string
          enum: [pro, cordial, direct]
          example: "pro"
        style:
          type: string
          enum: [formel, creatif, technique, commercial]
          example: "formel"
        language:
          type: string
          enum: [fr, en, es, de, it, pt, nl, pl, ru, ar, zh, ja, ko]
          example: "fr"
        length:
          type: string
          enum: [court, moyen, long]
          default: "moyen"
        context:
          type: string
          example: "Candidature pour un poste de développeur senior chez Google"
        customPrompt:
          type: string
          nullable: true
          example: "Inclure mes compétences en TypeScript et React"
        attachments:
          type: boolean
          default: false
        variables:
          type: object
          additionalProperties:
            type: string
          example:
            nom: "Dupont"
            entreprise: "Google"
    
    GeneratedEmail:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data:
          type: object
          properties:
            subject:
              type: string
              example: "Candidature au poste de Développeur Senior"
            text:
              type: string
              example: "Madame, Monsieur,\n\nJe vous écris..."
            html:
              type: string
              example: "<p>Madame, Monsieur,</p><p>Je vous écris...</p>"
            tokensUsed:
              type: integer
              example: 450
    
    Usage:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data:
          type: object
          properties:
            plan:
              type: string
              enum: [FREE, STARTER, PRO]
              example: "FREE"
            used:
              type: integer
              example: 7
            limit:
              type: integer
              example: 10
            remaining:
              type: integer
              example: 3
            percentage:
              type: number
              format: float
              example: 70.0
            resetAt:
              type: string
              format: date-time
              example: "2025-12-01T00:00:00Z"
    
    Template:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        name:
          type: string
          example: "Relance commerciale"
        description:
          type: string
          example: "Template pour relancer un prospect"
        type:
          type: string
          example: "prospection"
        content:
          type: string
        variables:
          type: object
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

paths:
  /ai/generate:
    post:
      summary: Générer un email avec l'IA
      description: |
        Génère un email professionnel basé sur les paramètres fournis.
        **Consomme 1 crédit du quota mensuel.**
      security:
        - cookieAuth: []
      tags:
        - AI
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EmailGeneration'
      responses:
        '200':
          description: Email généré avec succès
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GeneratedEmail'
        '401':
          description: Non authentifié
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '429':
          description: Quota épuisé
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                success: false
                error: "Quota exceeded"
                message: "You have reached your monthly limit of 10 generations"
        '500':
          description: Erreur serveur
  
  /usage:
    get:
      summary: Obtenir l'utilisation actuelle
      description: Retourne le quota utilisé et restant pour le mois en cours
      security:
        - cookieAuth: []
      tags:
        - Usage
      responses:
        '200':
          description: Usage récupéré
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Usage'
  
  /templates:
    get:
      summary: Lister les templates
      description: Récupère les templates de l'utilisateur connecté
      security:
        - cookieAuth: []
      tags:
        - Templates
      parameters:
        - name: q
          in: query
          schema:
            type: string
          description: Recherche par nom/description
        - name: type
          in: query
          schema:
            type: string
          description: Filtrer par type
      responses:
        '200':
          description: Liste des templates
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Template'
    
    post:
      summary: Créer un template
      security:
        - cookieAuth: []
      tags:
        - Templates
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, type, content]
              properties:
                name:
                  type: string
                description:
                  type: string
                type:
                  type: string
                content:
                  type: string
                variables:
                  type: object
      responses:
        '201':
          description: Template créé
        '400':
          description: Données invalides
  
  /billing/checkout:
    post:
      summary: Créer une session de paiement Stripe
      security:
        - cookieAuth: []
      tags:
        - Billing
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [priceId, plan]
              properties:
                priceId:
                  type: string
                  example: "price_1234567890"
                plan:
                  type: string
                  enum: [STARTER, PRO]
      responses:
        '200':
          description: Session créée
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  url:
                    type: string
                    example: "https://checkout.stripe.com/..."
  
  /gmail/auth:
    get:
      summary: Initier OAuth Gmail
      security:
        - cookieAuth: []
      tags:
        - Mail Center
      responses:
        '302':
          description: Redirige vers Google OAuth
  
  /gmail/callback:
    get:
      summary: Callback OAuth Gmail
      tags:
        - Mail Center
      parameters:
        - name: code
          in: query
          required: true
          schema:
            type: string
      responses:
        '302':
          description: Redirige vers le mail center
  
  /mail-center/sync:
    post:
      summary: Synchroniser les emails
      description: Synchronise les 50 derniers emails de tous les comptes connectés
      security:
        - cookieAuth: []
      tags:
        - Mail Center
      responses:
        '200':
          description: Emails synchronisés
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      emailsSynced:
                        type: integer
                      accounts:
                        type: array
                        items:
                          type: object

tags:
  - name: AI
    description: Génération d'emails par IA
  - name: Usage
    description: Gestion des quotas
  - name: Templates
    description: CRUD templates
  - name: Billing
    description: Paiements Stripe
  - name: Mail Center
    description: Sync et gestion multi-comptes
```

---

## 2️⃣ FLOWS CRITIQUES VÉRIFIÉS

### ✅ Flow 1 : Authentification (Google OAuth)

**Étapes:**
1. User clique "Se connecter avec Google"
2. Redirect vers `/api/auth/signin/google`
3. Callback vers `/api/auth/callback/google`
4. Session créée (JWT)
5. Utilisateur créé/mis à jour en DB (Supabase `users` table)

**Statut:** ✅ Fonctionnel  
**Tests:** ⚠️ Manquants

### ✅ Flow 2 : Génération d'email

**Étapes:**
1. User remplit form (type, tone, context, etc.)
2. POST `/api/ai/generate`
3. Vérification quota (`/api/usage`)
4. Appel OpenAI API (`lib/ai.ts`)
5. Incrémentation usage (`/api/usage/increment`)
6. Retour email généré

**Statut:** ✅ Fonctionnel  
**Bugs identifiés:**
- ⚠️ Race condition possible sur incrémentation quota (2 requêtes parallèles)
- ⚠️ Pas de timeout sur appel OpenAI (risque hang)

**Fix recommandé:**
```typescript
// lib/ai.ts
import { withTimeout } from './utils';

export async function generateEmail(params) {
  try {
    const completion = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [...],
        timeout: 30000, // 30s max
      }),
      30000
    );
    return completion;
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('AI generation timed out');
    }
    throw error;
  }
}
```

### ⚠️ Flow 3 : Paiement Stripe

**Étapes:**
1. User clique "Upgrade to PRO"
2. POST `/api/billing/checkout`
3. Création Stripe Checkout Session
4. Redirect vers Stripe
5. User paie
6. Webhook Stripe (`/api/stripe/webhook`)
7. Mise à jour plan user en DB

**Statut:** ⚠️ Partiellement testé  
**Bugs identifiés:**
- ❌ Webhook signature verification non testée en prod
- ⚠️ Pas de gestion annulation/échec paiement

**Fix recommandé:**
```typescript
// app/api/stripe/webhook/route.ts
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  // Handle events...
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
    // ... autres events
  }
  
  return NextResponse.json({ received: true });
}
```

### ❌ Flow 4 : OAuth Token Refresh (Gmail/Outlook)

**Étapes:**
1. Token expiré
2. Récupérer refresh token de DB
3. Appeler Google/Microsoft OAuth refresh endpoint
4. Sauvegarder nouveau access token

**Statut:** ❌ **BUG CRITIQUE** — Non implémenté  
**Impact:** Sync emails échoue après 1h (expiration token)

**Fix complet fourni dans EXEMPLE PR ci-dessus (Section 6 de l'audit).**

---

## 3️⃣ SCHÉMA BASE DE DONNÉES

### Tables Supabase (existantes)

```sql
-- Users (NextAuth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  image TEXT,
  plan TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'STARTER', 'PRO', 'ADMIN')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage (quotas)
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  language TEXT DEFAULT 'fr',
  tone TEXT DEFAULT 'pro',
  content TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emails (historique)
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT,
  language TEXT,
  tone TEXT,
  variables JSONB DEFAULT '{}',
  prompt_used TEXT,
  html TEXT,
  text TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mail accounts (OAuth)
CREATE TABLE mail_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  email TEXT NOT NULL,
  access_token TEXT NOT NULL, -- Chiffré AES-256
  refresh_token TEXT, -- Chiffré AES-256
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider, email)
);

-- Emails cache (Mail Center)
CREATE TABLE emails_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES mail_accounts(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  thread_id TEXT,
  subject TEXT,
  sender TEXT,
  recipient TEXT,
  cc TEXT,
  bcc TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMPTZ,
  labels JSONB DEFAULT '[]',
  -- AI Analysis
  category TEXT, -- 'support', 'vente', 'spam', 'urgent', etc.
  sentiment TEXT, -- 'positif', 'neutre', 'negatif', 'urgent'
  urgency_score INTEGER DEFAULT 0 CHECK (urgency_score BETWEEN 0 AND 10),
  entities JSONB DEFAULT '{}',
  requires_validation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, message_id)
);

-- Automation rules
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  -- Triggers
  trigger_keywords JSONB DEFAULT '[]',
  trigger_category TEXT,
  trigger_sender TEXT,
  -- Actions
  action_type TEXT NOT NULL CHECK (action_type IN ('auto_reply', 'flag', 'archive', 'forward')),
  action_template_id UUID REFERENCES templates(id),
  action_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pending replies (validation)
CREATE TABLE pending_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_id UUID REFERENCES emails_cache(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES automation_rules(id),
  generated_subject TEXT,
  generated_body TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signatures
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variables
CREATE TABLE variables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);
```

### Indexes recommandés

```sql
-- Performance indexes
CREATE INDEX idx_emails_user_created ON emails(user_id, created_at DESC);
CREATE INDEX idx_templates_user_favorite ON templates(user_id, is_favorite);
CREATE INDEX idx_usage_user_month ON usage(user_id, month);
CREATE INDEX idx_emails_cache_account ON emails_cache(account_id, received_at DESC);
CREATE INDEX idx_emails_cache_category ON emails_cache(category);
CREATE INDEX idx_pending_replies_status ON pending_replies(user_id, status);

-- Full-text search
CREATE INDEX idx_templates_search ON templates USING gin(to_tsvector('french', name || ' ' || description));
CREATE INDEX idx_emails_search ON emails USING gin(to_tsvector('french', title || ' ' || text));
```

### Row Level Security (RLS)

```sql
-- Enable RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_accounts ENABLE ROW LEVEL SECURITY;
-- ... etc pour toutes les tables

-- Policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own usage"
  ON usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their templates"
  ON templates FOR ALL
  USING (auth.uid() = user_id);

-- ... policies similaires pour toutes les tables
```

---

## 4️⃣ TESTS D'INTÉGRATION

### Setup Vitest

```bash
npm install -D vitest @vitest/ui
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### Exemple test d'intégration

```typescript
// tests/api/ai-generate.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/ai/generate/route';

describe('POST /api/ai/generate', () => {
  let sessionMock: any;

  beforeAll(() => {
    // Setup session mock
    sessionMock = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        plan: 'FREE',
      },
    };
  });

  it('should generate email successfully', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        type: 'candidature',
        tone: 'pro',
        language: 'fr',
        context: 'Candidature développeur chez Google',
      },
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('subject');
    expect(data.data).toHaveProperty('text');
    expect(data.data).toHaveProperty('html');
  });

  it('should fail if quota exceeded', async () => {
    // Mock usage at limit
    // ... test logic
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error).toContain('quota');
  });

  it('should fail if unauthenticated', async () => {
    // Remove session
    // ... test logic
    const response = await POST(req as any);
    expect(response.status).toBe(401);
  });
});
```

### Tests E2E Playwright

```typescript
// tests/e2e/full-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Full user flow', () => {
  test('should signup, generate email, and save', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('centre de gestion');

    // 2. Click "Essayer gratuitement"
    await page.click('text=Essayer gratuitement');

    // 3. Google OAuth (mock)
    await page.waitForURL('/dashboard');

    // 4. Fill email generation form
    await page.selectOption('select[name="type"]', 'candidature');
    await page.fill('textarea[name="context"]', 'Candidature développeur senior');
    await page.click('button:has-text("Générer")');

    // 5. Wait for generation
    await page.waitForSelector('text=Email généré');
    const subject = await page.locator('input[name="subject"]').inputValue();
    expect(subject).toBeTruthy();

    // 6. Save to history
    await page.click('button:has-text("Enregistrer")');
    await expect(page.locator('text=Email enregistré')).toBeVisible();

    // 7. Check history
    await page.click('text=Historique');
    await expect(page.locator('.history-item').first()).toBeVisible();
  });
});
```

---

## 5️⃣ PRs/PATCHES PRÊTS À MERGER

### PR #1 — OAuth Token Refresh

**Fichier:** Voir Section 6 de AUDIT_FRONTEND_COMPLET.md

**Commits:**
```
fix(api): Add OAuth token refresh for Gmail
fix(api): Add OAuth token refresh for Outlook
test(api): Add tests for expired token handling
docs(api): Update API docs with token refresh behavior
```

### PR #2 — Rate Limiting Amélioré

**Diff:**
```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type RateLimitConfig = {
  interval: number; // ms
  uniqueTokenPerInterval: number;
};

const cache = new LRUCache<string, number>({
  max: 500,
  ttl: 60000, // 1 minute
});

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = {
    interval: 60000, // 1 minute
    uniqueTokenPerInterval: 30,
  }
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();
  const key = `${identifier}-${Math.floor(now / config.interval)}`;
  
  const count = (cache.get(key) || 0) + 1;
  cache.set(key, count);
  
  const success = count <= config.uniqueTokenPerInterval;
  const remaining = Math.max(0, config.uniqueTokenPerInterval - count);
  const reset = Math.ceil((now + config.interval) / 1000);
  
  return {
    success,
    limit: config.uniqueTokenPerInterval,
    remaining,
    reset,
  };
}

// app/api/ai/generate/route.ts
+import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
+  // Rate limiting
+  const rateLimitResult = await rateLimit(session.user.id, {
+    interval: 60000, // 1 minute
+    uniqueTokenPerInterval: 10, // 10 requêtes/minute max
+  });
+  
+  if (!rateLimitResult.success) {
+    return NextResponse.json(
+      {
+        success: false,
+        error: 'Rate limit exceeded',
+        message: 'Too many requests. Please try again later.',
+        retryAfter: rateLimitResult.reset,
+      },
+      {
+        status: 429,
+        headers: {
+          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
+          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
+          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
+        },
+      }
+    );
+  }
  
  // ... reste du code
}
```

### PR #3 — Migration DB Indexes

**Fichier SQL:**
```sql
-- migrations/003_add_indexes.sql
BEGIN;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_emails_user_created 
  ON emails(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_templates_user_favorite 
  ON templates(user_id, is_favorite);

CREATE INDEX IF NOT EXISTS idx_usage_user_month 
  ON usage(user_id, month);

CREATE INDEX IF NOT EXISTS idx_emails_cache_account 
  ON emails_cache(account_id, received_at DESC);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_templates_search 
  ON templates USING gin(to_tsvector('french', name || ' ' || description));

COMMIT;
```

**Script migration:**
```bash
npm run db:migrate
```

---

## 6️⃣ RECOMMANDATIONS BACKEND

### Sécurité

1. ✅ **Activer HTTPS uniquement en prod**
   - Vérifier que `NEXTAUTH_URL` commence par `https://`

2. ✅ **Chiffrer tokens OAuth**
   - ✅ Déjà fait (AES-256)
   - ⚠️ Vérifier que `ENCRYPTION_KEY` est sécurisé (32 chars random)

3. ⚠️ **Ajouter Sentry pour monitoring**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

4. ⚠️ **Audit npm**
   ```bash
   npm audit fix
   npm audit --production
   ```

### Performance

1. ⚠️ **Connection pooling Supabase**
   ```typescript
   // lib/db.ts
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!,
     {
       db: {
         schema: 'public',
       },
       auth: {
         persistSession: false,
       },
       global: {
         headers: {
           'x-connection-pool': 'true',
         },
       },
     }
   );
   ```

2. ⚠️ **Cache Redis pour quotas**
   - Utiliser Vercel KV ou Upstash Redis
   - Éviter requêtes DB systématiques

3. ✅ **Lazy loading composants lourds**
   ```typescript
   const EmailEditor = dynamic(() => import('@/components/EmailEditor'), {
     loading: () => <EmailSkeletonLoader />,
     ssr: false,
   });
   ```

### Logs

1. ⚠️ **Structured logging**
   ```typescript
   // lib/logger.ts
   import pino from 'pino';
   
   export const logger = pino({
     level: process.env.LOG_LEVEL || 'info',
     transport: {
       target: 'pino-pretty',
       options: {
         colorize: true,
       },
     },
   });
   
   // Usage
   logger.info({ userId: '123', action: 'email_generated' }, 'Email generated successfully');
   logger.error({ err, userId: '123' }, 'Failed to generate email');
   ```

---

## 7️⃣ CHECKLIST DÉPLOIEMENT

### Pré-déploiement

- [ ] Toutes les variables d'environnement configurées en prod
- [ ] Stripe webhooks pointant vers prod (`/api/stripe/webhook`)
- [ ] Google OAuth redirect URI: `https://votredomaine.com/api/auth/callback/google`
- [ ] Outlook OAuth redirect URI: `https://votredomaine.com/api/mail-center/outlook/callback`
- [ ] Supabase RLS activé et testé
- [ ] Migrations DB appliquées
- [ ] Tests E2E passent à 100%
- [ ] Lighthouse >= 90

### Post-déploiement

- [ ] Vérifier logs (pas d'erreurs 500)
- [ ] Tester flow signup -> generate -> save
- [ ] Tester paiement Stripe (mode live)
- [ ] Tester sync Gmail/Outlook
- [ ] Vérifier webhooks Stripe reçus
- [ ] Monitoring actif (Sentry/LogRocket)

---

**Document préparé par:** Lead Backend Engineer  
**Date:** 7 novembre 2025  
**Version:** 1.0  
**Status:** ✅ Prêt pour implémentation
