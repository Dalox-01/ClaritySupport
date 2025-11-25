# 🚀 DÉPLOIEMENT MAILWIZARD.FR

## ✅ CHANGEMENTS EFFECTUÉS

### 1. Code mis à jour
- ✅ `app/layout.tsx` : métadonnées OpenGraph avec `https://mailwizard.fr`
- ✅ `.env.production` : toutes les variables prêtes pour Vercel

### 2. Domaine configuré
- 🌐 **mailwizard.fr**

---

## 📋 ÉTAPES À SUIVRE (DANS L'ORDRE)

### ÉTAPE 1 : Récupérer vos clés Stripe LIVE

1. Allez sur https://dashboard.stripe.com/apikeys
2. **Activez le mode "Live"** (switch en haut à droite)
3. Copiez :
   - **Clé publique** : `pk_live_...` 
   - **Clé secrète** : `sk_live_...` (cliquez sur "Reveal")
4. **Gardez-les de côté** (vous allez les copier dans Vercel)

---

### ÉTAPE 2 : Configurer Google OAuth

1. Allez sur https://console.cloud.google.com/apis/credentials
2. Cliquez sur votre **OAuth 2.0 Client ID**
3. Dans **"Authorized redirect URIs"**, ajoutez :
   ```
   https://mailwizard.fr/api/auth/callback/google
   ```
4. **Gardez aussi** l'URI localhost pour continuer à tester
5. Cliquez sur **"Save"**

✅ **Fait ? Passez à l'étape suivante**

---

### ÉTAPE 3 : Configurer Microsoft OAuth

1. Allez sur https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps
2. Cliquez sur votre application
3. **Authentication** > **Redirect URIs**
4. Ajoutez :
   ```
   https://mailwizard.fr/api/auth/callback/azure-ad
   ```
5. **Save**

✅ **Fait ? Passez à l'étape suivante**

---

### ÉTAPE 4 : Exécuter la migration Supabase

1. Allez sur https://app.supabase.com/project/xzeujbctwaqnxouvdedd
2. **SQL Editor** (menu gauche)
3. **New query**
4. Copiez-collez ce SQL :

```sql
-- Création de la table user_templates
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

-- Index
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON public.user_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_category ON public.user_templates(category);

-- RLS désactivé
ALTER TABLE public.user_templates DISABLE ROW LEVEL SECURITY;

-- Trigger updated_at
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

5. **RUN**
6. Vérifiez "Success"

✅ **Fait ? Passez à l'étape suivante**

---

### ÉTAPE 5 : Déployer sur Vercel

#### 5.1 - Push sur GitHub

```bash
cd "c:\Users\laszl\Desktop\SiteDalox\MailWiz\project-bolt-sb1-6x8aaug9 (1)\project"
git init
git add .
git commit -m "Production deployment - mailwizard.fr"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/mailwizard.git
git push -u origin main
```

#### 5.2 - Importer sur Vercel

1. https://vercel.com
2. **Add New...** > **Project**
3. Importez le repo GitHub
4. **Framework** : Next.js (auto-détecté)
5. **NE DÉPLOYEZ PAS ENCORE**

#### 5.3 - Configurer les variables d'environnement

**Ouvrez le fichier `.env.production`** dans le projet et copiez TOUTES les variables dans Vercel :

1. Dans Vercel : **Environment Variables**
2. Pour **CHAQUE variable** :
   - Copiez le nom (ex: `NEXTAUTH_URL`)
   - Copiez la valeur (ex: `https://mailwizard.fr`)
   - Sélectionnez **Production**
   - Cliquez **Add**

⚠️ **ATTENTION** : Pour Stripe, remplacez les valeurs par vos vraies clés LIVE :
- `STRIPE_PUBLISHABLE_KEY` → votre `pk_live_...`
- `STRIPE_SECRET_KEY` → votre `sk_live_...`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → même `pk_live_...`

3. Une fois TOUTES les variables ajoutées, cliquez **Deploy**

⏳ Attendez 2-5 minutes...

✅ **Déploiement terminé ? Notez l'URL Vercel (ex: mailwizard.vercel.app)**

---

### ÉTAPE 6 : Configurer le Webhook Stripe

1. Allez sur https://dashboard.stripe.com/webhooks
2. **Mode LIVE activé** (switch en haut à droite)
3. **Add endpoint**
4. **Endpoint URL** :
   ```
   https://mailwizard.fr/api/stripe/webhook
   ```
5. **Events to send** :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. **Add endpoint**
7. **Copiez le Signing secret** (`whsec_...`)
8. Retournez sur **Vercel** > **Settings** > **Environment Variables**
9. Trouvez `STRIPE_WEBHOOK_SECRET`
10. **Edit** et remplacez par le vrai secret
11. **Save**
12. **Deployments** > **3 points** > **Redeploy**

---

### ÉTAPE 7 : Configurer votre domaine

1. **Vercel** > **Settings** > **Domains**
2. **Add** : `mailwizard.fr`
3. Vercel vous donne des enregistrements DNS

4. Allez chez votre **registrar** (OVH, Cloudflare, etc.)
5. Ajoutez les enregistrements DNS fournis par Vercel

**Exemple typique** :
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

6. **Attendez la propagation** (5-30 minutes)
7. Vercel affichera "Valid Configuration" quand c'est prêt

---

## 🧪 TESTS FINAUX

### Test 1 : Site accessible
- [ ] https://mailwizard.fr s'ouvre
- [ ] Page d'accueil OK

### Test 2 : Connexion Google
- [ ] "Se connecter avec Google"
- [ ] Authentification réussie
- [ ] Dashboard accessible

### Test 3 : Génération d'email
- [ ] Formulaire rempli
- [ ] "Générer" → email créé
- [ ] Quota diminue

### Test 4 : Paiement LIVE (VRAIE CARTE !)
- [ ] "Passer au plan Starter"
- [ ] Checkout Stripe
- [ ] ⚠️ **Paiement réel de 7.99€**
- [ ] Succès
- [ ] Plan mis à jour

### Test 5 : Webhook
- [ ] https://dashboard.stripe.com/webhooks
- [ ] Votre webhook
- [ ] Événements reçus
- [ ] Statut "Succeeded"

---

## 🎉 RÉCAPITULATIF

Vous avez :
- ✅ Configuré Google OAuth pour mailwizard.fr
- ✅ Configuré Microsoft OAuth pour mailwizard.fr
- ✅ Exécuté la migration Supabase
- ✅ Déployé sur Vercel avec les clés LIVE
- ✅ Configuré le webhook Stripe
- ✅ Configuré le DNS pour mailwizard.fr

**Le site est maintenant en PRODUCTION ! 🚀**

---

## ⚠️ IMPORTANT - SÉCURITÉ

1. **Ne partagez JAMAIS** vos clés secrètes (Stripe sk_live_, NEXTAUTH_SECRET, etc.)
2. **Vérifiez régulièrement** les webhooks Stripe pour détecter les erreurs
3. **Surveillez les logs** Vercel pour détecter les problèmes
4. **Testez les paiements** avec une vraie carte en mode LIVE

---

## 📞 BESOIN D'AIDE ?

Si vous rencontrez un problème :

1. **Vérifiez les logs Vercel** : https://vercel.com/dashboard
2. **Vérifiez les webhooks Stripe** : https://dashboard.stripe.com/webhooks
3. **Vérifiez la console Supabase** : https://app.supabase.com

**Bon lancement ! 🎊**
