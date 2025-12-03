-- Migration: Système d'affiliation
-- Parrain: +1500 crédits/mois par filleul actif
-- Filleul: +500 crédits/mois tant que son abonnement est actif
-- Les bonus s'arrêtent si l'un des deux résilie

-- Table des affiliations
CREATE TABLE IF NOT EXISTS affiliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Le parrain (celui qui invite)
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Le filleul (celui qui est invité)
  referee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Code d'affiliation unique du parrain
  referral_code VARCHAR(20) NOT NULL,
  
  -- Statut de l'affiliation
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
  -- pending: code généré mais pas encore utilisé
  -- active: filleul a souscrit un abonnement
  -- cancelled: un des deux a résilié
  -- expired: lien expiré
  
  -- Crédits mensuels accordés
  referrer_monthly_credits INTEGER DEFAULT 1500,
  referee_monthly_credits INTEGER DEFAULT 500,
  
  -- Date d'activation (quand le filleul souscrit)
  activated_at TIMESTAMP WITH TIME ZONE,
  
  -- Date de fin (quand un des deux résilie)
  ended_at TIMESTAMP WITH TIME ZONE,
  ended_reason VARCHAR(50), -- 'referrer_cancelled', 'referee_cancelled'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_affiliations_referrer_id ON affiliations(referrer_id);
CREATE INDEX idx_affiliations_referee_id ON affiliations(referee_id);
CREATE INDEX idx_affiliations_referral_code ON affiliations(referral_code);
CREATE INDEX idx_affiliations_status ON affiliations(status);
CREATE INDEX idx_affiliations_active ON affiliations(status) WHERE status = 'active';

-- Table des codes de parrainage (un code par utilisateur)
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL = illimité
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);

-- Table pour tracker les crédits bonus mensuels
CREATE TABLE IF NOT EXISTS affiliate_bonus_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  affiliation_id UUID NOT NULL REFERENCES affiliations(id) ON DELETE CASCADE,
  
  -- Type de bonus
  bonus_type VARCHAR(20) NOT NULL CHECK (bonus_type IN ('referrer', 'referee')),
  
  -- Mois concerné
  month_year VARCHAR(7) NOT NULL, -- Format: '2025-12'
  
  -- Crédits accordés ce mois
  credits_amount INTEGER NOT NULL,
  
  -- Appliqué au quota ?
  is_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, affiliation_id, month_year)
);

CREATE INDEX idx_affiliate_bonus_user_id ON affiliate_bonus_credits(user_id);
CREATE INDEX idx_affiliate_bonus_month ON affiliate_bonus_credits(month_year);
CREATE INDEX idx_affiliate_bonus_pending ON affiliate_bonus_credits(is_applied) WHERE is_applied = false;

-- Ajouter une colonne pour stocker le code parrain utilisé lors de l'inscription
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS affiliate_bonus_credits INTEGER DEFAULT 0;

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION generate_referral_code(user_name VARCHAR DEFAULT NULL)
RETURNS VARCHAR(20) AS $$
DECLARE
  new_code VARCHAR(20);
  prefix VARCHAR(10);
  suffix VARCHAR(10);
BEGIN
  -- Créer un préfixe basé sur le nom ou aléatoire
  IF user_name IS NOT NULL AND LENGTH(user_name) > 0 THEN
    prefix := UPPER(LEFT(REGEXP_REPLACE(user_name, '[^a-zA-Z]', '', 'g'), 4));
  ELSE
    prefix := 'REF';
  END IF;
  
  -- Ajouter un suffixe aléatoire
  suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  
  new_code := prefix || suffix;
  
  -- Vérifier l'unicité
  WHILE EXISTS (SELECT 1 FROM referral_codes WHERE code = new_code) LOOP
    suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    new_code := prefix || suffix;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les crédits bonus d'affiliation d'un utilisateur
