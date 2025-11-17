# PROMPT POUR L'INGÉNIEUR FRONTEND
## Développement de l'Interface de Gestion des Filtres Personnalisés

---

## 🎯 OBJECTIF

Créer un **onglet "FILTRES" (ou "CONFIGURATION FILTRES")** dans la configuration de l'IA du Mail Center, permettant aux utilisateurs de :
1. Visualiser tous leurs filtres (de base + personnalisés)
2. Créer de nouveaux filtres personnalisés (selon leur plan)
3. Modifier les mots-clés de détection et la configuration IA de chaque filtre
4. Supprimer leurs filtres personnalisés
5. Voir les statistiques d'utilisation

---

## 📊 BACKEND DÉJÀ DÉVELOPPÉ

### **API Endpoints Disponibles**

#### 1. **GET /api/filters** - Liste tous les filtres
```typescript
Response: {
  success: true,
  filters: UserFilter[],
  counts: {
    total: number,
    default: number, // Filtres de base (non supprimables)
    custom: number   // Filtres créés par l'utilisateur
  }
}
```

#### 2. **POST /api/filters** - Créer un filtre personnalisé
```typescript
Body: {
  name: string,              // ex: "Urgences VIP"
  description?: string,
  color?: string,            // Hex color (ex: "#EF4444")
  icon?: string,             // Nom icône Lucide (ex: "Zap")
  filter_key: string,        // Clé unique (ex: "urgent_vip")
  keywords?: string[],       // Mots-clés détection
  detection_rules?: {
    matchMode: 'any' | 'all',
    caseSensitive: boolean,
    regexPatterns?: string[],
    excludeKeywords?: string[]
  },
  response_config?: {
    tone: 'pro' | 'cordial' | 'empathique' | 'technique',
    language: 'fr' | 'en',
    customInstructions?: string,
    responseTemplate?: string,
    autoReplyEnabled?: boolean,
    priorityLevel: 'high' | 'normal' | 'low'
  }
}

Response: {
  success: true,
  filter: UserFilter
}

Erreur si limite atteinte (status 403):
{
  error: 'Limite de filtres atteinte',
  details: {
    plan: string,
    current: number,
    max: number,
    message: string
  }
}
```

#### 3. **PATCH /api/filters/[id]** - Modifier un filtre personnalisé
```typescript
Body: {
  name?: string,
  description?: string,
  color?: string,
  icon?: string,
  keywords?: string[],
  detection_rules?: { ... },
  response_config?: { ... },
  is_active?: boolean
}

Response: {
  success: true,
  filter: UserFilter
}

Note: Les filtres de base (is_default = true) ne peuvent PAS être modifiés
Erreur 403 si tentative de modification d'un filtre de base
```

#### 4. **DELETE /api/filters/[id]** - Supprimer un filtre personnalisé
```typescript
Response: {
  success: true,
  message: 'Filtre supprimé avec succès'
}

Note: Les filtres de base ne peuvent PAS être supprimés
Erreur 403 si tentative de suppression d'un filtre de base
```

#### 5. **GET /api/filters/limits** - Vérifier limites et statistiques
```typescript
Response: {
  success: true,
  limits: {
    canCreate: boolean,
    current: number,      // Nombre de filtres personnalisés actuels
    max: number,          // Limite selon le plan
    remaining: number,
    plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE'
  },
  usage: {
    totalClassifications: number,
    filtersCount: number,
    defaultFiltersCount: number,
    customFiltersCount: number,
    mostUsedFilter: {
      name: string,
      key: string,
      count: number
    } | null
  },
  filters: FilterUsageStat[]
}
```

#### 6. **POST /api/filters/detect** - Tester la détection (optionnel pour prévisualisation)
```typescript
Body: {
  subject: string,
  content: string
}

Response: {
  success: true,
  detectedFilters: FilterMatch[],
  primaryFilter: FilterMatch,
  confidence: number
}
```

