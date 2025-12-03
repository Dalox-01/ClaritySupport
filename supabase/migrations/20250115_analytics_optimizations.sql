-- ============================================================
-- MIGRATION: OPTIMISATION ANALYTICS MAIL CENTER
-- Date: 2025-01-15
-- Description: Tables et index pour analytics temps réel haute performance
-- ============================================================

-- 1. Table d'analytics pré-agrégées (pour performance)
CREATE TABLE IF NOT EXISTS mail_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Volume
  total_received INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_pending INTEGER DEFAULT 0,
  
  -- Par catégorie
  category_support INTEGER DEFAULT 0,
  category_vente INTEGER DEFAULT 0,
  category_spam INTEGER DEFAULT 0,
  category_urgent INTEGER DEFAULT 0,
  category_autre INTEGER DEFAULT 0,
  
  -- Par sentiment (basé sur analyse IA)
  sentiment_positif INTEGER DEFAULT 0,
  sentiment_neutre INTEGER DEFAULT 0,
  sentiment_negatif INTEGER DEFAULT 0,
  
  -- Par support_category (filtres)
  filter_facturation INTEGER DEFAULT 0,
  filter_technique INTEGER DEFAULT 0,
  filter_commercial INTEGER DEFAULT 0,
  filter_remboursement INTEGER DEFAULT 0,
  filter_commande INTEGER DEFAULT 0,
  filter_livraison INTEGER DEFAULT 0,
  filter_renseignement INTEGER DEFAULT 0,
  filter_produit INTEGER DEFAULT 0,
  filter_service INTEGER DEFAULT 0,
  filter_autre INTEGER DEFAULT 0,
  
  -- Métriques qualité
  avg_urgency_score DECIMAL(5,2) DEFAULT 0,
  avg_response_time_minutes INTEGER DEFAULT 0,
  emails_read INTEGER DEFAULT 0,
  emails_unread INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Index pour recherches ultra-rapides
CREATE INDEX idx_mail_analytics_daily_user_date ON mail_analytics_daily(user_id, date DESC);
CREATE INDEX idx_mail_analytics_daily_date ON mail_analytics_daily(date DESC);

-- 2. Fonction pour calculer les analytics d'un jour
CREATE OR REPLACE FUNCTION calculate_daily_analytics(p_user_id UUID, p_date DATE)
RETURNS void AS $$
DECLARE
  v_total_received INTEGER;
  v_cat_support INTEGER;
  v_cat_vente INTEGER;
  v_cat_spam INTEGER;
  v_cat_urgent INTEGER;
  v_cat_autre INTEGER;
  v_sent_positif INTEGER;
  v_sent_neutre INTEGER;
  v_sent_negatif INTEGER;
  v_filter_facturation INTEGER;
  v_filter_technique INTEGER;
  v_filter_commercial INTEGER;
  v_filter_remboursement INTEGER;
  v_filter_commande INTEGER;
  v_filter_livraison INTEGER;
  v_filter_renseignement INTEGER;
  v_filter_produit INTEGER;
  v_filter_service INTEGER;
  v_filter_autre INTEGER;
  v_avg_urgency DECIMAL(5,2);
  v_emails_read INTEGER;
  v_emails_unread INTEGER;
  v_total_sent INTEGER;
  v_avg_response INTEGER;
