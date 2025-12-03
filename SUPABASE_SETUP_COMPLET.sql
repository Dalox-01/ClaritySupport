-- ============================================================
-- CONFIGURATION COMPLÈTE SUPABASE POUR MAIL CENTER
-- Project: ueatvsnijatgtvxvcveq
-- URL: https://ueatvsnijatgtvxvcveq.supabase.co
-- ============================================================

-- ============================================================
-- 1. TABLE: users (utilisateurs de l'application)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  provider TEXT DEFAULT 'google',
  stripe_customer_id TEXT,
  plan TEXT DEFAULT 'FREE',
  usage_month INTEGER,
  usage_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  role TEXT DEFAULT 'USER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Utilisateurs de l''application Mail Center';
COMMENT ON COLUMN public.users.plan IS 'Plan actuel: FREE, STARTER, PRO, ADMIN';
COMMENT ON COLUMN public.users.usage_month IS 'Mois d''utilisation au format YYYYMM (ex: 202501)';
COMMENT ON COLUMN public.users.usage_count IS 'Nombre de réponses IA générées ce mois';

-- ============================================================
-- 2. TABLE: subscriptions (abonnements Stripe)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  billing_period TEXT DEFAULT 'monthly',
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS 'Abonnements Stripe des utilisateurs';
COMMENT ON COLUMN public.subscriptions.plan IS 'Plan: starter, pro, enterprise';
COMMENT ON COLUMN public.subscriptions.status IS 'Status: active, past_due, canceled, inactive';
COMMENT ON COLUMN public.subscriptions.billing_period IS 'Période: monthly, yearly';

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id);

-- ============================================================
-- 3. TABLE: mail_accounts (comptes email connectés)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mail_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.mail_accounts IS 'Comptes email connectés (Gmail, Outlook)';
COMMENT ON COLUMN public.mail_accounts.provider IS 'Provider: google, microsoft';

CREATE INDEX IF NOT EXISTS idx_mail_accounts_user_id ON public.mail_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_mail_accounts_email ON public.mail_accounts(email);

-- ============================================================
-- 4. TABLE: emails_cache (cache des emails synchronisés)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.emails_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.mail_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL,
  thread_id TEXT,
  subject TEXT,
  from_email TEXT,
  from_name TEXT,
  to_email TEXT,
  body_text TEXT,
  body_html TEXT,
  received_date TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT FALSE,
  is_replied BOOLEAN DEFAULT FALSE,
  support_category TEXT,
  detected_hashtags TEXT[],
  auto_replied BOOLEAN DEFAULT FALSE,
  auto_replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, email_id)
);

COMMENT ON TABLE public.emails_cache IS 'Cache des emails synchronisés depuis Gmail/Outlook';
COMMENT ON COLUMN public.emails_cache.support_category IS 'Catégorie détectée: FACTURATION, TECHNIQUE, COMMERCIAL, etc.';
COMMENT ON COLUMN public.emails_cache.detected_hashtags IS 'Hashtags/mots-clés détectés dans l''email';
COMMENT ON COLUMN public.emails_cache.auto_replied IS 'True si IA a envoyé une réponse automatique';

CREATE INDEX IF NOT EXISTS idx_emails_cache_user_id ON public.emails_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_cache_account_id ON public.emails_cache(account_id);
CREATE INDEX IF NOT EXISTS idx_emails_cache_received_date ON public.emails_cache(received_date DESC);
CREATE INDEX IF NOT EXISTS idx_emails_cache_support_category ON public.emails_cache(support_category);
CREATE INDEX IF NOT EXISTS idx_emails_cache_auto_replied ON public.emails_cache(auto_replied) WHERE auto_replied IS NULL OR auto_replied = FALSE;

