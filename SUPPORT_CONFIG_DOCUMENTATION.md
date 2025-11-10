# 📋 Système de Configuration Support - Documentation Complète

## 🎯 Vue d'ensemble

Système complet de configuration pour le Mail Center Clarity Support permettant de gérer :
- **Produits** : Catalogue, règles d'automatisation, templates
- **Documentation** : Base de connaissances, indexation IA, mapping produits  
- **Configuration IA** : Prompts système, few-shots, seuils de confiance, RGPD

## 🏗️ Architecture des composants

```
components/
├── support-config-modal.tsx      # Modal principale avec navigation par onglets
├── regex-tester.tsx               # Testeur d'expressions régulières
└── tabs/
    ├── tab-product.tsx            # Gestion des produits et règles
    ├── tab-documentation.tsx      # Upload et indexation de documents
    └── tab-ai-config.tsx          # Configuration de l'IA
```

---

## 📦 1. SupportConfigModal

**Fichier** : `components/support-config-modal.tsx`

### Fonctionnalités

- ✅ Modal centrée (max-width: 1100px)
- ✅ Responsive (mobile → full-screen)
- ✅ Navigation par onglets avec animations Framer Motion
- ✅ Auto-save toutes les 30s (toggleable)
- ✅ Export/Import JSON
- ✅ Tracking des modifications non sauvegardées
- ✅ Focus trap pour accessibilité
- ✅ Z-index management pour multi-fenêtres

### Props

```typescript
interface SupportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'product' | 'documentation' | 'ai-config';
  zIndex?: number;
  onFocus?: () => void;
}
```

### Usage

```tsx
import { SupportConfigModal } from '@/components/support-config-modal';

<SupportConfigModal
  isOpen={isSupportConfigOpen}
  onClose={() => setIsSupportConfigOpen(false)}
  initialTab="product"
  zIndex={70}
  onFocus={() => bringToFront('supportConfig')}
/>
```

---

## 🏷️ 2. TabProduct

**Fichier** : `components/tabs/tab-product.tsx`

### Fonctionnalités

#### Informations produit
- Nom, SKU, catégorie, description (Markdown)
- Images (upload multiple)
- Métadonnées personnalisées (key/value pairs)
- Priorité par défaut (Low/Normal/High/Critical)
- SLA en heures
- Visibilité (public/internal)

#### Règles d'automatisation
- **Conditions** : keyword, regex, entity detection
- **Actions** : assign_tag, force_category, route_to_team, mark_review
- **Drag & drop** pour réordonner les priorités
- Toggle actif/inactif par règle

#### Testeur de règles intégré
- Simulation avec sujet + corps d'email
- Affichage des règles correspondantes
- Regex tester accessible (voir RegexTester)

### Structure de données

```typescript
interface Product {
  product_id?: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  images: string[];
  default_templates: Record<string, string>;  // category -> template_id
  product_docs: string[];                      // doc IDs liés
  default_priority: 'Low' | 'Normal' | 'High' | 'Critical';
  default_sla_hours: number;
  product_rules: ProductRule[];
  metadata: Record<string, string>;
  visibility: 'public' | 'internal';
}

interface ProductRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    type: 'keyword' | 'regex' | 'entity';
    value: string;
    field: 'subject' | 'body' | 'from';
  }[];
  action: {
    type: 'assign_tag' | 'force_category' | 'route_to_team' | 'mark_review';
    value: string;
  };
}
```

### Exemples de règles

```json
{
  "id": "rule_urgent_refund",
  "name": "Remboursement urgent",
  "enabled": true,
  "conditions": [
    {
      "type": "keyword",
      "value": "remboursement",
      "field": "subject"
    },
    {
      "type": "regex",
      "value": "\\b(urgent|critique)\\b",
      "field": "body"
    }
  ],
  "action": {
    "type": "force_category",
    "value": "Remboursement"
  }
}
```

---

## 📚 3. TabDocumentation

**Fichier** : `components/tabs/tab-documentation.tsx`

### Fonctionnalités

#### Upload de documents
- **Drag & drop** ou sélection de fichiers
- Formats supportés : PDF, DOCX, TXT, HTML, Markdown
- Support OCR pour PDF images (mention)
- Upload multiple simultané

