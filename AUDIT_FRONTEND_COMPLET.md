# 📊 AUDIT FRONTEND COMPLET — IA mailcenter / MailWizard

**Date:** 7 novembre 2025  
**Auteur:** Lead Frontend Engineer + UI/UX Developer  
**Scope:** Refonte complète frontend + Review backend  

---

## 📋 RÉSUMÉ EXÉCUTIF

### Projet analysé
- **Nom:** IA mailcenter / MailWizard
- **Tech Stack:** Next.js 13.5 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion
- **État actuel:** MVP fonctionnel avec animations de base, 204 composants TSX, backend Supabase opérationnel
- **Objectif:** Transformer en expérience web premium avec animations raffinées et surprenantes

### Verdict global
✅ **Base solide** — Architecture propre, composants modulaires, design system cohérent  
⚠️ **Animations basiques** — Framer Motion présent mais animations limitées, pas de GSAP ni Lottie  
⚠️ **Responsive perfectible** — Breakpoints définis mais optimisations mobile manquantes  
❌ **Pas de Storybook** — Documentation composants inexistante  
❌ **Tests E2E manquants** — Aucun test Playwright/Cypress détecté  

---

## 1️⃣ AUDIT TECHNIQUE DÉTAILLÉ

### 1.1 Tech Stack Actuel

#### ✅ Points forts
```json
{
  "framework": "Next.js 13.5 (App Router) — Moderne et performant",
  "ui_library": "shadcn/ui — 48 composants Radix UI préconstruits",
  "styling": "Tailwind CSS 3.3 + CSS variables — Design tokens structurés",
  "animations": "Framer Motion 12.x — Présent mais sous-exploité",
  "3d": "@react-three/fiber + drei — Support Three.js ready",
  "forms": "React Hook Form + Zod — Validation robuste",
  "state": "TanStack Query v5 — Gestion serveur state optimale",
  "auth": "NextAuth v4 + Google OAuth — Sécurisé",
  "payments": "Stripe — Intégration complète",
  "database": "Supabase (PostgreSQL) — RLS activé",
  "ai": "OpenAI GPT-4o-mini — Génération emails fonctionnelle"
}
```

#### ⚠️ Manques critiques
```diff
- ❌ GSAP (animations complexes et timeline-based)
- ❌ Lottie (micro-animations et assets animés)
- ❌ Storybook (catalogue composants)
- ❌ Playwright/Cypress (tests E2E)
- ❌ Lighthouse CI (monitoring performance)
- ⚠️ Reduced-motion support incomplet
- ⚠️ i18n structure présente mais non implémentée
```

### 1.2 Structure de Fichiers

```
project/
├── app/                              # ✅ App Router Next.js 13
│   ├── page.tsx                      # ✅ Homepage avec ClarityHero
│   ├── layout.tsx                    # ✅ RootLayout + metadata SEO
│   ├── globals.css                   # ✅ CSS vars + animations custom
│   ├── api/                          # ✅ 108 routes API (auth, AI, billing, etc.)
│   ├── auth/                         # ⚠️ Basique (login/signup manquants)
│   ├── contact/                      # ✅ Page contact fonctionnelle
│   ├── dashboard/                    # ✅ 6 pages (analytics, templates, etc.)
│   └── mail-center/                  # ✅ Centre de gestion emails
├── components/                       # ✅ 204 composants TSX
│   ├── ui/                           # ✅ 48 composants shadcn/ui
│   ├── home/                         # ✅ 16 composants page accueil
│   │   ├── ClarityHero.tsx           # ✅ Hero avec parallax + particles
│   │   ├── BentoFeatures.tsx         # ✅ Grid features + TiltCard
│   │   ├── ClarityPricing.tsx        # ✅ Pricing plans
│   │   └── ClarityFaq.tsx            # ✅ FAQ accordéon
│   ├── AnimatedBackground.tsx        # ✅ Fond animé basique
│   ├── CustomCursor.tsx              # ✅ Curseur custom
│   ├── Dock.tsx                      # ✅ macOS-style dock
│   └── providers.tsx                 # ✅ Context providers (auth, theme, query)
├── lib/                              # ✅ 18 fichiers utils
│   ├── ai.ts                         # ✅ OpenAI service
│   ├── auth.ts                       # ✅ NextAuth config
│   ├── db.ts                         # ✅ Supabase client
│   ├── stripe.ts                     # ✅ Stripe SDK
│   └── gmail-helpers.ts              # ✅ Gmail/Outlook intégration
├── tailwind.config.ts                # ✅ Design tokens + breakpoints
└── tsconfig.json                     # ✅ TypeScript strict mode
```

**Statistiques:**
- 📄 **204 fichiers .tsx** (composants React)
- 🎨 **12 fichiers .css** (styles custom + Dock, ProfileCard)
- 🔌 **108 routes API** (backend complet)
- 📦 **89 dépendances** npm

### 1.3 Palette de Couleurs (Design System)

