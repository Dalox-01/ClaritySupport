# Intégration complète des paramètres IA - Configuration

## ✅ Modifications effectuées

### 1. **Structure des données (Base de données)**

**Migration créée**: `supabase/migrations/20250110_add_ai_global_params.sql`

Nouveaux champs ajoutés à la table `ai_configurations` :

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `model` | TEXT | `'gpt-4o'` | Modèle OpenAI (gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo) |
| `max_tokens` | INTEGER | `300` | Nombre maximum de tokens (100-1000) |
| `creativity` | NUMERIC(3,2) | `0.5` | Niveau de créativité (0.0 - 1.0) |
| `style` | TEXT | `'professionnel'` | Style de réponse |
| `tone` | TEXT | `'professionnel'` | Ton de la réponse |
| `length` | TEXT | `'moyen'` | Longueur cible |
| `language` | TEXT | `'fr'` | Langue de réponse |
| `category_templates` | JSONB | `{...}` | **Prompts contextuels par catégorie** |
| `security_audit_log` | BOOLEAN | `false` | ⚠️ Logs d'audit (RGPD - décoché par défaut) |
| `security_mask_personal_data` | BOOLEAN | `false` | ⚠️ Masquage données perso (RGPD - décoché par défaut) |
| `security_data_retention_days` | INTEGER | `30` | Durée de rétention des données |

### 2. **Prompts contextuels par catégorie**

Les `category_templates` permettent à l'IA d'adapter son comportement selon la catégorie de l'email :

```json
{
  "urgent": "Traitez avec la plus haute priorité. Reconnaissez l'urgence...",
  "commande": "Le client a une question sur sa commande. Vérifiez les détails...",
  "remboursement": "Expliquez la politique de remboursement, les délais...",
  "question-produit": "Fournissez des informations détaillées, techniques...",
  "suivi-commande": "Fournissez les informations de tracking...",
  "sav": "Faites preuve d'empathie, proposez des solutions...",
  "reclamation": "Reconnaissez le problème, présentez des excuses...",
  "information": "Réponse claire et complète...",
  "facturation": "Expliquez clairement les montants...",
  "technique": "Diagnostic étape par étape, soyez pédagogue...",
  "autre": "Analysez le contenu et répondez de manière professionnelle..."
}
```

### 3. **Adaptation dynamique de la longueur selon maxTokens**

Le système génère maintenant des **instructions de longueur dynamiques** basées sur la configuration :

| maxTokens | Guideline | Description |
|-----------|-----------|-------------|
| ≤ 200 | TRÈS BREF | 1-2 paragraphes maximum, direct |
| 201-400 | Concis mais complet | 2-3 paragraphes, structuré |
| 401-600 | Détaillé | 3-4 paragraphes, explications claires |
| > 600 | Complet et exhaustif | Réponse détaillée et pédagogique |

**Exemple** : Si l'utilisateur configure `maxTokens = 800` au lieu de `300`, l'IA recevra automatiquement l'instruction :
> "Fournis une réponse complète et exhaustive. Tu peux être détaillé et pédagogue."

### 4. **Modifications du code**

#### **lib/ai-prompt-config.ts**
- ✅ Ajout du champ `model` avec types supportés
- ✅ Ajout du champ `maxTokens` (100-1000)
- ✅ Ajout de l'objet `security` avec `auditLog` et `maskPersonalData` (false par défaut)
- ✅ Mise à jour du `DEFAULT_AI_CONFIG` avec les nouvelles valeurs

#### **lib/mail-ai-helpers.ts**
- ✅ Utilisation de `email.support_category` pour sélectionner le prompt contextuel approprié
- ✅ Génération dynamique des instructions de longueur basées sur `maxTokens`
- ✅ Ajout des instructions AVANT l'appel API (dans Master Prompt ET dans AIPromptBuilder)
- ✅ Utilisation du `model` et `maxTokens` depuis `aiConfig`
- ✅ Mapping automatique : `creativity` → `temperature` OpenAI (0.3 - 1.0)

#### **app/api/mail-center/process-auto-reply/route.ts**
- ✅ Construction de l'objet `AIPromptConfig` à partir des données DB
- ✅ Passage de `aiConfig` complet à `generateReplyWithAI()`
- ✅ Récupération du nom utilisateur depuis la DB (compatible mode interne)

### 5. **Flux de traitement mis à jour**

