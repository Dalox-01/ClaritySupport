-- Migration Mail Center
-- Création des tables pour la fonctionnalité Mail Center

-- Table pour les comptes email connectés (Gmail/Outlook)
CREATE TABLE IF NOT EXISTS mail_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  email VARCHAR(255) NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Index pour améliorer les performances
CREATE INDEX idx_mail_accounts_user_id ON mail_accounts(user_id);
CREATE INDEX idx_mail_accounts_active ON mail_accounts(is_active) WHERE is_active = true;

-- Table pour le cache des emails (24h max)
CREATE TABLE IF NOT EXISTS emails_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES mail_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  external_message_id VARCHAR(255) NOT NULL, -- ID Gmail/Outlook
  thread_id VARCHAR(255),
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  to_email VARCHAR(255) NOT NULL,
  subject TEXT,
  snippet TEXT, -- Aperçu court
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Analyse IA
  category VARCHAR(50), -- support, vente, spam, autre, urgent
  sentiment VARCHAR(20), -- positif, neutre, negatif, urgent
  urgency_score INTEGER DEFAULT 0 CHECK (urgency_score BETWEEN 0 AND 10),
  requires_validation BOOLEAN DEFAULT false,
  detected_entities JSONB DEFAULT '{}', -- {produit, probleme, date_souhaitee, etc.}
  
  -- État de traitement
  is_read BOOLEAN DEFAULT false,
  is_auto_replied BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  reply_status VARCHAR(20) DEFAULT 'pending', -- pending, validated, sent, rejected
  
  -- Métadonnées
  has_attachments BOOLEAN DEFAULT false,
  labels TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  
  UNIQUE(account_id, external_message_id)
);

-- Index pour performances et recherche
CREATE INDEX idx_emails_cache_user_id ON emails_cache(user_id);
CREATE INDEX idx_emails_cache_account_id ON emails_cache(account_id);
CREATE INDEX idx_emails_cache_received_at ON emails_cache(received_at DESC);
CREATE INDEX idx_emails_cache_expires_at ON emails_cache(expires_at);
CREATE INDEX idx_emails_cache_category ON emails_cache(category);
CREATE INDEX idx_emails_cache_reply_status ON emails_cache(reply_status);
CREATE INDEX idx_emails_cache_validation ON emails_cache(requires_validation) WHERE requires_validation = true;

-- Table pour les templates de réponses automatiques
CREATE TABLE IF NOT EXISTS response_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- support, vente, absence, partenariat, etc.
  tone VARCHAR(50) DEFAULT 'professionnel', -- professionnel, amical, formel
  language VARCHAR(10) DEFAULT 'fr',
  
  -- Contenu du template
  subject_template TEXT,
  body_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}', -- {nom_expediteur}, {sujet}, {entreprise}, etc.
  
  -- Configuration IA
  ai_prompt_override TEXT, -- Permet de personnaliser le prompt IA
  use_ai_enhancement BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_response_templates_user_id ON response_templates(user_id);
CREATE INDEX idx_response_templates_category ON response_templates(category);
CREATE INDEX idx_response_templates_active ON response_templates(is_active) WHERE is_active = true;

-- Table pour les règles d'automatisation
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES mail_accounts(id) ON DELETE CASCADE, -- NULL = toutes les boîtes
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Priorité d'exécution (1 = plus haute)
  priority INTEGER DEFAULT 100,
  
  -- Déclencheurs (conditions)
  triggers JSONB NOT NULL DEFAULT '{}', -- {subject_contains: [], from_domain: [], category: [], sentiment: []}
  
  -- Action à effectuer
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('auto_reply', 'suggest_reply', 'categorize', 'forward', 'archive')),
  template_id UUID REFERENCES response_templates(id) ON DELETE SET NULL,
  
  -- Configuration de l'action
  action_config JSONB DEFAULT '{}', -- {delay_minutes: 0, forward_to: "", custom_prompt: ""}
  
  -- Mode de fonctionnement
  mode VARCHAR(20) DEFAULT 'auto' CHECK (mode IN ('auto', 'validation', 'disabled')),
  require_validation_if_urgent BOOLEAN DEFAULT true,
  
  -- Horaires actifs (optionnel)
  active_hours JSONB DEFAULT '{}', -- {days: [1,2,3,4,5], start: "09:00", end: "18:00"}
  
  -- État
  is_active BOOLEAN DEFAULT true,
  
  -- Statistiques
  triggered_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX idx_automation_rules_priority ON automation_rules(priority ASC);
CREATE INDEX idx_automation_rules_active ON automation_rules(is_active) WHERE is_active = true;

