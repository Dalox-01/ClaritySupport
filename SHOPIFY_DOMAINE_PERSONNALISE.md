# 🌐 Domaines personnalisés Shopify - Guide utilisateur

## 🤔 Mon site est aegisvolt.shop, pas .myshopify.com

Si votre boutique utilise un **domaine personnalisé** (comme `aegisvolt.shop`, `monshop.com`, etc.), vous devez quand même utiliser votre **domaine Shopify original** pour la connexion OAuth.

## 📍 Où trouver mon domaine .myshopify.com ?

### Méthode 1 : Dans votre Admin Shopify

1. **Connectez-vous à votre admin Shopify** (shopify.com/admin)
2. **Menu de gauche** → **Paramètres** (icône ⚙️ en bas)
3. Cliquez sur **"Domaines"**
4. Vous verrez :

```
┌─────────────────────────────────────────────────┐
│ 🌐 Domaines                                     │
├─────────────────────────────────────────────────┤
│                                                  │
│ Domaine principal (votre site public)           │
│ aegisvolt.shop                          ✅ Actif│
│                                                  │
│ Domaine Shopify (domaine technique)             │
│ aegisvolt.myshopify.com                ← CELUI-CI│
│                                                  │
└─────────────────────────────────────────────────┘
```

5. **Copiez** le domaine qui finit par `.myshopify.com`

### Méthode 2 : Regarder l'URL de votre admin

Quand vous êtes connecté à Shopify Admin, regardez l'URL dans votre navigateur :

```
https://admin.shopify.com/store/aegisvolt
                                 ^^^^^^^^
                                 C'est ce nom !
```

Votre domaine Shopify est : **`aegisvolt.myshopify.com`**

### Méthode 3 : Vérifier vos anciens emails Shopify

Cherchez dans vos emails (quand vous avez créé votre boutique) :

```
Objet: Bienvenue sur Shopify !

Votre boutique aegisvolt.myshopify.com est prête !
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

## 🔌 Comment connecter à Mail Center

Une fois que vous avez trouvé votre domaine `.myshopify.com` :

### Option 1 : Entrer le domaine complet
```
aegisvolt.myshopify.com
```

### Option 2 : Entrer juste le nom (plus simple)
```
aegisvolt
```
*(Mail Center ajoutera automatiquement `.myshopify.com`)*

## ❌ Ce qui ne fonctionne PAS

```
❌ aegisvolt.shop           (domaine personnalisé)
❌ https://aegisvolt.shop   (domaine personnalisé)
❌ www.aegisvolt.shop       (domaine personnalisé)
```

## ✅ Ce qui fonctionne

```
✅ aegisvolt.myshopify.com  (domaine Shopify complet)
✅ aegisvolt                (nom seul - recommandé)
✅ https://aegisvolt.myshopify.com (avec https - sera nettoyé)
```

## 🤷 Pourquoi cette limitation ?

Shopify **impose** l'utilisation du domaine `.myshopify.com` pour l'authentification OAuth. Même si votre boutique publique utilise un domaine personnalisé, l'API Shopify utilise toujours le domaine technique `.myshopify.com` en arrière-plan.

C'est une **limitation Shopify**, pas de Mail Center.

## 📸 Aide visuelle

```
┌─────────────────────────────────────────────────┐
│ Mail Center - Connexion Shopify                │
├─────────────────────────────────────────────────┤
│                                                  │
│ Domaine de votre boutique Shopify:              │
│ ┌──────────────────────────────────────────┐   │
│ │ aegisvolt                                │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ 💡 Entrez juste le nom (ex: aegisvolt)         │
│    ou le domaine complet (aegisvolt.myshopify.com)│
│                                                  │
│ ❌ N'entrez PAS votre domaine personnalisé     │
│    (aegisvolt.shop)                             │
│                                                  │
│              [Connecter ma boutique]            │
│                                                  │
│ 🔍 Où trouver mon domaine Shopify ?            │
│    → Shopify Admin → Paramètres → Domaines     │
│                                                  │
└─────────────────────────────────────────────────┘
```

## 🆘 Besoin d'aide ?

Si vous ne trouvez toujours pas votre domaine `.myshopify.com` :

1. **Contactez le support Shopify** : help.shopify.com
2. **Ou contactez notre support** : support@mailcenter.com

Ils pourront vous confirmer votre domaine Shopify technique.

---

**Note pour les développeurs frontend** :  
Vous pouvez afficher ce message d'aide dans une tooltip ou un modal quand l'utilisateur clique sur "?" à côté du champ de saisie.
