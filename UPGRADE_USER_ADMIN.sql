-- Upgrade user to ENTERPRISE plan (Unlimited Shopify shops)
UPDATE public.subscriptions
SET 
  plan = 'ENTERPRISE',
  segment = 'shopify',
  status = 'active',
  current_period_end = NOW() + INTERVAL '100 years'
FROM auth.users
WHERE 
  public.subscriptions.user_id = auth.users.id 
  AND auth.users.email = 'clarityteamfr@gmail.com';

-- If no subscription exists, insert one
INSERT INTO public.subscriptions (user_id, plan, segment, status, current_period_start, current_period_end)
SELECT 
  id, 
  'ENTERPRISE', 
  'shopify', 
  'active', 
  NOW(), 
  NOW() + INTERVAL '100 years'
FROM auth.users
WHERE email = 'clarityteamfr@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.subscriptions WHERE user_id = auth.users.id
);
