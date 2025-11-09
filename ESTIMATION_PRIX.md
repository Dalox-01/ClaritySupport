# 💰 ESTIMATION DE PRIX - MAILWIZ (Site + Extension Chrome)

**Date d'estimation :** 1er novembre 2025  
**Projet :** MailWiz - Plateforme SaaS de génération d'emails par IA  
**Livrables :** Site web complet + Extension Chrome

---

## 📊 DÉCOMPOSITION DU PROJET

### 🎨 1. DESIGN & UI/UX

#### Page d'accueil (Landing Page)
- Hero section avec animations
- Section features (3-4 blocs)
- Section pricing (3 plans)
- Section testimonials
- Footer complet
- Navigation responsive
- **Temps estimé :** 12 heures
- **Prix :** 600€ (50€/h)

#### Dashboard principal
- Sidebar navigation avec animations
- Formulaire de génération multi-étapes
- Zone de résultat avec preview
- Dock panel avec 8 boutons animés
- Système de tabs (Générer/Reformuler)
- Modal d'envoi d'email
- Modal d'upgrade plan
- Système de thème dark/light
- Badge de plan utilisateur
- Indicateur de quota en temps réel
- **Temps estimé :** 20 heures
- **Prix :** 1 000€ (50€/h)

#### Composants UI réutilisables (shadcn/ui)
- 40+ composants personnalisés :
  - Buttons, Cards, Dialogs, Forms
  - Inputs, Selects, Checkboxes
  - Toast notifications, Tooltips
  - Skeleton loaders, Progress bars
  - Accordions, Tabs, etc.
- Animations CSS/Tailwind personnalisées
- Dock macOS-style avec magnification
- **Temps estimé :** 15 heures
- **Prix :** 750€ (50€/h)

#### Responsive Design
- Adaptation mobile/tablette de toutes les pages
- Menu burger mobile
- Layout adaptatif
- Touch interactions
- **Temps estimé :** 8 heures
- **Prix :** 400€ (50€/h)

**TOTAL DESIGN & UI/UX : 2 750€**

---

### ⚙️ 2. BACKEND & API

#### Architecture Next.js 13+ (App Router)
- Configuration projet Next.js
- Structure de fichiers optimisée
- Middleware personnalisé (CORS, auth)
- Route handlers API
- Server components
- **Temps estimé :** 6 heures
- **Prix :** 360€ (60€/h)

#### Système d'authentification
- NextAuth.js configuration complète
- OAuth Google
- OAuth GitHub (bonus)
- Protection des routes
- Sessions persistantes
- Gestion des tokens
- **Temps estimé :** 10 heures
- **Prix :** 600€ (60€/h)

#### API Routes (16 endpoints)
1. `/api/auth/[...nextauth]` - Authentication
2. `/api/ai/generate` - Génération email IA
3. `/api/emails/send` - Envoi email Resend
4. `/api/gmail/auth` - OAuth Gmail
5. `/api/gmail/callback` - Callback Gmail
6. `/api/gmail/send` - Envoi via Gmail API
7. `/api/outlook/auth` - OAuth Outlook
8. `/api/outlook/callback` - Callback Outlook
9. `/api/outlook/send` - Envoi via Outlook API
10. `/api/templates` - CRUD templates
11. `/api/templates/[id]` - Template spécifique
12. `/api/history` - Historique emails
13. `/api/history/[id]` - Email spécifique
14. `/api/usage` - Quota utilisateur
15. `/api/billing/checkout` - Stripe checkout
16. `/api/billing/portal` - Stripe portal
17. `/api/stripe/webhook` - Webhooks Stripe
18. `/api/extension/auth` - Auth extension
19. `/api/extension/generate` - Génération extension
20. `/api/extension/usage` - Usage extension

- **Temps estimé :** 25 heures
- **Prix :** 1 500€ (60€/h)

#### Intégration OpenAI
- Configuration client OpenAI
- Prompt engineering avancé
- Gestion des tokens
- Streaming (optionnel)
- Error handling
- Rate limiting
- **Temps estimé :** 8 heures
- **Prix :** 480€ (60€/h)

#### Intégration Gmail API
- OAuth 2.0 flow complet
- Envoi d'emails RFC 2822
- Gestion des tokens (refresh)
- Stockage sécurisé en DB
- **Temps estimé :** 6 heures
- **Prix :** 360€ (60€/h)