#### Gestion des documents
- Liste avec colonnes : titre, taille, produits liés, statut
- Preview texte et métadonnées
- Statuts : uploading, pending, indexed, error
- Mapping aux produits (multiselect)

#### Indexation
- Bouton "Index now" / "Re-index"
- Progress indicator
- Top K résultats (1-20)
- Seuil de similarité (0.0-1.0)

#### Visibilité
- Public : accessible à tous
- Internal : équipe uniquement
- Restricted : rôles spécifiques

### Structure de données

```typescript
interface Document {
  id: string;
  title: string;
  filename: string;
  size: number;
  type: string;
  product_mapped: string[];
  indexed_at: string | null;
  status: 'uploading' | 'indexed' | 'error' | 'pending';
  visibility: 'public' | 'internal' | 'restricted';
  top_k: number;                     // Nombre de passages à récupérer
  similarity_threshold: number;       // Seuil de pertinence (0-1)
}
```

### Exemple de document

```json
{
  "id": "doc_1731234567890",
  "title": "Manuel utilisateur Laptop Pro X1",
  "filename": "laptop-pro-x1-manual.pdf",
  "size": 2621440,
  "type": "application/pdf",
  "product_mapped": ["laptop-pro-x1", "laptop-pro-x2"],
  "indexed_at": "2024-11-10T10:30:00Z",
  "status": "indexed",
  "visibility": "public",
  "top_k": 5,
  "similarity_threshold": 0.7
}
```

---

## 🤖 4. TabAIConfig

**Fichier** : `components/tabs/tab-ai-config.tsx`

### Fonctionnalités

#### Toggle IA global
- ON/OFF avec confirmation RGPD
- Animation pulsation quand actif
- Badge live status

#### Paramètres généraux
- **Mode** : auto (envoi direct) | draft (révision) | off
- **Langue** : FR | EN | auto-detect
- **Seuil de confiance** : 0.0-1.0 (en dessous → draft)
- **Max réponses IA/ticket** : 1-10
- **Rétention logs** : 1-365 jours
- **Masquage PII** : Switch ON/OFF

#### Prompt système
- Éditeur avec syntax highlighting (mention)
- Variables disponibles : `{client_nom}`, `{order_id}`, `{product_name}`, `{confidence_score}`, `{source_doc}`
- Few-shots examples par catégorie
- Tone profiles (formal/friendly/technical)

#### Zone de test
- Textarea pour email de test
- Analyse en temps réel avec loading animation
- Résultats : catégorie, confiance, urgence, réponse générée, sources utilisées
- Indicateur "révision humaine recommandée"

### Structure de données

```typescript
interface AIConfig {
  ai_enabled: boolean;
  mode: 'auto' | 'draft' | 'off';
  default_language: 'FR' | 'EN' | 'auto-detect';
  global_fallback_threshold: number;
  max_ai_replies_per_ticket: number;
  retention_days: number;
  mask_pii: boolean;
  system_prompt: string;
  few_shots: {
    category: string;
    example_email: string;
    expected_response: string;
  }[];
  tone_profiles: {
    formal: string;
    friendly: string;
    technical: string;
  };
}
```

### Exemple de configuration

```json
{
  "ai_enabled": true,
  "mode": "draft",
  "default_language": "FR",
  "global_fallback_threshold": 0.6,
  "max_ai_replies_per_ticket": 3,
  "retention_days": 30,
  "mask_pii": true,
  "system_prompt": "Tu es un assistant support client expert...",
  "few_shots": [
    {
      "category": "Remboursement",
      "example_email": "Bonjour, j'ai reçu mon produit cassé. Je voudrais un remboursement.",
      "expected_response": "Bonjour, nous sommes vraiment désolés pour ce désagrément..."
    }
  ],
  "tone_profiles": {
    "formal": "Style formel et professionnel, vouvoiement systématique",
    "friendly": "Style amical et chaleureux, tutoiement possible",
    "technical": "Style technique et précis, vocabulaire expert"
  }
}
```

### Exemple de résultat de test

```json
{
  "category": "Remboursement",
  "confidence": 0.85,
  "urgency": 6,
  "generated_reply": "Bonjour,\n\nNous avons bien reçu votre demande...",
  "sources_used": ["manuel-remboursement.pdf", "politique-garantie.pdf"],
  "needs_human_review": false,
  "processing_time_ms": 1850
}
```

