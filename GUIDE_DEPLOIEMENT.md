# 🚀 Guide de Déploiement - MailWiz

## ✅ Prérequis avant déploiement

### 1. Vérifications de sécurité
- [ ] Changer `NEXTAUTH_SECRET` en production (minimum 32 caractères aléatoires)
- [ ] Utiliser les clés Stripe **LIVE** (pk_live_xxx et sk_live_xxx) en production
- [ ] Configurer le Webhook Stripe avec l'URL de production
- [ ] Vérifier que toutes les clés API sont sécurisées

### 2. Base de données Supabase
- [ ] Exécuter toutes les migrations SQL dans Supabase SQL Editor
- [ ] Vérifier que la table `user_templates` existe (voir migration ci-dessous)
- [ ] Activer RLS (Row Level Security) si nécessaire

### 3. Variables d'environnement
Configurer ces variables sur Vercel/votre plateforme :

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=https://xzeujbctwaqnxouvdedd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth - IMPORTANT: Changer en production !
NEXTAUTH_URL=https://votre-domaine.com
NEXTAUTH_SECRET=GENERER_UNE_CHAINE_ALEATOIRE_DE_32_CARACTERES_MINIMUM

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YOUR_GOOGLE_CLIENT_SECRET

# Microsoft OAuth
MICROSOFT_CLIENT_ID=YOUR_MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET=YOUR_MICROSOFT_CLIENT_SECRET

# OpenAI
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
DEFAULT_AI_MODEL=gpt-4o-mini

# Stripe - UTILISER LES CLÉS LIVE EN PRODUCTION !
STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_PUBLIQUE
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_PRODUCTION
STRIPE_PRICE_STARTER_MONTHLY=price_1SPRvSK4jU5Tmgr11Z1zVOlY
STRIPE_PRICE_PRO_MONTHLY=price_1SPOv2K4jU5Tmgr1AsCgSUqF
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_PUBLIQUE
NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY=price_1SPRvSK4jU5Tmgr11Z1zVOlY
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_1SPOv2K4jU5Tmgr1AsCgSUqF

# App Config
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
NODE_ENV=production
```

## 📊 Migration Supabase à exécuter

Connectez-vous à votre dashboard Supabase > SQL Editor et exécutez :

```sql
-- Migration: Création de la table user_templates
CREATE TABLE IF NOT EXISTS public.user_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON public.user_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_category ON public.user_templates(category);
ALTER TABLE public.user_templates DISABLE ROW LEVEL SECURITY;

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_templates_updated_at ON public.user_templates;
CREATE TRIGGER update_user_templates_updated_at
    BEFORE UPDATE ON public.user_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 🔧 Configuration Stripe Webhook

1. Allez sur https://dashboard.stripe.com/webhooks
2. Cliquez sur "Add endpoint"
3. URL du webhook: `https://votre-domaine.com/api/stripe/webhook`
4. Événements à écouter:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le "Signing secret" (whsec_xxx) et ajoutez-le dans `STRIPE_WEBHOOK_SECRET`

## 🌐 Configuration Google OAuth

Ajoutez l'URL de production dans Google Cloud Console:
1. Allez sur https://console.cloud.google.com
2. Projet > APIs & Services > Credentials
3. Modifier votre OAuth 2.0 Client ID
4. Authorized redirect URIs:
   - `https://votre-domaine.com/api/auth/callback/google`

## 🪟 Configuration Microsoft OAuth

Ajoutez l'URL de production dans Azure:
1. Allez sur https://portal.azure.com
2. App registrations > Votre app
3. Authentication > Add a platform > Web
4. Redirect URIs:
   - `https://votre-domaine.com/api/auth/callback/azure-ad`

## 📦 Déploiement sur Vercel (Recommandé)

### Via l'interface Vercel:

1. **Push le code sur GitHub**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Importer sur Vercel**
   - Allez sur https://vercel.com
   - "Add New Project"
   - Importez votre repo GitHub
   - Framework Preset: **Next.js**
   - Root Directory: `./`

3. **Configurer les variables d'environnement**
   - Dans Vercel > Settings > Environment Variables
   - Copiez toutes les variables du fichier `.env.local`
   - ⚠️ Changez `NEXTAUTH_URL` avec votre domaine
   - ⚠️ Utilisez les clés Stripe **LIVE**

4. **Déployer**
   - Cliquez sur "Deploy"
   - Attendez la fin du build (~2-5 minutes)

### Via CLI Vercel:

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod

# Configurer les variables d'environnement
vercel env add NEXTAUTH_SECRET
vercel env add STRIPE_SECRET_KEY
# ... etc
```

## 🔍 Vérifications post-déploiement

- [ ] Le site charge correctement sur votre domaine
- [ ] La connexion Google fonctionne
- [ ] Les paiements Stripe fonctionnent (testez en mode live!)
- [ ] Les webhooks Stripe sont reçus
- [ ] La génération d'emails fonctionne
- [ ] Le quota des utilisateurs est respecté
- [ ] Les templates personnalisés se sauvegardent

## 🚨 Checklist de sécurité finale

- [ ] `NEXTAUTH_SECRET` changé (32+ caractères aléatoires)
- [ ] Clés Stripe en mode **LIVE** (pk_live_xxx, sk_live_xxx)
- [ ] `NEXTAUTH_URL` pointe vers le domaine de production
- [ ] Webhooks Stripe configurés avec le bon endpoint
- [ ] OAuth Google/Microsoft configurés avec les bonnes redirections
- [ ] Variables sensibles jamais commitées dans Git
- [ ] `.env.local` dans `.gitignore`

## 📈 Surveillance et Monitoring

### Logs Vercel:
- Vercel Dashboard > Votre projet > Deployments > Logs

### Stripe Dashboard:
- https://dashboard.stripe.com/logs

### Supabase Logs:
- https://app.supabase.com/project/xzeujbctwaqnxouvdedd/logs/explorer

## 🎯 Produits Stripe configurés

- **MailWizard Starter** (7,99€/mois): `price_1SPRvSK4jU5Tmgr11Z1zVOlY`
- **MailWiz Pro** (18,99€/mois): `price_1SPOv2K4jU5Tmgr1AsCgSUqF`

## 🔗 Liens utiles

- Dashboard Supabase: https://app.supabase.com
- Dashboard Stripe: https://dashboard.stripe.com
- Console Google Cloud: https://console.cloud.google.com
- Azure Portal: https://portal.azure.com
- Vercel Dashboard: https://vercel.com/dashboard

## 💡 Conseils

1. **Testez en local avant** avec `npm run build && npm start`
2. **Utilisez le mode test Stripe** pour vérifier le flux de paiement
3. **Activez les logs détaillés** pendant les premiers jours
4. **Surveillez les erreurs** dans Vercel et Sentry (si configuré)
5. **Backup régulier** de votre base Supabase

---

✅ **Le site est prêt pour la production !**

En cas de problème, vérifiez:
1. Les logs Vercel
2. Les variables d'environnement
3. Les webhooks Stripe
4. La configuration OAuth