#### Intégration Outlook/Microsoft Graph API
- OAuth 2.0 Microsoft
- Création de brouillons
- Gestion des tokens
- Rafraîchissement automatique
- **Temps estimé :** 6 heures
- **Prix :** 360€ (60€/h)

#### Intégration Stripe
- Configuration produits/prix
- Checkout session
- Customer portal
- Webhooks (4 événements)
- Gestion des abonnements
- Mise à jour du plan utilisateur
- **Temps estimé :** 10 heures
- **Prix :** 600€ (60€/h)

#### Base de données Supabase
- Schéma complet (4 tables principales)
- Relations et contraintes
- Indexes de performance
- Row Level Security (RLS)
- Migrations SQL (3 fichiers)
- Fonctions PostgreSQL
- **Temps estimé :** 12 heures
- **Prix :** 720€ (60€/h)

#### Gestion des quotas
- Système de comptage
- Limites par plan (FREE/STARTER/PRO/ADMIN)
- Synchronisation temps réel
- Notifications de limite atteinte
- **Temps estimé :** 5 heures
- **Prix :** 300€ (60€/h)

#### Système de logging & monitoring
- Logger personnalisé
- Audit logs
- Error tracking
- Performance monitoring
- **Temps estimé :** 4 heures
- **Prix :** 240€ (60€/h)

**TOTAL BACKEND & API : 5 520€**

---

### 🎯 3. FONCTIONNALITÉS MÉTIER

#### Générateur d'emails IA
- Formulaire multi-champs
- Validation des inputs
- Prévisualisation en temps réel
- Gestion du contexte
- Historique des prompts
- **Temps estimé :** 8 heures
- **Prix :** 480€ (60€/h)

#### Reformulation intelligente
- Analyse de l'email existant
- Suggestions de ton
- Reformulation contextuelle
- Comparaison avant/après
- **Temps estimé :** 6 heures
- **Prix :** 360€ (60€/h)

#### Chatbot IA pour ajustements
- Interface de chat
- Historique de conversation
- Modifications en temps réel
- Suggestions intelligentes
- **Temps estimé :** 10 heures
- **Prix :** 600€ (60€/h)

#### Système de templates
- CRUD complet
- Catégorisation
- Variables dynamiques
- Duplication de templates
- Import/Export
- **Temps estimé :** 8 heures
- **Prix :** 480€ (60€/h)

#### Historique des emails
- Liste paginée
- Filtres et recherche
- Réutilisation d'emails
- Suppression
- Export
- **Temps estimé :** 6 heures
- **Prix :** 360€ (60€/h)

#### Éditeur de contenu
- Mode édition inline
- Sauvegarde automatique
- Annuler/Refaire
- Formatage basique
- **Temps estimé :** 5 heures
- **Prix :** 300€ (60€/h)

#### Export PDF
- Génération PDF avec jsPDF
- Mise en page professionnelle
- Logo et branding
- Téléchargement automatique
- **Temps estimé :** 4 heures
- **Prix :** 240€ (60€/h)

#### Copie dans le presse-papier
- Copie du contenu
- Notifications toast
- Formatage préservé
- **Temps estimé :** 2 heures
- **Prix :** 120€ (60€/h)

#### Système d'abonnements
- Gestion des plans
- Upgrade/Downgrade
- Billing portal
- Historique de facturation
- **Temps estimé :** 8 heures
- **Prix :** 480€ (60€/h)

**TOTAL FONCTIONNALITÉS MÉTIER : 3 420€**

---

### 🔌 4. EXTENSION CHROME

#### Architecture de l'extension
- Manifest V3
- Background service worker
- Content scripts
- Popup interface
- Storage API
- **Temps estimé :** 6 heures
- **Prix :** 360€ (60€/h)

#### Interface utilisateur de l'extension
- Popup 400×600px
- Formulaire de génération
- Vue résultat full-screen
- Dock panel (4 boutons)
- Animations macOS-style
- Thème synchronisé avec le site
- **Temps estimé :** 10 heures
- **Prix :** 500€ (50€/h)

#### Authentification extension
- Synchronisation session avec le site
- Auto-login via cookies
- Gestion des tokens
- Route API dédiée `/api/extension/auth`
- **Temps estimé :** 6 heures
- **Prix :** 360€ (60€/h)

#### Génération d'emails dans l'extension
- Route API `/api/extension/generate`
- Sans vérification de session stricte
- CORS configuré pour chrome-extension://
- Streaming de résultats (optionnel)
- **Temps estimé :** 5 heures
- **Prix :** 300€ (60€/h)