#### Thème clair (Light Mode)
```css
:root {
  /* Couleurs primaires — CONSERVER */
  --background: 41 42% 92%;           /* Beige clair #E8E2D0 */
  --foreground: 30 17% 27%;           /* Brun foncé #6B4F3A */
  --primary: 168 57% 28%;             /* Vert nature #1E6F5C */
  --primary-foreground: 0 0% 98%;     /* Blanc cassé */
  
  /* Couleurs secondaires */
  --secondary: 41 42% 92%;            /* Beige */
  --muted: 41 32% 85%;                /* Beige clair */
  --accent: 168 57% 28%;              /* Vert (=primary) */
  
  /* UI States */
  --destructive: 0 84.2% 60.2%;       /* Rouge */
  --border: 41 32% 85%;               /* Beige border */
  --input: 41 32% 85%;                /* Input bg */
  --ring: 168 57% 28%;                /* Focus ring vert */
  
  /* Charts */
  --chart-1: 168 57% 28%;             /* Vert */
  --chart-2: 41 42% 70%;              /* Beige moyen */
  --chart-3: 30 17% 50%;              /* Brun moyen */
  --chart-4: 168 40% 45%;             /* Vert clair */
  --chart-5: 41 60% 60%;              /* Beige saturé */
}
```

#### Thème sombre (Dark Mode)
```css
.dark {
  --background: 215 25% 17%;          /* Gris-bleu foncé #2C2F33 */
  --foreground: 41 42% 92%;           /* Beige clair (texte) */
  --primary: 168 57% 35%;             /* Vert plus clair */
  --secondary: 215 15% 25%;           /* Gris foncé */
  --muted: 215 15% 25%;
  --accent: 168 57% 35%;
  --destructive: 0 62.8% 50%;
  --border: 215 15% 25%;
  --input: 215 15% 25%;
  --ring: 168 57% 40%;
}
```

**Note:** ✅ **Palette cohérente et élégante** — À conserver intégralement.  
**Recommandation:** Ajouter tokens pour gradients (primary-gradient, accent-gradient) et glassmorphism (backdrop-blur).

### 1.4 Breakpoints Responsive

```typescript
// tailwind.config.ts
screens: {
  'xxs': '320px',    // ⚠️ Bon pour old devices mais peu utilisé
  'xs': '375px',     // ✅ iPhone SE, petits mobiles
  'sm': '640px',     // ✅ Mobiles landscape
  'md': '768px',     // ✅ Tablettes portrait
  'lg': '1024px',    // ✅ Tablettes landscape / petits laptops
  'xl': '1280px',    // ✅ Desktop standard
  '2xl': '1536px',   // ✅ Large desktop
  '3xl': '1920px',   // ⚠️ Peu utilisé
  '4xl': '2560px',   // ⚠️ Peu utilisé
}
```

**Audit:** Classes responsives (`sm:`, `md:`, `lg:`) présentes mais **inconsistantes**. Nécessite refactoring mobile-first systématique.

---

## 2️⃣ ANALYSE DES COMPOSANTS EXISTANTS

### 2.1 Composants Home (/components/home/)

| Composant | État | Animations | Responsive | A Refondre |
|-----------|------|------------|------------|-----------|
| `ClarityHero.tsx` | ✅ Bon | ⚠️ Basique (parallax simple, particles) | ⚠️ Moyen | 🔄 Oui — Ajout GSAP morphing + Lottie |
| `BentoFeatures.tsx` | ✅ Bon | ⚠️ Hover + gradient following mouse | ✅ Bon | 🔄 Oui — Animations au scroll GSAP |
| `ClarityPricing.tsx` | ✅ Bon | ⚠️ Hover scale | ✅ Bon | ✅ Conserver + polish |
| `ClarityFaq.tsx` | ✅ Bon | ✅ Accordéon Radix | ✅ Bon | ✅ Conserver |
| `ProofSection.tsx` | ⚠️ Moyen | ❌ Aucune | ⚠️ Moyen | 🔄 Oui — Testimonials avec fade-in |
| `SmoothScroll.tsx` | ✅ Bon | ✅ Lenis smooth scroll | ✅ N/A | ✅ Conserver |
| `TiltCard.tsx` | ✅ Excellent | ✅ 3D tilt effect | ✅ Bon | ✅ Conserver + réutiliser |
| `MagneticButton.tsx` | ✅ Excellent | ✅ Magnetic hover | ✅ Bon | ✅ Conserver + réutiliser |
| `CustomCursor.tsx` | ✅ Bon | ✅ Follow mouse | ⚠️ Desktop only | ⚠️ Optionnel mobile |

**Recommandations:**
- ✅ **Conserver:** TiltCard, MagneticButton, SmoothScroll, CustomCursor
- 🔄 **Refondre:** ClarityHero (ajouter GSAP timeline), BentoFeatures (scroll reveal), ProofSection (testimonials carousel)
- ❌ **Supprimer:** HyperluminaScene, PricingOrbit, ProofOfMagic (trop complexes, non utilisés)

### 2.2 Composants UI shadcn/ui (/components/ui/)