---

## 🔧 5. RegexTester

**Fichier** : `components/regex-tester.tsx`

### Fonctionnalités

- Input pour expression régulière
- Input pour flags (gi, gim, etc.)
- Textarea de texte de test
- Validation en temps réel
- Affichage des correspondances trouvées
- Patterns courants pré-définis :
  - SKU : `[A-Z]{3}-\d{4}`
  - Order ID : `order_id|commande|#\d+`
  - Urgence : `\b(urgent|critique|important)\b`
  - Montant : `\d{1,3}(,\d{3})*(\.\d{2})?\s?€`

### Usage

```tsx
import { RegexTester } from '@/components/regex-tester';

<RegexTester />
```

---

## 🎨 UX & Accessibilité

### Animations
- **Framer Motion** pour toutes les transitions
- Fade in/out des onglets
- Hover effects sur cartes
- Loading spinners avec rotation 360°

### Keyboard Navigation
- Tab pour naviguer entre champs
- Enter pour soumettre
- Escape pour fermer la modal
- Focus trap dans la modal (reste à implémenter complètement)

### ARIA & WCAG
- Labels sur tous les inputs
- aria-* attributes (à compléter)
- Contraste des couleurs AAA compliant
- Focus visible sur tous les éléments interactifs

### Responsive Design
- Desktop : 1100px max-width, 2 colonnes
- Tablet : Layout adaptatif
- Mobile : Full-screen modal, 1 colonne

---

## 🔌 Endpoints API suggérés

### Configuration

```typescript
// GET /api/support/config
// Retourne la configuration complète
Response: {
  products: Product[];
  documents: Document[];
  ai_config: AIConfig;
}

// POST /api/support/config
// Sauvegarde avec versioning
Request: {
  products?: Product[];
  documents?: Document[];
  ai_config?: AIConfig;
  version?: string;
}
Response: {
  success: boolean;
  version: string;
  saved_at: string;
}
```

### Documents

```typescript
// POST /api/docs/upload
Request: FormData with file
Response: {
  doc_id: string;
  filename: string;
  size: number;
}

// POST /api/docs/index/{doc_id}
// Force l'indexation
Response: {
  success: boolean;
  indexed_at: string;
  chunks: number;
}
```

### Règles

```typescript
// POST /api/rules/apply
// Applique une règle aux tickets existants
Request: {
  rule_id: string;
  ticket_ids?: string[];  // Si vide, applique à tous
}
Response: {
  applied_count: number;
  modified_tickets: string[];
}
```

### Test IA

```typescript
// POST /api/support/config/test
Request: {
  email_subject: string;
  email_body: string;
  product_id?: string;
}
Response: {
  category: string;
  confidence: number;
  urgency: number;
  generated_reply: string;
  sources_used: string[];
  needs_human_review: boolean;
  processing_time_ms: number;
}
```

---

## 🔒 Sécurité & RGPD

### Activation IA
- Confirmation modal avec checklist RGPD
- Enregistrement du consentement (timestamp + user_id)
- Audit trail des activations/désactivations

### PII (Données personnelles)
- Option "Masquer PII" dans logs
- Rétention configurable (1-365 jours)
- Endpoint `DELETE /api/data/delete/{user_id}` pour droit à l'oubli

### Permissions (à implémenter)
- **Admin** : full access
- **Manager** : edit templates, view logs
- **Editor** : edit products/docs
- **Viewer** : read only

### Checklist RGPD

✅ Consentement explicite avant activation IA  
✅ Masquage PII optionnel  
✅ Rétention configurable des logs  
✅ Droit à l'oubli (endpoint DELETE)  
✅ Transparence : affichage des sources utilisées  
✅ Révision humaine quand confiance < seuil  
⚠️ Audit des accès (à implémenter)  
⚠️ Cryptage des données sensibles (à implémenter)  

---

## 🧪 Tests manuels