#### Intégration Gmail (content script)
- Détection de la page Gmail
- Injection dans le composer
- Pré-remplissage automatique
- Bouton "Envoyer" dans Gmail
- **Temps estimé :** 8 heures
- **Prix :** 480€ (60€/h)

#### Gestion du quota dans l'extension
- Affichage du quota restant
- Synchronisation avec le site
- Badge de plan
- Notifications de limite
- **Temps estimé :** 4 heures
- **Prix :** 240€ (60€/h)

#### Fonctionnalités du dock
- Modifier l'email
- Sauvegarder dans l'historique
- Télécharger en .txt
- Envoyer via Gmail
- **Temps estimé :** 6 heures
- **Prix :** 360€ (60€/h)

#### Optimisation et debugging
- Tests cross-browser
- Gestion des erreurs
- Performance optimization
- Memory leaks prevention
- **Temps estimé :** 4 heures
- **Prix :** 240€ (60€/h)

**TOTAL EXTENSION CHROME : 2 840€**

---

### 🔒 5. SÉCURITÉ & PERFORMANCE

#### Sécurité
- Protection CSRF
- Validation des inputs (Zod)
- Rate limiting
- Secrets management
- SQL injection prevention
- XSS protection
- **Temps estimé :** 8 heures
- **Prix :** 480€ (60€/h)

#### Performance
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Bundle size optimization
- **Temps estimé :** 6 heures
- **Prix :** 360€ (60€/h)

#### SEO & Accessibilité
- Meta tags
- Open Graph
- Schema.org
- ARIA labels
- Keyboard navigation
- **Temps estimé :** 4 heures
- **Prix :** 240€ (60€/h)

**TOTAL SÉCURITÉ & PERFORMANCE : 1 080€**

---

### 🧪 6. TESTS & QUALITÉ

#### Tests unitaires
- Fonctions utilitaires
- Validation des données
- Helpers
- **Temps estimé :** 6 heures
- **Prix :** 360€ (60€/h)

#### Tests d'intégration
- API routes
- Authentification flow
- Paiements Stripe
- **Temps estimé :** 8 heures
- **Prix :** 480€ (60€/h)

#### Tests E2E
- User flows complets
- Extension Chrome
- Cross-browser testing
- **Temps estimé :** 6 heures
- **Prix :** 360€ (60€/h)

#### Code review & refactoring
- Optimisation du code
- Documentation
- Clean code principles
- **Temps estimé :** 6 heures
- **Prix :** 360€ (60€/h)

**TOTAL TESTS & QUALITÉ : 1 560€**

---

### 📚 7. DOCUMENTATION

#### Documentation technique
- README.md
- Guide d'installation
- Configuration des API
- Architecture du projet
- **Temps estimé :** 4 heures
- **Prix :** 240€ (60€/h)

#### Documentation utilisateur
- Guide d'utilisation
- FAQ
- Tutoriels vidéo (scripts)
- **Temps estimé :** 4 heures
- **Prix :** 240€ (60€/h)

#### Guide de déploiement
- Vercel deployment
- Variables d'environnement
- Configuration DNS
- Monitoring setup
- **Temps estimé :** 3 heures
- **Prix :** 180€ (60€/h)

**TOTAL DOCUMENTATION : 660€**

---

## 💡 INNOVATIONS & VALEUR AJOUTÉE

### Innovations techniques

1. **Dock macOS-style avec magnification**
   - Animation physique réaliste
   - Effet de loupe au survol
   - Rarement vu dans les webapps
   - **Valeur ajoutée :** +500€

2. **Synchronisation extension ↔ site en temps réel**
   - Quota partagé entre extension et site
   - Session unifiée
   - Pas besoin de double authentification
   - **Valeur ajoutée :** +800€

3. **Multi-provider email (Gmail + Outlook)**
   - OAuth2 pour 2 providers
   - Envoi depuis compte personnel
   - Gestion intelligente des tokens
   - **Valeur ajoutée :** +1 000€

4. **Chatbot IA intégré pour ajustements**
   - Conversation contextuelle
   - Modifications en temps réel
   - Historique de chat
   - **Valeur ajoutée :** +600€

5. **Système de reformulation intelligent**
   - Analyse du ton
   - Suggestions contextuelles
   - Amélioration de la qualité
   - **Valeur ajoutée :** +400€

