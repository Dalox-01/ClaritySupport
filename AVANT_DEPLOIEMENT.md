# ✅ CHECKLIST COMPLÈTE AVANT DÉPLOIEMENT

## 🎯 INFORMATIONS À ME FOURNIR

Avant de déployer, j'ai besoin de ces informations :

### 1. **Nom de domaine**
- [ ] Votre nom de domaine (ex: `mailwiz.app` ou `votre-domaine.com`)
- [ ] Confirmez que le domaine est acheté et prêt

### 2. **Clés Stripe LIVE (Production)**
Actuellement en mode TEST. Pour la production, allez sur https://dashboard.stripe.com et récupérez :

- [ ] **Clé publique LIVE** : `pk_live_XXXXXXXXX` (commence par `pk_live_`)
- [ ] **Clé secrète LIVE** : `sk_live_XXXXXXXXX` (commence par `sk_live_`)

⚠️ **IMPORTANT** : Les Price IDs sont déjà corrects :
- Starter : `price_1SPRvSK4jU5Tmgr11Z1zVOlY`
- Pro : `price_1SPOv2K4jU5Tmgr1AsCgSUqF`

---

## 📋 CE QUE VOUS DEVEZ FAIRE (DANS L'ORDRE)

### ÉTAPE 1 : Configurer Google OAuth pour votre domaine

1. Allez sur https://console.cloud.google.com/apis/credentials
2. Cliquez sur votre **OAuth 2.0 Client ID** (celle utilisée actuellement)
3. Dans **"Authorized redirect URIs"**, ajoutez :
   ```
   https://VOTRE-DOMAINE.com/api/auth/callback/google
   ```
   ⚠️ Remplacez `VOTRE-DOMAINE.com` par votre vrai domaine

4. **NE SUPPRIMEZ PAS** l'URI localhost (pour continuer à tester en local)
5. Cliquez sur **"Save"**

✅ **Vos Client ID et Secret restent les mêmes**, pas besoin de me les redonner.

---

### ÉTAPE 2 : Configurer Microsoft OAuth pour votre domaine

1. Allez sur https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps
2. Cliquez sur votre application
3. Allez dans **"Authentication"** > **"Redirect URIs"**
4. Ajoutez :
   ```
   https://VOTRE-DOMAINE.com/api/auth/callback/azure-ad
   ```
5. Cliquez sur **"Save"**

✅ **Vos Client ID et Secret restent les mêmes**.

---

### ÉTAPE 3 : Créer la migration Supabase

1. Allez sur https://app.supabase.com/project/xzeujbctwaqnxouvdedd
2. Cliquez sur **"SQL Editor"** dans le menu de gauche
3. Cliquez sur **"New query"**
4. Copiez-collez ce SQL :

```sql
-- Création de la table user_templates (si elle n'existe pas)
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

-- Index pour optimisation
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON public.user_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_category ON public.user_templates(category);

-- Désactiver RLS pour simplifier
ALTER TABLE public.user_templates DISABLE ROW LEVEL SECURITY;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour appeler la fonction
DROP TRIGGER IF EXISTS update_user_templates_updated_at ON public.user_templates;
CREATE TRIGGER update_user_templates_updated_at
    BEFORE UPDATE ON public.user_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

5. Cliquez sur **"RUN"** en bas à droite
6. Vérifiez qu'il n'y a pas d'erreur (vous devriez voir "Success")

---

### ÉTAPE 4 : Déployer sur Vercel

#### 4.1 - Push le code sur GitHub

```bash
cd "c:\Users\laszl\Desktop\SiteDalox\MailWiz\project-bolt-sb1-6x8aaug9 (1)\project"
git init
git add .
git commit -m "Production ready deployment"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/mailwiz.git
git push -u origin main
```

⚠️ Remplacez `VOTRE-USERNAME` par votre username GitHub.

#### 4.2 - Importer sur Vercel

1. Allez sur https://vercel.com
2. Cliquez sur **"Add New..."** > **"Project"**
3. Importez votre repo GitHub
4. **Framework Preset** : Next.js (détecté automatiquement)
5. **Root Directory** : `./`
6. **NE CLIQUEZ PAS ENCORE SUR DEPLOY**

#### 4.3 - Configurer les variables d'environnement

Dans l'interface Vercel, allez dans **"Environment Variables"** et ajoutez :

```bash
# Database Supabase (GARDEZ CES VALEURS)
NEXT_PUBLIC_SUPABASE_URL=https://xzeujbctwaqnxouvdedd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZXVqYmN0d2FxbnhvdXZkZWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTE5MTcsImV4cCI6MjA3NzMyNzkxN30.O3RvBvC6HL_P4nuLo-8KPdbzXpcBvl_mniKbk8tX70w
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZXVqYmN0d2FxbnhvdXZkZWRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc1MTkxNywiZXhwIjoyMDc3MzI3OTE3fQ.45bbV6WUEC9i60Ztuc40O1IlRsFHKORsJ6jOZ5sq43I

# NextAuth - ⚠️ CHANGEZ CES VALEURS
NEXTAUTH_URL=https://VOTRE-DOMAINE.com
NEXTAUTH_SECRET=r4SaZb9zPPXCe11lNdHAXXzUA7iKsd0Yu/SlhYzfJvDdrQfEcuRVTs0Z4Q1DXwMU

# Google OAuth (GARDEZ CES VALEURS)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YOUR_GOOGLE_CLIENT_SECRET

# Microsoft OAuth (GARDEZ CES VALEURS)
MICROSOFT_CLIENT_ID=YOUR_MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET=YOUR_MICROSOFT_CLIENT_SECRET

