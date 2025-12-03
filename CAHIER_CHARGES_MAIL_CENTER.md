# 📧 Cahier des Charges - Mail Center (Centre de Gestion Email IA)

## 🎯 Vue d'ensemble

Création d'un centre de gestion email intelligent permettant de centraliser, automatiser et analyser les communications email via une interface web moderne.

**Route principale** : `/mail` ou `/mail-center`

---

## 🔑 Fonctionnalités Principales

### 1. 📬 **Connexion & Synchronisation Gmail**

#### 1.1 Authentification OAuth 2.0
- Connexion sécurisée via Google OAuth
- Permissions Gmail API :
  - `gmail.readonly` : Lecture des emails
  - `gmail.send` : Envoi de réponses automatiques
  - `gmail.modify` : Marquage lu/non-lu, labels
  - `gmail.labels` : Gestion des catégories

#### 1.2 Multi-comptes
- Support de plusieurs boîtes Gmail par utilisateur
- Sélecteur de compte actif
- Vue unifiée ou par compte
- Synchronisation en temps réel via webhooks Gmail (Push notifications)

#### 1.3 Synchronisation
- **Temps réel** : Affichage des 50 derniers emails
- **Système FIFO** : Le 51ème email arrive en haut, le 50ème disparaît
- Rafraîchissement automatique (WebSocket ou polling intelligent)
- Cache local pour performance
- Indicateur de nouveaux emails

---

### 2. 🤖 **Réponses Automatiques IA**

#### 2.1 Configuration des Règles
Interface intuitive pour créer des règles d'automatisation :

**Déclencheurs** :
- Mots-clés dans l'objet ou le corps
- Expéditeur spécifique ou domaine
- Présence de pièces jointes
- Sentiment détecté (urgent, plainte, question, etc.)
- Catégorie auto-détectée (support, vente, partenariat, spam, etc.)

**Actions** :
- Réponse automatique personnalisée
- Transfert vers une autre adresse
- Ajout de label/tag
- Marquage comme important/archivé
- Délai de réponse (immédiat ou programmé)

#### 2.2 Templates de Réponses IA
- **Bibliothèque de templates** :
  - Support client (accusé de réception, résolution problème)
  - Ventes (devis, suivi, relance)
  - RH (candidatures, entretiens)
  - Absence (répondeur automatique)
  
- **Personnalisation dynamique** :
  - Variables : {nom_expediteur}, {sujet}, {date}, {entreprise}
  - Ton de réponse : formel, amical, professionnel
  - Langue auto-détectée
  - Signature automatique

#### 2.3 IA Intelligente
- **Analyse contextuelle** :
  - Détection de l'intention (question, plainte, demande info, spam)
  - Extraction d'entités (produit mentionné, problème, date souhaitée)
  - Score de priorité (urgent, normal, faible)
  - Suggestion de réponse même sans règle prédéfinie

- **Apprentissage** :
  - Amélioration basée sur les réponses validées/modifiées
  - Suggestions de nouvelles règles basées sur les patterns

#### 2.4 Mode de Fonctionnement
- **Automatique** : Envoi direct selon règles
- **Semi-automatique** : Suggestion de réponse à valider
- **Manuel** : Juste marquage/catégorisation
- **Pause** : Désactivation temporaire

---

### 3. 📊 **Dashboard & Statistiques**

#### 3.1 Métriques Principales
**Vue d'ensemble** :
- Emails reçus aujourd'hui / cette semaine / ce mois
- Taux de réponse automatique (%)
- Temps de réponse moyen
- Emails traités vs en attente

**Graphiques** :
- Évolution du volume d'emails (courbe temporelle)
- Répartition par catégorie (camembert)
- Taux d'automatisation (jauge)
- Top expéditeurs
- Heures de pic d'activité (heatmap)

#### 3.2 Analytics Avancées
- **Performance IA** :
  - Taux de précision des catégorisations
  - Réponses automatiques envoyées/validées/rejetées
  - Top règles utilisées
  
