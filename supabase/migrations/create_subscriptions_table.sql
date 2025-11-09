-- Table pour gérer les abonnements utilisateurs dans ClaritySupport
-- Cette table stocke le plan actuel de chaque utilisateur et les informations de paiement Stripe

-- Supprimer la table existante si elle existe (pour recréer avec la bonne structure)
DROP TABLE IF EXISTS subscriptions CASCADE;

CREATE TABLE subscriptions (
  -- Identifiant unique
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Utilisateur (lien avec auth.users)
  user_id UUID NOT NULL UNIQUE,
  
  -- Plan actuel
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  
  -- Statut de l'abonnement
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'past_due')),
  
  -- Période de facturation
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
  
  -- Informations Stripe
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  
  -- Dates
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS subscriptions_updated_at_trigger ON subscriptions;
CREATE TRIGGER subscriptions_updated_at_trigger
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Activer RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique RLS : les utilisateurs peuvent voir leur propre abonnement
CREATE POLICY "Users can view their own subscription"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique RLS : les utilisateurs ne peuvent pas modifier directement (seulement via API)
CREATE POLICY "Users cannot modify subscriptions"
  ON subscriptions
  FOR UPDATE
  USING (false);

-- Commentaires pour documentation
COMMENT ON TABLE subscriptions IS 'Gère les abonnements et plans des utilisateurs ClaritySupport';
COMMENT ON COLUMN subscriptions.user_id IS 'ID de l''utilisateur (lien avec auth.users)';
COMMENT ON COLUMN subscriptions.plan IS 'Plan actuel : free, starter, pro, ou enterprise';
COMMENT ON COLUMN subscriptions.status IS 'Statut : active, cancelled, expired, trial, ou past_due';
COMMENT ON COLUMN subscriptions.current_period_start IS 'Début de la période de facturation actuelle';
COMMENT ON COLUMN subscriptions.current_period_end IS 'Fin de la période de facturation actuelle';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'ID client Stripe';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'ID abonnement Stripe';
