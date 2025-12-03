/*
  # Système d'Affiliation ClaritySupport
  
  ## Description
  Système d'affiliation professionnel permettant aux utilisateurs Pro et Enterprise
  de gagner des bonus de génération en référant de nouveaux clients.

  ## Tables Créées

  ### 1. affiliate_codes
  Stocke les codes d'affiliation des utilisateurs
  - `id` (uuid, primary key) - Identifiant unique
  - `user_id` (uuid, foreign key) - Propriétaire du code
  - `code` (text, unique) - Code d'affiliation unique (ex: JOHN-2024-XK9)
  - `referral_link` (text) - Lien complet d'affiliation
  - `total_referrals` (integer) - Nombre total de parrainages réussis
  - `total_bonus_earned` (integer) - Total des bonus gagnés
  - `is_active` (boolean) - Si le code est actif
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Dernière mise à jour

  ### 2. affiliate_referrals
  Historique des parrainages
  - `id` (uuid, primary key) - Identifiant unique
  - `affiliate_code_id` (uuid, foreign key) - Code d'affiliation utilisé
  - `referred_user_id` (uuid, foreign key) - Utilisateur parrainé
  - `plan_subscribed` (text) - Plan souscrit par le filleul
  - `bonus_awarded` (integer) - Bonus attribué au parrain
  - `status` (text) - Statut: pending, completed, canceled
  - `subscription_date` (timestamptz) - Date de souscription
  - `created_at` (timestamptz) - Date de création

  ### 3. affiliate_bonus_transactions
  Historique des bonus accordés
  - `id` (uuid, primary key) - Identifiant unique
  - `user_id` (uuid, foreign key) - Utilisateur bénéficiaire
  - `referral_id` (uuid, foreign key) - Référence au parrainage
  - `bonus_type` (text) - Type: referral_reward, welcome_bonus
  - `amount` (integer) - Montant du bonus (générations)
  - `description` (text) - Description du bonus
  - `expires_at` (timestamptz, nullable) - Date d'expiration
  - `created_at` (timestamptz) - Date de création

  ## Bonus Structure
  - Parrain: 1500 générations par parrainage réussi
  - Filleul: 500 générations de bienvenue
  - Plans éligibles pour générer un code: Pro, Enterprise
  - Plans comptabilisés comme parrainage: Starter, Pro, Enterprise
*/

-- Table des codes d'affiliation
CREATE TABLE IF NOT EXISTS affiliate_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  referral_link text NOT NULL,
  total_referrals integer NOT NULL DEFAULT 0,
  total_bonus_earned integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table des parrainages
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code_id uuid NOT NULL REFERENCES affiliate_codes(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_subscribed text NOT NULL,
  bonus_awarded integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'canceled')),
  subscription_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id) -- Un utilisateur ne peut être parrainé qu'une fois
);

-- Table des transactions de bonus
CREATE TABLE IF NOT EXISTS affiliate_bonus_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_id uuid REFERENCES affiliate_referrals(id) ON DELETE SET NULL,
  bonus_type text NOT NULL CHECK (bonus_type IN ('referral_reward', 'welcome_bonus', 'milestone_bonus', 'special_promotion')),
  amount integer NOT NULL,
  description text NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ajouter colonne bonus_credits aux users si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'bonus_credits'
  ) THEN
    ALTER TABLE users ADD COLUMN bonus_credits integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Ajouter colonne referred_by aux users si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE users ADD COLUMN referred_by uuid REFERENCES affiliate_codes(id);
  END IF;
