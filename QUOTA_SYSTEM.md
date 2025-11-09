# Système de Quota - Documentation

## Vue d'ensemble

Le système de quota permet de limiter l'utilisation des générations IA selon le plan d'abonnement de l'utilisateur.

## Plans et Limites

| Plan | Générations IA / mois | Prix |
|------|----------------------|------|
| **Starter** | 500 | Gratuit |
| **Pro** | 5 000 | €29/mois |
| **Enterprise** | Illimité | €99/mois |

## Architecture

### Base de données (`user_profiles`)

```sql
- ai_generations_used: INTEGER (compteur mensuel)
- ai_generations_limit: INTEGER (limite selon le plan)
- plan: TEXT ('starter' | 'pro' | 'enterprise')
- quota_reset_date: TIMESTAMP (date de réinitialisation)
```

### API Endpoints

#### `GET /api/quota/check`
Récupère le quota actuel de l'utilisateur.

**Réponse:**
```json
{
  "used": 10,
  "limit": 500,
  "plan": "starter",
  "percentage": 2
}
```

#### `POST /api/quota/increment`
Incrémente le compteur après une génération IA.

**Réponse (succès):**
```json
{
  "success": true,
  "used": 11,
  "limit": 500,
  "plan": "starter",
  "percentage": 2.2
}
```

**Réponse (quota dépassé):**
```json
{
  "error": "Quota atteint",
  "used": 500,
  "limit": 500,
  "percentage": 100
}
```
Status: 403

## Composants UI

### `QuotaDisplay`
Affiche le quota en temps réel dans le header.

**Props:**
- `isLightMode: boolean` - Thème actuel

**Comportement:**
- **< 50%**: Affichage bleu (normal)
- **50-79%**: Affichage jaune (attention)
- **80-99%**: Affichage orange + bouton "Upgrade"
- **≥ 100%**: Affichage rouge + modal bloquante

**Modal de dépassement:**
- Affiche le quota actuel
- Montre les avantages du plan supérieur
- Bouton "Passer au plan Pro/Enterprise"
- Redirige vers `/dashboard/billing`

### `ReplyGeneratorWindow`
Intègre les vérifications de quota.

**Workflow:**
1. Vérifier le quota avant génération
2. Si ≥ 100%, bloquer et afficher message d'erreur
3. Générer la réponse via l'IA
4. Incrémenter le quota après succès

## Base de données - Fonctions automatiques

### `update_quota_limit_on_plan_change()`
Trigger qui s'exécute lors du changement de plan.

**Actions:**
- Ajuste `ai_generations_limit` selon le nouveau plan
- Réinitialise `ai_generations_used` à 0
- Reset `quota_reset_date` pour un nouveau cycle

### `reset_monthly_quota()`
Fonction à appeler mensuellement (cron job).

**Actions:**
- Remet `ai_generations_used` à 0
- Incrémente `quota_reset_date` d'un mois

## Intégration

### Migration de la base de données

```bash
# Appliquer la migration
supabase db push
```

Ou via Supabase Dashboard > SQL Editor:
```sql
-- Copier le contenu de supabase/migrations/20250105_add_quota_system.sql
```

### Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Workflow Utilisateur

### Cycle de vie du quota

```
1. Utilisateur inscrit → Plan Starter (500 générations)
2. Utilise l'IA → Compteur incrémente (10/500, 11/500, etc.)
3. Atteint 80% → Bouton "Upgrade" apparaît
4. Atteint 100% → Modal bloquante
5. Upgrade vers Pro → Quota reset + nouvelle limite (5000)
6. Après 1 mois → reset_monthly_quota() remet à 0
```

### Flux de paiement

```
Mail Center → Quota Display → Upgrade Button → /dashboard/billing
→ Stripe Checkout → Webhook → Update user.plan → Auto-reset quota
```

## Sécurité

- ✅ Vérification côté serveur (API routes)
- ✅ Session NextAuth requise
- ✅ Service Role Key pour Supabase
- ✅ Validation des limites avant génération
- ✅ Triggers DB pour cohérence des données

## Monitoring

### Requêtes utiles

**Utilisateurs proches de leur limite:**
```sql
SELECT email, plan, ai_generations_used, ai_generations_limit,
       ROUND((ai_generations_used::FLOAT / ai_generations_limit) * 100, 2) as percentage
FROM user_profiles
WHERE (ai_generations_used::FLOAT / ai_generations_limit) >= 0.8
ORDER BY percentage DESC;
```

**Quotas à réinitialiser:**
```sql
SELECT email, quota_reset_date
FROM user_profiles
WHERE quota_reset_date <= NOW()
ORDER BY quota_reset_date;
```

**Statistiques par plan:**
```sql
SELECT plan, 
       COUNT(*) as users,
       AVG(ai_generations_used) as avg_usage,
       SUM(ai_generations_used) as total_usage
FROM user_profiles
GROUP BY plan;
```

## Tâches Cron recommandées

### Réinitialisation mensuelle (1er du mois à 00:00)
```bash
0 0 1 * * curl -X POST https://your-domain.com/api/quota/reset
```

Ou via Supabase Functions:
```typescript
// supabase/functions/reset-quota/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async () => {
  const supabase = createClient(/* ... */);
  const { error } = await supabase.rpc('reset_monthly_quota');
  return new Response(JSON.stringify({ success: !error }));
});
```

## Tests

### Tester le workflow quota

1. **Créer un utilisateur test:**
```sql
INSERT INTO user_profiles (email, plan, ai_generations_used, ai_generations_limit)
VALUES ('test@example.com', 'starter', 495, 500);
```

2. **Générer des réponses IA** jusqu'à atteindre 500

3. **Vérifier le blocage** à 500/500

4. **Upgrader le plan:**
```sql
UPDATE user_profiles SET plan = 'pro' WHERE email = 'test@example.com';
-- Le trigger doit automatiquement set limit=5000 et used=0
```

5. **Vérifier le reset:** Quota doit être 0/5000

## Troubleshooting

### Le quota ne s'affiche pas
- Vérifier que `QuotaDisplay` est bien importé dans `mail-center/page.tsx`
- Vérifier les logs console pour erreurs API
- Vérifier que la migration a été appliquée: `SELECT * FROM user_profiles;`

### Le quota ne s'incrémente pas
- Vérifier que `/api/quota/increment` est appelé après génération réussie
- Vérifier les permissions Supabase (Service Role Key)
- Vérifier les logs serveur Next.js

### Le trigger ne fonctionne pas
```sql
-- Vérifier que le trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_quota_on_plan_change';

-- Retester manuellement
UPDATE user_profiles SET plan = 'pro' WHERE email = 'test@example.com';
SELECT ai_generations_limit FROM user_profiles WHERE email = 'test@example.com';
-- Doit retourner 5000
```

## Prochaines étapes

- [ ] Créer endpoint `/api/quota/reset` pour cron job
- [ ] Ajouter analytics sur l'utilisation du quota
- [ ] Implémenter webhook Stripe pour auto-upgrade
- [ ] Convertir outils restants en DraggableWindow (BlockNote, Calendar, TaskManager)
- [ ] Ajouter notifications email à 80% et 100%