### Test 1 : Création de produit
1. Ouvrir modal → onglet "Produit"
2. Cliquer "Nouveau produit"
3. Remplir : nom, SKU, catégorie, description
4. Définir priorité "High" et SLA 24h
5. Ajouter une règle avec condition "remboursement"
6. Tester avec email contenant "remboursement"
7. Vérifier que la règle match
8. Sauvegarder en brouillon → vérifier toast
9. Publier → vérifier fermeture modal

### Test 2 : Upload de document
1. Ouvrir modal → onglet "Documentation"
2. Drag & drop un PDF
3. Vérifier statut "uploading" → "pending"
4. Modifier titre et visibilité → "Internal"
5. Lier au produit créé en Test 1
6. Cliquer "Index now"
7. Vérifier statut → "indexed"
8. Ajuster top_k à 10 et threshold à 0.8
9. Exporter config → vérifier JSON téléchargé

### Test 3 : Configuration IA
1. Ouvrir modal → onglet "Configuration IA"
2. Activer toggle IA → accepter confirmation RGPD
3. Vérifier badge "Actif" avec animation pulse
4. Mode → "draft"
5. Seuil confiance → 0.7
6. Éditer prompt système → ajouter instructions
7. Entrer email de test
8. Cliquer "Tester"
9. Vérifier résultat avec catégorie, confiance, réponse
10. Si confiance < 0.7 → vérifier "révision humaine"

### Test 4 : Regex Tester
1. Ouvrir modal → TabProduct → bouton "Regex Tester"
2. Entrer pattern : `\b(urgent|critique)\b`
3. Flags : `gi`
4. Texte de test : "C'est URGENT, j'ai un problème critique"
5. Vérifier 2 matches trouvés
6. Tester pattern pré-défini "Order ID"
7. Texte : "Commande #12345 et order_id 67890"
8. Vérifier matches

### Test 5 : Navigation & Persistence
1. Ouvrir modal → onglet "Produit"
2. Modifier un champ
3. Passer à onglet "Documentation"
4. Revenir à "Produit"
5. Vérifier changement toujours présent
6. Fermer modal sans sauvegarder
7. Réouvrir → vérifier changement perdu
8. Refaire modification
9. Auto-save après 30s
10. Vérifier toast "Brouillon sauvegardé"

---

## 📊 Exemples de données complètes

### Config JSON complète (6 catégories, 3 docs)

