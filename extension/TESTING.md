# 🧪 Guide de Test - Extension MailWiz Chrome

## ✅ Checklist de Test Complète

### 1️⃣ Installation de l'Extension

- [ ] Ouvrir Chrome
- [ ] Aller à `chrome://extensions/`
- [ ] Activer "Mode développeur" (toggle en haut à droite)
- [ ] Cliquer "Charger l'extension non empaquetée"
- [ ] Sélectionner le dossier `extension/`
- [ ] ✅ L'extension apparaît dans la liste avec l'icône verte

**Résultat attendu**: Extension installée, icône visible dans la barre d'outils Chrome

---

### 2️⃣ Test du Thème (Mode Clair/Sombre)

**Avant la connexion:**
- [ ] Cliquer sur l'icône de l'extension
- [ ] Vérifier que l'écran de login s'affiche en mode clair
- [ ] Cliquer sur l'icône ☀️ en haut à droite
- [ ] ✅ Le thème passe en mode sombre
- [ ] Cliquer sur l'icône 🌙
- [ ] ✅ Le thème repasse en mode clair
- [ ] Fermer la popup et la rouvrir
- [ ] ✅ Le thème est persisté (reste en mode clair)

**Résultat attendu**: Toggle fonctionne et le thème est sauvegardé

---

### 3️⃣ Test de l'Authentification

**Étape 1: Connexion initiale**
- [ ] Cliquer sur "Se connecter avec Google"
- [ ] ✅ Une nouvelle fenêtre s'ouvre sur `localhost:3000/?extension=true`
- [ ] ✅ La popup de l'extension se ferme automatiquement
- [ ] S'authentifier avec un compte Google
- [ ] ✅ La page affiche "✅ Connexion réussie !"
- [ ] ✅ La fenêtre se ferme automatiquement après 2 secondes

**Étape 2: Vérification du dashboard**
- [ ] Rouvrir l'extension en cliquant sur son icône
- [ ] ✅ Le dashboard s'affiche directement (pas d'écran de login)
- [ ] ✅ Le nom/email de l'utilisateur est affiché
- [ ] ✅ Le badge du plan est visible (FREE, STARTER, PRO, ou ADMIN)
- [ ] ✅ Le quota est affiché (ex: "5 / 10 utilisés")

**Résultat attendu**: Authentification réussie et dashboard accessible

---

### 4️⃣ Test de la Génération d'Email

**Étape 1: Remplir le formulaire**
- [ ] Dans le dashboard de l'extension
- [ ] Sélectionner "Réponse" dans le type d'email
- [ ] Sélectionner "Professionnel" dans le ton
- [ ] Entrer dans le contexte: "Répondre à un client pour confirmer un rendez-vous demain à 14h"
- [ ] Cliquer sur "Générer l'email"

**Étape 2: Vérification de la génération**
- [ ] ✅ Le loader s'affiche avec le spinner
- [ ] ✅ Le bouton "Générer" est désactivé pendant le chargement
- [ ] Attendre la réponse de l'API (2-5 secondes)
- [ ] ✅ L'email généré s'affiche avec:
  - Un sujet
  - Un corps de message
  - Boutons "Copier l'email" et "Insérer dans Gmail"
- [ ] ✅ Le quota est mis à jour (ex: "6 / 10 utilisés")

**Résultat attendu**: Email généré avec succès et quota incrémenté

---

### 5️⃣ Test de la Copie

- [ ] Générer un email (voir étape 4)
- [ ] Cliquer sur "Copier l'email"
- [ ] ✅ Une notification "✅ Email copié !" s'affiche
- [ ] Ouvrir un éditeur de texte (Notepad, Word, etc.)
- [ ] Coller (Ctrl+V)
- [ ] ✅ Le sujet et le corps sont collés correctement

**Format attendu:**
```
Sujet: [Texte du sujet]

[Corps de l'email]
```

---

### 6️⃣ Test de l'Insertion Gmail

**Prérequis:**
- [ ] Ouvrir Gmail dans un onglet
- [ ] Cliquer sur "Nouveau message" ou "Répondre"
- [ ] ✅ Une fenêtre de composition s'ouvre