---

## 🎨 SPÉCIFICATIONS UI/UX

### **Layout Principal**

Dans **app/mail-center/page.tsx**, section "Configuration IA", ajouter un nouvel onglet :

```
Onglets actuels:
[ Instructions ] [ Réponses Automatiques ] [ Classifications ] [ FILTRES ] ← NOUVEAU
```

### **Vue d'ensemble des filtres**

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Statistiques                                              │
│ ┌──────────────┬──────────────┬──────────────┬─────────────┐│
│ │ Filtres      │ Personnalisés│ Utilisations │ Plus utilisé││
│ │ 8 / 8        │ 3 / 5        │ 247          │ Urgent (89) ││
│ └──────────────┴──────────────┴──────────────┴─────────────┘│
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [+] Créer un filtre personnalisé (2 restants)           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Filtres de base (non supprimables)                          │
│ ┌─ Support technique ────────────────────────────────────┐  │
│ │ 🔧 Support technique                    [⚙️ Configurer] │  │
│ │ 47 utilisations • Détection: 7 mots-clés              │  │
│ └────────────────────────────────────────────────────────┘  │
│ ┌─ Questions commerciales ───────────────────────────────┐  │
│ │ 💰 Questions commerciales              [⚙️ Configurer] │  │
│ │ 32 utilisations • Détection: 7 mots-clés              │  │
│ └────────────────────────────────────────────────────────┘  │
│ ... (autres filtres de base)                                │
│                                                               │
│ Mes filtres personnalisés                                    │
│ ┌─ Urgences VIP ─────────────────────────────────────────┐  │
│ │ ⚡ Urgences VIP             [⚙️ Modifier] [🗑️ Supprimer]│  │
│ │ 12 utilisations • Détection: 5 mots-clés              │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **Modal de Configuration (Modification/Création)**

Quand l'utilisateur clique "Configurer" ou "Modifier" :

```
┌─────────────────────────────────────────────────────────────┐
│ Configuration du filtre "Support technique"           [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 📋 Informations générales                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Nom du filtre                                           │ │
│ │ [Support technique                                    ] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Description (optionnel)                                 │ │
│ │ [Questions techniques et problèmes à résoudre...      ] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ 🎨 Apparence                                                 │
│ Couleur: [🔵] [🟢] [🔴] [🟡] [🟣]    Icône: [Wrench ▼]       │
│                                                               │
│ 🔍 Détection automatique                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Mots-clés de détection                                  │ │
│ │ [bug] [×]  [erreur] [×]  [problème] [×]                │ │
│ │ [+ Ajouter un mot-clé]                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Mode de détection:                                           │
│ ( ) Au moins un mot-clé (ANY) ← Plus flexible              │
│ (•) Tous les mots-clés (ALL) ← Plus précis                 │
│                                                               │
│ ☑️ Sensible à la casse                                       │
│                                                               │
│ 🤖 Configuration des réponses IA                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Ton des réponses:                                        │ │
│ │ [Technique ▼] [Français ▼] [Priorité haute ▼]          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Instructions personnalisées pour l'IA (optionnel)       │ │
│ │ [Toujours demander les logs et la version du système...│ │
│ │                                                          ] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ☑️ Activer les réponses automatiques pour ce filtre         │
│                                                               │
│ 📊 Statistiques d'utilisation                               │
│ Utilisé 47 fois • Dernière utilisation: il y a 2 heures    │
│                                                               │
│               [Annuler]              [Enregistrer]           │
└─────────────────────────────────────────────────────────────┘
```

### **Modal de Création**

Identique au modal de configuration, mais :
- Titre : "Créer un nouveau filtre"
- Tous les champs vides par défaut
- Afficher en haut : "Filtres restants : X / Y (Plan PRO)"
- Si limite atteinte : désactiver le bouton [+] et afficher message "Passez au plan ENTERPRISE pour créer des filtres illimités"

---