END $$;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_user_id ON affiliate_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_code ON affiliate_codes(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_active ON affiliate_codes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_code_id ON affiliate_referrals(affiliate_code_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_user ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_bonus_user_id ON affiliate_bonus_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- Enable RLS
ALTER TABLE affiliate_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_bonus_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour affiliate_codes
CREATE POLICY "Users can view own affiliate code"
  ON affiliate_codes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own affiliate code"
  ON affiliate_codes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own affiliate code"
  ON affiliate_codes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies pour affiliate_referrals
CREATE POLICY "Users can view referrals for own affiliate code"
  ON affiliate_referrals FOR SELECT
  TO authenticated
  USING (
    affiliate_code_id IN (
      SELECT id FROM affiliate_codes WHERE user_id = auth.uid()
    )
    OR referred_user_id = auth.uid()
  );

-- RLS Policies pour affiliate_bonus_transactions
CREATE POLICY "Users can view own bonus transactions"
  ON affiliate_bonus_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger pour updated_at sur affiliate_codes
CREATE TRIGGER update_affiliate_codes_updated_at
  BEFORE UPDATE ON affiliate_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer un code d'affiliation unique
CREATE OR REPLACE FUNCTION generate_affiliate_code(user_name text)
RETURNS text AS $$
DECLARE
  base_code text;
  random_suffix text;
  final_code text;
  code_exists boolean;
BEGIN
  -- Nettoyer le nom et prendre les 4 premières lettres
  base_code := UPPER(SUBSTRING(REGEXP_REPLACE(user_name, '[^a-zA-Z]', '', 'g'), 1, 4));
  
  -- Si le nom est trop court, ajouter des lettres aléatoires
  WHILE LENGTH(base_code) < 4 LOOP
    base_code := base_code || CHR(65 + FLOOR(RANDOM() * 26)::int);
  END LOOP;
  
  -- Générer un suffixe aléatoire
  LOOP
    random_suffix := UPPER(
      SUBSTRING(MD5(RANDOM()::text), 1, 4) || 
      TO_CHAR(EXTRACT(YEAR FROM NOW()), 'FM0000')
    );
    final_code := base_code || '-' || random_suffix;
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM affiliate_codes WHERE code = final_code) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN final_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour attribuer un bonus d'affiliation
CREATE OR REPLACE FUNCTION award_affiliate_bonus(
  p_referrer_user_id uuid,
  p_referred_user_id uuid,
  p_referral_id uuid,
  p_plan text
)
RETURNS void AS $$
DECLARE
  referrer_bonus integer := 1500; -- Bonus parrain
  referred_bonus integer := 500;  -- Bonus filleul de bienvenue
BEGIN
  -- Bonus pour le parrain
  INSERT INTO affiliate_bonus_transactions (
    user_id, referral_id, bonus_type, amount, description
  ) VALUES (
    p_referrer_user_id,
    p_referral_id,
    'referral_reward',
    referrer_bonus,
    'Bonus parrainage - Nouveau filleul (' || p_plan || ')'
  );
  
  -- Mettre à jour les bonus_credits du parrain
  UPDATE users 
  SET bonus_credits = bonus_credits + referrer_bonus
  WHERE id = p_referrer_user_id;
  
  -- Bonus de bienvenue pour le filleul
  INSERT INTO affiliate_bonus_transactions (
    user_id, referral_id, bonus_type, amount, description
  ) VALUES (
    p_referred_user_id,
    p_referral_id,
    'welcome_bonus',
    referred_bonus,
    'Bonus de bienvenue - Parrainage'
  );
  
  -- Mettre à jour les bonus_credits du filleul
  UPDATE users 
  SET bonus_credits = bonus_credits + referred_bonus
  WHERE id = p_referred_user_id;
  
  -- Mettre à jour les stats du code d'affiliation
  UPDATE affiliate_codes
  SET 
    total_referrals = total_referrals + 1,
    total_bonus_earned = total_bonus_earned + referrer_bonus
  WHERE id = (
    SELECT affiliate_code_id FROM affiliate_referrals WHERE id = p_referral_id
  );
  
  -- Mettre à jour le statut du parrainage
  UPDATE affiliate_referrals
  SET 
    status = 'completed',
    bonus_awarded = referrer_bonus,
    subscription_date = NOW()
  WHERE id = p_referral_id;
END;
$$ LANGUAGE plpgsql;