✅ **48 composants** Radix UI déjà installés — **Excellente base**.

| Composant | Usage actuel | Améliorations |
|-----------|-------------|---------------|
| Button | ✅ Utilisé partout | Ajouter variantes : magnetic, glow, gradient |
| Card | ✅ Utilisé partout | Ajouter effet glassmorphism, shimmer |
| Dialog | ✅ Modales auth, upgrade | Ajouter animations entry/exit GSAP |
| Input/Textarea | ✅ Forms | Ajouter floating labels, micro-interactions |
| Select | ✅ Dropdown menus | Ajouter animations smooth |
| Tabs | ✅ Dashboard | Ajouter active indicator animation |
| Accordion | ✅ FAQ | ✅ Déjà animé (Radix) |
| Skeleton | ✅ Loaders | Ajouter shimmer effect |
| Toast (Sonner) | ✅ Notifications | ✅ Déjà excellent |

**Action:** Créer des **variantes améliorées** pour Button, Card, Input avec animations GSAP.

### 2.3 Pages existantes

| Page | Route | État | À refondre |
|------|-------|------|-----------|
| Home | `/` | ✅ Bon | 🔄 Polish animations |
| Dashboard | `/dashboard` | ✅ Complet | 🔄 Simplifier UI, add micro-animations |
| Mail Center | `/mail-center` | ✅ Fonctionnel | 🔄 Refonte UX complète |
| Contact | `/contact` | ✅ Bon | ✅ Conserver |
| Templates | `/dashboard/templates` | ✅ Bon | 🔄 Add preview animations |
| Pricing | `/dashboard/pricing` | ✅ Bon | ✅ Conserver |
| Settings | `/dashboard/settings` | ✅ Bon | 🔄 Add toggle animations |
| Analytics | `/dashboard/analytics` | ✅ Bon | 🔄 Charts animations (Chart.js/Recharts) |

**Pages manquantes (à créer):**
- ❌ `/auth/login` — Page login standalone
- ❌ `/auth/signup` — Page signup standalone
- ❌ `/auth/reset-password` — Reset password
- ❌ `/blog` — Blog listing
- ❌ `/blog/[slug]` — Article détail
- ❌ `/legal` — Mentions légales
- ❌ `/privacy` — Politique de confidentialité
- ❌ `/404` — Page 404 custom
- ❌ `/500` — Page 500 custom

### 2.4 API Routes (Backend)

✅ **108 routes API** détectées — Backend **complet et fonctionnel**.

**Catégories:**
- ✅ `/api/auth/*` — NextAuth (Google OAuth)
- ✅ `/api/ai/*` — Génération emails (OpenAI)
- ✅ `/api/templates/*` — CRUD templates
- ✅ `/api/history/*` — Historique emails
- ✅ `/api/usage/*` — Quotas utilisateur
- ✅ `/api/billing/*` — Stripe checkout/portal
- ✅ `/api/stripe/webhook` — Webhooks Stripe
- ✅ `/api/gmail/*` — Gmail OAuth + envoi
- ✅ `/api/outlook/*` — Outlook OAuth + envoi
- ✅ `/api/mail-center/*` — Sync emails, analyse IA
- ✅ `/api/contact` — Formulaire contact
- ✅ `/api/variables` — Variables personnalisées
- ✅ `/api/signatures` — Signatures emails

**Audit sécurité rapide:**
- ✅ Rate limiting présent (`lib/rate-limit.ts`)
- ✅ Validation Zod sur inputs
- ✅ RLS Supabase activé
- ✅ NextAuth sessions JWT
- ✅ CSP headers configurés (`next.config.js`)
- ⚠️ Tokens chiffrés AES-256 (vérifier ENCRYPTION_KEY en prod)

**Actions backend:**
- ✅ Backend **fonctionnel à 95%**
- 🔄 Créer OpenAPI/Swagger doc
- 🔄 Ajouter tests d'intégration (Vitest)
- 🔄 Monitoring erreurs (Sentry)

---

## 3️⃣ PROPOSITION DE 3 WIREFRAMES (Page d'accueil)

### Wireframe A — "Hyperlumina" (Avant-gardiste)

**Concept:** Immersion totale, animations 3D Three.js, scène interactive.

**Structure:**
```
┌─────────────────────────────────────────┐
│  [Logo]    Features  Pricing  Contact  │  ← Nav transparente, backdrop-blur
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│                                         │
│     ┌─ Scene Three.js interactive ─┐   │  ← Sphères lumineuses 3D qui suivent
│     │  "Votre centre de gestion    │   │     la souris, particules WebGL
│     │   intelligent des emails"    │   │
│     │                               │   │  ← CTA: Bouton magnétique géant
│     │  [Essayer gratuitement ➔]    │   │
│     └───────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Features: Bento Grid avec TiltCards    │  ← GSAP ScrollTrigger reveal
│  ┌───┐ ┌───┐ ┌───┐                     │
│  │ 1 │ │ 2 │ │ 3 │ ...                 │  ← Chaque card: Lottie icon + hover 3D
│  └───┘ └───┘ └───┘                     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Pricing: Orbital Pricing Rings         │  ← Plans en orbite circulaire animée
│     ○ FREE    ● PRO    ○ ENTERPRISE     │
└─────────────────────────────────────────┘
```

