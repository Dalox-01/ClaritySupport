# 📊 Système de Quota Unifié - MailWizard

## 🎯 Changement majeur

Le système de quota a été **unifié** entre le Dashboard et le Mail Center.

### ❌ Avant (2 compteurs séparés)
- `usage_count` → Dashboard (générations d'emails)
- `mail_center_usage` → Mail Center (réponses automatiques)

### ✅ Maintenant (1 compteur global)
- `usage_count` → **Quota global** pour TOUT (Dashboard + Mail Center)
- Le compteur est **partagé** entre toutes les fonctionnalités

---

## 📋 Limites par plan

| Plan | Quota mensuel global |
|------|---------------------|
| **FREE** | 10 générations |
| **STARTER** | 500 générations |
| **PRO** | 5000 générations |
| **ADMIN** | Illimité |

---

## ✨ Fonctionnalités

### 1. **Compteur affiché partout**
- **Dashboard** : Affiche `usage_count` / limite
- **Mail Center** : Affiche le même `usage_count` / limite
- **Les deux sont synchronisés en temps réel**

### 2. **Incrémentation**
Chaque action consomme **1 crédit** du quota global :
- ✅ Génération d'email dans Dashboard
- ✅ Réponse automatique dans Mail Center
- ✅ Utilisation du chatbot IA (si applicable)

### 3. **Accès Mail Center**
- ✅ **FREE** : Accès autorisé (10 générations globales)
- ✅ **STARTER** : Accès autorisé (500 générations globales)
- ✅ **PRO** : Accès autorisé (5000 générations globales)

---

## 🔧 API Modifiées

### `/api/mail-center/quota`
```json
GET → {
  "plan": "PRO",
  "limit": 5000,
  "used": 125,
  "remaining": 4875,
  "hasAccess": true
}

POST → Incrémente usage_count (quota global)
```

### Colonnes utilisées
- ✅ `users.usage_count` → Compteur global
- ✅ `users.usage_month` → Mois de référence (YYYYMM)
- ❌ ~~`users.mail_center_usage`~~ → Plus utilisé
- ❌ ~~`users.mail_center_usage_month`~~ → Plus utilisé

---

## 🎨 Interface

### Dashboard
```
┌─────────────────────────────┐
│ Utilisation: 125/5000       │
│ ████████░░░░░░░░░░░░ 2.5%   │
└─────────────────────────────┘
```

### Mail Center
```
┌─────────────────────────────┐
│ [👤] [125/5000 quota global]│
└─────────────────────────────┘
```

**Les deux affichent le même compteur !** ✅

---

## 📊 Exemple d'utilisation

### Scénario : Plan PRO (5000/mois)

1. **Dashboard** : Génère 50 emails → `usage_count = 50`
2. **Mail Center** : Répond à 30 emails → `usage_count = 80`
3. **Dashboard** : Génère 20 emails → `usage_count = 100`

**Résultat** : `100/5000` affiché partout

---

## ⚠️ Migration

### Option 1 : Garder les anciennes colonnes (recommandé)
Aucune action requise. Les colonnes `mail_center_usage` restent mais ne sont plus utilisées.

### Option 2 : Nettoyer les colonnes
Si vous voulez supprimer les colonnes inutilisées :

```sql
ALTER TABLE users DROP COLUMN IF EXISTS mail_center_usage;
ALTER TABLE users DROP COLUMN IF EXISTS mail_center_usage_month;
DROP INDEX IF EXISTS idx_users_mail_center_usage;
```

---

## ✅ Avantages

1. **Simplicité** : Un seul compteur à gérer
2. **Cohérence** : Même limite partout
3. **Flexibilité** : L'utilisateur choisit comment utiliser son quota
4. **Transparent** : Synchronisation automatique

---

## 🧪 Test

1. **Dashboard** → Générez 1 email
2. **Vérifiez** le compteur : `1/limite`
3. **Mail Center** → Générez 1 réponse
4. **Vérifiez** le compteur : `2/limite`
5. **Les deux affichent `2/limite`** ✅

---

**Quota unifié = Expérience utilisateur simplifiée !** 🎉