-- ============================================================
-- 5. TABLE: pending_replies (réponses IA en attente de validation)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pending_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES public.emails_cache(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  generated_reply TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.pending_replies IS 'Réponses générées par IA en attente de validation utilisateur';
COMMENT ON COLUMN public.pending_replies.status IS 'Status: pending, approved, rejected, sent';

CREATE INDEX IF NOT EXISTS idx_pending_replies_email_id ON public.pending_replies(email_id);
CREATE INDEX IF NOT EXISTS idx_pending_replies_user_id ON public.pending_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_replies_status ON public.pending_replies(status);

-- ============================================================
-- 6. TABLE: ai_configurations (config IA par utilisateur)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  model TEXT DEFAULT 'gpt-4o-mini',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  tone TEXT DEFAULT 'professional',
  language TEXT DEFAULT 'fr',
  auto_reply_enabled BOOLEAN DEFAULT FALSE,
  require_validation BOOLEAN DEFAULT TRUE,
  company_context TEXT,
  custom_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ai_configurations IS 'Configuration IA personnalisée par utilisateur';
COMMENT ON COLUMN public.ai_configurations.tone IS 'Tone: professional, cordial, direct';
COMMENT ON COLUMN public.ai_configurations.require_validation IS 'True = validation manuelle requise avant envoi';

CREATE INDEX IF NOT EXISTS idx_ai_configurations_user_id ON public.ai_configurations(user_id);

-- ============================================================
-- 7. TABLE: ai_settings (ancienne table - compatibilité)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  model TEXT DEFAULT 'gpt-4o-mini',
  tone TEXT DEFAULT 'professional',
  language TEXT DEFAULT 'fr',
  auto_send BOOLEAN DEFAULT FALSE,
  company_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ai_settings IS 'Settings IA (ancienne version - pour compatibilité)';

CREATE INDEX IF NOT EXISTS idx_ai_settings_user_id ON public.ai_settings(user_id);

-- ============================================================
-- 8. TABLE: mail_ai_activity_logs (logs activité IA)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mail_ai_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email_id UUID REFERENCES public.emails_cache(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.mail_ai_activity_logs IS 'Logs de toutes les actions IA (génération, envoi, etc.)';
COMMENT ON COLUMN public.mail_ai_activity_logs.action IS 'Action: reply_generated, reply_sent, error, etc.';

CREATE INDEX IF NOT EXISTS idx_mail_ai_activity_logs_user_id ON public.mail_ai_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mail_ai_activity_logs_created_at ON public.mail_ai_activity_logs(created_at DESC);

-- ============================================================
-- 9. TABLE: email_automations (logs d'utilisation quotas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.email_automations IS 'Logs des actions utilisateur pour tracking quotas';

CREATE INDEX IF NOT EXISTS idx_email_automations_user_id ON public.email_automations(user_id);
CREATE INDEX IF NOT EXISTS idx_email_automations_created_at ON public.email_automations(created_at DESC);

-- ============================================================
-- 10. TABLE: user_templates (templates personnalisés)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tone TEXT DEFAULT 'professional',
  language TEXT DEFAULT 'fr',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_templates IS 'Templates de réponses personnalisés par utilisateur';

CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON public.user_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_category ON public.user_templates(category);

-- ============================================================
-- 11. TABLE: audit_logs (audit trail complet)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.audit_logs IS 'Logs d''audit pour toutes les actions importantes';

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================================
-- FONCTION: update_updated_at_column()
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mail_accounts_updated_at ON public.mail_accounts;
CREATE TRIGGER update_mail_accounts_updated_at
  BEFORE UPDATE ON public.mail_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_emails_cache_updated_at ON public.emails_cache;
CREATE TRIGGER update_emails_cache_updated_at
  BEFORE UPDATE ON public.emails_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pending_replies_updated_at ON public.pending_replies;
CREATE TRIGGER update_pending_replies_updated_at
  BEFORE UPDATE ON public.pending_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_configurations_updated_at ON public.ai_configurations;
CREATE TRIGGER update_ai_configurations_updated_at
  BEFORE UPDATE ON public.ai_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_settings_updated_at ON public.ai_settings;
CREATE TRIGGER update_ai_settings_updated_at
  BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_templates_updated_at ON public.user_templates;
CREATE TRIGGER update_user_templates_updated_at
  BEFORE UPDATE ON public.user_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FONCTION: create_user_on_signup()
-- Crée automatiquement un user dans public.users quand auth.users reçoit un nouveau user
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_user_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer dans public.users avec plan FREE par défaut
  INSERT INTO public.users (id, email, name, provider, plan, role, usage_month, usage_count)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'google'),
    'FREE',
    'USER',
    EXTRACT(YEAR FROM NOW()) * 100 + EXTRACT(MONTH FROM NOW()),
    0
  )
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users pour créer automatiquement le user
DROP TRIGGER IF EXISTS on_auth_user_created_users ON auth.users;
CREATE TRIGGER on_auth_user_created_users
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_on_signup();

-- ============================================================
-- FONCTION: sync_user_plan_with_subscription()
-- Synchronise le plan dans users quand subscription change
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_user_plan_with_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le plan de l'utilisateur
  UPDATE public.users
  SET plan = CASE 
    WHEN NEW.status = 'active' THEN UPPER(NEW.plan)
    ELSE 'FREE'
  END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur subscriptions pour sync avec users.plan
DROP TRIGGER IF EXISTS sync_subscription_to_user_plan ON public.subscriptions;
CREATE TRIGGER sync_subscription_to_user_plan
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_plan_with_subscription();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_ai_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id::text OR email = auth.jwt()->>'email');

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id::text OR email = auth.jwt()->>'email');