**Animations clés:**
- Hero: Scene Three.js avec shaders custom, morphing géométrique au scroll
- Features: Cards apparaissent en "wave" avec GSAP stagger
- Pricing: Rotation orbitale continue (CSS transform 3D)

**Pros:** 🎯 Très impactant, mémorable, "wow effect" garanti  
**Cons:** ⚠️ Performance lourde (WebGL), accessibilité complexe, temps de dev +30%

---

### Wireframe B — "Clarity" (Minimaliste raffiné) ⭐ **RECOMMANDÉ**

**Concept:** Simplicité élégante, micro-animations subtiles, focus sur la lisibilité.

**Structure:**
```
┌─────────────────────────────────────────┐
│  [Logo]    Features  Pricing  Contact  │  ← Nav fixe, glassmorphism
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│                                         │
│   🎯 Votre centre de gestion           │  ← Titre: Gradient text animé
│      intelligent des emails.           │     (couleurs qui circulent)
│                                         │
│   "Centralisez Gmail & Outlook,        │  ← Sous-titre fade-in staggered
│    générez avec l'IA, automatisez."    │
│                                         │
│   [Essayer gratuitement ➔]  [Démo ▶]   │  ← CTA: Magnetic button + ripple
│                                         │
│   ┌─────────────────────────────┐      │  ← Mockup: Perspective + glow
│   │  [Aperçu interface]         │      │     Floating UI elements animés
│   │  🎨 Screenshot mailcenter   │      │
│   └─────────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Features: Bento Grid propre            │  ← Grid 3 colonnes, scroll reveal
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │  ← Hover: Subtle lift + shadow
│  │ Mail AI │ │ Multi   │ │ Stats   │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Pricing: Cards horizontales            │  ← 3 plans côte à côte
│  [FREE]    [STARTER]    [PRO]           │  ← Plan populaire: Glow effect
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  FAQ: Accordéon simple                  │  ← Radix Accordion + icons
└─────────────────────────────────────────┘
```

**Animations clés:**
- Hero: Texte gradient avec background-position animé, mockup avec parallax layers
- Features: Cards reveal avec GSAP from bottom, hover avec scale + shadow smooth
- Pricing: Active plan avec pulse glow (keyframes CSS)
- Scroll: Smooth scroll Lenis + progress bar

**Pros:** ✅ Équilibre parfait, performance optimale, accessible, temps de dev raisonnable  
**Cons:** Moins spectaculaire que A

**Maquette HTML/CSS minimale (Clarity Hero):**
```html
<section class="hero">
  <h1 class="gradient-text">
    Votre centre de gestion intelligent des emails.
  </h1>
  <p class="subtitle">
    Centralisez Gmail & Outlook, générez avec l'IA, automatisez.
  </p>
  <div class="cta-group">
    <button class="btn-primary magnetic">
      Essayer gratuitement →
    </button>
    <button class="btn-ghost">Démo ▶</button>
  </div>
  <div class="mockup-container">
    <div class="mockup-window glow-box">
      <img src="/mockup.png" alt="Interface" />
      <div class="floating-ui">💬</div>
    </div>
  </div>
</section>

<style>
.gradient-text {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-flow 5s ease infinite;
}
@keyframes gradient-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.magnetic { transition: transform 0.2s; }
.magnetic:hover { transform: translateY(-2px) scale(1.05); }
.glow-box {
  box-shadow: 0 0 40px rgba(59, 130, 246, 0.3);
  animation: glow-pulse 3s ease-in-out infinite;
}
</style>
```

---

### Wireframe C — "Aurora" (Éléments fluides)

**Concept:** Formes organiques, blobs morphing, gradients mesh, ambiance moderne.

**Structure:**
```
┌─────────────────────────────────────────┐
│  [Logo]    Features  Pricing  Contact  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│   ∿∿∿  Blobs animés en fond  ∿∿∿       │  ← Gradient mesh animé (CSS/SVG)
│                                         │
│     Centralisez vos emails.            │  ← Texte sur fond fluide
│     Automatisez tout.                  │
│                                         │
│     [Commencer →]                      │
│                                         │
│   ┌─────────────────────────────┐      │  ← Mockup flottant avec ombres
│   │  Interface mailcenter       │      │     colorées (drop-shadow multi)
│   └─────────────────────────────┘      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Features: Cards avec gradient borders  │  ← Border-image-gradient animé
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
└─────────────────────────────────────────┘
```

**Animations clés:**
- Hero: SVG blobs morphing (GSAP MorphSVG), gradients qui se déplacent
- Features: Cards avec border gradient rotatif (conic-gradient animé)
- Global: Couleurs fluides, transitions douces

