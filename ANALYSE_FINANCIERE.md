# 💰 Analyse Financière - ClaritySupport

## Tarifs OpenAI (Décembre 2025)

| Modèle | Input ($/1M tokens) | Output ($/1M tokens) | Usage |
|--------|---------------------|----------------------|-------|
| GPT-4o | $2.50 | $10.00 | Génération réponses |
| GPT-4o-mini | $0.15 | $0.60 | Analyse emails |
| GPT-3.5-turbo | $0.50 | $1.50 | Optimisation tokens |

---

## Estimation tokens par opération

| Opération | Tokens Input | Tokens Output | Total |
|-----------|--------------|---------------|-------|
| Analyse email | ~800 | ~200 | ~1,000 |
| Génération réponse | ~1,500 | ~500 | ~2,000 |
| Optimisation contexte | ~2,000 | ~400 | ~2,400 |

---

## 📊 PLAN STARTER - 49€/mois

### Limites
- **5 000 emails/mois**
- 3 comptes email
- 1 boutique Shopify
- Pas de fichiers techniques

### Coûts OpenAI (usage MAX)

| Opération | Quantité | Modèle | Coût unitaire | Coût total |
|-----------|----------|--------|---------------|------------|
| Analyse emails | 5,000 | GPT-4o-mini | ~$0.0002 | **$1.00** |
| Génération réponses | 5,000 | GPT-4o | ~$0.008 | **$40.00** |
| Optimisation contexte | 1 | GPT-3.5 | ~$0.003 | **$0.003** |

### Bilan STARTER

| Métrique | Valeur |
|----------|--------|
| **Revenu mensuel** | 49€ (~$53) |
| **Coût OpenAI max** | ~$41 |
| **Coût infra (Vercel/Supabase)** | ~$2 |
| **Coût total** | ~$43 |
| **Bénéfice brut** | **~$10** |
| **Marge brute** | **~19%** |

> ⚠️ **Attention** : Le plan Starter a une marge faible si le client utilise 100% du quota.
> En pratique, usage moyen = 40-60% → marge réelle ~45-55%

---

## 📊 PLAN PRO - 99€/mois

### Limites
- **20 000 emails/mois**
- 10 comptes email
- 3 boutiques Shopify
- 5 fichiers techniques max
- Affiliation activée

### Coûts OpenAI (usage MAX)

| Opération | Quantité | Modèle | Coût unitaire | Coût total |
|-----------|----------|--------|---------------|------------|
| Analyse emails | 20,000 | GPT-4o-mini | ~$0.0002 | **$4.00** |
| Génération réponses | 20,000 | GPT-4o | ~$0.008 | **$160.00** |
| Optimisation contexte | 5 | GPT-3.5 | ~$0.003 | **$0.015** |

### Bilan PRO

| Métrique | Valeur |
|----------|--------|
| **Revenu mensuel** | 99€ (~$107) |
| **Coût OpenAI max** | ~$164 |
| **Coût infra** | ~$5 |
| **Coût total** | ~$169 |
| **Bénéfice brut** | **-$62** ❌ |
| **Marge brute** | **-58%** ❌ |

> 🚨 **ALERTE** : Le plan Pro est DÉFICITAIRE à usage maximum !
> Solution : Réduire le quota ou augmenter le prix

### Scénario réaliste (60% usage)

| Métrique | Valeur |
|----------|--------|
| Emails traités | 12,000 |
| Coût OpenAI | ~$98 |
| Coût total | ~$103 |
| **Bénéfice brut** | **~$4** |
| **Marge brute** | **~4%** |

---

## 📊 PLAN SCALE - 199€/mois

### Limites
- **60 000 emails/mois**
- Comptes email illimités
- Boutiques Shopify illimitées
- Fichiers techniques illimités
- Affiliation activée

### Coûts OpenAI (usage MAX)

| Opération | Quantité | Modèle | Coût unitaire | Coût total |
|-----------|----------|--------|---------------|------------|
| Analyse emails | 60,000 | GPT-4o-mini | ~$0.0002 | **$12.00** |
| Génération réponses | 60,000 | GPT-4o | ~$0.008 | **$480.00** |
| Optimisation contexte | 10 | GPT-3.5 | ~$0.003 | **$0.03** |