-- Policies pour subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policies pour mail_accounts
DROP POLICY IF EXISTS "Users can manage own mail accounts" ON public.mail_accounts;
CREATE POLICY "Users can manage own mail accounts"
  ON public.mail_accounts FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Policies pour emails_cache
DROP POLICY IF EXISTS "Users can manage own emails" ON public.emails_cache;
CREATE POLICY "Users can manage own emails"
  ON public.emails_cache FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Policies pour pending_replies
DROP POLICY IF EXISTS "Users can manage own pending replies" ON public.pending_replies;
CREATE POLICY "Users can manage own pending replies"
  ON public.pending_replies FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Policies pour ai_configurations
DROP POLICY IF EXISTS "Users can manage own AI config" ON public.ai_configurations;
CREATE POLICY "Users can manage own AI config"
  ON public.ai_configurations FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Policies pour ai_settings
DROP POLICY IF EXISTS "Users can manage own AI settings" ON public.ai_settings;
CREATE POLICY "Users can manage own AI settings"
  ON public.ai_settings FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Policies pour mail_ai_activity_logs
DROP POLICY IF EXISTS "Users can view own AI logs" ON public.mail_ai_activity_logs;
CREATE POLICY "Users can view own AI logs"
  ON public.mail_ai_activity_logs FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policies pour email_automations
DROP POLICY IF EXISTS "Users can view own automations" ON public.email_automations;
CREATE POLICY "Users can view own automations"
  ON public.email_automations FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policies pour user_templates
DROP POLICY IF EXISTS "Users can manage own templates" ON public.user_templates;
CREATE POLICY "Users can manage own templates"
  ON public.user_templates FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Policies pour audit_logs
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- ============================================================
-- VÉRIFICATION FINALE
-- ============================================================
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM public.users
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM public.subscriptions
UNION ALL
SELECT 'mail_accounts', COUNT(*) FROM public.mail_accounts
UNION ALL
SELECT 'emails_cache', COUNT(*) FROM public.emails_cache
UNION ALL
SELECT 'pending_replies', COUNT(*) FROM public.pending_replies
UNION ALL
SELECT 'ai_configurations', COUNT(*) FROM public.ai_configurations
UNION ALL
SELECT 'ai_settings', COUNT(*) FROM public.ai_settings
UNION ALL
SELECT 'mail_ai_activity_logs', COUNT(*) FROM public.mail_ai_activity_logs
UNION ALL
SELECT 'email_automations', COUNT(*) FROM public.email_automations
UNION ALL
SELECT 'user_templates', COUNT(*) FROM public.user_templates
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM public.audit_logs;

-- ============================================================
-- ✅ SETUP TERMINÉ
-- ============================================================
-- Prochaine étape: Tester la connexion Google OAuth
-- Le trigger create_user_on_signup() va automatiquement:
-- 1. Créer un user dans public.users avec plan FREE
-- 2. Définir usage_month au mois actuel
-- 3. Initialiser usage_count à 0
-- ============================================================