**Pros:** 🎨 Très design, moderne, "fluide"  
**Cons:** ⚠️ Peut sembler trop "trendy", nécessite beaucoup de polish

---

### Choix recommandé : **Wireframe B "Clarity"** ⭐

**Justification:**
- ✅ Équilibre parfait élégance/performance
- ✅ Accessible (WCAG AA facile à atteindre)
- ✅ Maintenable (pas de complexité 3D)
- ✅ Animations raffinées mais subtiles
- ✅ Mobile-first naturel
- ✅ Temps de dev optimal (2-3 semaines)

---

## 4️⃣ LISTE COMPLÈTE DES COMPOSANTS À DÉVELOPPER

### 4.1 Composants UI de base (réutilisables)

| Composant | Variantes | Animations | Priorité |
|-----------|-----------|------------|----------|
| **Button** | default, magnetic, gradient, glow, ghost, outline | Hover: scale + ripple, Press: squash, Loading: spinner | 🔴 P0 |
| **Card** | default, glassmorphism, shimmer, tilt, hoverglow | Hover: lift + shadow, Appear: slide-up | 🔴 P0 |
| **Input** | default, floating-label, icon-left, icon-right | Focus: ring pulse, Error shake | 🔴 P0 |
| **Modal** | default, fullscreen, drawer, alert | Entry: scale + fade, Exit: slide-down | 🟡 P1 |
| **Navbar** | transparent, solid, blur | Scroll: blur + shrink, Active: underline slide | 🔴 P0 |
| **Footer** | default, minimal | Links: hover slide-right | 🟡 P1 |
| **Loader** | spinner, skeleton, progress | Shimmer effect, Pulse | 🔴 P0 |
| **Badge** | default, glow, animated | Pulse pour notifications | 🟢 P2 |

### 4.2 Composants Home

| Composant | Description | Animations GSAP/Lottie | Priorité |
|-----------|-------------|------------------------|----------|
| **Hero** | Section principale avec CTA | Timeline: titre split reveal, mockup parallax, particles Lottie | 🔴 P0 |
| **FeaturesBento** | Grid 3×3 features | ScrollTrigger: stagger reveal, hover: tilt 3D | 🔴 P0 |
| **PricingCards** | 3 plans tarifaires | Hover: glow + scale, Popular: pulse border | 🔴 P0 |
| **TestimonialsCarousel** | Avis clients défilants | Auto-scroll smooth, Hover: pause | 🟡 P1 |
| **FaqAccordion** | Questions fréquentes | Radix Accordion + icons rotate | 🟡 P1 |
| **StatsCounter** | Chiffres clés animés | CountUp on scroll | 🟢 P2 |
| **CtaSection** | Call-to-action final | Gradient background animé | 🟡 P1 |

### 4.3 Composants Dashboard

| Composant | Description | Animations | Priorité |
|-----------|-------------|----------|----------|
| **Sidebar** | Navigation latérale | Collapse: width smooth, Active: slide indicator | 🔴 P0 |
| **UsageCard** | Quota utilisateur | Progress bar fill, Warning pulse | 🔴 P0 |
| **EmailEditor** | Éditeur WYSIWYG | Toolbar appear, Autosave indicator | 🔴 P0 |
| **TemplateCard** | Card template | Hover: preview, Click: modal detail | 🟡 P1 |
| **AnalyticsChart** | Graphiques Recharts | Data enter: stagger bars, Tooltip smooth | 🟡 P1 |
| **HistoryList** | Liste emails générés | Infinite scroll, Delete: swipe | 🟡 P1 |

### 4.4 Composants Authentification

| Composant | Description | Animations | Priorité |
|-----------|-------------|----------|----------|
| **LoginForm** | Formulaire connexion | Field focus: scale, Submit: loading | 🔴 P0 |
| **SignupForm** | Formulaire inscription | Steps wizard, Progress bar | 🔴 P0 |
| **ResetPasswordForm** | Réinitialisation mdp | Success: checkmark Lottie | 🟡 P1 |
| **OAuthButtons** | Boutons Google/Outlook | Hover: brand colors gradient | 🔴 P0 |

### 4.5 Composants Pages d'erreur

| Composant | Description | Animations | Priorité |
|-----------|-------------|----------|----------|
| **Error404** | Page 404 custom | Lottie 404 animation, CTA bounce | 🟡 P1 |
| **Error500** | Page 500 custom | Lottie erreur serveur, Retry button pulse | 🟡 P1 |

### 4.6 Composants utilitaires

| Composant | Description | Animations | Priorité |
|-----------|-------------|----------|----------|
| **SmoothScroll** | Wrapper Lenis | Smooth scroll global | 🔴 P0 |
| **ScrollProgress** | Barre progression scroll | Fill smooth, Sticky top | 🟢 P2 |
| **CookieBanner** | RGPD cookies | Slide-up from bottom | 🟡 P1 |
| **NewsletterPopup** | Popup inscription newsletter | Delay 10s, Exit intent | 🟢 P2 |
| **ToTopButton** | Bouton retour haut | Appear on scroll, Smooth scroll to top | 🟢 P2 |