**Test:**
- [ ] Dans l'extension, générer un email
- [ ] Cliquer sur "Insérer dans Gmail"
- [ ] ✅ Le sujet est inséré dans le champ "Objet"
- [ ] ✅ Le corps est inséré dans la zone de texte
- [ ] ✅ Une notification verte "✅ Email inséré !" apparaît sur Gmail
- [ ] ✅ La notification disparaît après 3 secondes

**Résultat attendu**: Email inséré automatiquement dans Gmail

---

### 7️⃣ Test des Restrictions de Plan

**Pour FREE (10/mois):**
- [ ] Se connecter avec un compte FREE
- [ ] Générer 10 emails successivement
- [ ] ✅ Après le 10ème, le quota affiche "10 / 10 utilisés"
- [ ] Tenter de générer un 11ème email
- [ ] ✅ Un message d'erreur s'affiche
- [ ] ✅ Un bouton "Améliorer le plan" apparaît
- [ ] Cliquer sur "Améliorer le plan"
- [ ] ✅ Un onglet s'ouvre sur la page de tarification

**Pour STARTER (100/mois):**
- [ ] Vérifier que le quota max est 100
- [ ] Générer quelques emails
- [ ] ✅ Le compteur s'incrémente correctement

**Pour PRO (1000/mois):**
- [ ] Vérifier que le quota max est 1000

**Pour ADMIN (illimité):**
- [ ] Vérifier que le quota affiche "Illimité"
- [ ] Générer plusieurs emails
- [ ] ✅ Pas de limite

---

### 8️⃣ Test des Différents Types d'Email

Pour chaque type, générer un email et vérifier la pertinence:

**Réponse:**
- [ ] Contexte: "Répondre positivement à une demande de stage"
- [ ] ✅ L'email généré est une réponse appropriée

**Nouveau:**
- [ ] Contexte: "Présenter mon entreprise à un prospect"
- [ ] ✅ L'email est un nouveau message de présentation

**Suivi:**
- [ ] Contexte: "Relancer un client qui n'a pas répondu depuis 2 semaines"
- [ ] ✅ L'email est un message de suivi/relance

**Candidature:**
- [ ] Contexte: "Postuler pour un poste de développeur web"
- [ ] ✅ L'email est une candidature structurée

**Remerciement:**
- [ ] Contexte: "Remercier un client pour son achat"
- [ ] ✅ L'email exprime de la gratitude

**Excuses:**
- [ ] Contexte: "S'excuser pour un retard de livraison"
- [ ] ✅ L'email présente des excuses professionnelles

---

### 9️⃣ Test des Différents Tons

Pour chaque ton, générer le même email et comparer:

Contexte identique: "Informer que la réunion est reportée"

**Professionnel:**
- [ ] ✅ Langage formel, structure claire

**Amical:**
- [ ] ✅ Ton décontracté, chaleureux

**Formel:**
- [ ] ✅ Très formel, courtois, respectueux

**Concis:**
- [ ] ✅ Email court, direct, sans détails superflus

---

### 🔟 Test de la Déconnexion

- [ ] Cliquer sur "Se déconnecter" dans l'extension
- [ ] ✅ Un message de confirmation apparaît
- [ ] Confirmer la déconnexion
- [ ] ✅ L'écran de login s'affiche
- [ ] ✅ Les données utilisateur sont effacées du storage
- [ ] Fermer et rouvrir l'extension
- [ ] ✅ L'écran de login est toujours affiché

**Résultat attendu**: Déconnexion complète et retour à l'écran de login

---

### 1️⃣1️⃣ Test du Thème Après Connexion

