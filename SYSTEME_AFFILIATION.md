# 🎁 Système d'Affiliation ClaritySupport

## Vue d'ensemble

Le système d'affiliation permet aux utilisateurs PRO et SCALE de gagner des bonus en parrainant de nouveaux utilisateurs.

## Bonus

| Type de bonus | Crédits |
|---------------|--------|
| **Parrain** (celui qui génère le lien) | +1500 générations d'emails |
| **Filleul** (celui qui utilise le lien) | +500 générations d'emails (bonus de bienvenue) |

## Plans disponibles

| Plan | Prix | Comptes email | Emails/mois | Boutiques Shopify | Fichiers IA | Affiliation |
|------|------|---------------|-------------|-------------------|-------------|-------------|
|**S** | 49€  | 3             | 5000        | 1                 | ❌          |         ❌ |
|**P** | 99€  | 10            | 20 000      | 3                 | 5 max        |         ✅ |
|**Sc**| 199€ | Illimité      | 60 000      | Illimité          | Illimité     |         ✅ |

## Plans éligibles à l'affiliation

Seuls les utilisateurs des plans suivants peuvent générer un code d'affiliation :
- **PRO** (99€/mois)
- **SCALE** (199€/mois)

## Comment ça fonctionne

### Pour le parrain

1. Aller dans **Paramètres** → Onglet **Affiliation**
2. Cliquer sur **Générer mon lien d'affiliation**
3. Copier et partager le lien avec des amis/collègues
4. Recevoir **1500 générations bonus** pour chaque nouvel abonné

### Pour le filleul

1. Cliquer sur le lien d'affiliation partagé
2. S'inscrire sur ClaritySupport
3. Souscrire à un plan payant (STARTER, PRO ou ENTERPRISE)
4. Recevoir automatiquement **500 générations bonus** de bienvenue

## Structure technique

### Tables de base de données

```sql
-- Table des codes d'affiliation
affiliate_codes (
  id, user_id, code, is_active, 
  total_referrals, total_bonus_earned,
  created_at
)

-- Table des parrainages
affiliate_referrals (
  id, referrer_code_id, referred_user_id,
  status, plan_subscribed, bonus_awarded,
  subscription_date, created_at
)

-- Table des transactions de bonus
affiliate_bonus_transactions (
  id, user_id, bonus_type, amount,
  related_referral_id, description, created_at
)
```

### Colonnes ajoutées à la table users

```sql
bonus_credits INTEGER DEFAULT 0  -- Crédits bonus accumulés
referred_by TEXT                 -- Code d'affiliation utilisé à l'inscription
```

### API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/affiliate` | GET | Récupérer les stats d'affiliation |
| `/api/affiliate` | POST | Générer un code d'affiliation |
| `/api/affiliate/validate` | POST | Valider un code d'affiliation |
| `/api/affiliate/apply` | POST | Appliquer un code lors de la souscription |

## Consommation des bonus

1. Les **bonus credits** sont utilisés en **priorité** avant le quota du plan
2. Quand `bonus_credits > 0`, chaque génération décrémente les bonus
3. Quand les bonus sont épuisés, le quota normal du plan est utilisé
4. Les bonus ne sont **jamais** réinitialisés mensuellement

## Intégration dans le flux de paiement

Lors de la souscription via Stripe :

```typescript
// Dans le webhook Stripe (checkout.session.completed)
// Récupérer le code d'affiliation stocké en session
// Appeler l'API /api/affiliate/apply avec le code
// Les bonus sont distribués automatiquement
```

## Affichage des bonus dans l'UI

Dans la sidebar du Mail Center et partout où le quota est affiché :

```
Quota mensuel: 2000/2000 utilisés
+ 1500 bonus disponibles
─────────────────────────────
Total restant: 1500 générations
```

## Migration SQL à exécuter

```bash
# Appliquer la migration
npx supabase migration up

# Ou manuellement
psql -f supabase/migrations/20251203_create_affiliate_system.sql
```

## Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `lib/db.ts` | Ajout de `bonusCredits` et `totalRemaining` dans `getUserQuota()` |
| `lib/db.ts` | Modification de `incrementUsage()` pour consommer les bonus en priorité |
| `app/api/usage/route.ts` | Ajout des bonus dans la réponse API |
| `app/api/ai/generate/route.ts` | Vérification du `totalRemaining` au lieu de `used >= limit` |
| `app/mail-center/settings/page.tsx` | Nouvelle page avec onglet Affiliation |

## Fichiers créés

| Fichier | Description |
|---------|-------------|
| `app/api/affiliate/route.ts` | API principale d'affiliation |
| `app/api/affiliate/validate/route.ts` | Validation des codes |
| `app/api/affiliate/apply/route.ts` | Application des bonus |
| `supabase/migrations/20251203_create_affiliate_system.sql` | Migration DB |

## Tests à effectuer

1. ✅ Générer un code d'affiliation (plan PRO/ENTERPRISE)
2. ✅ Copier le lien de parrainage
3. ✅ S'inscrire avec un nouveau compte via le lien
4. ✅ Souscrire à un plan payant
5. ✅ Vérifier que le parrain reçoit +1500 bonus
6. ✅ Vérifier que le filleul reçoit +500 bonus
7. ✅ Générer un email et vérifier que les bonus sont consommés en priorité

---

*Système d'affiliation créé le 3 décembre 2025*
