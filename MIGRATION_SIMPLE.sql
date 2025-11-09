-- MIGRATION SIMPLE MAIL CENTER
-- Copier-coller dans Supabase SQL Editor et Run

-- 1. Supprimer les anciennes tables
DROP TABLE IF EXISTS pending_replies CASCADE;
DROP TABLE IF EXISTS emails_cache CASCADE;
DROP TABLE IF EXISTS mail_accounts CASCADE;
DROP TABLE IF EXISTS response_templates CASCADE;
DROP TABLE IF EXISTS automation_rules CASCADE;
DROP TABLE IF EXISTS mail_ai_activity_logs CASCADE;
DROP TABLE IF EXISTS mail_statistics CASCADE;

-- 2. Table mail_accounts
CREATE TABLE mail_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
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

-- 3. Table emails_cache
CREATE TABLE emails_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  account_id UUID REFERENCES mail_accounts(id) ON DELETE CASCADE,
  external_message_id TEXT NOT NULL,
  thread_id TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  snippet TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  category TEXT,
  sentiment TEXT,
  urgency_score INTEGER DEFAULT 0,
  requires_validation BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  is_auto_replied BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(account_id, external_message_id)
);

-- 4. Table pending_replies
CREATE TABLE pending_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email_id UUID REFERENCES emails_cache(id) ON DELETE CASCADE,
  generated_subject TEXT,
  generated_body TEXT,
  status TEXT DEFAULT 'pending',
  requires_validation BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Index pour performances
CREATE INDEX idx_emails_user_received ON emails_cache(user_id, received_at DESC);
CREATE INDEX idx_emails_account ON emails_cache(account_id);
CREATE INDEX idx_emails_message ON emails_cache(external_message_id);
CREATE INDEX idx_pending_user ON pending_replies(user_id, status);
CREATE INDEX idx_accounts_user ON mail_accounts(user_id);

-- 6. RLS (Row Level Security)
ALTER TABLE mail_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_replies ENABLE ROW LEVEL SECURITY;

-- Politiques RLS - Permettre tout pour l'instant (à améliorer)
CREATE POLICY "Allow all for authenticated users" ON mail_accounts FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON emails_cache FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON pending_replies FOR ALL USING (true);

