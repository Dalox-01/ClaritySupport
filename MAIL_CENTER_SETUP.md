# Mail Center - Configuration Complète

## ⚠️ ÉTAPE OBLIGATOIRE : Créer les tables Supabase

**IMPORTANT** : Les emails NE PEUVENT PAS être sauvegardés sans ces tables !

### 1. Allez sur Supabase

1. Ouvrez https://supabase.com/dashboard
2. Sélectionnez votre projet MailWiz
3. Allez dans **SQL Editor** (dans le menu de gauche)

### 2. Créez les tables

Copiez-collez ce SQL et cliquez sur **Run** :

```sql
-- Table: Comptes email (Gmail/Outlook)
CREATE TABLE IF NOT EXISTS mail_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Table: Cache des emails
CREATE TABLE IF NOT EXISTS emails_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  account_id UUID REFERENCES mail_accounts(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  thread_id TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  has_attachments BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  category TEXT,
  sentiment TEXT,
  urgency_score INTEGER DEFAULT 0,
  ai_summary TEXT,
  ai_action_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, account_id)
);

-- Table: Réponses en attente de validation
CREATE TABLE IF NOT EXISTS pending_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email_id UUID REFERENCES emails_cache(id) ON DELETE CASCADE,
  generated_subject TEXT,
  generated_body TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  requires_validation BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_emails_user_received ON emails_cache(user_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_account ON emails_cache(account_id);
CREATE INDEX IF NOT EXISTS idx_emails_message ON emails_cache(message_id);
CREATE INDEX IF NOT EXISTS idx_pending_user ON pending_replies(user_id, status);

-- RLS (Row Level Security)
ALTER TABLE mail_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_replies ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can manage their own mail accounts"
  ON mail_accounts FOR ALL
  USING (user_id = current_user);

CREATE POLICY "Users can view their own emails"
  ON emails_cache FOR ALL
  USING (user_id = current_user);

CREATE POLICY "Users can manage their own pending replies"
  ON pending_replies FOR ALL
  USING (user_id = current_user);
```

### 3. Vérifiez l'installation

Dans la console de votre navigateur (F12) sur http://localhost:3000/mail-center, vous devriez voir :

```
✅ Tables Supabase OK
```

---

## 🔄 Fonctionnement du système

### Synchronisation automatique

- **Au démarrage** : Charge les 50 derniers emails depuis la base
- **Toutes les 3 minutes** : Vérifie Gmail et récupère les nouveaux emails
- **Bouton Actualiser** : Recharge manuellement depuis la base

### Quand vous recevez un nouvel email

1. Gmail reçoit l'email
2. **Après max 3 minutes**, le système détecte le nouvel email
3. L'email est analysé par l'IA (catégorie, sentiment, urgence)
4. L'email est sauvegardé dans `emails_cache`
5. Une notification apparaît dans Mail Center
6. L'email s'affiche en haut de la liste

---

## 🧪 Tester le système

1. **Envoyez-vous un email** depuis un autre compte
2. **Attendez max 3 minutes**
3. Vous devriez voir dans la console :
   ```
   🔄 Synchronisation automatique...
   📬 1 nouveaux emails !
   ```
4. L'email apparaît avec une notification

---

## ⚙️ Configuration

### Changer l'intervalle de synchronisation

Dans `app/mail-center/page.tsx`, ligne ~130 :

```typescript
const interval = setInterval(checkNewEmails, 180000); // 180000ms = 3 minutes

// Pour 1 minute : 60000
// Pour 5 minutes : 300000
```

### Changer le nombre d'emails affichés

Dans `app/mail-center/page.tsx`, plusieurs endroits :

```typescript
fetch('/api/mail-center/emails?limit=50') // Changer 50 par le nombre souhaité
```

---

## 🐛 Résolution des problèmes

### Les emails n'apparaissent pas

1. **Vérifiez les tables** : Console → Devrait voir `✅ Tables Supabase OK`
2. **Vérifiez Gmail** : Reconnectez votre compte Gmail
3. **Regardez les logs** : Console (F12) → Logs détaillés

### Message "Tables manquantes"

→ Appliquez le SQL ci-dessus dans Supabase SQL Editor

### Pas de synchronisation automatique

→ Vérifiez la console : Devrait voir `🔄 Synchronisation automatique...` toutes les 3 min

