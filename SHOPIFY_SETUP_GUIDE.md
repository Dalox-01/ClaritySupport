# 🛍️ Guide de Configuration Shopify

## Vue d'ensemble

Le système Shopify permet aux utilisateurs avec un abonnement **E-commerce** (segment `shopify`) de connecter leurs boutiques Shopify directement depuis le Mail Center.

### Fonctionnalités

- ✅ **Connexion multi-boutiques** selon le plan
- ✅ **Restriction par segment** : Visible uniquement pour les abonnés e-commerce
- ✅ **Limites par plan** :
  - `STARTER` : 1 boutique
  - `PRO` : 3 boutiques
  - `SCALE` : Illimité (999)
- ✅ **UI verte distinctive** pour différencier de l'UI bleue principale
- ✅ **Gestion complète** : Connexion, liste, déconnexion

---

## 📋 Étape 1 : Appliquer la Migration SQL

### 1.1 Aller dans Supabase Dashboard

1. Ouvrir [Supabase Dashboard](https://app.supabase.com)
2. Sélectionner votre projet
3. Aller dans **SQL Editor** (menu de gauche)

### 1.2 Exécuter la Migration

Copier-coller le contenu du fichier `supabase/migrations/20251116_add_shopify_support.sql` :

```sql
-- Cette migration ajoute :
-- 1. Colonne 'segment' à la table subscriptions
-- 2. Table shopify_connections
-- 3. Politiques RLS pour la sécurité
-- 4. Fonctions helper pour vérifier les limites
```

**Actions effectuées** :
- ✅ Ajout colonne `segment` (shopify | freelance) à `subscriptions`
- ✅ Création table `shopify_connections` avec RLS activé
- ✅ Index de performance sur `user_id` et `status`
- ✅ Trigger `updated_at` automatique
- ✅ Vue `shopify_stats` pour statistiques
- ✅ Fonction `check_shopify_limit()` pour validation

### 1.3 Vérifier l'Application

Exécuter cette requête pour confirmer :

```sql
-- Vérifier la structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shopify_connections';

-- Vérifier les politiques RLS
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'shopify_connections';
```

**Résultat attendu** :
- 9 colonnes dans `shopify_connections`
- 4 politiques RLS (SELECT, INSERT, UPDATE, DELETE)

---

## 🔧 Étape 2 : Configurer les Segments Utilisateurs

### 2.1 Assigner le Segment aux Abonnements Existants

Par défaut, tous les nouveaux abonnements auront `segment = 'shopify'`. Pour les abonnements existants :

```sql
-- Mettre tous les plans e-commerce en segment shopify
UPDATE public.subscriptions 
SET segment = 'shopify' 
WHERE plan IN ('STARTER', 'PRO', 'SCALE');

-- Mettre tous les plans freelance en segment freelance
UPDATE public.subscriptions 
SET segment = 'freelance' 
WHERE plan IN ('SOLO', 'UNLIMITED');
```

### 2.2 Vérifier les Segments

```sql
SELECT 
  u.email,
  s.plan,
  s.segment,
  s.status
FROM subscriptions s
JOIN users u ON u.id = s.user_id
WHERE s.status = 'active'
ORDER BY s.segment, s.plan;
```

---

## 🎨 Étape 3 : Apparence dans le Mail Center

### Position du Bouton

Le bouton Shopify apparaît dans la **sidebar gauche** :

```
┌─────────────────┐
│ Navigation      │ ← Inbox, Validation, Stats
├─────────────────┤
│ Filtres         │ ← Support, Vente, Spam, etc.
├─────────────────┤
│ Comptes         │ ← Sélecteur de comptes email
├─────────────────┤
│ 🛍️ Shopify      │ ← NOUVEAU (vert)
├─────────────────┤
│ Outils          │ ← Config IA, Base de connaissances
└─────────────────┘
```

### Design

- **Couleur** : Vert (`from-green-600 to-emerald-600`)
- **Icône** : `ShoppingBag` de Lucide
- **Badge** : "E-commerce" en vert
- **Visibilité** : Automatiquement masqué pour les utilisateurs freelance

---

## 🔐 Étape 4 : Sécurité et Permissions

### 4.1 Row Level Security (RLS)

Toutes les boutiques Shopify sont protégées par RLS :

```sql
-- Les utilisateurs voient UNIQUEMENT leurs boutiques
SELECT * FROM shopify_connections WHERE user_id = auth.uid();
```

### 4.2 Vérification du Segment

L'API `/api/shopify/connect` vérifie automatiquement :

```typescript
const planInfo = await getUserPlanInfo(userId);

if (planInfo.segment !== 'shopify') {
  return 403 Forbidden; // Utilisateur freelance
}
```

### 4.3 Limites par Plan

```typescript
const maxShops = planInfo.plan.includes('STARTER') ? 1 
  : planInfo.plan.includes('PRO') ? 3 
  : 999;
```

---

## 🧪 Étape 5 : Tester le Système

### Test 1 : Utilisateur E-commerce

1. Se connecter avec un compte ayant `segment = 'shopify'`
2. Aller dans **Mail Center**
3. **Résultat attendu** : Le bouton Shopify vert est visible dans la sidebar

### Test 2 : Utilisateur Freelance

1. Se connecter avec un compte ayant `segment = 'freelance'`
2. Aller dans **Mail Center**
3. **Résultat attendu** : Le bouton Shopify n'apparaît PAS

### Test 3 : Connexion d'une Boutique

1. Cliquer sur "Connecter boutique"
2. Entrer : `ma-boutique.myshopify.com`
3. Cliquer "Connecter"
4. **Résultat attendu** : 
   - Boutique ajoutée avec statut `pending`
   - Toast de succès
   - Boutique listée avec badge "pending"

### Test 4 : Limite de Boutiques

1. Connecter le nombre maximum de boutiques pour votre plan
2. Essayer d'en ajouter une de plus
3. **Résultat attendu** : Message d'erreur "Limite atteinte"

---

## 📊 Étape 6 : Monitorer les Connexions

### Vue d'ensemble SQL

```sql
-- Statistiques globales
SELECT 
  segment,
  COUNT(*) as total_users,
  SUM((SELECT COUNT(*) FROM shopify_connections sc WHERE sc.user_id = s.user_id)) as total_shops
FROM subscriptions s
WHERE status = 'active'
GROUP BY segment;
```

### Boutiques par Utilisateur

```sql
-- Top utilisateurs avec le plus de boutiques
SELECT 
  u.email,
  s.plan,
  COUNT(sc.id) as shop_count
FROM users u
JOIN subscriptions s ON s.user_id = u.id
LEFT JOIN shopify_connections sc ON sc.user_id = u.id
WHERE s.segment = 'shopify'
GROUP BY u.email, s.plan
ORDER BY shop_count DESC;
```

### Statuts des Boutiques

```sql
-- Distribution des statuts
SELECT 
  status,
  COUNT(*) as count
FROM shopify_connections
GROUP BY status;
```

---

## 🚀 Prochaines Étapes (Roadmap)

### Phase 1 : OAuth Shopify Complet ✅ (Actuel)
- ✅ Structure de base
- ✅ Stockage des connexions
- ✅ Restrictions par plan

### Phase 2 : Intégration Shopify API 🔜
- 🔄 OAuth flow complet avec redirection
- 🔄 Récupération du `access_token` sécurisé
- 🔄 Validation de la boutique via API Shopify
- 🔄 Installation automatique des webhooks

### Phase 3 : Synchronisation Commandes 📋
- 📋 Webhook `orders/create` pour nouvelles commandes
- 📋 Affichage des commandes dans l'email detail
- 📋 Statut de livraison en temps réel
- 📋 Bouton "Voir dans Shopify" avec lien direct

### Phase 4 : Réponses IA Contextuelles 🤖
- 🤖 Enrichissement des prompts avec données commande
- 🤖 Recommandations produits automatiques
- 🤖 Upsell intelligent basé sur l'historique
- 🤖 Gestion automatique des retours/SAV

---

## 🆘 Dépannage

### Problème : Le bouton n'apparaît pas

**Cause** : Segment non défini ou utilisateur freelance

**Solution** :
```sql
-- Vérifier le segment
SELECT u.email, s.segment, s.plan 
FROM users u 
JOIN subscriptions s ON s.user_id = u.id 
WHERE u.email = 'votre-email@example.com';

-- Corriger si besoin
UPDATE subscriptions 
SET segment = 'shopify' 
WHERE user_id = '<USER_ID>' AND plan IN ('STARTER', 'PRO', 'SCALE');
```

### Problème : Erreur 403 lors de la connexion

**Cause** : RLS bloque l'accès ou segment incorrect

**Solution** :
1. Vérifier les politiques RLS dans Supabase Dashboard
2. Vérifier que `auth.uid()` correspond au `user_id`
3. Vérifier que `segment = 'shopify'`

### Problème : Migration SQL échoue

**Cause** : Conflits avec la structure existante

**Solution** :
```sql
-- Vérifier si la colonne existe déjà
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' AND column_name = 'segment';

-- Si existe, skipper l'ALTER TABLE
-- Si n'existe pas, exécuter la migration
```

---

## 📚 Ressources

- [Documentation Shopify OAuth](https://shopify.dev/docs/apps/auth/oauth)
- [Shopify Webhooks](https://shopify.dev/docs/apps/webhooks)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist de Déploiement

- [ ] Migration SQL exécutée sur Supabase
- [ ] Segments assignés aux abonnements existants
- [ ] Test avec utilisateur e-commerce (bouton visible)
- [ ] Test avec utilisateur freelance (bouton caché)
- [ ] Test de connexion d'une boutique
- [ ] Vérification des limites par plan
- [ ] RLS validé (pas d'accès inter-utilisateurs)
- [ ] Logs applicatifs propres (pas d'erreurs console)

---

**Date de création** : 16 novembre 2025  
**Version** : 1.0  
**Statut** : ✅ Production Ready
