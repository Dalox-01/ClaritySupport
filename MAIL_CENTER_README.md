# 📧 Mail Center - Documentation d'Implémentation

## ✅ État d'Avancement

### Phase 1 : Infrastructure & Backend (COMPLÉTÉ)

#### ✅ Base de Données
- [x] Migration Supabase complète
- [x] Tables : `mail_accounts`, `emails_cache`, `automation_rules`, `response_templates`, `pending_replies`
- [x] Triggers auto pour statistiques
- [x] Fonction nettoyage auto 24h
- [x] Row Level Security (RLS)
- [x] Indexes optimisés

#### ✅ Authentification OAuth
- [x] Gmail OAuth 2.0 avec refresh tokens
- [x] Outlook/Microsoft Graph OAuth
- [x] Chiffrement AES-256 des tokens
- [x] Routes callback complètes
- [x] Gestion expiration et refresh automatique

#### ✅ API Routes
- [x] `/api/mail-center/gmail/auth` - Connexion Gmail
- [x] `/api/mail-center/gmail/callback` - Callback OAuth Gmail
- [x] `/api/mail-center/outlook/auth` - Connexion Outlook
- [x] `/api/mail-center/outlook/callback` - Callback OAuth Outlook
- [x] `/api/mail-center/sync` - Synchronisation emails
- [x] `/api/mail-center/accounts` - Liste comptes connectés
- [x] `/api/mail-center/pending-replies` - Réponses en attente

#### ✅ Helpers & Utilitaires
- [x] `gmail-helpers.ts` - Intégration Gmail API
- [x] `outlook-helpers.ts` - Intégration Microsoft Graph
- [x] `mail-ai-helpers.ts` - Analyse IA emails
- [x] `mail-center-types.ts` - Types TypeScript
- [x] Fonctions encrypt/decrypt tokens

#### ✅ Interface Utilisateur
- [x] Page `/mail-center` responsive
- [x] Liste emails avec animations FIFO
- [x] Sidebar navigation
- [x] Filtres par catégorie
- [x] Badges sentiment/urgence
- [x] Connexion multi-comptes

---

## 🚧 À Implémenter (Prochaines Phases)

### Phase 2 : Automatisation IA

#### Pages à créer
- [ ] `/mail-center/rules` - Gestion règles automatisation
- [ ] `/mail-center/templates` - Gestion templates réponses
- [ ] `/mail-center/pending` - Validation réponses
- [ ] `/mail-center/analytics` - Dashboard statistiques

#### API Routes manquantes
- [ ] `/api/mail-center/rules` (CRUD)
- [ ] `/api/mail-center/templates` (CRUD)
- [ ] `/api/mail-center/analyze` - Analyse email on-demand
- [ ] `/api/mail-center/generate-reply` - Génération réponse
- [ ] `/api/mail-center/send-reply` - Envoi réponse
- [ ] `/api/mail-center/validate-reply` - Validation réponse
- [ ] `/api/mail-center/stats` - Statistiques

#### Composants UI
- [ ] `RuleBuilder.tsx` - Interface création règles
- [ ] `TemplateEditor.tsx` - Éditeur templates
- [ ] `EmailDetail.tsx` - Vue détail email
- [ ] `ReplyValidator.tsx` - Validation réponses
- [ ] `AnalyticsDashboard.tsx` - Graphiques stats

### Phase 3 : Temps Réel & Performance
- [ ] WebSocket pour nouveaux emails
- [ ] Polling intelligent
- [ ] Notifications browser
- [ ] Système FIFO strict (50 emails max)
- [ ] Job nettoyage 24h automatique
- [ ] Rate limiting APIs

---

## 🔧 Configuration Requise

### Variables d'Environnement

Ajouter dans `.env.local` :

```env
# Gmail OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Outlook OAuth
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here

# OpenAI (déjà configuré)
OPENAI_API_KEY=sk-...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Setup Google Cloud Console

1. Aller sur https://console.cloud.google.com
2. Créer un projet ou sélectionner existant
3. Activer Gmail API
4. Créer identifiants OAuth 2.0
5. Ajouter URI de redirection : `http://localhost:3000/api/mail-center/gmail/callback`
6. Copier Client ID et Client Secret

### Setup Microsoft Azure

1. Aller sur https://portal.azure.com
2. Azure Active Directory > App registrations > New registration
3. Ajouter URI de redirection : `http://localhost:3000/api/mail-center/outlook/callback`
4. Permissions requises :
   - Mail.Read
   - Mail.Send
   - Mail.ReadWrite
   - offline_access
5. Créer un Client Secret
6. Copier Application (client) ID et Secret

---

## 📊 Structure Base de Données

### Table: mail_accounts
Stocke les comptes email connectés avec tokens chiffrés.

### Table: emails_cache
Cache temporaire des emails (24h max). Contient analyse IA.

### Table: automation_rules
Règles définies par l'utilisateur pour automatiser réponses.

### Table: response_templates
Templates de réponses personnalisables.

### Table: pending_replies
Réponses générées en attente de validation utilisateur.

### Table: mail_statistics
Statistiques agrégées par jour.

---

## 🎯 Fonctionnalités Clés

