# Configuration Supabase pour le système de pricing

## Migrations à exécuter dans l'ordre

### 1. Migration plans (FREE, STARTER, PRO, ADMIN)

Aller dans **Supabase Dashboard** → **SQL Editor** → Coller ce code :

```sql
-- Ajouter STARTER et ADMIN au type plan
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_plan_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_plan_check 
CHECK (plan IN ('FREE', 'STARTER', 'PRO', 'ADMIN'));
```

### 2. Configurer le compte ADMIN de Laszlo

```sql
-- Mettre à jour le compte admin
UPDATE public.users 
SET plan = 'ADMIN', role = 'ADMIN'
WHERE email = 'laszlojeanpierre@gmail.com';

-- Vérifier
SELECT id, email, plan, role 
FROM public.users 
WHERE email = 'laszlojeanpierre@gmail.com';
```

### 2. Configurer le compte ADMIN de Laszlo

```sql
-- Mettre à jour le compte admin
UPDATE public.users 
SET plan = 'ADMIN', role = 'ADMIN'
WHERE email = 'laszlojeanpierre@gmail.com';

-- Vérifier
SELECT id, email, plan, role 
FROM public.users 
WHERE email = 'laszlojeanpierre@gmail.com';
```

### 3. Vérifier la table user_templates (si erreur dans les logs)

Si tu vois l'erreur `Could not find the table 'public.user_templates'`, exécute :

```sql
-- Créer la table user_templates
CREATE TABLE IF NOT EXISTS public.user_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON public.user_templates(user_id);

-- RLS (Row Level Security)
ALTER TABLE public.user_templates ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs voient seulement leurs templates
CREATE POLICY "Users can view own templates"
  ON public.user_templates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates"
  ON public.user_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON public.user_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON public.user_templates
  FOR DELETE
  USING (auth.uid() = user_id);
```

### 4. Vérifier les utilisateurs existants

Mettre à jour les plans des utilisateurs si besoin :

```sql
-- Voir tous les utilisateurs et leurs plans
SELECT id, email, plan, role, created_at 
FROM public.users 
ORDER BY created_at DESC;

-- Si besoin, mettre à jour le plan d'un utilisateur :
-- UPDATE public.users SET plan = 'STARTER' WHERE email = 'autre@email.com';
-- UPDATE public.users SET plan = 'PRO' WHERE email = 'autre@email.com';
```

## Ordre d'exécution

1. ✅ Exécuter migration plans (obligatoire)
2. ✅ Configurer le compte ADMIN de laszlojeanpierre@gmail.com
3. ✅ Exécuter migration user_templates (si l'erreur apparaît)
4. ✅ Vérifier que tout fonctionne

## Vérification

Après les migrations, teste dans le SQL Editor :

```sql
-- Vérifier que ADMIN fonctionne
INSERT INTO public.users (email, plan, role) 
VALUES ('test@test.com', 'ADMIN', 'ADMIN');

-- Nettoyer le test
DELETE FROM public.users WHERE email = 'test@test.com';
```

## Avantages du plan ADMIN

- ✅ **Générations illimitées** (999,999 / mois)
- ✅ **Signatures illimitées**
- ✅ **Variables illimitées**
- ✅ **Templates personnalisés illimités**
- ✅ **Dictée vocale**
- ✅ **Chatbot IA**
- ✅ **Pas de filigrane PDF**
- ✅ **Historique illimité**
- ✅ **Gratuit** (pas de facturation Stripe)

## En cas de problème

Si une migration échoue :
1. Note l'erreur exacte
2. Vérifie que la table `users` existe : `SELECT * FROM public.users LIMIT 1;`
3. Vérifie les contraintes : `SELECT conname FROM pg_constraint WHERE conrelid = 'public.users'::regclass;`
