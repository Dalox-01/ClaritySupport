# Clear Vercel Build Cache

## Problème
Le déploiement utilise encore l'ancien code même après le commit.

## Solution 1: Via Dashboard Vercel
1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet "ClaritySupport"
3. Onglet **Deployments**
4. Trouver le dernier déploiement (commit `cdec86b` ou `4c3ba9c`)
5. Cliquer sur les **3 points** (⋮) à droite
6. Sélectionner **"Redeploy"**
7. ✅ Cocher **"Clear build cache and redeploy"**
8. Cliquer **Redeploy**

## Solution 2: Via CLI Vercel (si installé)
```bash
vercel --prod --force
```

## Solution 3: Via Settings
1. Aller dans **Settings** du projet
2. Onglet **General**
3. Scroller jusqu'à **Build & Development Settings**
4. Activer temporairement **"Enable Build Cache"** puis le désactiver
5. Faire un nouveau push

## Vérification
Le fichier local est CORRECT:
- Ligne 1540 utilise `AlertCircle` (pas `AlertTriangle`)
- Les imports sont corrects
- Le build local fonctionne ✓
- Le commit `cdec86b` est correct ✓

C'est uniquement un problème de **cache Vercel**.