CREATE OR REPLACE FUNCTION calculate_affiliate_bonus_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_bonus INTEGER := 0;
  current_month VARCHAR(7);
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Crédits en tant que parrain (1500 par filleul actif)
  SELECT COALESCE(SUM(referrer_monthly_credits), 0) INTO total_bonus
  FROM affiliations
  WHERE referrer_id = p_user_id 
    AND status = 'active';
  
  -- Ajouter crédits en tant que filleul (500 si affiliation active)
  total_bonus := total_bonus + COALESCE((
    SELECT referee_monthly_credits
    FROM affiliations
    WHERE referee_id = p_user_id 
      AND status = 'active'
    LIMIT 1
  ), 0);
  
  RETURN total_bonus;
END;
$$ LANGUAGE plpgsql;

-- Fonction appelée quand un abonnement est créé/activé
CREATE OR REPLACE FUNCTION activate_affiliation_on_subscription()
RETURNS TRIGGER AS $$
DECLARE
  ref_code VARCHAR(20);
  referrer_user_id UUID;
BEGIN
  -- Vérifier si l'utilisateur a été référé
  SELECT referred_by_code INTO ref_code
  FROM users
  WHERE id = NEW.user_id;
  
  IF ref_code IS NOT NULL THEN
    -- Trouver le parrain
    SELECT user_id INTO referrer_user_id
    FROM referral_codes
    WHERE code = ref_code AND is_active = true;
    
    IF referrer_user_id IS NOT NULL THEN
      -- Mettre à jour l'affiliation en active
      UPDATE affiliations
      SET status = 'active',
          activated_at = NOW(),
          referee_id = NEW.user_id,
          updated_at = NOW()
      WHERE referral_code = ref_code 
        AND (referee_id IS NULL OR referee_id = NEW.user_id)
        AND status = 'pending';
      
      -- Si pas d'affiliation existante, en créer une
      IF NOT FOUND THEN
        INSERT INTO affiliations (referrer_id, referee_id, referral_code, status, activated_at)
        VALUES (referrer_user_id, NEW.user_id, ref_code, 'active', NOW());
      END IF;
      
      -- Incrémenter le compteur d'utilisation du code
      UPDATE referral_codes
      SET uses_count = uses_count + 1,
          updated_at = NOW()
      WHERE code = ref_code;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction appelée quand un abonnement est annulé
CREATE OR REPLACE FUNCTION cancel_affiliation_on_subscription_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'abonnement est annulé, désactiver les affiliations
  IF NEW.status = 'cancelled' OR NEW.cancel_at_period_end = true THEN
    -- Annuler les affiliations où l'utilisateur est parrain
    UPDATE affiliations
    SET status = 'cancelled',
        ended_at = NOW(),
        ended_reason = 'referrer_cancelled',
        updated_at = NOW()
    WHERE referrer_id = NEW.user_id AND status = 'active';
    
    -- Annuler les affiliations où l'utilisateur est filleul
    UPDATE affiliations
    SET status = 'cancelled',
        ended_at = NOW(),
        ended_reason = 'referee_cancelled',
        updated_at = NOW()
    WHERE referee_id = NEW.user_id AND status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_bonus_credits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY affiliations_user_policy ON affiliations
FOR ALL USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY referral_codes_user_policy ON referral_codes
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY affiliate_bonus_credits_user_policy ON affiliate_bonus_credits
FOR ALL USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER update_affiliations_updated_at 
BEFORE UPDATE ON affiliations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_codes_updated_at 
BEFORE UPDATE ON referral_codes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE affiliations IS 'Relations parrain-filleul avec statut et crédits bonus';
COMMENT ON TABLE referral_codes IS 'Codes de parrainage uniques par utilisateur';
COMMENT ON TABLE affiliate_bonus_credits IS 'Historique des crédits bonus mensuels attribués';
COMMENT ON FUNCTION calculate_affiliate_bonus_credits IS 'Calcule le total des crédits bonus d''affiliation pour un utilisateur';
