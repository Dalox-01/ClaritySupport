-- ============================================
-- Migration: Support ADMIN plan for filters limits
-- Date: 2025-02-07
-- Description: Ensure ADMIN users are treated like SCALE/ENTERPRISE for
--              filter limits and align users.plan constraint accordingly.
-- ============================================

-- Ajuster la contrainte sur users.plan pour inclure les nouveaux plans
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_plan_check;

ALTER TABLE public.users
ADD CONSTRAINT users_plan_check
CHECK (plan IN ('FREE', 'STARTER', 'PRO', 'ENTERPRISE', 'SCALE', 'ADMIN'));

-- Mettre à jour la fonction de vérification des limites des filtres
CREATE OR REPLACE FUNCTION check_custom_filter_limit(p_user_id UUID)
RETURNS TABLE(
  can_create BOOLEAN,
  current_count INTEGER,
  max_allowed INTEGER,
  plan TEXT
) AS $$
DECLARE
  v_plan TEXT;
  v_current_count INTEGER;
  v_max_allowed INTEGER;
BEGIN
  SELECT users.plan INTO v_plan
  FROM users
  WHERE id = p_user_id;

  v_max_allowed := CASE v_plan
    WHEN 'FREE' THEN 0
    WHEN 'STARTER' THEN 0
    WHEN 'PRO' THEN 5
    WHEN 'ENTERPRISE' THEN 999999
    WHEN 'SCALE' THEN 999999
    WHEN 'ADMIN' THEN 999999
    ELSE 0
  END;

  SELECT COUNT(*) INTO v_current_count
  FROM user_filters
  WHERE user_id = p_user_id
    AND is_default = FALSE
    AND is_active = TRUE;

  RETURN QUERY SELECT
    (v_current_count < v_max_allowed) AS can_create,
    v_current_count::INTEGER,
    v_max_allowed::INTEGER,
    v_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