-- Table pour les réponses générées (en attente de validation)
CREATE TABLE IF NOT EXISTS pending_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id UUID NOT NULL REFERENCES emails_cache(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
  template_id UUID REFERENCES response_templates(id) ON DELETE SET NULL,
  
  -- Contenu généré par IA
  generated_subject TEXT,
  generated_body_text TEXT,
  generated_body_html TEXT,
  
  -- Personnalisation utilisateur
  ai_prompt_used TEXT,
  ai_model_used VARCHAR(50) DEFAULT 'gpt-4',
  
  -- État
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  edited_subject TEXT, -- Si utilisateur modifie
  edited_body_html TEXT,
  
  -- Métadonnées
  reason_for_validation TEXT, -- Pourquoi validation requise
  validated_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_pending_replies_user_id ON pending_replies(user_id);
CREATE INDEX idx_pending_replies_email_id ON pending_replies(email_id);
CREATE INDEX idx_pending_replies_status ON pending_replies(status);
CREATE INDEX idx_pending_replies_pending ON pending_replies(status) WHERE status = 'pending';

-- Table pour les logs d'activité IA
CREATE TABLE IF NOT EXISTS mail_ai_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_id UUID REFERENCES emails_cache(id) ON DELETE SET NULL,
  rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
  
  action_type VARCHAR(50) NOT NULL, -- categorize, generate_reply, send_auto_reply
  action_result VARCHAR(20) NOT NULL, -- success, failed, validated, rejected
  
  metadata JSONB DEFAULT '{}', -- Détails de l'action
  
  tokens_used INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mail_ai_logs_user_id ON mail_ai_activity_logs(user_id);
CREATE INDEX idx_mail_ai_logs_created_at ON mail_ai_activity_logs(created_at DESC);
CREATE INDEX idx_mail_ai_logs_email_id ON mail_ai_activity_logs(email_id);

-- Table pour les statistiques agrégées
CREATE TABLE IF NOT EXISTS mail_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES mail_accounts(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  
  -- Métriques quotidiennes
  total_received INTEGER DEFAULT 0,
  total_auto_replied INTEGER DEFAULT 0,
  total_manual_replied INTEGER DEFAULT 0,
  total_pending_validation INTEGER DEFAULT 0,
  
  -- Par catégorie
  category_support INTEGER DEFAULT 0,
  category_vente INTEGER DEFAULT 0,
  category_spam INTEGER DEFAULT 0,
  category_autre INTEGER DEFAULT 0,
  
  -- Temps de réponse (en minutes)
  avg_response_time_minutes INTEGER,
  
  -- Sentiment
  sentiment_positive INTEGER DEFAULT 0,
  sentiment_neutral INTEGER DEFAULT 0,
  sentiment_negative INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, account_id, date)
);

CREATE INDEX idx_mail_stats_user_id ON mail_statistics(user_id);
CREATE INDEX idx_mail_stats_date ON mail_statistics(date DESC);

-- Fonction pour nettoyer automatiquement les emails expirés (24h)
CREATE OR REPLACE FUNCTION cleanup_expired_emails()
RETURNS void AS $$
BEGIN
  DELETE FROM emails_cache WHERE expires_at < NOW();
  DELETE FROM pending_replies WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les statistiques
CREATE OR REPLACE FUNCTION update_mail_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert ou update des statistiques du jour
  INSERT INTO mail_statistics (
    user_id,
    account_id,
    date,
    total_received
  )
  VALUES (
    NEW.user_id,
    NEW.account_id,
    DATE(NEW.received_at),
    1
  )
  ON CONFLICT (user_id, account_id, date) 
  DO UPDATE SET
    total_received = mail_statistics.total_received + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-incrémenter les stats quand un email arrive
CREATE TRIGGER trigger_update_mail_statistics
AFTER INSERT ON emails_cache
FOR EACH ROW
EXECUTE FUNCTION update_mail_statistics();

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_mail_accounts_updated_at BEFORE UPDATE ON mail_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_response_templates_updated_at BEFORE UPDATE ON response_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE mail_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_ai_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_statistics ENABLE ROW LEVEL SECURITY;

-- Policies: Les utilisateurs peuvent seulement voir leurs propres données
CREATE POLICY mail_accounts_user_policy ON mail_accounts
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY emails_cache_user_policy ON emails_cache
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY response_templates_user_policy ON response_templates
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY automation_rules_user_policy ON automation_rules
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY pending_replies_user_policy ON pending_replies
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY mail_ai_logs_user_policy ON mail_ai_activity_logs
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY mail_statistics_user_policy ON mail_statistics
FOR ALL USING (auth.uid() = user_id);

-- Insertion de templates par défaut
INSERT INTO response_templates (user_id, name, description, category, body_template, variables) VALUES
  (
    '00000000-0000-0000-0000-000000000000', -- Template global
    'Support - Accusé de réception',
    'Réponse automatique pour accusé de réception support client',
    'support',
    'Bonjour {nom_expediteur},

Merci d''avoir contacté notre support technique.

Nous avons bien reçu votre demande concernant : {sujet}

Notre équipe traitera votre demande dans les 24 heures ouvrées.

Cordialement,
L''équipe Support',
    '{"nom_expediteur": "string", "sujet": "string", "entreprise": "string"}'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Vente - Demande de devis',
    'Réponse automatique pour demande de devis',
    'vente',
    'Bonjour {nom_expediteur},

Merci pour votre intérêt pour nos services.

Nous avons bien reçu votre demande de devis. Un membre de notre équipe commerciale vous contactera sous 48h avec une proposition personnalisée.

En attendant, n''hésitez pas à consulter notre catalogue : {lien_catalogue}

Cordialement,
L''équipe Commerciale',
    '{"nom_expediteur": "string", "lien_catalogue": "string"}'
  );

COMMENT ON TABLE mail_accounts IS 'Comptes email connectés (Gmail/Outlook)';
COMMENT ON TABLE emails_cache IS 'Cache des emails reçus (suppression auto après 24h)';
COMMENT ON TABLE response_templates IS 'Templates de réponses automatiques personnalisables';
COMMENT ON TABLE automation_rules IS 'Règles d''automatisation des réponses';
COMMENT ON TABLE pending_replies IS 'Réponses générées en attente de validation';
COMMENT ON TABLE mail_ai_activity_logs IS 'Logs de toutes les actions IA sur les emails';
COMMENT ON TABLE mail_statistics IS 'Statistiques agrégées par jour';
