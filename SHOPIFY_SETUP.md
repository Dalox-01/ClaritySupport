# 🛒 Configuration Shopify Integration

## 📋 Vue d'ensemble

Intégration Shopify 
- **STARTER** — Parfait pour démarrer votre boutique en ligne (**49€ / mois**, 1 boutique connectée)
- **PRO** — Pour les boutiques en croissance (**99€ / mois**, jusqu’à 3 boutiques connectées)
- **SCALE** — Pour les entreprises e-commerce établies (**199€ / mois**, boutiques illimitées)

## 🔑 Prérequis

### 1. Créer une Shopify Partner App

1. Allez sur https://partners.shopify.com/
2. Créez un compte Shopify Partner (gratuit)
3. Dans le dashboard, cliquez **Apps** → **Create app**
4. Choisissez **Public app** (distribution publique)
5. Remplissez les informations :
   - **App name** : Mail Center by Dalox
   - **App URL** : `https://votre-domaine.com`
   - **Allowed redirection URL(s)** : `https://votre-domaine.com/api/shopify/callback`

### 2. Récupérer les credentials

Dans les paramètres de votre app Shopify :
- **API key** : Copiez la clé (visible dans l'onglet Overview)
- **API secret key** : Cliquez "Show" et copiez

### 3. Configurer les scopes OAuth

Dans **API scopes**, activez :
- ✅ `read_orders` - Lire les commandes
- ✅ `read_customers` - Lire les clients
- ✅ `read_products` - Lire les produits
- ✅ `read_inventory` - Lire l'inventaire

## ⚙️ Variables d'environnement

Ajoutez ces variables dans votre `.env.local` :

```env
# Shopify OAuth Configuration
SHOPIFY_API_KEY=votre_api_key_ici
SHOPIFY_API_SECRET=votre_api_secret_ici
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

**En développement local :**

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Migration de la base de données

Exécutez la migration SQL dans votre instance Supabase :

```bash
# Via Supabase Dashboard SQL Editor
1. Ouvrez Supabase Dashboard → SQL Editor
2. Collez le contenu de supabase/migrations/20250116_shopify_integration.sql
3. Cliquez "Run"
```

Ou via CLI :

```bash
supabase migration up
```

Cette migration créera :
- ✅ Table `shopify_shops` - Boutiques connectées
- ✅ Table `shopify_orders` - Commandes synchronisées
- ✅ Table `shopify_customers` - Clients Shopify
- ✅ Fonction `check_shopify_shop_limit()` - Vérification des limites
- ✅ Fonction `update_shop_statistics()` - Mise à jour des stats
- ✅ RLS policies - Sécurité Row Level Security

## 🚀 Flow OAuth complet

### 1. Connexion d'une boutique (Frontend)

L'utilisateur clique sur le bouton **"Connecter Shopify"** :

```typescript
// components/shopify-connect-button.tsx (déjà créé par ingénieur frontend)
const handleConnect = async () => {
  const shopDomain = "ma-boutique.myshopify.com";
  
  const response = await fetch('/api/shopify/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shopDomain }),
  });

  const { authUrl } = await response.json();
  window.location.href = authUrl; // Redirection OAuth
};
```

### 2. Autorisation Shopify (Shopify)

L'utilisateur est redirigé vers Shopify :
```
https://ma-boutique.myshopify.com/admin/oauth/authorize?
  client_id=votre_api_key
  &scope=read_orders,read_customers,read_products,read_inventory
  &redirect_uri=https://votre-domaine.com/api/shopify/callback
  &state=user_id_123
```

### 3. Callback OAuth (Backend)

Shopify redirige vers `/api/shopify/callback?code=xxx&shop=xxx&state=userId` :

1. ✅ Échange du `code` contre un `access_token` permanent
2. ✅ Récupération des infos de la boutique (nom, email, devise)
3. ✅ Sauvegarde en BDD (`shopify_shops`)
4. ✅ Synchronisation initiale des 250 dernières commandes (asynchrone)
5. ✅ Redirection vers `/mail-center?shopify_success=true`

### 4. Synchronisation continue (Webhooks)

**TODO: Implémenter les webhooks Shopify** (prochaine étape)

Pour recevoir les mises à jour en temps réel :
- `orders/create` - Nouvelle commande
- `orders/updated` - Commande modifiée
- `customers/create` - Nouveau client

## 📊 Vérification des limites

Le système vérifie automatiquement les limites :

```typescript
// Exemple de réponse GET /api/shopify/connect
{
  "shops": [
    {
      "id": "uuid",
      "shop_domain": "ma-boutique.myshopify.com",
      "shop_name": "Ma Boutique",
      "status": "active",
      "total_orders": 1245,
      "total_revenue": 125000.50
    }
  ],
  "planLimits": {
    "plan": "STARTER",
    "currentShops": 1,
    "maxShops": 1,
    "canAddMore": false,
    "hasAccess": true
  }
}
```

## 🔒 Sécurité

### Row Level Security (RLS)

Toutes les tables ont des policies RLS :

```sql
-- Les utilisateurs ne voient que leurs propres boutiques
CREATE POLICY "Users can only view their own shops"
  ON shopify_shops FOR SELECT
  USING (auth.uid() = user_id);