### ✅ Déjà Fonctionnel

1. **Connexion Multi-Comptes**
   - Gmail et Outlook
   - OAuth sécurisé
   - Refresh automatique des tokens

2. **Synchronisation Emails**
   - 50 derniers emails par compte
   - Parsing Gmail et Outlook
   - Cache en base de données

3. **Analyse IA Automatique**
   - Catégorisation (support, vente, spam, urgent, etc.)
   - Détection sentiment (positif, neutre, négatif, urgent)
   - Score d'urgence 0-10
   - Extraction entités (produit, problème, date)
   - Flag validation requise

4. **Interface Moderne**
   - Responsive design
   - Animations Framer Motion
   - Filtres en temps réel
   - Badges visuels

### 🚧 En Cours d'Implémentation

5. **Règles d'Automatisation**
   - Déclencheurs configurables
   - Actions conditionnelles
   - Priorités de règles

6. **Génération Réponses IA**
   - Templates personnalisables
   - Variables dynamiques
   - Prompt utilisateur modifiable

7. **Validation Obligatoire**
   - Détection emails sensibles
   - Interface validation
   - Édition avant envoi

8. **Dashboard Analytics**
   - Graphiques temps réel
   - Métriques clés
   - Tendances

---

## 🚀 Utilisation

### Démarrer le serveur

```bash
cd project
npm run dev
```

### Accéder au Mail Center

1. Naviguer vers `http://localhost:3000/mail-center`
2. Cliquer "Connecter un compte"
3. Choisir Gmail ou Outlook
4. Autoriser l'accès
5. Les emails se synchronisent automatiquement

### Workflow Automatisation (à venir)

1. Créer une règle d'automatisation
2. Définir déclencheurs (mots-clés, catégorie, etc.)
3. Choisir template de réponse
4. Configurer mode (auto, validation, manuel)
5. Activer la règle

Les nouveaux emails matchant la règle seront traités automatiquement.

---

## 🔐 Sécurité

### Implémenté
- ✅ Chiffrement AES-256 des tokens OAuth
- ✅ Row Level Security Supabase
- ✅ Sanitization HTML
- ✅ HTTPS uniquement en production
- ✅ Tokens stockés côté serveur uniquement

### À implémenter
- [ ] Rate limiting par utilisateur
- [ ] Logs d'audit détaillés
- [ ] 2FA optionnel
- [ ] Détection anomalies

---

## 📈 Performance

### Optimisations Actuelles
- Index database sur colonnes clés
- Limite 50 emails affichés (FIFO)
- Cache côté client (React Query à ajouter)
- Suppression auto emails > 24h

### À Optimiser
- [ ] Pagination emails
- [ ] Lazy loading composants
- [ ] WebWorkers pour analyse IA
- [ ] CDN pour assets
- [ ] Edge functions pour webhooks

---

## 🐛 Debugging

### Logs importants

```bash
# Sync emails
GET /api/mail-center/sync

# Console logs
✅ Email analyzed in Xms - Category: support, Urgency: 8/10
✅ Reply generated in Xms - Tokens: 450
```

### Problèmes courants

**Erreur OAuth**: Vérifier redirectUri correspond exactement
**Token expiré**: Automatiquement géré par refresh
**Quota Gmail**: Max 250 quotas/jour en mode gratuit

---

## 📦 Dépendances Ajoutées

```json
{
  "googleapis": "^latest",
  "@microsoft/microsoft-graph-client": "^latest",
  "@azure/msal-node": "^latest",
  "isomorphic-fetch": "^latest"
}
```

Déjà installées : `openai`, `framer-motion`, `@supabase/supabase-js`

---

## 🎨 Design System

### Couleurs Catégories
- Support: Bleu (`bg-blue-500/10`)
- Vente: Vert (`bg-green-500/10`)
- Urgent: Rouge (`bg-red-500/10`)
- Spam: Gris (`bg-gray-500/10`)
- Partenariat: Violet (`bg-purple-500/10`)

### Icônes Sentiment
- Urgent (8+): ⚠️ AlertCircle rouge
- Négatif: ⚠️ AlertCircle jaune
- Urgent (sentiment): 🕐 Clock orange

---

## 🔄 Prochaines Étapes

1. **Implémenter système de règles**
   - Interface création règles
   - Matching automatique
   - Exécution actions

2. **Génération réponses automatiques**
   - Templates avec variables
   - Prompt personnalisable
   - Validation avant envoi

3. **Dashboard analytics**
   - Graphiques Recharts
   - KPIs temps réel
   - Exports PDF

4. **Système temps réel**
   - WebSocket ou polling
   - Notifications push
   - FIFO strict 50 emails

5. **Tests & Documentation**
   - Tests unitaires
   - Tests E2E
   - Documentation utilisateur

---

## 📞 Support

Pour questions ou problèmes :
- Voir logs console navigateur
- Vérifier logs serveur Next.js
- Consulter docs Gmail/Outlook API
- Vérifier configuration OAuth

---

**Version**: 1.0.0 (MVP)  
**Dernière mise à jour**: 4 novembre 2025  
**Status**: ✅ Backend fonctionnel, 🚧 Frontend en cours
