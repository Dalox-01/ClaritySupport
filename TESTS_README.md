# Guide des Tests Unitaires - ClaritySupport

## 📋 Vue d'ensemble

Ce projet utilise **Jest** avec **ts-jest** pour les tests unitaires du backend.

## 🚀 Installation

```bash
npm install
```

## 📝 Commandes de test

| Commande | Description |
|----------|-------------|
| `npm test` | Lance tous les tests une fois |
| `npm run test:watch` | Lance les tests en mode watch (relance automatique) |
| `npm run test:coverage` | Lance les tests avec rapport de couverture |
| `npm run test:ci` | Mode CI (pas de watch, avec coverage) |

## 📁 Structure des tests

```
__tests__/
├── setup.ts                    # Configuration globale Jest
├── lib/
│   ├── pricing-plans.test.ts   # Tests des plans tarifaires
│   ├── plan-features.test.ts   # Tests des fonctionnalités par plan
│   ├── mail-ai-helpers.test.ts # Tests des helpers IA mail
│   ├── token-optimizer.test.ts # Tests optimisation tokens
│   └── affiliate.test.ts       # Tests système d'affiliation
├── api/
│   └── routes.test.ts          # Tests des routes API
├── security/
│   └── security.test.ts        # Tests de sécurité (XSS, CSRF, SQL)
└── utils/
    └── utils.test.ts           # Tests des utilitaires
```

## ✅ Tests inclus

### 1. Plans tarifaires (`pricing-plans.test.ts`)
- Structure des 3 plans (Starter, Pro, Scale)
- Prix corrects (49€, 99€, 199€)
- Limites par plan (emails, comptes, Shopify)
- Fonctions utilitaires (upgrade, comparaison, etc.)

### 2. Fonctionnalités par plan (`plan-features.test.ts`)
- Limites de génération (5k, 20k, 60k)
- Signatures et templates
- Chatbot (Pro/Scale uniquement)
- Affiliation (Pro/Scale uniquement)

### 3. Helpers IA (`mail-ai-helpers.test.ts`)
- Classification par hashtags
- Détection de sentiment
- Détection d'urgence
- Structure des résultats

### 4. Optimisation tokens (`token-optimizer.test.ts`)
- Estimation de tokens
- Génération de hash
- Compression base de connaissances
- Construction prompt système

### 5. Système d'affiliation (`affiliate.test.ts`)
- Configuration des bonus (1500€ parrain, 500€ filleul)
- Génération de codes
- Éligibilité par plan
- Validation des liens

### 6. Routes API (`routes.test.ts`)
- Structure des réponses
- Codes HTTP standards
- Validation des données
- Gestion des erreurs

### 7. Sécurité (`security.test.ts`)
- Protection CSRF
- Protection XSS
- Détection SQL Injection
- Validation des entrées
- Rate limiting
- Quotas utilisateurs

### 8. Utilitaires (`utils.test.ts`)
- Formatage des prix
- Formatage des dates
- Manipulation de chaînes
- Manipulation de tableaux
- Calculs numériques
- Génération d'IDs

## 🎯 Couverture visée

- **lib/** : 80%+ de couverture
- **app/api/** : 70%+ de couverture
- Tests critiques : 100% des fonctions de paiement et sécurité

## 🔧 Configuration

Le fichier `jest.config.js` configure :
- Environnement Node.js
- Transformation TypeScript via ts-jest
- Alias de modules (@/ → racine)
- Timeout de 10 secondes
- Couverture sur lib/ et app/api/

## 🐛 Debugging

Pour débugger un test spécifique :

```bash
# Lancer un seul fichier
npm test -- __tests__/lib/pricing-plans.test.ts

# Lancer un test spécifique par nom
npm test -- -t "devrait coûter 49€/mois"

# Mode verbose
npm test -- --verbose
```

## 📊 Rapport de couverture

Après `npm run test:coverage`, le rapport est dans :
- Console : résumé
- `coverage/lcov-report/index.html` : rapport détaillé

## ⚠️ Points importants

1. **Mocks** : Les appels externes (OpenAI, Supabase) sont mockés
2. **Variables d'env** : Définies dans `__tests__/setup.ts`
3. **Isolation** : Chaque test est indépendant
4. **Nettoyage** : `afterEach` nettoie les mocks automatiquement

## 🚀 Avant déploiement

```bash
# Lancer tous les checks
npm run lint
npm run typecheck
npm run test:ci
npm run build
```

Si tous les tests passent ✅, le déploiement peut continuer.
