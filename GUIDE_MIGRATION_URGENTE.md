# 🔧 Guide de correction du schéma Mail Accounts

## Problème
Les comptes Gmail ne s'affichent pas après la connexion OAuth car le schéma de la table `mail_accounts` dans Supabase ne correspond pas au code.

## Solution - Appliquer la migration

### Option 1: Via le Dashboard Supabase (Recommandé)

1. **Connectez-vous à Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez l'éditeur SQL**
   - Dans le menu de gauche, cliquez sur "SQL Editor"
   - Cliquez sur "New query"

3. **Copiez-collez cette requête SQL**

```sql
-- Migration: Correction du schéma mail_accounts
-- Date: 2025-11-12

-- Renommer access_token_encrypted -> access_token
ALTER TABLE mail_accounts 
  RENAME COLUMN access_token_encrypted TO access_token;

-- Renommer refresh_token_encrypted -> refresh_token
ALTER TABLE mail_accounts 
  RENAME COLUMN refresh_token_encrypted TO refresh_token;

-- Supprimer la colonne sync_enabled (on utilise seulement is_active)
ALTER TABLE mail_accounts 
  DROP COLUMN IF EXISTS sync_enabled;

-- Renommer last_sync_at -> last_sync
ALTER TABLE mail_accounts 
  RENAME COLUMN last_sync_at TO last_sync;

-- Mettre à jour les commentaires
COMMENT ON TABLE mail_accounts IS 'Comptes email connectés (Gmail, Outlook) - Mis à jour 2025-11-12';
COMMENT ON COLUMN mail_accounts.access_token IS 'Token d''accès chiffré';
COMMENT ON COLUMN mail_accounts.refresh_token IS 'Token de rafraîchissement chiffré';
COMMENT ON COLUMN mail_accounts.token_expires_at IS 'Date d''expiration du token';
COMMENT ON COLUMN mail_accounts.is_active IS 'Compte actif ou non';
COMMENT ON COLUMN mail_accounts.last_sync IS 'Date de dernière synchronisation';
```

4. **Exécutez la requête**
   - Cliquez sur le bouton "Run" (F5)
   - Vérifiez qu'il n'y a pas d'erreur

5. **Vérifiez la structure**
   - Allez dans "Table Editor"
   - Sélectionnez la table `mail_accounts`
   - Vérifiez que les colonnes sont bien renommées

### Option 2: Via Supabase CLI

Si vous avez la CLI Supabase installée :

```bash
cd project
supabase db push
```

## Après la migration

1. **Redéployez sur Vercel** (déjà fait ✅)
2. **Testez la connexion Gmail**
   - Allez sur votre application
   - Cliquez sur "Ajouter un compte"
   - Connectez un compte Gmail
   - Le compte devrait maintenant s'afficher dans la liste

## Vérification

Pour vérifier que tout fonctionne :

```sql
-- Dans l'éditeur SQL Supabase
SELECT * FROM mail_accounts;
```

Vous devriez voir vos comptes Gmail avec les bonnes colonnes.

## En cas de problème

Si vous avez des erreurs, vérifiez :
1. Que la table `mail_accounts` existe
2. Que vous utilisez le bon projet Supabase
3. Les logs dans la console Vercel pour plus de détails

---

**Status**: ⚠️ Migration à appliquer manuellement sur Supabase