6. **Thème synchronisé site ↔ extension**
   - Variables CSS partagées
   - Pas de pixel blanc en dark mode
   - Cohérence visuelle parfaite
   - **Valeur ajoutée :** +300€

7. **Extension Chrome Manifest V3**
   - Dernière version (V3)
   - Architecture moderne
   - Service workers
   - **Valeur ajoutée :** +400€

**TOTAL INNOVATIONS : 4 000€**

---

## 🛠️ STACK TECHNOLOGIQUE

### Frontend
- **Next.js 13+** (App Router) - Framework React moderne
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling utility-first
- **shadcn/ui** - Composants UI premium
- **Framer Motion** - Animations fluides
- **Radix UI** - Primitives accessibles

### Backend
- **Next.js API Routes** - Serverless functions
- **NextAuth.js** - Authentification
- **Supabase** - Base de données PostgreSQL
- **Zod** - Validation de schémas

### Intégrations
- **OpenAI GPT-5** - IA de génération
- **Gmail API** - Envoi depuis Gmail
- **Microsoft Graph API** - Envoi depuis Outlook
- **Stripe** - Paiements & abonnements
- **Resend** - Service d'email transactionnel

### DevOps & Tools
- **Git & GitHub** - Versioning
- **Vercel** - Déploiement & hosting
- **ESLint & Prettier** - Code quality
- **TypeScript Compiler** - Type checking

### Extension Chrome
- **Manifest V3** - Standard Chrome
- **Chrome APIs** - Storage, Tabs, Runtime
- **Content Scripts** - Injection Gmail

**Nombre de technologies utilisées :** 25+  
**Complexité technique :** Élevée  
**Intégrations tierces :** 7 API majeures

---

## ⏱️ RÉCAPITULATIF DU TEMPS

| Catégorie | Heures | Prix HT |
|-----------|--------|---------|
| Design & UI/UX | 55h | 2 750€ |
| Backend & API | 92h | 5 520€ |
| Fonctionnalités métier | 57h | 3 420€ |
| Extension Chrome | 49h | 2 840€ |
| Sécurité & Performance | 18h | 1 080€ |
| Tests & Qualité | 26h | 1 560€ |
| Documentation | 11h | 660€ |
| **SOUS-TOTAL** | **308h** | **17 830€** |
| **Innovations & valeur ajoutée** | - | **+4 000€** |
| **TOTAL GÉNÉRAL** | **308h** | **21 830€ HT** |

---

## 💰 ESTIMATION FINALE

### Prix décomposé

**SITE WEB COMPLET :** 15 410€ HT  
- Landing page : 600€
- Dashboard & UI : 2 150€
- Backend & API : 5 520€
- Fonctionnalités : 3 420€
- Sécurité & Tests : 2 640€
- Documentation : 660€
- Innovations (site) : 2 420€

**EXTENSION CHROME :** 6 420€ HT  
- Architecture & UI : 1 220€
- Intégrations : 1 380€
- Fonctionnalités : 600€
- Tests & optimisation : 640€
- Innovations (extension) : 1 580€

---

## 🎯 TARIFICATION FINALE RECOMMANDÉE

### Option 1 : Tarif au forfait (recommandé)
**PRIX FORFAITAIRE : 21 830€ HT (26 196€ TTC)**

**Inclus :**
✅ Site web complet avec toutes les fonctionnalités
✅ Extension Chrome Manifest V3
✅ 7 intégrations API (OpenAI, Gmail, Outlook, Stripe, etc.)
✅ Base de données complète avec migrations
✅ Système d'authentification multi-provider
✅ Système de paiement et abonnements
✅ Tests et qualité assurée
✅ Documentation complète
✅ Support 30 jours après livraison

**Non inclus :**
❌ Coûts des API (OpenAI, Stripe, etc.)
❌ Hébergement (Vercel, Supabase)
❌ Nom de domaine
❌ Maintenance mensuelle
❌ Évolutions futures

---

### Option 2 : Tarif au temps passé
**TAUX HORAIRE MOYEN : 60€/h**

**Fourchette estimée :**
- Minimum (optimiste) : 280h × 60€ = **16 800€ HT**
- Moyen (réaliste) : 308h × 60€ = **18 480€ HT**
- Maximum (pessimiste) : 350h × 60€ = **21 000€ HT**

**+ Innovations et valeur ajoutée : +4 000€**

**TOTAL : 20 800€ - 25 000€ HT**

---

### Option 3 : Tarif par module