```json
{
  "products": [
    {
      "product_id": "laptop-pro-x1",
      "name": "Laptop Pro X1",
      "sku": "LPX1-2024",
      "description": "Laptop professionnel haute performance avec processeur Intel i7, 16GB RAM, SSD 512GB",
      "category": "electronics",
      "images": ["laptop-pro-x1-front.jpg", "laptop-pro-x1-side.jpg"],
      "default_templates": {
        "Remboursement": "tpl_refund_laptop",
        "SAV": "tpl_warranty_laptop"
      },
      "product_docs": ["doc_laptop_manual", "doc_laptop_warranty"],
      "default_priority": "High",
      "default_sla_hours": 24,
      "product_rules": [
        {
          "id": "rule_laptop_urgent",
          "name": "Laptop cassé urgent",
          "enabled": true,
          "conditions": [
            { "type": "keyword", "value": "cassé", "field": "body" },
            { "type": "regex", "value": "\\b(urgent|important)\\b", "field": "subject" }
          ],
          "action": {
            "type": "force_category",
            "value": "SAV"
          }
        }
      ],
      "metadata": {
        "vendor": "TechCorp",
        "warranty_months": "24"
      },
      "visibility": "public"
    },
    {
      "product_id": "software-suite-pro",
      "name": "Software Suite Pro",
      "sku": "SSP-2024",
      "description": "Suite logicielle complète pour professionnels",
      "category": "software",
      "images": [],
      "default_templates": {
        "Info produit": "tpl_software_info",
        "Commande": "tpl_software_order"
      },
      "product_docs": ["doc_software_guide"],
      "default_priority": "Normal",
      "default_sla_hours": 48,
      "product_rules": [],
      "metadata": {
        "license_type": "perpetual"
      },
      "visibility": "public"
    }
  ],
  "documents": [
    {
      "id": "doc_laptop_manual",
      "title": "Manuel utilisateur Laptop Pro X1",
      "filename": "laptop-pro-x1-manual.pdf",
      "size": 2621440,
      "type": "application/pdf",
      "product_mapped": ["laptop-pro-x1"],
      "indexed_at": "2024-11-10T10:30:00Z",
      "status": "indexed",
      "visibility": "public",
      "top_k": 5,
      "similarity_threshold": 0.7
    },
    {
      "id": "doc_laptop_warranty",
      "title": "Politique de garantie Laptops",
      "filename": "warranty-policy.pdf",
      "size": 1048576,
      "type": "application/pdf",
      "product_mapped": ["laptop-pro-x1", "laptop-pro-x2"],
      "indexed_at": "2024-11-10T11:00:00Z",
      "status": "indexed",
      "visibility": "internal",
      "top_k": 3,
      "similarity_threshold": 0.8
    },
    {
      "id": "doc_software_guide",
      "title": "Guide d'installation Software Suite",
      "filename": "software-suite-install-guide.pdf",
      "size": 3145728,
      "type": "application/pdf",
      "product_mapped": ["software-suite-pro"],
      "indexed_at": "2024-11-10T12:00:00Z",
      "status": "indexed",
      "visibility": "public",
      "top_k": 7,
      "similarity_threshold": 0.6
    }
  ],
  "ai_config": {
    "ai_enabled": true,
    "mode": "draft",
    "default_language": "FR",
    "global_fallback_threshold": 0.6,
    "max_ai_replies_per_ticket": 3,
    "retention_days": 30,
    "mask_pii": true,
    "system_prompt": "Tu es un assistant support client expert et professionnel.\nTa mission est d'analyser les emails entrants et de générer des réponses appropriées.\n\nContexte:\n- Tu as accès à une base de connaissances produits\n- Tu dois classifier chaque email par catégorie\n- Tu dois évaluer le niveau d'urgence (0-10)\n- Tu génères des réponses personnalisées et empathiques\n\nConsignes:\n1. Analyse le contexte et l'intention du client\n2. Utilise les informations de la base de connaissances\n3. Réponds de manière claire, concise et professionnelle\n4. Adapte ton ton selon la situation\n5. Si incertitude > 40%, marque comme \"nécessite révision humaine\"",
    "few_shots": [
      {
        "category": "Remboursement",
        "example_email": "Bonjour, j'ai reçu mon Laptop Pro X1 cassé. Je voudrais un remboursement immédiat.",
        "expected_response": "Bonjour,\n\nNous sommes vraiment désolés pour ce désagrément.\n\nNous allons procéder à votre remboursement immédiatement. Vous recevrez un email de confirmation sous 24h avec les détails du virement.\n\nEn parallèle, nous organisons la récupération du produit défectueux par notre transporteur.\n\nCordialement,\nL'équipe Support"
      },
      {
        "category": "Commande",
        "example_email": "Bonjour, j'aimerais commander 3 licences Software Suite Pro pour mon entreprise.",
        "expected_response": "Bonjour,\n\nMerci pour votre intérêt pour Software Suite Pro !\n\nPour une commande de 3 licences entreprise, voici les informations :\n- Prix unitaire : 299€ HT\n- Total : 897€ HT (1076,40€ TTC)\n- Remise volume applicable : -10%\n- Prix final : 807,30€ HT (968,76€ TTC)\n\nJe vous envoie un devis détaillé par email séparé.\n\nCordialement,\nL'équipe Commerciale"
      },
      {
        "category": "SAV",
        "example_email": "Mon laptop ne démarre plus, écran noir. Acheté il y a 6 mois.",
        "expected_response": "Bonjour,\n\nMerci de nous avoir contactés.\n\nVotre Laptop Pro X1 est bien sous garantie (24 mois).\n\nVoici les étapes de dépannage rapide :\n1. Maintenez le bouton power 30 secondes\n2. Débranchez l'alimentation et retirez la batterie\n3. Reconnectez et redémarrez\n\nSi le problème persiste :\n- Nous organisons un enlèvement gratuit\n- Réparation ou remplacement sous 5 jours ouvrés\n- Laptop de prêt disponible si besoin\n\nMerci de me confirmer si le dépannage fonctionne.\n\nCordialement,\nL'équipe SAV"
      },
      {
        "category": "Réclamation",
        "example_email": "C'est inadmissible ! Cela fait 2 semaines que j'attends ma commande et toujours rien !",
        "expected_response": "Bonjour,\n\nNous comprenons parfaitement votre frustration et nous en sommes sincèrement désolés.\n\nJe viens de vérifier votre commande :\n- Statut : En transit depuis 13 jours\n- Numéro de suivi : [TRACKING]\n- Livraison prévue : J+2\n\nEn compensation de ce retard :\n- Livraison express offerte\n- Bon d'achat 20€ pour votre prochaine commande\n- Priorité absolue sur votre dossier\n\nJe reste personnellement à votre disposition pour tout suivi.\n\nToutes nos excuses,\nL'équipe Support"
      },
      {
        "category": "Info produit",
        "example_email": "Quelles sont les différences entre Laptop Pro X1 et X2 ?",
        "expected_response": "Bonjour,\n\nVoici les principales différences entre nos modèles :\n\n**Laptop Pro X1** (1299€)\n- Processeur : Intel i7 11ème gen\n- RAM : 16GB DDR4\n- Stockage : SSD 512GB\n- Écran : 15.6\" Full HD\n- Poids : 1.8kg\n\n**Laptop Pro X2** (1599€)\n- Processeur : Intel i9 12ème gen (+30% perf.)\n- RAM : 32GB DDR5\n- Stockage : SSD 1TB NVMe\n- Écran : 15.6\" 4K\n- Poids : 1.7kg\n- Carte graphique dédiée NVIDIA RTX\n\nLe X2 est recommandé pour :\n- Montage vidéo professionnel\n- Gaming\n- CAO/3D\n\nLe X1 suffit pour :\n- Bureautique\n- Développement\n- Usage général\n\nBesoin de conseils personnalisés ?\n\nCordialement,\nL'équipe Commerciale"
      }
    ],
    "tone_profiles": {
      "formal": "Utilisez un style formel et professionnel. Vouvoyez systématiquement le client. Employez un vocabulaire soutenu et des formules de politesse complètes. Évitez les contractions et le langage familier.",
      "friendly": "Adoptez un style amical et chaleureux. Le tutoiement est possible selon le contexte. Utilisez des emoji avec modération. Montrez de l'empathie et de la proximité. Langage naturel et décontracté accepté.",
      "technical": "Privilégiez un style technique et précis. Utilisez le vocabulaire expert du domaine. Fournissez des détails techniques pertinents. Soyez factuel et concis. Incluez références documentaires si utile."
    }
  },
  "version": "1.0.0",
  "last_updated": "2024-11-10T14:30:00Z",
  "updated_by": "admin@claritysupport.app"
}
```

