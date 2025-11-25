# Résolution du problème OAuth Shopify

Le message d'erreur `Oauth error invalid_request: The redirect_uri and application url must have matching hosts` indique une différence entre l'URL configurée dans votre code et celle configurée dans le tableau de bord Shopify Partner.

## Diagnostic

1. **URL générée par votre application :**
   `https://www.claritysupport.app/api/shopify/callback`
   (Ceci vient de votre variable d'environnement `NEXT_PUBLIC_APP_URL` qui est définie sur `https://www.claritysupport.app`)

2. **Configuration Shopify probable :**
   Dans votre Shopify Partner Dashboard, l'URL de l'application (App URL) est probablement configurée sur `https://claritysupport.app` (sans `www`) ou une autre URL.

## Solution

Vous devez aligner les deux configurations. La méthode recommandée est de mettre à jour la configuration dans Shopify.

### Option 1 : Mettre à jour Shopify (Recommandé)

1. Connectez-vous à votre [Shopify Partner Dashboard](https://partners.shopify.com/).
2. Allez dans **Apps** > Sélectionnez votre application **ClaritySupport**.
3. Cliquez sur **Configuration**.
4. Dans la section **URLs** :
   - **App URL** : Changez pour `https://www.claritysupport.app`
   - **Allowed redirection URL(s)** : Ajoutez ou modifiez pour avoir exactement `https://www.claritysupport.app/api/shopify/callback`
5. Cliquez sur **Save**.
6. Réessayez l'installation.

### Option 2 : Mettre à jour votre variable d'environnement

Si vous préférez utiliser l'URL sans `www` (ou une autre URL) :

1. Allez dans votre configuration de déploiement (Vercel, etc.).
2. Modifiez la variable d'environnement `NEXT_PUBLIC_APP_URL`.
   - Nouvelle valeur : `https://claritysupport.app` (ou l'URL exacte configurée dans Shopify)
3. Redéployez votre application.
4. Assurez-vous que votre domaine redirige bien vers cette URL.

### Option 3 : Utiliser une variable spécifique pour Shopify (Nouveau)

J'ai mis à jour le code pour supporter une variable d'environnement spécifique `SHOPIFY_APP_URL`. Cela vous permet de garder `NEXT_PUBLIC_APP_URL` tel quel, mais de forcer une URL différente pour Shopify.

1. Ajoutez une nouvelle variable d'environnement : `SHOPIFY_APP_URL`
2. Valeur : `https://claritysupport.app` (ou l'URL exacte configurée dans Shopify)
3. Redéployez.

## Vérification

Après la modification, l'URL de redirection dans la barre d'adresse lors de l'erreur devrait correspondre exactement à celle dans "Allowed redirection URL(s)" sur Shopify.

URL actuelle qui pose problème :
`redirect_uri=https%3A%2F%2Fwww.claritysupport.app%2Fapi%2Fshopify%2Fcallback`