BEGIN
  -- Récupérer les totaux pour ce jour
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE category = 'support'),
    COUNT(*) FILTER (WHERE category = 'vente'),
    COUNT(*) FILTER (WHERE category = 'spam'),
    COUNT(*) FILTER (WHERE category = 'urgent'),
    COUNT(*) FILTER (WHERE category IS NULL OR category = 'autre'),
    COUNT(*) FILTER (WHERE sentiment = 'positif'),
    COUNT(*) FILTER (WHERE sentiment = 'neutre' OR sentiment IS NULL),
    COUNT(*) FILTER (WHERE sentiment = 'negatif'),
    COUNT(*) FILTER (WHERE support_category = 'FACTURATION'),
    COUNT(*) FILTER (WHERE support_category = 'TECHNIQUE'),
    COUNT(*) FILTER (WHERE support_category = 'COMMERCIAL'),
    COUNT(*) FILTER (WHERE support_category = 'REMBOURSEMENT'),
    COUNT(*) FILTER (WHERE support_category = 'COMMANDE'),
    COUNT(*) FILTER (WHERE support_category = 'LIVRAISON'),
    COUNT(*) FILTER (WHERE support_category = 'RENSEIGNEMENT'),
    COUNT(*) FILTER (WHERE support_category = 'PRODUIT'),
    COUNT(*) FILTER (WHERE support_category = 'SERVICE_CLIENT'),
    COUNT(*) FILTER (WHERE support_category IS NULL OR support_category NOT IN ('FACTURATION', 'TECHNIQUE', 'COMMERCIAL', 'REMBOURSEMENT', 'COMMANDE', 'LIVRAISON', 'RENSEIGNEMENT', 'PRODUIT', 'SERVICE_CLIENT')),
    AVG(urgency_score),
    COUNT(*) FILTER (WHERE is_read = true),
    COUNT(*) FILTER (WHERE is_read = false OR is_read IS NULL)
  INTO 
    v_total_received,
    v_cat_support,
    v_cat_vente,
    v_cat_spam,
    v_cat_urgent,
    v_cat_autre,
    v_sent_positif,
    v_sent_neutre,
    v_sent_negatif,
    v_filter_facturation,
    v_filter_technique,
    v_filter_commercial,
    v_filter_remboursement,
    v_filter_commande,
    v_filter_livraison,
    v_filter_renseignement,
    v_filter_produit,
    v_filter_service,
    v_filter_autre,
    v_avg_urgency,
    v_emails_read,
    v_emails_unread
  FROM emails_cache
  WHERE user_id = p_user_id
    AND DATE(received_at) = p_date;
  
  -- Calculer le temps de réponse moyen
  SELECT 
    COUNT(*),
    COALESCE(AVG(EXTRACT(EPOCH FROM (sent_at - created_at)) / 60), 0)
  INTO v_total_sent, v_avg_response
  FROM pending_replies
  WHERE user_id = p_user_id
    AND status = 'sent'
    AND sent_at IS NOT NULL
    AND DATE(created_at) = p_date;
  
  -- Insérer ou mettre à jour
  INSERT INTO mail_analytics_daily (
    user_id, date,
    total_received, total_sent,
    category_support, category_vente, category_spam, category_urgent, category_autre,
    sentiment_positif, sentiment_neutre, sentiment_negatif,
    filter_facturation, filter_technique, filter_commercial, filter_remboursement,
    filter_commande, filter_livraison, filter_renseignement, filter_produit, filter_service, filter_autre,
    avg_urgency_score, avg_response_time_minutes,
    emails_read, emails_unread
  ) VALUES (
    p_user_id, p_date,
    COALESCE(v_total_received, 0), COALESCE(v_total_sent, 0),
    COALESCE(v_cat_support, 0), COALESCE(v_cat_vente, 0), COALESCE(v_cat_spam, 0), 
    COALESCE(v_cat_urgent, 0), COALESCE(v_cat_autre, 0),
    COALESCE(v_sent_positif, 0), COALESCE(v_sent_neutre, 0), COALESCE(v_sent_negatif, 0),
    COALESCE(v_filter_facturation, 0), COALESCE(v_filter_technique, 0), COALESCE(v_filter_commercial, 0),
    COALESCE(v_filter_remboursement, 0), COALESCE(v_filter_commande, 0), COALESCE(v_filter_livraison, 0),
    COALESCE(v_filter_renseignement, 0), COALESCE(v_filter_produit, 0), COALESCE(v_filter_service, 0),
    COALESCE(v_filter_autre, 0),
    COALESCE(v_avg_urgency, 0), COALESCE(v_avg_response, 0),
    COALESCE(v_emails_read, 0), COALESCE(v_emails_unread, 0)
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_received = EXCLUDED.total_received,
    total_sent = EXCLUDED.total_sent,
    category_support = EXCLUDED.category_support,
    category_vente = EXCLUDED.category_vente,
    category_spam = EXCLUDED.category_spam,
    category_urgent = EXCLUDED.category_urgent,
    category_autre = EXCLUDED.category_autre,
    sentiment_positif = EXCLUDED.sentiment_positif,
    sentiment_neutre = EXCLUDED.sentiment_neutre,
    sentiment_negatif = EXCLUDED.sentiment_negatif,
    filter_facturation = EXCLUDED.filter_facturation,
    filter_technique = EXCLUDED.filter_technique,
    filter_commercial = EXCLUDED.filter_commercial,
    filter_remboursement = EXCLUDED.filter_remboursement,
    filter_commande = EXCLUDED.filter_commande,
    filter_livraison = EXCLUDED.filter_livraison,
    filter_renseignement = EXCLUDED.filter_renseignement,
    filter_produit = EXCLUDED.filter_produit,
    filter_service = EXCLUDED.filter_service,
    filter_autre = EXCLUDED.filter_autre,
    avg_urgency_score = EXCLUDED.avg_urgency_score,
    avg_response_time_minutes = EXCLUDED.avg_response_time_minutes,
    emails_read = EXCLUDED.emails_read,
    emails_unread = EXCLUDED.emails_unread,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger pour recalculer les analytics automatiquement
CREATE OR REPLACE FUNCTION trigger_recalculate_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculer les analytics du jour de l'email
  PERFORM calculate_daily_analytics(
    COALESCE(NEW.user_id, OLD.user_id),
    DATE(COALESCE(NEW.received_at, OLD.received_at))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers
DROP TRIGGER IF EXISTS emails_cache_analytics_trigger ON emails_cache;
CREATE TRIGGER emails_cache_analytics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON emails_cache
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_analytics();

-- 4. Index optimisés pour les requêtes analytics
CREATE INDEX IF NOT EXISTS idx_emails_cache_user_date ON emails_cache(user_id, DATE(received_at) DESC);
CREATE INDEX IF NOT EXISTS idx_emails_cache_category_user ON emails_cache(category, user_id) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_emails_cache_sentiment_user ON emails_cache(sentiment, user_id) WHERE sentiment IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_emails_cache_support_category_user ON emails_cache(support_category, user_id) WHERE support_category IS NOT NULL;

-- 5. RLS pour mail_analytics_daily
ALTER TABLE mail_analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON mail_analytics_daily FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own analytics"
  ON mail_analytics_daily FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own analytics"
  ON mail_analytics_daily FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- 6. Vue matérialisée pour les stats en temps réel (cache 1h)
CREATE MATERIALIZED VIEW IF NOT EXISTS mail_realtime_stats AS
SELECT 
  user_id,
  DATE(received_at) as date,
  COUNT(*) as total_emails,
  COUNT(*) FILTER (WHERE is_read = true) as read_emails,
  COUNT(*) FILTER (WHERE urgency_score >= 8) as urgent_emails,
  AVG(urgency_score) as avg_urgency,
  jsonb_object_agg(
    COALESCE(category, 'autre'),
    COUNT(*) FILTER (WHERE category IS NOT NULL)
  ) as category_distribution,
  jsonb_object_agg(
    COALESCE(support_category, 'autre'),
    COUNT(*) FILTER (WHERE support_category IS NOT NULL)
  ) as filter_distribution
FROM emails_cache
WHERE received_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id, DATE(received_at);

-- Index sur la vue matérialisée
CREATE UNIQUE INDEX idx_mail_realtime_stats_user_date ON mail_realtime_stats(user_id, date DESC);

-- Fonction pour rafraîchir le cache (à appeler toutes les heures via cron)
CREATE OR REPLACE FUNCTION refresh_mail_realtime_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mail_realtime_stats;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE mail_analytics_daily IS 'Analytics pré-calculées par jour pour performance maximale';
COMMENT ON FUNCTION calculate_daily_analytics IS 'Recalcule les analytics pour un utilisateur et une date donnés';
COMMENT ON MATERIALIZED VIEW mail_realtime_stats IS 'Cache des stats temps réel (rafraîchi toutes les heures)';