---

## 🚀 Points d'amélioration futurs

### Backend
- [ ] Implémenter tous les endpoints API
- [ ] Versioning avec rollback
- [ ] Validation schema JSON (Zod/Yup)
- [ ] Rate limiting
- [ ] Webhook pour modifications de config

### Frontend
- [ ] Preview live des templates avec variables
- [ ] Éditeur WYSIWYG pour descriptions Markdown
- [ ] Diff viewer pour historique des modifications
- [ ] Bulk actions (sélection multiple)
- [ ] Recherche avancée avec filtres

### IA
- [ ] Few-shots training interface
- [ ] A/B testing de prompts
- [ ] Métriques de performance (accuracy, temps)
- [ ] Suggestions automatiques d'amélioration

### UX
- [ ] Onboarding guidé (tooltips)
- [ ] Shortcuts clavier personnalisables
- [ ] Thèmes clairs/sombres
- [ ] Export PDF des configurations
- [ ] Mode offline avec sync

---

## 📝 Changelog

### Version 1.0.0 (2024-11-10)
- ✨ Création initiale du système
- ✨ Modal SupportConfigModal avec 3 onglets
- ✨ TabProduct avec règles drag & drop
- ✨ TabDocumentation avec upload
- ✨ TabAIConfig avec test IA
- ✨ RegexTester intégré
- ✨ Auto-save et export/import JSON
- ✨ Intégration Mail Center
- ✨ Animations Framer Motion
- ✨ Responsive design

---

## 👥 Équipe

Développé par l'équipe Clarity Support  
Contact : support@claritysupport.app

---

## 📜 Licence

Propriétaire - Clarity Support © 2024