---

## 5️⃣ ROADMAP D'IMPLÉMENTATION (20 tâches atomiques)

### Phase 1 : Setup & Foundation (Semaine 1)

1. **T1.1 — Installer GSAP + Lottie** ⏱️ 2h
   ```bash
   npm install gsap @gsap/react @lottiefiles/react-lottie-player
   ```
   Créer `/lib/gsap-config.ts` avec GSAP plugins (ScrollTrigger, ScrollSmoother, MorphSVG si license).

2. **T1.2 — Setup Storybook 7** ⏱️ 4h
   ```bash
   npx storybook@latest init
   ```
   Configurer `.storybook/main.ts` avec Tailwind, Next.js, dark mode addon.

3. **T1.3 — Créer Design Tokens** ⏱️ 3h
   Fichier `/lib/design-tokens.ts`:
   ```typescript
   export const tokens = {
     colors: { /* HSL vars */ },
     spacing: { /* rem scale */ },
     typography: { /* font sizes */ },
     animations: {
       durations: { fast: 200, normal: 300, slow: 500 },
       easings: { smooth: [0.22, 1, 0.36, 1], bounce: [0.68, -0.55, 0.265, 1.55] }
     }
   };
   ```

4. **T1.4 — Audit accessibilité actuel** ⏱️ 2h
   - Lancer Lighthouse audit
   - Tester avec lecteur d'écran (NVDA/VoiceOver)
   - Lister violations WCAG AA

5. **T1.5 — Setup Playwright** ⏱️ 3h
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```
   Créer `/tests/e2e/home.spec.ts`, `/tests/e2e/auth.spec.ts`.

### Phase 2 : Composants UI Core (Semaine 2)

6. **T2.1 — Refondre Button** ⏱️ 4h
   Variantes: `magnetic`, `gradient`, `glow`.  
   Animations: hover scale, ripple effect, loading spinner.  
   Story: `Button.stories.tsx` avec tous les variants.

7. **T2.2 — Refondre Card** ⏱️ 4h
   Variantes: `glassmorphism`, `shimmer`, `tilt`.  
   Animations: hover lift, appear slide-up.  
   Story: `Card.stories.tsx`.

8. **T2.3 — Refondre Input/Textarea** ⏱️ 3h
   Ajouter floating labels, focus ring pulse, error shake.  
   Story: `Input.stories.tsx`.

9. **T2.4 — Créer Navbar refonte** ⏱️ 5h
   Transparent -> blur on scroll (GSAP ScrollTrigger).  
   Active link: underline slide animation.  
   Mobile: burger menu avec animations.  
   Story: `Navbar.stories.tsx`.

10. **T2.5 — Créer Footer refonte** ⏱️ 2h
    Links hover: slide-right animation.  
    Responsive columns.

### Phase 3 : Page Home Refonte (Semaine 3)

11. **T3.1 — Refondre Hero (Clarity)** ⏱️ 8h
    - Titre: gradient text animé (background-position)
    - CTA: MagneticButton réutilisé
    - Mockup: parallax layers (GSAP), floating UI elements (Lottie)
    - Particles: 40 particules avec depth (z-index), mouvement Brownian
    - Story: `Hero.stories.tsx`

12. **T3.2 — Refondre Features Bento** ⏱️ 6h
    - GSAP ScrollTrigger: reveal cards en stagger
    - Hover: TiltCard effet 3D
    - Icons: Lottie animations
    - Story: `FeaturesBento.stories.tsx`

13. **T3.3 — Refondre Pricing** ⏱️ 4h
    - Plan populaire: glow pulse animation
    - Hover: scale + shadow
    - CTA: magnetic button
    - Story: `PricingCards.stories.tsx`

14. **T3.4 — Créer Testimonials Carousel** ⏱️ 5h
    - Embla Carousel (déjà installé)
    - Auto-scroll smooth, pause on hover
    - Avatar avec Lottie quote icon
    - Story: `Testimonials.stories.tsx`

### Phase 4 : Pages Auth & Dashboard (Semaine 4)

15. **T4.1 — Créer page /auth/login** ⏱️ 4h
    - Form avec animations field focus
    - OAuth buttons avec brand colors
    - Error: shake animation
    - Story: `LoginPage.stories.tsx`

16. **T4.2 — Créer page /auth/signup** ⏱️ 4h
    - Multi-step wizard avec progress bar
    - Validation Zod en temps réel
    - Success: confetti Lottie
    - Story: `SignupPage.stories.tsx`

17. **T4.3 — Refondre Dashboard sidebar** ⏱️ 3h
    - Collapse animation smooth
    - Active item: slide indicator
    - Responsive: drawer mobile

18. **T4.4 — Refondre EmailEditor** ⏱️ 6h
    - Toolbar avec tooltips animés
    - Autosave indicator (pulse)
    - Export PDF: progress bar

### Phase 5 : Pages Support & Errors (Semaine 5)

19. **T5.1 — Créer pages Legal, Privacy, Blog** ⏱️ 6h
    - Layout markdown avec TOC
    - Scroll spy pour anchors
    - Copy link: toast feedback

20. **T5.2 — Créer pages 404 et 500** ⏱️ 4h
    - Lottie animations custom
    - CTA: retour home avec bounce
    - Story: `ErrorPages.stories.tsx`

### Phase 6 : Tests, Optimisation, Documentation (Semaine 6)

21. **T6.1 — Tests E2E Playwright** ⏱️ 8h
    - Flow: signup -> dashboard -> generate email -> save
    - Flow: login -> upgrade -> payment (mock Stripe)
    - Flow: contact form submit

22. **T6.2 — Optimisations performance** ⏱️ 6h
    - Lazy load components (React.lazy)
    - Code splitting routes
    - Image optimization (Next/Image)
    - Lighthouse score >= 90

23. **T6.3 — Accessibilité WCAG AA** ⏱️ 4h
    - Fix contrast ratios
    - Add aria-labels
    - Keyboard navigation test
    - Reduced-motion support

24. **T6.4 — Documentation finale** ⏱️ 4h
    - Storybook published (Chromatic ou GitHub Pages)
    - README.md mis à jour
    - DEPLOYMENT_GUIDE.md

---

## 6️⃣ EXEMPLE DE PR BACKEND (Bug Critique Fictif)

**Titre PR:** `fix(api): Handle expired OAuth tokens gracefully`

**Description:**
```markdown
## 🐛 Bug Fix