- **Insights Business** :
  - Sujets les plus fréquents (nuage de mots)
  - Sentiment général (positif/négatif/neutre)
  - SLA (Service Level Agreement) - respect des délais
  - Tendances (augmentation/diminution de certains types d'emails)

#### 3.3 Rapports Exportables
- Export PDF/Excel des statistiques
- Rapports personnalisables (période, métrique)
- Envoi automatique par email (hebdo/mensuel)

---

### 4. 🎨 **Interface Utilisateur (/mail)**

#### 4.1 Layout Principal

```
┌─────────────────────────────────────────────────────┐
│  Header : MailWizard Mail Center                    │
│  [Compte actif ▼] [Sync ↻] [Paramètres ⚙️]         │
├──────────────┬──────────────────────────────────────┤
│  Sidebar     │  Zone Principale                     │
│              │                                       │
│ 📊 Dashboard │  ┌────────────────────────────────┐  │
│ 📬 Inbox(50) │  │ Email #1 (le + récent)         │  │
│ 🤖 Règles IA │  │ De: client@example.com         │  │
│ 📈 Stats     │  │ Objet: Ma télé ne marche pas   │  │
│ ⚙️  Config   │  │ 🤖 Auto-réponse envoyée ✓      │  │
│ 🏷️  Labels   │  └────────────────────────────────┘  │
│              │                                       │
│ Filtres:     │  ┌────────────────────────────────┐  │
│ □ Non lus    │  │ Email #2                       │  │
│ □ Auto-rep   │  │ ...                            │  │
│ □ En attente │  └────────────────────────────────┘  │
│              │                                       │
│              │  ... (jusqu'à email #50)              │
└──────────────┴──────────────────────────────────────┘
```

#### 4.2 Composants Clés

**Liste des Emails** :
- Carte par email avec :
  - Expéditeur (avec avatar/initiales)
  - Objet (tronqué avec tooltip)
  - Aperçu du contenu (2 lignes)
  - Timestamp relatif ("il y a 5 min")
  - Badges : 🤖 Auto-répondu, ⚠️ Urgent, ⭐ Important
  - Catégorie (support, vente, spam, etc.)
  
- Actions rapides :
  - Répondre manuellement
  - Archiver
  - Marquer spam
  - Voir détails

**Vue Détail Email** (Modal ou panneau latéral) :
- Email complet avec formatting HTML
- Historique de conversation (thread)
- Réponse IA suggérée (si applicable)
- Édition de la réponse avant envoi
- Pièces jointes

**Animation d'Arrivée** :
- Nouvel email apparaît en haut avec animation slide-in
- Notification toast : "Nouveau mail de [expéditeur]"
- Son optionnel
- Le 50ème disparaît avec fade-out

#### 4.3 Section Règles IA

Interface de création/édition :
```
┌─────────────────────────────────────────┐
│  Créer une Règle d'Automatisation       │
├─────────────────────────────────────────┤
│  Nom de la règle : [Support Client___] │
│                                          │
│  QUAND :                                 │
│  ☑ Objet contient : [problème, bug...]  │
│  ☑ Catégorie : [Support ▼]              │
│  ☐ Expéditeur : [@domaine.com______]    │
│                                          │
│  ALORS :                                 │
│  ● Réponse automatique                  │
│  ○ Suggérer réponse (validation)        │
│  ○ Juste catégoriser                    │
│                                          │
│  Template : [Accusé réception support ▼]│
│  ┌────────────────────────────────────┐ │
│  │ Bonjour {nom_expediteur},          │ │
│  │                                    │ │
│  │ Merci pour votre message.          │ │
│  │ Notre équipe traitera votre        │ │
│  │ demande sous 24h.                  │ │
│  │                                    │ │
│  │ Cordialement,                      │ │
│  │ {signature}                        │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Ton : [Professionnel ▼]  Délai: [0min] │
│                                          │
│  [Tester la règle] [Sauvegarder]        │
└─────────────────────────────────────────┘
```

**Liste des Règles** :
- Tableau avec colonnes : Nom, Déclencheurs, Action, Statut (Active/Pause), Stats
- Toggle activation rapide
- Drag & drop pour prioriser
- Duplication de règles

#### 4.4 Dashboard Visuel

**Cartes de statistiques (style glassmorphism)** :
- 📬 Total emails : 1,247
- 🤖 Auto-réponses : 856 (68.6%)
- ⏱️ Temps moy. réponse : 12min
- ⚡ Emails en attente : 3

**Graphiques interactifs** :
- Chart.js ou Recharts pour les visualisations
- Période sélectionnable (7j, 30j, 90j, année)
- Export des données

---

### 5. 🔐 **Sécurité & Confidentialité**

#### 5.1 Protection des Données
- Tokens OAuth chiffrés en base
- Emails stockés temporairement (cache 24h max)
- Option : Ne pas stocker le contenu, juste les métadonnées
- Conformité RGPD
- Chiffrement end-to-end des règles et templates

#### 5.2 Permissions
- Utilisateur contrôle les permissions accordées
- Révocation d'accès en un clic
- Logs d'activité IA (toutes les réponses envoyées)
- Validation obligatoire pour emails sensibles

#### 5.3 Rate Limiting
- Quotas Gmail API respectés
- Limite de réponses auto par heure (configurable)
- Alerte si quota proche

---

### 6. ⚙️ **Configuration & Personnalisation**

#### 6.1 Paramètres Généraux
- Nombre d'emails affichés (50 par défaut, ajustable 25-100)
- Fréquence de synchronisation (temps réel, 1min, 5min)
- Notifications (browser, email digest)
- Langue de l'interface

#### 6.2 Paramètres IA
- Niveau d'agressivité IA (conservateur → agressif)
- Validation manuelle obligatoire (oui/non)
- Apprentissage activé/désactivé
- Modèle IA : GPT-4, Claude, Gemini (selon abonnement)

#### 6.3 Intégrations
- Webhooks sortants (envoyer événements vers Zapier, Make)
- API REST pour accès externe
- Export vers CRM (HubSpot, Salesforce)

---

## 🏗️ **Architecture Technique Proposée**

### 7.1 Stack Recommandée

**Frontend** :
- Next.js 14+ (App Router)
- React Server Components
- TanStack Query pour cache & sync
- Zustand pour state management
- Framer Motion pour animations
- Chart.js / Recharts pour graphiques
- WebSocket (Pusher ou Socket.io) pour temps réel

**Backend** :
- Next.js API Routes
- Supabase (PostgreSQL) pour :
  - Stockage métadonnées emails
  - Règles et templates
  - Statistiques
  - Logs d'activité
- Redis pour cache temps réel
- Queue system (Bull/BullMQ) pour traitement asynchrone

**APIs Externes** :
- Gmail API (Google)
- OpenAI API / Anthropic (IA)
- Pusher (notifications temps réel)

**Déploiement** :
- Vercel (frontend + API routes)
- Supabase Cloud
- Redis Cloud / Upstash

### 7.2 Schéma Base de Données

```sql
-- Comptes Gmail connectés
mail_accounts (
  id, user_id, email, access_token_encrypted, 
  refresh_token_encrypted, is_active, created_at
)

-- Métadonnées emails (cache temporaire)
emails_cache (
  id, account_id, gmail_message_id, from_email, 
  subject, snippet, received_at, category, sentiment,
  is_auto_replied, created_at
)

-- Règles d'automatisation
automation_rules (
  id, user_id, account_id, name, triggers_json,
  action_type, template_id, is_active, priority,
  stats_triggered, stats_success, created_at
)

-- Templates de réponses
response_templates (
  id, user_id, name, content, tone, language,
  variables, is_ai_enhanced, created_at
)

-- Logs d'activité IA
ai_activity_logs (
  id, rule_id, email_id, action_taken,
  response_sent, was_validated, created_at
)

-- Statistiques agrégées
email_statistics (
  id, user_id, account_id, date, 
  total_received, auto_replied, manual_replied,
  avg_response_time, created_at
)
```

### 7.3 Workflow Technique

**Synchronisation Emails** :
1. Utilisateur connecte Gmail via OAuth
2. Webhook Gmail configuré (push notifications)
3. Nouvel email → Event trigger
4. Serveur reçoit notification
5. Fetch email via Gmail API
6. Analyse IA (catégorie, sentiment, entités)
7. Check règles d'automatisation (par priorité)
8. Si match : génère réponse IA
9. Selon mode : envoi auto ou suggestion
10. Update cache local (WebSocket → Frontend)
11. Affichage temps réel avec animation

**Traitement IA** :
```
Email reçu
  ↓
Analyse contextuelle (OpenAI)
  → Catégorie : support/vente/spam/autre
  → Sentiment : urgent/normal/positif/négatif
  → Entités : produit, problème, date
  → Score priorité : 1-10
  ↓
Matching règles (priorité DESC)
  ↓
Si match :
  → Génération réponse (template + contexte)
  → Variables dynamiques remplies
  → Ton adapté
  ↓
Selon mode :
  - Auto : Envoi via Gmail API + log
  - Semi-auto : Notification utilisateur + suggestion
  - Manuel : Juste catégorisation
```

---

## 📱 **Responsive & Accessibilité**

- **Mobile-first** : Interface optimisée pour mobile
- **Raccourcis clavier** : Navigation rapide (desktop)
- **Dark mode** : Support complet
- **Accessibilité** : ARIA labels, navigation clavier
- **PWA** : Installation possible, notifications natives

---

## 🎯 **Évolutions Futures (Phase 2)**

### Fonctionnalités Avancées
- **Assistant vocal** : "Hey MailWizard, résume mes emails non lus"
- **Smart Inbox** : Tri prédictif intelligent (Important/Social/Promotions)
- **Email Scheduling** : Programmer envoi de réponses
- **Follow-up automatique** : Relances si pas de réponse
- **Collaboration équipe** : 
  - Assignation d'emails
  - Commentaires internes
  - Brouillons partagés
- **Intégration calendrier** : Détection dates → ajout auto Google Calendar
- **Analyse sentiment client** : Dashboard satisfaction
- **Templates vidéo** : Réponses avec Loom embeddé
- **Multi-providers** : Outlook, Yahoo, IMAP générique

---

## 💰 **Modèle de Tarification Suggéré**

### Plans
**Free** :
- 1 compte Gmail
- 50 emails affichés
- 100 réponses auto/mois
- 5 règles
- Stats basiques

**Pro** (19€/mois) :
- 3 comptes Gmail
- 100 emails affichés
- Réponses auto illimitées
- Règles illimitées
- Stats avancées
- Support prioritaire
- IA GPT-4

**Business** (49€/mois) :
- 10 comptes
- 200 emails
- Collaboration équipe
- API access
- Webhooks
- White-label
- IA personnalisée

**Enterprise** (Sur devis) :
- Comptes illimités
- Installation on-premise option
- SLA garanti
- Manager dédié

---

## 📋 **Checklist Implémentation**

### Phase 1 : MVP (2-3 semaines)
- [ ] OAuth Gmail + synchronisation basique
- [ ] Affichage 50 derniers emails
- [ ] Système FIFO temps réel
- [ ] Création règles simples (mots-clés)
- [ ] Templates réponses fixes
- [ ] Dashboard stats basiques
- [ ] UI responsive

### Phase 2 : IA & Automatisation (2 semaines)
- [ ] Intégration OpenAI/Claude
- [ ] Catégorisation automatique
- [ ] Génération réponses contextuelles
- [ ] Apprentissage basé sur feedback
- [ ] Mode semi-automatique
- [ ] Logs d'activité détaillés

### Phase 3 : Analytics & Polish (1-2 semaines)
- [ ] Graphiques avancés
- [ ] Exports rapports
- [ ] Notifications temps réel
- [ ] Optimisation performances
- [ ] Tests utilisateurs
- [ ] Documentation

### Phase 4 : Scale & Monetization
- [ ] Multi-comptes
- [ ] Gating features par plan
- [ ] Intégration Stripe
- [ ] Webhooks sortants
- [ ] API publique

---

## 🎨 **Mockups & Exemples**

### Exemple Règle Support Client
```
Nom : "Support Technique Auto-Réponse"
Déclencheurs :
  - Objet contient : "problème", "bug", "erreur", "ne fonctionne pas"
  - OU Catégorie détectée : Support
  - ET Heure : 9h-18h (sinon mode attente)

Action : Réponse automatique
Template : 
  "Bonjour {prenom},
  
  Merci d'avoir contacté notre support technique.
  
  Nous avons bien reçu votre demande concernant {sujet_detecte}.
  Notre équipe vous répondra dans les 24 heures ouvrées.
  
  En attendant, consultez notre FAQ : [lien]
  
  Cordialement,
  L'équipe {nom_entreprise}"

Mode : Automatique
Statistiques : 234 déclenchements, 98.7% satisfaction
```

### Exemple Dashboard
```
┌─────────────────────────────────────────────────┐
│  📊 Tableau de Bord - Derniers 30 jours         │
├─────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ 1.2K │  │ 856  │  │ 12min│  │ 3    │       │
│  │ 📬   │  │ 🤖   │  │ ⏱️   │  │ ⚡   │       │
│  │Reçus │  │Auto  │  │T.moy │  │Att.  │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│                                                  │
│  📈 Volume d'emails (courbe 30j)                │
│  [Graphique ligne temps]                        │
│                                                  │
│  🎯 Catégories          🌡️ Sentiment           │
│  [Camembert]            [Jauge positif/négatif] │
│  Support: 45%                                    │
│  Vente: 30%             78% positifs             │
│  Spam: 15%              15% neutres              │
│  Autre: 10%             7% négatifs              │
│                                                  │
│  ⭐ Top 5 Règles Utilisées                      │
│  1. Support Auto (234 fois) ████████████        │
│  2. Absence Bureau (189 fois) ██████████        │
│  3. Demande Devis (145 fois) ████████           │
│  ...                                             │
└─────────────────────────────────────────────────┘
```

---

## 🚀 **Valeur Ajoutée pour MailWizard**

### Avantages Compétitifs
1. **All-in-one** : Signatures + Gestion emails → écosystème complet
2. **IA contextuelle** : Plus intelligent que simple auto-répondeur
3. **UX moderne** : Interface fluide et intuitive
4. **ROI client** : Économie temps → justifie abonnement premium
5. **Données** : Insights business précieux
6. **Sticky feature** : Augmente rétention utilisateurs

### Synergies avec Existant
- Signatures créées dans MailWizard → utilisées dans réponses auto
- Branding cohérent (templates + signatures)
- Base utilisateurs existante pour adoption rapide
- Cross-selling naturel

---

## ❓ Questions & Décisions Requises

### À valider :
1. **Stockage emails** : Cache temporaire uniquement ou historique complet ?
2. **Modèle IA** : OpenAI (coût) vs modèle open-source hébergé ?
3. **Plan gratuit** : Limites strictes ou fonctionnalités limitées ?
4. **Multi-langue** : Support immédiat FR/EN ou juste FR pour MVP ?
5. **Mobile app** : Web responsive suffit ou app native nécessaire ?
6. **Compliance** : Besoin audit sécurité externe pour entreprises ?

### Alternatives à considérer :
- **WebMail complet** vs **Vue lecture seule + automation**
- **Toutes catégories emails** vs **Focus support client uniquement** (plus simple MVP)
- **Temps réel pur** vs **Sync périodique** (coûts infrastructure)

---

## 📅 Timeline Estimée

**MVP Fonctionnel** : 6-8 semaines
**Version Complète** : 12-14 semaines
**Lancement Public** : +2 semaines (tests, doc, marketing)

---

## 💡 Recommandations Finales

### Approche Suggérée
1. **Commencer par MVP ciblé** : Focus support client (cas d'usage clair)
2. **Itérations rapides** : Feedback utilisateurs précoce
3. **Métriques clés** : Taux d'adoption, réponses auto validées, temps économisé
4. **Différenciation** : Miser sur qualité IA (réponses naturelles) vs concurrence

### Risques à Mitiger
- **Quotas Gmail API** : Plan scaling robuste
- **Coûts IA** : Cache intelligent des analyses
- **Complexité perçue** : Onboarding ultra-simple
- **Vie privée** : Communication transparente sur données

---

**✅ Prêt à valider et démarrer l'implémentation !**

*Ce cahier des charges est évolutif - ajustements possibles selon feedback.*
