# 🚀 GUIDE DE DÉPLOIEMENT - Mail Center avec IA

## ✅ Étape 1: Migrations SQL (OBLIGATOIRE)

### Connectez-vous à Supabase Dashboard
```
https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql
```

### Exécutez les 2 migrations suivantes (dans l'ordre):

#### Migration 1: Table `ai_settings` (Activation IA globale)

```sql
-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_ai_settings_user_id ON ai_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_settings_enabled ON ai_settings(enabled) WHERE enabled = true;

-- Activer RLS
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Politique RLS
CREATE POLICY ai_settings_user_policy ON ai_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insérer paramètres par défaut (IA désactivée)
INSERT INTO ai_settings (user_id, enabled)
SELECT id, false
FROM users
WHERE id NOT IN (SELECT user_id FROM ai_settings)
ON CONFLICT (user_id) DO NOTHING;
```

#### Migration 2: Colonne `ai_prompt_config` (Configuration prompts utilisateur)

```sql
-- Ajouter la colonne JSONB pour stocker AIPromptConfig
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ai_prompt_config JSONB DEFAULT NULL;

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_users_ai_prompt_config ON users USING GIN (ai_prompt_config);

-- Commentaire sur la colonne
COMMENT ON COLUMN users.ai_prompt_config IS 'Configuration des prompts IA: créativité (0-1), ton, style, longueur, do/don''t lists, signature, etc.';
```

---

## ✅ Étape 2: Redémarrer Next.js

```powershell
# Arrêter le serveur (Ctrl+C si en cours)
# Puis relancer:
npm run dev
```

---

## ✅ Étape 3: Test du système

### 3.1 Connexion d'un compte Gmail/Outlook

1. Allez sur http://localhost:3000/mail-center
2. Cliquez sur **"Connecter Gmail"** ou **"Connecter Outlook"**
3. Autorisez l'accès à votre boîte mail
4. **Vérifiez dans la console:**
   ```
   ✅ [GET /emails] X emails trouvés
   📧 Chargé X emails et affichés
   ```

### 3.2 Activation de l'IA

1. Dans Mail Center, cliquez sur le bouton **"IA inactive"**
2. Le bouton devient **"IA active 🤖"** (vert)
3. **Vérifiez dans la console:**
   ```
   🤖 [AUTO-REPLY] Démarrage pour user [ID]
   ✅ [AUTO-REPLY] IA activée
   🎨 [AUTO-REPLY] Config IA: {hasConfig, creativity, tone, style}
   ```

### 3.3 Test de la réponse automatique

**L'IA va automatiquement:**
- ✅ Détecter les nouveaux emails (toutes les 60 secondes)
- ✅ Générer des réponses personnalisées selon votre config
- ✅ Envoyer les réponses automatiquement
- ❌ **NE PAS** répondre aux emails "urgent" ou "autre" (sécurité)

**Logs attendus:**
```
📧 [AUTO-REPLY] Traitement email [ID]: [Sujet]
✅ [AUTO-REPLY] Réponse générée pour [ID]: "Re: [Sujet]"
📤 [AUTO-REPLY] Réponse envoyée avec succès pour [ID]
📊 [AUTO-REPLY] Terminé - Traités: X, Erreurs: 0
```

---

## 📊 Fonctionnalités Implémentées

### ✅ Affichage des emails
- Auto-chargement au démarrage
- Rechargement automatique après connexion compte
- Logs détaillés pour debugging
- Toast notifications sur succès/erreur

### ✅ Configuration IA (Créativité 0-1)
- **0 = Précis/Brut** → Température OpenAI: 0.3
- **1 = Créatif** → Température OpenAI: 1.0
- Mapping linéaire: `temperature = 0.3 + (creativity × 0.7)`

### ✅ Auto-Reply Intelligent
- Utilise la config utilisateur (ton, style, longueur)
- Applique les do/don't lists
- Intègre les instructions personnalisées
- Sécurité: **Ne répond JAMAIS** aux emails "urgent" ou "autre"

---

## 🔍 Debugging

### Problème: "Aucun mail trouvé"

**Vérifiez:**
1. Console navigateur: Y a-t-il des erreurs ?
2. Console serveur: Logs `[GET /emails]` présents ?
3. Supabase: Table `emails_cache` contient des données ?

**Solution:**
```powershell
# Forcer une synchronisation manuelle
# Dans Mail Center → Bouton "Synchroniser"
```

### Problème: IA ne répond pas

**Vérifiez:**
1. Table `ai_settings` existe ? (`SELECT * FROM ai_settings;`)
2. Colonne `enabled = true` pour votre user ?
3. Logs `[AUTO-REPLY]` dans la console serveur ?

**Solution:**
```sql
-- Activer l'IA manuellement en SQL
UPDATE ai_settings 
SET enabled = true 
WHERE user_id = '[VOTRE_USER_ID]';
```

---

## 🎯 Prochaines Étapes

1. **Tester avec un vrai compte Gmail** contenant des emails
2. **Activer l'IA** et observer le comportement
3. **Ajuster la créativité** dans les paramètres IA
4. **Vérifier les réponses envoyées** dans votre boîte Gmail (Envoyés)

---

## 🚨 Sécurité

⚠️ **IMPORTANT:** L'IA ne répond **JAMAIS** automatiquement aux:
- Emails catégorisés "urgent"
- Emails catégorisés "autre"
- Emails avec `support_category = 'urgent'` ou `'autre'`

Ces emails sont **marqués pour validation manuelle** obligatoire.

---

## 📞 Support

Si problème persistant:
1. Vérifiez les migrations SQL exécutées
2. Consultez les logs serveur (console terminal)
3. Consultez les logs navigateur (console DevTools)
4. Vérifiez les variables d'environnement (.env.local)

---

**Dernière mise à jour:** 14 novembre 2025  
**Version:** 1.0.0 - Système IA complet opérationnel