# OpenAI (GARDEZ CETTE VALEUR)
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
DEFAULT_AI_MODEL=gpt-4o-mini

# Stripe - ⚠️ UTILISEZ LES CLÉS LIVE (pk_live_ et sk_live_)
STRIPE_PUBLISHABLE_KEY=VOTRE_CLE_PUBLIQUE_LIVE
STRIPE_SECRET_KEY=VOTRE_CLE_SECRETE_LIVE
STRIPE_WEBHOOK_SECRET=whsec_SERA_GENERE_APRES
STRIPE_PRICE_STARTER_MONTHLY=price_1SPRvSK4jU5Tmgr11Z1zVOlY
STRIPE_PRICE_PRO_MONTHLY=price_1SPOv2K4jU5Tmgr1AsCgSUqF

# Stripe Public (MÊMES VALEURS)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=VOTRE_CLE_PUBLIQUE_LIVE
NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY=price_1SPRvSK4jU5Tmgr11Z1zVOlY
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_1SPOv2K4jU5Tmgr1AsCgSUqF

# App Config - ⚠️ CHANGEZ CETTE VALEUR
NEXT_PUBLIC_APP_URL=https://VOTRE-DOMAINE.com
NODE_ENV=production
```

7. Cliquez sur **"Deploy"**
8. Attendez 2-5 minutes que le build se termine

---

### ÉTAPE 5 : Configurer le Webhook Stripe

⚠️ **FAITES CECI APRÈS LE DÉPLOIEMENT VERCEL**

1. Allez sur https://dashboard.stripe.com/webhooks
2. Cliquez sur **"Add endpoint"**
3. **Endpoint URL** : `https://VOTRE-DOMAINE.com/api/stripe/webhook`
4. **Events to send** : Sélectionnez ces événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Cliquez sur **"Add endpoint"**
6. **Copiez le "Signing secret"** (commence par `whsec_`)
7. Retournez sur Vercel > Settings > Environment Variables
8. Trouvez `STRIPE_WEBHOOK_SECRET` et remplacez par le vrai secret
9. **Redéployez** (Vercel > Deployments > 3 points > Redeploy)

---

### ÉTAPE 6 : Configurer votre domaine sur Vercel

1. Dans Vercel, allez dans **Settings** > **Domains**
2. Cliquez sur **"Add"**
3. Entrez votre domaine : `votre-domaine.com`
4. Vercel vous donnera des instructions DNS
5. Allez chez votre registrar de domaine (OVH, Cloudflare, etc.)
6. Ajoutez les enregistrements DNS fournis par Vercel
7. Attendez la propagation DNS (5-30 minutes)

---

## 🧪 TESTS POST-DÉPLOIEMENT

Une fois déployé, testez dans cet ordre :

### Test 1 : Site accessible
- [ ] Ouvrez `https://votre-domaine.com`
- [ ] La page d'accueil s'affiche correctement

### Test 2 : Connexion Google
- [ ] Cliquez sur "Se connecter avec Google"
- [ ] Authentification réussie
- [ ] Redirection vers `/dashboard`

### Test 3 : Génération d'email
- [ ] Remplissez le formulaire de génération
- [ ] Cliquez sur "Générer"
- [ ] L'email est généré correctement
- [ ] Le compteur de quota diminue

### Test 4 : Paiement Stripe
- [ ] Cliquez sur "Passer au plan Starter"
- [ ] Redirection vers Stripe Checkout
- [ ] ⚠️ **UTILISEZ UNE VRAIE CARTE** (mode LIVE activé)
- [ ] Paiement réussi
- [ ] Redirection vers page de succès
- [ ] Plan mis à jour dans le dashboard

### Test 5 : Webhook Stripe
- [ ] Allez sur https://dashboard.stripe.com/webhooks
- [ ] Cliquez sur votre webhook
- [ ] Vérifiez qu'il y a des événements reçus
- [ ] Statut = **"Succeeded"** (vert)

---

## ⚠️ ERREURS FRÉQUENTES ET SOLUTIONS

### Erreur : "Invalid redirect URI" lors de la connexion Google
**Solution** : Vérifiez que vous avez bien ajouté l'URI dans Google Cloud Console (Étape 1)

### Erreur : "Webhook signature verification failed"
**Solution** : Le `STRIPE_WEBHOOK_SECRET` est incorrect. Recopiez-le depuis Stripe Dashboard

### Erreur : "Could not find table user_templates"
**Solution** : Exécutez la migration SQL dans Supabase (Étape 3)

### Erreur : "NEXTAUTH_URL is not set"
**Solution** : Vérifiez que `NEXTAUTH_URL` est bien configuré dans Vercel avec votre domaine

---

## 📞 INFORMATIONS À ME COMMUNIQUER

Une fois tout configuré, donnez-moi :

1. ✅ Votre nom de domaine final : `____________________`
2. ✅ Confirmation migration Supabase exécutée : Oui / Non
3. ✅ Clés Stripe LIVE configurées : Oui / Non
4. ✅ Google OAuth configuré : Oui / Non
5. ✅ Microsoft OAuth configuré : Oui / Non
6. ✅ Webhook Stripe configuré : Oui / Non
7. ✅ Tests de paiement réussis : Oui / Non

---

## 🎉 C'EST TOUT !

Le code est **déjà prêt pour la production**. Vous n'avez **AUCUNE modification de code à faire** !

Il vous suffit de :
1. Configurer les OAuth (Google + Microsoft)
2. Exécuter la migration Supabase
3. Déployer sur Vercel avec les bonnes variables d'environnement
4. Configurer le webhook Stripe
5. Tester

**Bon déploiement ! 🚀**
