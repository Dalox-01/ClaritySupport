# MailWizard - Présentation Complète du Site

## 🎯 Vue d'ensemble

MailWizard est une application web intelligente qui utilise l'IA (ChatGPT) pour générer et reformuler des emails professionnels en quelques secondes. Parfait pour les professionnels qui veulent gagner du temps et améliorer la qualité de leur communication.

---

## 🔐 Authentification et Sécurité

### Connexion Google OAuth
- **Connexion simple et sécurisée** via votre compte Google
- **Un seul clic** pour accéder à l'application
- **Pas besoin de mot de passe** à mémoriser
- **Photo de profil** automatiquement importée de Google

### Gestion du compte
- Menu profil accessible via votre photo en haut à droite
- Affichage de votre nom et email
- Badge indiquant votre plan (Gratuit ou Pro)
- Option de déconnexion sécurisée

---

## ✨ Fonctionnalités Principales

### 1. Génération d'Emails par IA

#### Types d'emails disponibles
- **Candidature** - Pour postuler à un emploi
- **Relance** - Pour relancer un contact
- **Prospection B2B** - Pour démarcher de nouveaux clients
- **Support client** - Pour répondre à vos clients
- **Réponse client** - Pour communiquer avec vos clients
- **Négociation** - Pour négocier des conditions

#### Personnalisation
- **3 tons disponibles** :
  - Professionnel (formel et sérieux)
  - Cordial (chaleureux et amical)
  - Direct (concis et efficace)

- **2 langues** :
  - Français
  - Anglais (English)

- **Contexte personnalisé** :
  - Zone de texte pour décrire votre situation
  - Instructions personnalisées optionnelles (ton empathique, dates précises, etc.)

#### Processus de génération
1. Sélectionnez le type d'email
2. Choisissez le ton et la langue
3. Décrivez le contexte de votre email
4. (Optionnel) Ajoutez des instructions spécifiques
5. Cliquez sur "Générer l'email"
6. L'IA crée un email complet avec objet et corps de texte

---

### 2. Reformulation d'Emails

#### Améliorer vos emails existants
- **Collez votre email actuel** dans la zone de texte
- **Choisissez le ton souhaité** (pro, cordial, direct)
- **Sélectionnez la langue**
- **Ajoutez des instructions** (optionnel)
- **L'IA reformule** votre email pour le rendre plus efficace

#### Cas d'usage
- Rendre un email plus professionnel
- Adoucir un message trop direct
- Traduire le ton d'un email
- Améliorer la clarté du message

---

### 3. Édition en Temps Réel

#### Modifier le résultat généré
- **Bouton "Modifier"** (icône crayon) en haut à droite du résultat
- **Édition directe** de l'objet et du corps de l'email
- **Sauvegarde** des modifications avec validation (✓)
- **Annulation** possible à tout moment (✗)

#### Avantages
- Affinez le message généré par l'IA
- Ajoutez des détails personnels
- Corrigez des informations spécifiques
- Adaptez le texte à vos besoins exacts

---

### 4. Historique et Gestion

#### Barre latérale intelligente
- **Historique complet** de tous vos emails générés
- **Recherche visuelle** par titre et date
- **Rechargement** avec bouton refresh
- **Sidebar rétractable** pour plus d'espace

#### Actions sur l'historique
- **Clic sur un email** → rechargement dans la zone de résultat
- **Bouton supprimer** (🗑️) pour effacer un email
- **Affichage de la date** de création
- **Tri automatique** du plus récent au plus ancien

---

### 5. Actions sur les Emails

#### Boutons d'action
- **📝 Modifier** - Éditer l'objet et le texte
- **💾 Enregistrer** - Sauvegarder dans l'historique
- **📋 Copier** - Copier le texte dans le presse-papier
- **✓ Valider** - Confirmer les modifications (en mode édition)
- **✗ Annuler** - Annuler l'édition (en mode édition)

#### Notifications
- **Messages de confirmation** après chaque action
- **Feedback visuel** (toasts) en bas à droite
- **Indicateurs de chargement** pendant la génération

---

## 🎨 Interface Utilisateur

### Design moderne et épuré
- **Thème clair/sombre** avec bouton de basculement
- **Interface responsive** (fonctionne sur tous les écrans)
- **Animations fluides** et transitions douces
- **Icons intuitives** pour chaque action

### Organisation de l'écran
- **Sidebar gauche** - Navigation et historique
- **Formulaire central** - Configuration et génération
- **Panel droit** - Affichage du résultat

### Expérience utilisateur
- **Formulaires clairs** avec labels explicites
- **Boutons désactivés** quand les champs sont vides
- **Messages d'aide** et descriptions partout
- **Placeholders informatifs** dans les champs

---

## 📊 Pages et Navigation

### Page d'accueil (/)
- Présentation de MailWizard
- Bouton "Se connecter avec Google"
- Thème toggle (clair/sombre)

### Dashboard (/dashboard)
- **Générateur d'emails** (onglet principal)
- **Reformulateur** (deuxième onglet)
- **Historique** (sidebar gauche)
- **Profil utilisateur** (menu en haut à droite)

### Pages de gestion du compte
- **Paramètres** (/dashboard/settings)
  - Informations de profil
  - Photo et nom d'utilisateur
  - Email du compte
  - Badge du plan
  - Section compte
  - Notifications
  - Sécurité
  - Zone de danger (suppression)