Actuellement, si un token OAuth Gmail/Outlook expire, l'API `/api/mail-center/sync` 
crash avec une 500 au lieu de demander un refresh.

## 🔧 Changes

### Fichiers modifiés:
- `lib/gmail-helpers.ts` — Ajouter `refreshTokenIfNeeded()`
- `lib/outlook-helpers.ts` — Idem pour Outlook
- `app/api/mail-center/sync/route.ts` — Wrapper try/catch + refresh

### Diff illustratif:

```diff
// lib/gmail-helpers.ts
+async function refreshTokenIfNeeded(userId: string) {
+  const { data: account } = await supabase
+    .from('mail_accounts')
+    .select('access_token, refresh_token, token_expires_at')
+    .eq('user_id', userId)
+    .single();
+
+  if (!account || !account.refresh_token) {
+    throw new Error('No refresh token found');
+  }
+
+  const expiresAt = new Date(account.token_expires_at);
+  if (expiresAt > new Date()) {
+    return account.access_token; // Token still valid
+  }
+
+  // Refresh token
+  const oauth2Client = new google.auth.OAuth2(
+    process.env.GOOGLE_CLIENT_ID,
+    process.env.GOOGLE_CLIENT_SECRET
+  );
+  oauth2Client.setCredentials({ refresh_token: account.refresh_token });
+  const { credentials } = await oauth2Client.refreshAccessToken();
+
+  // Update DB
+  await supabase
+    .from('mail_accounts')
+    .update({
+      access_token: encrypt(credentials.access_token!),
+      token_expires_at: new Date(credentials.expiry_date!).toISOString(),
+    })
+    .eq('user_id', userId);
+
+  return credentials.access_token;
+}

 export async function fetchGmailEmails(userId: string) {
-  const { data: account } = await supabase...
-  const gmail = google.gmail({ version: 'v1', auth: ... });
+  const accessToken = await refreshTokenIfNeeded(userId);
+  const oauth2Client = new google.auth.OAuth2();
+  oauth2Client.setCredentials({ access_token: accessToken });
+  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
   
   // ...rest of code
 }
```

### Tests ajoutés:
```typescript
// tests/api/mail-center-sync.test.ts
describe('POST /api/mail-center/sync', () => {
  it('should refresh expired token automatically', async () => {
    // Mock expired token
    const expiredToken = { expires_at: '2024-01-01' };
    // ...test logic
    expect(response.status).toBe(200);
    expect(mockRefreshToken).toHaveBeenCalled();
  });
});
```

## ✅ Checklist

- [x] Code compilé sans erreurs TypeScript
- [x] Tests ajoutés et passent
- [x] Testé manuellement avec token expiré
- [x] Documentation mise à jour (README)
- [x] Commit message suit convention (`fix(api): ...`)

## 📸 Capture d'écran

