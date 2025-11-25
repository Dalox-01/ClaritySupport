# Guide de Configuration Shopify (Mise à jour)

Pour que l'intégration Shopify fonctionne correctement avec votre déploiement, voici les valeurs exactes à configurer dans votre **Shopify Partner Dashboard**.

## 1. Configuration de l'Application

Allez dans **Apps** > **ClaritySupport** > **Configuration**.

### URLs
*   **App URL** :
    ```
    https://www.claritysupport.app
    ```
    *(Note : Doit correspondre exactement à votre domaine de production)*

*   **Allowed redirection URL(s)** :
    ```
    https://www.claritysupport.app/api/shopify/callback
    ```
    *(Note : C'est ici que Shopify renvoie l'utilisateur après l'installation. Si cette URL ne correspond pas exactement à celle générée par le code, vous aurez l'erreur "Oauth error invalid_request")*

### Access (Scopes)
Dans la section **Access** > **Scopes**, sélectionnez ou collez les scopes suivants :

```text
read_orders,read_customers,read_products,read_inventory
```

## 2. Variables d'Environnement (Vercel)

Assurez-vous que vos variables d'environnement sur Vercel sont correctes :

*   `SHOPIFY_API_KEY` : (Votre Client ID Shopify)
*   `SHOPIFY_API_SECRET` : (Votre Client Secret Shopify)
*   `NEXT_PUBLIC_APP_URL` : `https://www.claritysupport.app`

### Optionnel : Forcer l'URL Shopify
Si vous ne pouvez pas changer l'URL dans Shopify (par exemple si elle est sans `www`), vous pouvez ajouter cette variable dans Vercel pour forcer l'URL utilisée lors de l'authentification :

*   `SHOPIFY_APP_URL` : `https://claritysupport.app` (ou l'URL configurée dans Shopify)

## 3. Résolution de l'erreur "Mode de distribution"

Si vous voyez l'erreur : *"Cette application ne peut pas encore être installée. Le développeur... doit d’abord sélectionner un mode de distribution."*

C'est une configuration à faire dans le **Shopify Partner Dashboard** :

1.  Allez dans votre **Shopify Partner Dashboard**.
2.  Sélectionnez votre application **ClaritySupport**.
3.  Dans le menu de gauche, cliquez sur **Distribution**.
4.  Vous devez choisir un mode :
    *   **Distribution personnalisée (Custom Distribution)** : Recommandé pour tester sur une boutique spécifique. Cliquez sur "Choisir", puis entrez l'URL de votre boutique (ex: `hk610k-6m.myshopify.com`).
    *   **Distribution publique (Public Distribution)** : Si vous prévoyez de la publier sur l'App Store.
5.  Une fois le mode choisi, vous pourrez installer l'application.

### Lien d'installation (Distribution Personnalisée)

Si vous avez choisi "Distribution personnalisée", Shopify vous donnera un lien spécial ressemblant à :
`https://admin.shopify.com/oauth/install_custom_app?client_id=...`

1.  Copiez ce lien.
2.  Ouvrez-le dans votre navigateur.
3.  Cliquez sur **Installer l'application**.
4.  Si tout est bien configuré (URLs), vous serez redirigé vers votre application ClaritySupport avec un message de succès.

**Astuce pour le développement :**
Le moyen le plus simple de tester est de créer une **Boutique de développement** (Development Store) directement depuis le tableau de bord Partner (section "Stores"), puis d'aller dans votre App > "Select store" pour l'installer dessus.