- **Utilisation** (/dashboard/usage)
  - Statistiques d'utilisation
  - Emails générés ce mois
  - Limite du plan
  - Emails restants
  - Barre de progression
  - Historique des 30 derniers jours

- **Facturation** (/dashboard/billing)
  - Plan actuel (Gratuit/Pro)
  - Comparaison des plans
  - Bouton "Passer au Pro"
  - Informations de paiement (si Pro)
  - Historique de facturation

---

## 🚀 Technologies Utilisées

### Frontend
- **Next.js 13** - Framework React moderne
- **TypeScript** - Code sûr et robuste
- **Tailwind CSS** - Design responsive
- **shadcn/ui** - Composants UI élégants

### Backend
- **Next.js API Routes** - API serverless
- **OpenAI GPT-5** - Intelligence artificielle
- **Supabase** - Base de données PostgreSQL
- **NextAuth.js** - Authentification sécurisée

### Intégrations
- **Google OAuth** - Connexion Google
- **Stripe** - Paiements (prêt pour Pro)
- **Resend** - Emails transactionnels (configuré)

---

## 💡 Avantages pour les Utilisateurs

### Gain de temps
- ⏱️ **Génération en 5 secondes** au lieu de 15-30 minutes
- 🔄 **Reformulation instantanée** d'emails existants
- 📝 **Édition rapide** du résultat
- 💾 **Historique accessible** immédiatement

### Qualité professionnelle
- ✅ **Structure parfaite** de chaque email
- 🎯 **Ton adapté** à chaque situation
- 🌍 **Multilingue** (FR/EN)
- 🤖 **IA de pointe** (ChatGPT GPT-5)

### Facilité d'utilisation
- 👆 **Interface intuitive** - aucune formation nécessaire
- 🔐 **Connexion simple** - un clic avec Google
- 💻 **Accessible partout** - navigateur web
- 📱 **Compatible mobile** - responsive design

### Flexibilité
- 🎨 **6 types d'emails** différents
- 🗣️ **3 tons** au choix
- ✏️ **Édition libre** après génération
- 💬 **Instructions personnalisées** possibles

---

## 📈 Plans et Tarification

### Plan Gratuit
- ✅ 10 emails générés par mois
- ✅ Tous les types d'emails
- ✅ Tous les tons et langues
- ✅ Reformulation illimitée
- ✅ Historique complet
- ✅ Support par email

### Plan Pro (à venir)
- ✅ 1000 emails par mois
- ✅ Toutes les fonctionnalités Gratuites
- ✅ Priorité de génération
- ✅ Templates personnalisés
- ✅ Export PDF
- ✅ Support prioritaire
- ✅ Statistiques avancées

---

## 🔒 Sécurité et Confidentialité

### Protection des données
- 🔐 **Connexion sécurisée** OAuth 2.0
- 🗄️ **Base de données chiffrée** (Supabase)
- 🚫 **Pas de stockage** des mots de passe
- ✅ **Conformité RGPD** (données EU)

### Confidentialité
- 👁️ **Emails privés** - non partagés
- 🔒 **Accès personnel** uniquement
- 🗑️ **Suppression possible** à tout moment
- 📧 **Pas de spam** - zéro email marketing

---

## 📞 Support et Assistance

### Aide intégrée
- 💬 **Tooltips** sur tous les boutons
- 📝 **Placeholders** informatifs
- ℹ️ **Messages d'erreur** clairs
- ✅ **Notifications** de confirmation

### Contact
- 📧 Email support (dans paramètres)
- 💡 Documentation complète
- 🐛 Rapport de bugs possible

---

## 🎯 Public Cible

### Professionnels
- Commerciaux et vendeurs B2B
- Responsables RH
- Chercheurs d'emploi
- Consultants et freelances

### Entreprises
- Startups et PME
- Services clients
- Équipes marketing
- Départements communication

### Cas d'usage courants
- 💼 Candidatures spontanées
- 📧 Relances commerciales
- 🤝 Prospection clients
- 💬 Support client
- 🎯 Négociations
- ✉️ Communication professionnelle

---

## 🌟 Points Forts du Projet

## ⭐ Pourquoi MailWizard est unique ?

1. **IA de dernière génération** - GPT-5 d'OpenAI
2. **Interface moderne** - Design 2025, UX optimale
3. **Authentification Google** - Connexion en 1 clic
4. **Édition en direct** - Modifier après génération
5. **Historique complet** - Jamais perdre un email
6. **Multi-ton et multilingue** - S'adapte à tous les besoins
7. **Responsive** - Fonctionne sur tous les appareils
8. **Mode sombre/clair** - Confort visuel optimal
9. **Rapide** - Génération en 5 secondes
10. **Évolutif** - Prêt pour le plan Pro et nouvelles fonctionnalités

---

## 🔄 Mises à jour Futures

### En développement
- Export PDF des emails
- Templates personnalisés
- Traductions supplémentaires (ES, DE, IT)
- Intégration Gmail
- Analytics avancées
- API publique

---

**MailWizard** - Votre assistant IA pour des emails professionnels parfaits, en quelques secondes.

*Version actuelle : 1.0.0*
*Dernière mise à jour : Octobre 2025*