```

### Validation des plans

La fonction PostgreSQL `check_shopify_shop_limit()` garantit :
- ✅ Vérification côté base de données (impossible à contourner)
- ✅ Limits strictes : STARTER=1, PRO=3, ENTERPRISE=999999
- ✅ Retour JSON avec `canAddMore` boolean

### Tokens sécurisés

Les `access_token` Shopify sont :
- ✅ Stockés chiffrés dans Supabase
- ✅ Jamais exposés au frontend
- ✅ Utilisés uniquement côté serveur

## 🧪 Tests

### Test manuel de connexion

1. **Créer un compte Shopify de développement** (gratuit) :
   - Allez sur https://accounts.shopify.com/signup
   - Créez un "Development store"

2. **Tester le flow OAuth** :
   ```bash
   # En local
   npm run dev
   
   # Ouvrir http://localhost:3000/mail-center
   # Cliquer "Connecter Shopify"
   # Entrer : votre-dev-store.myshopify.com
   ```

3. **Vérifier la synchronisation** :
   ```sql
   -- Dans Supabase SQL Editor
   SELECT * FROM shopify_shops;
   SELECT * FROM shopify_orders LIMIT 10;
   ```

### Test des limites par plan

```typescript
// Test avec utilisateur STARTER (max 1 boutique)
POST /api/shopify/connect
{ "shopDomain": "boutique1.myshopify.com" } // ✅ OK

POST /api/shopify/connect
{ "shopDomain": "boutique2.myshopify.com" } // ❌ 403 Limite atteinte

// Test avec utilisateur PRO (max 3 boutiques)
POST /api/shopify/connect // ✅ Boutique 1
POST /api/shopify/connect // ✅ Boutique 2
POST /api/shopify/connect // ✅ Boutique 3
POST /api/shopify/connect // ❌ 403 Limite atteinte
```

## 📈 Performance

### Cache des statistiques

Les stats sont mises en cache dans `shopify_shops` :
- `total_orders` - Nombre total de commandes
- `total_customers` - Nombre de clients
- `total_revenue` - Revenu total
- `last_sync_at` - Dernière synchronisation

Mise à jour automatique après chaque sync :
```sql
SELECT update_shop_statistics('shop_id_here');
```

### Rate Limiting Shopify API

Shopify limite à **2 requêtes/seconde** :

```typescript
// lib/shopify-service.ts implémente un délai automatique
const SHOPIFY_RATE_LIMIT_DELAY = 500; // 500ms entre requêtes
```

### Sync asynchrone

La synchronisation des commandes se fait en arrière-plan :
- ✅ Ne bloque pas le callback OAuth
- ✅ Traite 250 commandes par batch
- ✅ Upsert performant avec `ON CONFLICT DO UPDATE`

## 🛠️ API Endpoints

### `GET /api/shopify/connect`
Récupère les boutiques connectées + limites du plan

**Response :**
```json
{
  "shops": [ShopifyShop],
  "planLimits": {
    "plan": "STARTER",
    "currentShops": 1,
    "maxShops": 1,
    "canAddMore": false,
    "hasAccess": true
  }
}
```

### `POST /api/shopify/connect`
Initie la connexion OAuth

**Request :**
```json
{ "shopDomain": "ma-boutique.myshopify.com" }
```

**Response :**
```json
{
  "success": true,
  "authUrl": "https://ma-boutique.myshopify.com/admin/oauth/authorize?...",
  "message": "Redirection vers ma-boutique.myshopify.com..."
}
```

### `DELETE /api/shopify/connect`
Déconnecte une boutique

**Request :**
```json
{ "shopId": "uuid-de-la-boutique" }
```

**Response :**
```json
{
  "success": true,
  "message": "Boutique déconnectée avec succès"
}
```

### `GET /api/shopify/callback`
OAuth callback (géré automatiquement par Shopify)

**Query params :**
- `code` - Code d'autorisation temporaire
- `shop` - Domaine de la boutique
- `state` - userId pour identification
- `hmac` - Signature de sécurité

## ❓ Troubleshooting

### Erreur : "Missing OAuth parameters"

**Cause** : Shopify n'a pas renvoyé tous les paramètres OAuth

**Solution** :
1. Vérifier que `NEXT_PUBLIC_APP_URL` est correct
2. Vérifier que l'URL de callback est bien configurée dans Shopify Partner Dashboard
3. S'assurer que le domaine est `*.myshopify.com`

### Erreur : "Token exchange failed"

**Cause** : `SHOPIFY_API_KEY` ou `SHOPIFY_API_SECRET` invalides

**Solution** :
1. Vérifier les variables d'environnement
2. Régénérer les credentials dans Shopify Partner Dashboard
3. Redémarrer le serveur Next.js après modification du `.env`

### Erreur : "Limite atteinte"

**Cause** : L'utilisateur a dépassé sa limite de boutiques selon son plan

**Solution** :
1. Vérifier le plan de l'utilisateur : `SELECT plan FROM users WHERE id = 'user_id'`
2. Augmenter le plan (STARTER → PRO → ENTERPRISE)
3. Ou supprimer une boutique existante avant d'en ajouter une nouvelle

### Pas de synchronisation des commandes

**Cause** : La sync asynchrone a échoué en arrière-plan

**Solution** :
```bash
# Vérifier les logs de la sync
# Dans les logs Vercel ou console locale

# Relancer manuellement la sync
POST /api/shopify/sync
{ "shopId": "uuid-de-la-boutique" }
```

## 🔄 Prochaines étapes

1. ✅ **Webhooks Shopify** - Synchronisation temps réel
2. ✅ **Dashboard analytics** - Visualisation des commandes/clients
3. ✅ **Notifications** - Alertes sur nouvelles commandes
4. ✅ **Exports** - Export CSV des commandes
5. ✅ **Multi-devises** - Support des devises étrangères

---

**Documentation technique complète**  
Backend Engineer - Mail Center by Dalox
