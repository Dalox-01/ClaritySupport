# 🚨 MIGRATION URGENTE - Correction emails_cache

## Problème
Les emails ne s'affichent pas car les noms de colonnes de la table `emails_cache` ne correspondent pas au code.

## Solution - Exécutez ce SQL sur Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur "SQL Editor" → "New query"
4. Copiez-collez ce SQL :

```sql
-- Renommer email_id -> external_message_id
ALTER TABLE emails_cache 
  RENAME COLUMN email_id TO external_message_id;

-- Renommer received_date -> received_at
ALTER TABLE emails_cache 
  RENAME COLUMN received_date TO received_at;

-- Supprimer is_replied et ajouter replied_at
ALTER TABLE emails_cache 
  DROP COLUMN IF EXISTS is_replied;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

-- Renommer auto_replied -> is_auto_replied
ALTER TABLE emails_cache 
  RENAME COLUMN auto_replied TO is_auto_replied;

-- Ajouter les colonnes manquantes
ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS snippet TEXT;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS sentiment TEXT;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS urgency_score INTEGER DEFAULT 0;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS requires_validation BOOLEAN DEFAULT FALSE;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS has_attachments BOOLEAN DEFAULT FALSE;

ALTER TABLE emails_cache 
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Recréer l'index
DROP INDEX IF EXISTS idx_emails_cache_received_date;
CREATE INDEX IF NOT EXISTS idx_emails_cache_received_at ON emails_cache(received_at DESC);

-- Recréer la contrainte unique
ALTER TABLE emails_cache 
  DROP CONSTRAINT IF EXISTS emails_cache_account_id_email_id_key;

ALTER TABLE emails_cache 
  ADD CONSTRAINT emails_cache_account_id_external_message_id_key 
  UNIQUE(account_id, external_message_id);
```

5. Cliquez sur "Run" (F5)

## Après la migration

1. Allez sur votre application
2. Dans Mail Center, supprimez le compte Gmail existant
3. Reconnectez le compte Gmail
4. Les emails devraient maintenant s'afficher ! ✅

---

**IMPORTANT**: Cette migration est OBLIGATOIRE pour que les emails s'affichent !