- [ ] Se connecter et accéder au dashboard
- [ ] Passer en mode sombre
- [ ] Fermer la popup
- [ ] Rouvrir la popup
- [ ] ✅ Le thème sombre est toujours actif
- [ ] Se déconnecter
- [ ] ✅ Le thème est conservé (sombre sur l'écran de login)

---

### 1️⃣2️⃣ Test d'Erreurs Réseau

**Sans internet:**
- [ ] Couper la connexion internet
- [ ] Tenter de générer un email
- [ ] ✅ Un message d'erreur s'affiche
- [ ] Rétablir la connexion
- [ ] Générer un email
- [ ] ✅ Fonctionne normalement

**Serveur arrêté:**
- [ ] Arrêter le serveur Next.js (Ctrl+C dans le terminal)
- [ ] Tenter de générer un email
- [ ] ✅ Message d'erreur "Impossible de se connecter au serveur"
- [ ] Redémarrer le serveur
- [ ] Générer un email
- [ ] ✅ Fonctionne normalement

---

### 1️⃣3️⃣ Test Multi-Onglets Gmail

- [ ] Ouvrir 2 onglets Gmail
- [ ] Dans l'onglet 1: commencer un nouveau message
- [ ] Dans l'extension: générer un email
- [ ] Cliquer sur "Insérer dans Gmail"
- [ ] ✅ L'email s'insère dans l'onglet actif
- [ ] Passer à l'onglet 2
- [ ] Commencer un nouveau message
- [ ] Générer et insérer un email
- [ ] ✅ L'email s'insère dans le bon onglet

---

### 1️⃣4️⃣ Test de Performance

**Génération rapide:**
- [ ] Générer 5 emails successivement (sans attendre)
- [ ] ✅ Tous les emails sont générés correctement
- [ ] ✅ Le quota s'incrémente de 5
- [ ] ✅ Pas de doublon ou d'erreur

**Popup responsive:**
- [ ] Redimensionner la fenêtre Chrome
- [ ] Ouvrir l'extension
- [ ] ✅ La popup reste bien formatée
- [ ] ✅ Tous les éléments sont visibles

---

### 1️⃣5️⃣ Test de la Console (Debug)

**Background script:**
- [ ] Aller dans `chrome://extensions/`
- [ ] Cliquer sur "Inspecter les vues : service worker"
- [ ] Se connecter via l'extension
- [ ] ✅ Log "User authenticated:" apparaît
- [ ] ✅ Pas d'erreurs dans la console

**Popup:**
- [ ] Ouvrir l'extension
- [ ] Clic droit sur la popup → "Inspecter"
- [ ] Générer un email
- [ ] ✅ Les appels API sont visibles dans Network
- [ ] ✅ Pas d'erreurs dans la console

**Gmail content script:**
- [ ] Ouvrir Gmail
- [ ] F12 pour ouvrir DevTools
- [ ] Aller dans Console
- [ ] Insérer un email via l'extension
- [ ] ✅ Pas d'erreurs dans la console
- [ ] ✅ Log de l'insertion visible

---

## 📊 Résumé des Tests

| Catégorie | Tests | ✅ Passés | ❌ Échoués |
|-----------|-------|-----------|------------|
| Installation | 1 | | |
| Thème | 2 | | |
| Authentification | 1 | | |
| Génération | 1 | | |
| Copie | 1 | | |
| Gmail | 1 | | |
| Plans | 4 | | |
| Types d'email | 6 | | |
| Tons | 4 | | |
| Déconnexion | 1 | | |
| Erreurs | 2 | | |
| Performance | 2 | | |
| Debug | 3 | | |
| **TOTAL** | **29** | **0** | **0** |

---

## 🐛 Bugs à Reporter

Si un test échoue, noter ici:

### Bug #1
- **Test échoué**: [Nom du test]
- **Comportement attendu**: [Ce qui devrait se passer]
- **Comportement observé**: [Ce qui se passe réellement]
- **Étapes pour reproduire**: 
  1. 
  2. 
  3. 
- **Console logs**: [Copier les erreurs]

---

## ✅ Validation Finale

- [ ] Tous les tests passent
- [ ] Pas d'erreurs dans les consoles
- [ ] L'extension est stable
- [ ] Les icônes s'affichent correctement
- [ ] Les animations sont fluides
- [ ] Le thème fonctionne parfaitement
- [ ] L'authentification est fiable
- [ ] L'insertion Gmail fonctionne
- [ ] Les quotas sont respectés

**Prêt pour la production**: ☐ OUI ☐ NON

---

## 📝 Notes

[Ajouter ici toute observation ou suggestion d'amélioration]