**Modules obligatoires :**
- Site web (sans extension) : **15 410€ HT**
- Extension Chrome (sans site) : **6 420€ HT**

**Modules optionnels (à la carte) :**
- Intégration Gmail API : **1 200€ HT**
- Intégration Outlook API : **1 200€ HT**
- Système de paiement Stripe : **1 500€ HT**
- Chatbot IA : **1 000€ HT**
- Export PDF : **500€ HT**
- Système de templates : **800€ HT**

---

## 📊 COMPARAISON AVEC LE MARCHÉ

### Plateformes similaires (estimation)

**Jasper AI** (jasper.ai)
- Développement estimé : 500k€ - 1M€
- Équipe : 20+ développeurs
- Temps : 2+ ans

**Copy.ai** (copy.ai)
- Développement estimé : 300k€ - 800k€
- Équipe : 15+ développeurs
- Temps : 1.5+ ans

**MailWiz (votre projet)**
- Développement : **21 830€ HT**
- Équipe : 1 développeur fullstack senior
- Temps : **2-3 mois**

**RAPPORT QUALITÉ/PRIX : Excellent** ✅

---

## 🎁 BONUS INCLUS GRATUITEMENT

1. **Système de thème dark/light** (valeur : 300€)
2. **Animations avancées Framer Motion** (valeur : 500€)
3. **40+ composants UI shadcn/ui** (valeur : 800€)
4. **Responsive design complet** (valeur : 400€)
5. **Code TypeScript 100% typé** (valeur : 600€)
6. **Architecture Next.js 13 optimisée** (valeur : 500€)
7. **Guide de finalisation complet** (valeur : 200€)

**TOTAL BONUS : 3 300€ offerts**

---

## 💳 CONDITIONS DE PAIEMENT

### Paiement en 3 fois (recommandé)
- **30% à la commande** : 6 549€ HT
- **40% à mi-projet** : 8 732€ HT
- **30% à la livraison** : 6 549€ HT

### Paiement en 2 fois
- **50% à la commande** : 10 915€ HT
- **50% à la livraison** : 10 915€ HT

### Paiement comptant
- **100% à la commande** : 21 830€ HT
- **Remise de 5%** : **20 738,50€ HT**

---

## 🔧 MAINTENANCE & SUPPORT (Options)

### Support de base (inclus 30 jours)
- Corrections de bugs
- Réponses par email
- **Gratuit**

### Maintenance mensuelle (optionnel)
- Mises à jour de sécurité
- Corrections de bugs
- Support prioritaire par email
- **Prix : 500€/mois HT**

### Maintenance premium (optionnel)
- Tout de la maintenance mensuelle
- Nouvelles fonctionnalités (5h/mois)
- Support par téléphone/visio
- Monitoring proactif
- **Prix : 1 200€/mois HT**

---

## 📈 ÉVOLUTIONS FUTURES (Hors devis)

### Phase 2 (optionnelle)
- Mobile app (iOS/Android)
- Intégration Slack
- API publique
- Webhooks
- Multi-langues
- **Estimation : 15 000€ - 25 000€ HT**

### Phase 3 (optionnelle)
- Marketplace de templates
- White-label pour entreprises
- Analytics avancées
- A/B testing
- **Estimation : 20 000€ - 35 000€ HT**

---

## ✅ GARANTIES

- ✅ Code source livré à 100%
- ✅ Documentation complète
- ✅ Formation à l'utilisation (2h)
- ✅ Support 30 jours inclus
- ✅ Corrections de bugs gratuites (30 jours)
- ✅ Hébergement pendant 3 mois offert (Vercel)

---

## 📞 CONTACT & VALIDATION

Pour valider ce devis ou discuter des options :
- Email : contact@mailwiz.com
- Téléphone : +33 X XX XX XX XX
- Disponibilité : Lundi-Vendredi 9h-18h

**Devis valable 30 jours**

---

# 💰 PRIX FINAL RECOMMANDÉ

## SITE WEB + EXTENSION CHROME

# 21 830€ HT (26 196€ TTC)

**Soit 308 heures de développement × 60€/h + 4 000€ d'innovations**

**Paiement en 3 fois possible**  
**Livraison : IMMÉDIATE (code déjà développé)**  
**Mise en ligne : 1-4 jours (configuration & tests)**  
**Garantie : 30 jours**

---

*Ce devis inclut tout le travail de développement, les intégrations, les tests, la documentation et le support initial. Les coûts d'API (OpenAI, etc.) et d'hébergement sont à la charge du client.*