### Bilan SCALE

| Métrique | Valeur |
|----------|--------|
| **Revenu mensuel** | 199€ (~$215) |
| **Coût OpenAI max** | ~$492 |
| **Coût infra** | ~$10 |
| **Coût total** | ~$502 |
| **Bénéfice brut** | **-$287** ❌ |
| **Marge brute** | **-133%** ❌ |

> 🚨 **ALERTE CRITIQUE** : Le plan Scale perd de l'argent massivement !

### Scénario réaliste (40% usage)

| Métrique | Valeur |
|----------|--------|
| Emails traités | 24,000 |
| Coût OpenAI | ~$197 |
| Coût total | ~$207 |
| **Bénéfice brut** | **~$8** |
| **Marge brute** | **~4%** |

---

## 🔴 PROBLÈME IDENTIFIÉ

Les quotas actuels sont **TROP ÉLEVÉS** par rapport aux prix. Voici les problèmes :

| Plan | Prix | Quota actuel | Coût max OpenAI | Rentable ? |
|------|------|--------------|-----------------|------------|
| Starter | 49€ | 5,000 | ~$41 | ⚠️ Limite |
| Pro | 99€ | 20,000 | ~$164 | ❌ NON |
| Scale | 199€ | 60,000 | ~$492 | ❌ NON |

---

## ✅ RECOMMANDATIONS

### Option 1 : Réduire les quotas (recommandé)

| Plan | Prix | Nouveau quota | Coût max | Marge |
|------|------|---------------|----------|-------|
| Starter | 49€ | **2,000** | ~$16 | **~67%** ✅ |
| Pro | 99€ | **5,000** | ~$41 | **~60%** ✅ |
| Scale | 199€ | **15,000** | ~$123 | **~40%** ✅ |

### Option 2 : Augmenter les prix

| Plan | Nouveau prix | Quota | Coût max | Marge |
|------|--------------|-------|----------|-------|
| Starter | 49€ | 5,000 | ~$41 | ~19% |
| Pro | **199€** | 20,000 | ~$164 | ~25% |
| Scale | **499€** | 60,000 | ~$492 | ~5% |

### Option 3 : Utiliser GPT-4o-mini pour tout (économique)

| Plan | Prix | Quota | Coût max (mini) | Marge |
|------|------|-------|-----------------|-------|
| Starter | 49€ | 5,000 | ~$4 | **~92%** ✅ |
| Pro | 99€ | 20,000 | ~$16 | **~85%** ✅ |
| Scale | 199€ | 60,000 | ~$48 | **~78%** ✅ |

> 💡 **Recommandation finale** : Utiliser GPT-4o-mini pour la génération ET garder les quotas actuels. La qualité reste excellente et les marges sont très bonnes.

---

## 📈 Simulation avec GPT-4o-mini partout

### Nouveaux coûts par email

| Opération | Tokens | Modèle | Coût |
|-----------|--------|--------|------|
| Analyse | ~1,000 | GPT-4o-mini | $0.0002 |
| Génération | ~2,000 | GPT-4o-mini | $0.0004 |
| **Total par email** | ~3,000 | - | **$0.0006** |

### Bilan final (GPT-4o-mini)

| Plan | Prix | Quota | Coût OpenAI | Marge |
|------|------|-------|-------------|-------|
| **Starter** | 49€ | 5,000 | ~$3 | **94%** ✅ |
| **Pro** | 99€ | 20,000 | ~$12 | **89%** ✅ |
| **Scale** | 199€ | 60,000 | ~$36 | **83%** ✅ |

---

## 🎯 Action recommandée

**Changer le modèle de génération de GPT-4o vers GPT-4o-mini** dans :
- `lib/mail-ai-helpers.ts` ligne 574

```typescript
// Avant
model: 'gpt-4o'

// Après  
model: 'gpt-4o-mini'
```

Cela transforme des plans déficitaires en plans très rentables tout en gardant une qualité excellente.