## 🛠️ COMPOSANTS À CRÉER

### 1. **`<FiltersConfigTab />`** - Composant principal
**Fichier:** `components/filters-config-tab.tsx`

**Responsabilités:**
- Fetch `/api/filters` au chargement
- Fetch `/api/filters/limits` pour afficher statistiques et limites
- Afficher la liste des filtres (base + personnalisés)
- Bouton "Créer un filtre" (désactivé si limite atteinte)
- Ouvrir modal de config au clic sur un filtre

**Props:**
```typescript
interface FiltersConfigTabProps {
  isLightMode?: boolean;
}
```

### 2. **`<FilterCard />`** - Card pour afficher un filtre
**Fichier:** `components/filter-card.tsx`

**Props:**
```typescript
interface FilterCardProps {
  filter: UserFilter;
  isDefault: boolean;
  onConfigure: (filterId: string) => void;
  onDelete?: (filterId: string) => void; // Seulement si !isDefault
  isLightMode?: boolean;
}
```

**Affichage:**
- Badge couleur avec icône
- Nom du filtre
- Nombre d'utilisations
- Nombre de mots-clés
- Boutons : "Configurer" (toujours) + "Supprimer" (si personnalisé)

### 3. **`<FilterConfigModal />`** - Modal de configuration/création
**Fichier:** `components/filter-config-modal.tsx`

**Props:**
```typescript
interface FilterConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterId?: string; // Si édition, sinon création
  isDefault?: boolean; // Pour afficher warning si filtre de base
  onSave: () => void; // Callback après sauvegarde réussie
  isLightMode?: boolean;
}
```

**Sections:**
1. Informations générales (nom, description)
2. Apparence (couleur, icône)
3. Détection (mots-clés, règles, regex optionnel)
4. Configuration IA (ton, langue, instructions custom)
5. Statistiques (lecture seule)

**Validation:**
- Nom requis (min 3 caractères)
- Au moins 1 mot-clé de détection
- filter_key auto-généré depuis le nom (slugify)

### 4. **`<KeywordInput />`** - Input pour ajouter/supprimer mots-clés
**Fichier:** `components/keyword-input.tsx`

Tags interactifs avec bouton [×] pour supprimer, input pour ajouter.

**Props:**
```typescript
interface KeywordInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
}
```

---

## 📐 LIMITATIONS PAR PLAN

**Afficher clairement les limites:**

| Plan | Filtres personnalisés | Message |
|------|----------------------|---------|
| FREE | 0 | "Les filtres personnalisés nécessitent un plan PRO ou supérieur" |
| STARTER | 0 | "Les filtres personnalisés nécessitent un plan PRO ou supérieur" |
| PRO | 5 | "3 filtres restants (5 max)" |
| ENTERPRISE | ∞ | "Filtres illimités" |

**Gestion des erreurs 403:**
```typescript
if (response.status === 403) {
  const error = await response.json();
  toast.error(error.details.message);
  // Afficher modal upgrade plan
}
```

---

## 🎨 DESIGN SYSTEM

**Couleurs prédéfinies pour les filtres:**
```typescript
const FILTER_COLORS = [
  { name: 'Bleu', hex: '#3B82F6', class: 'bg-blue-500' },
  { name: 'Vert', hex: '#10B981', class: 'bg-green-500' },
  { name: 'Rouge', hex: '#EF4444', class: 'bg-red-500' },
  { name: 'Jaune', hex: '#F59E0B', class: 'bg-amber-500' },
  { name: 'Violet', hex: '#8B5CF6', class: 'bg-purple-500' },
  { name: 'Rose', hex: '#EC4899', class: 'bg-pink-500' },
  { name: 'Indigo', hex: '#6366F1', class: 'bg-indigo-500' },
  { name: 'Emeraude', hex: '#059669', class: 'bg-emerald-600' },
];
```

