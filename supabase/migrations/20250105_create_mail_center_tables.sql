-- Migration complète Mail Center
-- À exécuter dans Supabase SQL Editor

-- 1. Table mail_accounts (comptes Gmail/Outlook connectés)
CREATE TABLE IF NOT EXISTS mail_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  email TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, email)
);

CREATE INDEX idx_mail_accounts_user_id ON mail_accounts(user_id);
CREATE INDEX idx_mail_accounts_email ON mail_accounts(email);

-- RLS pour mail_accounts
ALTER TABLE mail_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mail accounts"
  ON mail_accounts FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own mail accounts"
  ON mail_accounts FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own mail accounts"
  ON mail_accounts FOR UPDATE
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own mail accounts"
  ON mail_accounts FOR DELETE
  USING (user_id::text = auth.uid()::text);

-- 2. Table emails_cache (cache des emails)
CREATE TABLE IF NOT EXISTS emails_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES mail_accounts(id) ON DELETE CASCADE,
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
  
  -- Analyse IA
  category TEXT CHECK (category IN ('support', 'vente', 'spam', 'urgent', 'partenariat', 'autre')),
  sentiment TEXT CHECK (sentiment IN ('positif', 'neutre', 'negatif', 'urgent')),
  urgency_score INTEGER DEFAULT 5 CHECK (urgency_score >= 0 AND urgency_score <= 10),
  requires_validation BOOLEAN DEFAULT false,
  detected_entities JSONB DEFAULT '{}'::jsonb,
  
  -- État
  is_read BOOLEAN DEFAULT false,
  is_auto_replied BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  reply_status TEXT DEFAULT 'pending' CHECK (reply_status IN ('pending', 'validated', 'sent', 'rejected')),
  
  has_attachments BOOLEAN DEFAULT false,
  labels TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  UNIQUE(account_id, external_message_id)
);

CREATE INDEX idx_emails_cache_user_id ON emails_cache(user_id);
CREATE INDEX idx_emails_cache_account_id ON emails_cache(account_id);
CREATE INDEX idx_emails_cache_received_at ON emails_cache(received_at DESC);
CREATE INDEX idx_emails_cache_category ON emails_cache(category);
CREATE INDEX idx_emails_cache_reply_status ON emails_cache(reply_status);

-- RLS pour emails_cache
ALTER TABLE emails_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own emails"
  ON emails_cache FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own emails"
  ON emails_cache FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own emails"
  ON emails_cache FOR UPDATE
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own emails"
  ON emails_cache FOR DELETE
  USING (user_id::text = auth.uid()::text);

-- 3. Table response_templates (templates de réponses)
CREATE TABLE IF NOT EXISTS response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('support', 'vente', 'spam', 'urgent', 'partenariat', 'autre')),
  tone TEXT DEFAULT 'professionnel',
  language TEXT DEFAULT 'fr',
  
  subject_template TEXT,
  body_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}'::jsonb,
  
  ai_prompt_override TEXT,
  use_ai_enhancement BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

CREATE INDEX idx_response_templates_user_id ON response_templates(user_id);
CREATE INDEX idx_response_templates_category ON response_templates(category);

-- RLS pour response_templates
ALTER TABLE response_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own templates"
  ON response_templates FOR ALL
  USING (user_id::text = auth.uid()::text);

-- 4. Table automation_rules (règles d'automatisation)
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id UUID REFERENCES mail_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  priority INTEGER DEFAULT 50,
  
  triggers JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_type TEXT NOT NULL CHECK (action_type IN ('auto_reply', 'suggest_reply', 'categorize', 'forward', 'archive')),
  template_id UUID REFERENCES response_templates(id) ON DELETE SET NULL,
  action_config JSONB DEFAULT '{}'::jsonb,
  
  mode TEXT DEFAULT 'validation' CHECK (mode IN ('auto', 'validation', 'disabled')),
  require_validation_if_urgent BOOLEAN DEFAULT true,
  active_hours JSONB DEFAULT '{}'::jsonb,
  
  is_active BOOLEAN DEFAULT true,
  triggered_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

CREATE INDEX idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX idx_automation_rules_priority ON automation_rules(priority);

-- RLS pour automation_rules
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own rules"
  ON automation_rules FOR ALL
  USING (user_id::text = auth.uid()::text);

-- 5. Table pending_replies (réponses en attente)
CREATE TABLE IF NOT EXISTS pending_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES emails_cache(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
  template_id UUID REFERENCES response_templates(id) ON DELETE SET NULL,
  
  generated_subject TEXT,
  generated_body_text TEXT,
  generated_body_html TEXT,
  
  ai_prompt_used TEXT,
  ai_model_used TEXT DEFAULT 'gpt-4o',
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  edited_subject TEXT,
  edited_body_html TEXT,
  
  reason_for_validation TEXT,
  validated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_pending_replies_user_id ON pending_replies(user_id);
CREATE INDEX idx_pending_replies_email_id ON pending_replies(email_id);
CREATE INDEX idx_pending_replies_status ON pending_replies(status);

-- RLS pour pending_replies
ALTER TABLE pending_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pending replies"
  ON pending_replies FOR ALL
  USING (user_id::text = auth.uid()::text);

-- 6. Table mail_ai_activity_logs (logs d'activité IA)
CREATE TABLE IF NOT EXISTS mail_ai_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_id UUID REFERENCES emails_cache(id) ON DELETE SET NULL,
  rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
  
  action_type TEXT NOT NULL,
  action_result TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  tokens_used INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mail_ai_logs_user_id ON mail_ai_activity_logs(user_id);
CREATE INDEX idx_mail_ai_logs_created_at ON mail_ai_activity_logs(created_at DESC);

-- RLS pour mail_ai_activity_logs
ALTER TABLE mail_ai_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs"
  ON mail_ai_activity_logs FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own activity logs"
  ON mail_ai_activity_logs FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- 7. Table mail_statistics (statistiques agrégées)
CREATE TABLE IF NOT EXISTS mail_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id UUID REFERENCES mail_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  total_received INTEGER DEFAULT 0,
  total_auto_replied INTEGER DEFAULT 0,
  total_manual_replied INTEGER DEFAULT 0,
  total_pending_validation INTEGER DEFAULT 0,
  
  category_support INTEGER DEFAULT 0,
  category_vente INTEGER DEFAULT 0,
  category_spam INTEGER DEFAULT 0,
  category_autre INTEGER DEFAULT 0,
  
  avg_response_time_minutes INTEGER,
  
  sentiment_positive INTEGER DEFAULT 0,
  sentiment_neutral INTEGER DEFAULT 0,
  sentiment_negative INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_mail_statistics_user_id ON mail_statistics(user_id);
CREATE INDEX idx_mail_statistics_date ON mail_statistics(date DESC);

-- RLS pour mail_statistics
ALTER TABLE mail_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own statistics"
  ON mail_statistics FOR ALL
  USING (user_id::text = auth.uid()::text);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mail_accounts_updated_at BEFORE UPDATE ON mail_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_response_templates_updated_at BEFORE UPDATE ON response_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mail_statistics_updated_at BEFORE UPDATE ON mail_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