[Avant] 500 Error  
[Après] Sync réussit après refresh automatique
```

**Commit messages:**
```
fix(api): Add OAuth token refresh for Gmail
fix(api): Add OAuth token refresh for Outlook
test(api): Add tests for expired token handling
docs(api): Update API docs with token refresh behavior
```

---

## 7️⃣ CHECKLIST D'ACCEPTATION FINALE

### Frontend

- [ ] **Lighthouse >= 90** (Desktop & Mobile)
  - [ ] Performance >= 90
  - [ ] Accessibility >= 95
  - [ ] Best Practices >= 95
  - [ ] SEO >= 95
- [ ] **WCAG AA** conformance
  - [ ] Contrast ratios >= 4.5:1
  - [ ] Keyboard navigation full
  - [ ] Screen reader tested (NVDA/VoiceOver)
  - [ ] Focus visible sur tous les interactifs
- [ ] **Responsive** tested
  - [ ] Mobile 360px, 375px, 414px
  - [ ] Tablet 768px, 1024px
  - [ ] Desktop 1280px, 1920px
- [ ] **Animations**
  - [ ] GSAP timelines sur Hero
  - [ ] Lottie icons sur Features
  - [ ] Scroll reveal (GSAP ScrollTrigger)
  - [ ] Reduced-motion fallback
- [ ] **Composants Storybook**
  - [ ] 30+ stories publiées
  - [ ] Dark mode testé
  - [ ] Responsive variants
- [ ] **Tests E2E**
  - [ ] 10+ flows critiques couverts
  - [ ] CI passe à 100%
- [ ] **Performance**
  - [ ] Lazy loading activé
  - [ ] Code splitting effectif
  - [ ] Images optimisées (WebP/AVIF)
  - [ ] FCP < 1.8s, LCP < 2.5s

### Backend

- [ ] **API Documentation**
  - [ ] OpenAPI 3.0 spec complète
  - [ ] Exemples de requêtes/réponses
  - [ ] Codes d'erreur documentés
- [ ] **Tests d'intégration**
  - [ ] Auth flows tested
  - [ ] Payment flows tested (mock Stripe)
  - [ ] Email sync tested
- [ ] **Sécurité**
  - [ ] Rate limiting actif
  - [ ] HTTPS only en prod
  - [ ] Tokens chiffrés
  - [ ] CSP headers configurés
  - [ ] Audit npm (0 vulnérabilités high/critical)
- [ ] **Logs & Monitoring**
  - [ ] Pino logs structurés
  - [ ] Sentry (ou équivalent) configuré
  - [ ] Alertes sur erreurs 500

### Déploiement

- [ ] **CI/CD**
  - [ ] GitHub Actions configuré
  - [ ] Tests auto sur PR
  - [ ] Deploy auto sur merge main
- [ ] **Environnements**
  - [ ] Staging déployé (Vercel Preview)
  - [ ] Production déployée (Vercel)
  - [ ] Rollback possible
- [ ] **Variables d'environnement**
  - [ ] Toutes les vars en prod
  - [ ] Secrets sécurisés (Vercel Secrets)
- [ ] **Database**
  - [ ] Migrations appliquées
  - [ ] Backups configurés
  - [ ] RLS vérifié

---

## 8️⃣ PROCHAINES ÉTAPES IMMÉDIATES

### Priorité 0 (Blocker) — Cette semaine

1. ✅ **Valider ce document** avec le client
2. 🔄 **Choisir wireframe** (recommandation: Clarity B)
3. 🔄 **Setup environnement**
   - Installer GSAP + Lottie
   - Configurer Storybook
   - Créer branch `refactor/frontend-2025`
4. 🔄 **Commencer T1 → T5**
   - Tokens design
   - Button refonte
   - Card refonte

### Priorité 1 — Semaines 2-3

5. 🔄 **Développer Hero + Features** (T3.1, T3.2)
6. 🔄 **Créer pages Auth** (T4.1, T4.2)
7. 🔄 **Tests E2E critiques**

### Priorité 2 — Semaines 4-6

8. 🔄 **Optimisations performance**
9. 🔄 **Documentation finale**
10. 🔄 **Déploiement staging**

---

## 📚 RESSOURCES & LIENS

### Documentation technique
- [Next.js App Router](https://nextjs.org/docs/app)
- [GSAP Docs](https://greensock.com/docs/)
- [Lottie React](https://github.com/LottieFiles/lottie-react)
- [Storybook 7](https://storybook.js.org/docs/react/get-started/install)
- [Playwright](https://playwright.dev/)

### Inspiration design
- [Awwwards](https://www.awwwards.com/websites/animation/)
- [Codrops](https://tympanus.net/codrops/)
- [Lottie Files](https://lottiefiles.com/)

### Accessibilité
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)

---

## 💬 QUESTIONS & CLARIFICATIONS

### Questions pour le client

1. **Budget animations:** Avez-vous une license GSAP Business (pour MorphSVG, DrawSVG) ?  
   → Si non, on utilisera les plugins gratuits uniquement.

2. **Assets Lottie:** Souhaitez-vous des animations Lottie custom (payant) ou bibliothèque gratuite ?

3. **Délai:** Quelle est la deadline ferme pour le déploiement en production ?

4. **Blog:** Le blog sera-t-il géré via CMS (Contentful, Strapi) ou fichiers markdown ?

5. **Multilingue:** Quelle priorité pour l'i18n (FR/EN) ? Phase 1 ou Phase 2 ?

---

**Document préparé par:** Lead Frontend Engineer  
**Date:** 7 novembre 2025  
**Version:** 1.0  
**Statut:** ✅ Prêt pour validation client
