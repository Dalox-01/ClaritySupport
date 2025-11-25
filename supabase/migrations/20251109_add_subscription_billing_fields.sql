-- Ajouter les champs manquants à la table subscriptions

-- Ajouter la colonne billing_period si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'billing_period'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly'));
  END IF;
END $$;

-- Ajouter la colonne cancel_at_period_end si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'cancel_at_period_end'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
  END IF;
END $$;

COMMENT ON COLUMN subscriptions.billing_period IS 'Période de facturation : monthly ou yearly';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Si true, l''abonnement sera annulé à la fin de la période en cours';