```
1. Email arrive (via check-new ou sync)
   ↓
2. Classification automatique → Catégorie assignée (commande, remboursement, etc.)
   ↓
3. Récupération de la config IA utilisateur (model, maxTokens, categoryTemplates, etc.)
   ↓
4. Sélection du prompt contextuel basé sur email.support_category
   ↓
5. Génération des instructions de longueur basées sur maxTokens
   ↓
6. Appel OpenAI avec :
   - Modèle dynamique (gpt-4o, gpt-4o-mini, etc.)
   - Temperature calculée depuis creativity
   - maxTokens configuré
   - Prompt système enrichi (contexte + longueur)
   ↓
7. Réponse générée et adaptée au budget de tokens configuré
```

## 🎯 Comportements clés

### **Prompts contextuels**
L'IA lit la catégorie de l'email (`email.support_category`) et applique le prompt correspondant depuis `categoryTemplates`.

**Exemple** : Pour un email classé "remboursement" :
```
Le client demande un remboursement.
Expliquez la politique de remboursement, les délais, et les étapes à suivre.
```

### **Adaptation de longueur**
Si l'utilisateur configure `maxTokens = 800` :
- Le système génère automatiquement : *"Fournis une réponse complète et exhaustive"*
- L'IA produit une réponse de 3-5 paragraphes

Si l'utilisateur configure `maxTokens = 200` :
- Le système génère : *"Sois TRÈS BREF et concis (1-2 paragraphes maximum)"*
- L'IA produit une réponse courte et directe

### **Sécurité RGPD**
Par défaut, les options sensibles sont **désactivées** :
- ❌ `security_audit_log = false` : Pas de logs détaillés
- ❌ `security_mask_personal_data = false` : Pas de masquage

L'utilisateur peut les activer manuellement dans l'interface.

## 📋 Prochaines étapes

### **À tester**
1. Déployer la migration SQL sur Supabase
2. Tester avec différentes configurations de `maxTokens` (200, 300, 800)
3. Vérifier que les prompts contextuels sont bien appliqués
4. Valider que le modèle choisi (gpt-4o-mini vs gpt-4o) est utilisé

### **Interface utilisateur**
Créer/mettre à jour les composants pour exposer :
- ✅ Sélecteur de modèle (dropdown)
- ✅ Slider maxTokens (100-1000, défaut 300)
- ✅ Checkboxes sécurité RGPD (décochées par défaut)
- ✅ Éditeur de prompts contextuels par catégorie

### **Monitoring**
Ajouter des logs pour suivre :
- Le modèle utilisé pour chaque réponse
- Le nombre de tokens consommés
- La catégorie détectée et le prompt contextuel appliqué

## 🔧 Commandes de déploiement

### **1. Appliquer la migration SQL**
```powershell
# Via Supabase CLI
supabase db push

# Ou via le Dashboard Supabase
# Copier le contenu de supabase/migrations/20250110_add_ai_global_params.sql
# et l'exécuter dans l'éditeur SQL
```

### **2. Vérifier les modifications**
```sql
-- Vérifier la structure de la table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ai_configurations'
ORDER BY ordinal_position;

-- Vérifier les données existantes
SELECT id, user_id, model, max_tokens, security_audit_log
FROM ai_configurations
LIMIT 5;
```

## 📊 Exemple de configuration utilisateur

```json
{
  "model": "gpt-4o",
  "max_tokens": 300,
  "creativity": 0.5,
  "style": "professionnel",
  "tone": "professionnel",
  "length": "moyen",
  "language": "fr",
  "category_templates": {
    "commande": "Le client a une question sur sa commande...",
    "remboursement": "Expliquez la politique de remboursement..."
  },
  "security": {
    "auditLog": false,
    "maskPersonalData": false,
    "dataRetentionDays": 30
  }
}
```

## ✨ Avantages

1. **Flexibilité maximale** : Chaque utilisateur contrôle son modèle, son budget tokens, et ses prompts
2. **Adaptation intelligente** : L'IA ajuste automatiquement sa verbosité selon les tokens alloués
3. **Contexte pertinent** : Chaque catégorie d'email reçoit le prompt approprié
4. **RGPD-friendly** : Options de sécurité désactivées par défaut
5. **Performance** : Possibilité d'utiliser gpt-4o-mini pour économiser tout en gardant la qualité

---

**Date de création** : 10 janvier 2025  
**Auteur** : Système d'IA de Clarity Support  
**Version** : 1.0