**Icônes Lucide recommandées:**
```typescript
import { 
  Filter, Wrench, DollarSign, AlertTriangle, HelpCircle, 
  Zap, Package, Users, Bell, Star, Flag, Heart, Tag
} from 'lucide-react';
```

**Animations:**
- Fade in pour les cards (stagger)
- Smooth slide pour le modal
- Bounce sur ajout de mot-clé
- Shake si limite atteinte

---

## 🔄 FLUX UTILISATEUR

### **Création d'un filtre:**
1. Clic sur [+ Créer un filtre personnalisé]
2. Vérification limite → si OK, ouvrir modal
3. Remplir formulaire
4. Clic [Enregistrer]
5. POST /api/filters
6. Si succès : toast + refresh liste
7. Si erreur 403 : afficher message upgrade plan

### **Modification d'un filtre:**
1. Clic sur [Configurer] dans FilterCard
2. Fetch `/api/filters/{id}` pour charger données actuelles
3. Pré-remplir le modal
4. Modifications utilisateur
5. Clic [Enregistrer]
6. PATCH `/api/filters/{id}`
7. Si succès : toast + refresh liste
8. Si filtre de base : afficher warning "Filtre de base non modifiable"

### **Suppression d'un filtre:**
1. Clic sur [Supprimer]
2. Confirmation modal : "Êtes-vous sûr de vouloir supprimer ce filtre ?"
3. DELETE `/api/filters/{id}`
4. Si succès : toast + refresh liste
5. Si filtre de base : erreur 403 (ne devrait pas arriver si UI correcte)

---

## 📱 RESPONSIVE

**Desktop (>1024px):**
- Grid 2 colonnes pour les filtres
- Modal pleine largeur (max 800px)

**Tablet (768px-1024px):**
- Grid 1 colonne
- Modal 90% largeur

**Mobile (<768px):**
- Liste verticale
- Modal fullscreen
- Sections collapsibles

---

## ✅ CHECKLIST DÉVELOPPEMENT

### Phase 1 - Structure de base
- [ ] Créer `<FiltersConfigTab />` avec fetch API
- [ ] Créer `<FilterCard />` avec design responsive
- [ ] Intégrer dans app/mail-center/page.tsx (nouvel onglet)
- [ ] Afficher statistiques depuis `/api/filters/limits`

### Phase 2 - Fonctionnalités CRUD
- [ ] Créer `<FilterConfigModal />` complet
- [ ] Implémenter formulaire création
- [ ] Implémenter formulaire modification
- [ ] Implémenter suppression avec confirmation

### Phase 3 - UX avancée
- [ ] Créer `<KeywordInput />` avec tags
- [ ] Ajouter sélecteur de couleurs
- [ ] Ajouter sélecteur d'icônes
- [ ] Gérer états de chargement (skeleton)

### Phase 4 - Gestion des limites
- [ ] Afficher compteur filtres restants
- [ ] Désactiver bouton création si limite atteinte
- [ ] Modal upgrade plan si FREE/STARTER
- [ ] Gérer erreurs 403 avec messages clairs

### Phase 5 - Finitions
- [ ] Animations Framer Motion
- [ ] Mode clair/sombre
- [ ] Messages de succès/erreur (toast)
- [ ] Tests responsive
- [ ] Validation formulaires (Zod)

---

## 🚀 EXEMPLE DE CODE DE DÉPART

```typescript
// components/filters-config-tab.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FilterCard } from './filter-card';
import { FilterConfigModal } from './filter-config-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Filter {
  id: string;
  name: string;
  is_default: boolean;
  usage_count: number;
  keywords: string[];
  // ... autres champs
}

export function FiltersConfigTab({ isLightMode = false }) {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [limits, setLimits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);

  const loadFilters = async () => {
    try {
      const [filtersRes, limitsRes] = await Promise.all([
        fetch('/api/filters'),
        fetch('/api/filters/limits'),
      ]);

      const filtersData = await filtersRes.json();
      const limitsData = await limitsRes.json();

      setFilters(filtersData.filters);
      setLimits(limitsData.limits);
    } catch (error) {
      toast.error('Erreur lors du chargement des filtres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  const handleCreate = () => {
    if (!limits?.canCreate) {
      toast.error(
        limits?.plan === 'PRO' 
          ? `Limite atteinte (${limits.max} max)`
          : 'Passez au plan PRO pour créer des filtres personnalisés'
      );
      return;
    }
    setSelectedFilterId(null);
    setModalOpen(true);
  };

  const handleConfigure = (filterId: string) => {
    setSelectedFilterId(filterId);
    setModalOpen(true);
  };

  const handleDelete = async (filterId: string) => {
    if (!confirm('Supprimer ce filtre ?')) return;

    try {
      const res = await fetch(`/api/filters/${filterId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Filtre supprimé');
        loadFilters();
      } else {
        const error = await res.json();
        toast.error(error.error);
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const defaultFilters = filters.filter(f => f.is_default);
  const customFilters = filters.filter(f => !f.is_default);

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      {limits && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Filtres totaux" value={filters.length} />
          <StatCard label="Personnalisés" value={`${limits.current} / ${limits.max}`} />
          {/* ... autres stats */}
        </div>
      )}

      {/* Bouton création */}
      <Button 
        onClick={handleCreate} 
        disabled={!limits?.canCreate}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Créer un filtre personnalisé
        {limits && ` (${limits.remaining} restants)`}
      </Button>

      {/* Filtres de base */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Filtres de base</h3>
        <div className="grid gap-3">
          {defaultFilters.map(filter => (
            <FilterCard
              key={filter.id}
              filter={filter}
              isDefault={true}
              onConfigure={handleConfigure}
              isLightMode={isLightMode}
            />
          ))}
        </div>
      </div>

      {/* Filtres personnalisés */}
      {customFilters.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Mes filtres personnalisés</h3>
          <div className="grid gap-3">
            {customFilters.map(filter => (
              <FilterCard
                key={filter.id}
                filter={filter}
                isDefault={false}
                onConfigure={handleConfigure}
                onDelete={handleDelete}
                isLightMode={isLightMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <FilterConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        filterId={selectedFilterId}
        onSave={() => {
          loadFilters();
          setModalOpen(false);
        }}
        isLightMode={isLightMode}
      />
    </div>
  );
}
```

---

## 📚 RESSOURCES TECHNIQUES

**Types TypeScript:**
```typescript
interface UserFilter {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  is_default: boolean;
  filter_key: string;
  keywords: string[];
  detection_rules: {
    matchMode: 'any' | 'all';
    caseSensitive: boolean;
    regexPatterns?: string[];
    excludeKeywords?: string[];
  };
  response_config: {
    tone: 'pro' | 'cordial' | 'empathique' | 'technique';
    language: 'fr' | 'en';
    customInstructions?: string;
    responseTemplate?: string;
    autoReplyEnabled?: boolean;
    priorityLevel: 'high' | 'normal' | 'low';
  };
  usage_count: number;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**Bibliothèques recommandées:**
- **UI:** shadcn/ui (déjà installé)
- **Forms:** react-hook-form + zod
- **Animations:** framer-motion (déjà installé)
- **Icons:** lucide-react (déjà installé)
- **Toast:** sonner (déjà installé)

---

## 🎯 RÉSULTAT ATTENDU

Un système de filtres totalement intégré permettant :
- ✅ Gestion complète des filtres personnalisés
- ✅ Configuration avancée de la détection IA
- ✅ Respect des limites par plan
- ✅ UX fluide et intuitive
- ✅ Design cohérent avec le reste de l'app
- ✅ Responsive mobile/tablet/desktop

**Questions ? Consulte la documentation backend dans `/app/api/filters/` ou demande à l'ingénieur backend pour clarifications.**

---

Bon développement ! 🚀
