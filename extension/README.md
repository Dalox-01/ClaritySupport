# MailWiz - Extension Chrome

Extension Chrome pour générer des emails professionnels avec l'IA directement depuis Gmail.

## 📦 Installation

### Mode développeur (pour tester)

1. Ouvrez Chrome et allez dans `chrome://extensions/`
2. Activez le "Mode développeur" (en haut à droite)
3. Cliquez sur "Charger l'extension non empaquetée"
4. Sélectionnez le dossier `extension`

### Conversion des icônes SVG en PNG

Les icônes doivent être au format PNG pour Chrome. Utilisez un outil en ligne comme :
- https://cloudconvert.com/svg-to-png
- https://www.aconvert.com/image/svg-to-png/

Convertissez `icon128.svg` en 3 tailles :
- icon16.png (16x16)
- icon48.png (48x48)  
- icon128.png (128x128)

Placez-les dans le dossier `extension/icons/`

## 🚀 Utilisation

### Première connexion

1. Cliquez sur l'icône de l'extension dans la barre d'outils
2. Cliquez sur "Se connecter à MailWiz"
3. Vous serez redirigé vers le site web
4. Connectez-vous avec Google
5. Revenez à l'extension - vous êtes connecté !

### Générer un email

1. Ouvrez l'extension
2. Choisissez le type d'email (Réponse, Candidature, etc.)
3. Sélectionnez le ton (Professionnel, Amical, etc.)
4. Décrivez le contexte
5. Cliquez sur "Générer l'email"
6. Copiez ou insérez directement dans Gmail

### Restrictions par plan

- **FREE** : 10 générations/mois
- **STARTER** : 100 générations/mois
- **PRO** : 1000 générations/mois
- **ADMIN** : Illimité

## 🛠️ Configuration

### Développement local

Dans `popup.js`, modifiez les URLs :

```javascript
const API_URL = 'http://localhost:3000';
const WEB_APP_URL = 'http://localhost:3000';
```

### Production

```javascript
const API_URL = 'https://votre-domaine.com';
const WEB_APP_URL = 'https://votre-domaine.com';
```

## 📁 Structure

```
extension/
├── manifest.json       # Configuration de l'extension
├── popup.html         # Interface de la popup
├── popup.css          # Styles de la popup
├── popup.js           # Logique de la popup
├── content.js         # Script injecté dans Gmail
├── content.css        # Styles pour Gmail
├── background.js      # Service worker
├── icons/            # Icônes de l'extension
└── README.md         # Ce fichier
```

## 🔐 Sécurité

L'extension utilise :
- `chrome.storage.local` pour stocker le token d'authentification
- Communication sécurisée avec l'API via HTTPS (en production)
- Permissions minimales (storage, activeTab)

## 🐛 Dépannage

### L'extension ne se connecte pas
- Vérifiez que le site web est accessible
- Vérifiez les URLs dans `popup.js`
- Ouvrez la console (clic droit sur l'extension > Inspecter)

### Gmail n'insère pas l'email
- Vérifiez que vous êtes sur `mail.google.com`
- Rechargez la page Gmail
- Vérifiez la console pour les erreurs

## 📝 TODO

- [ ] Convertir les icônes SVG en PNG
- [ ] Ajouter la gestion d'erreurs réseau
- [ ] Implémenter le refresh token
- [ ] Ajouter des analytics
- [ ] Publier sur le Chrome Web Store

## 🚢 Publication sur Chrome Web Store

1. Créez un compte développeur Chrome ($5 unique)
2. Créez un fichier ZIP de l'extension
3. Téléchargez sur le Chrome Web Store
4. Remplissez les informations (description, captures d'écran)
5. Soumettez pour révision

Plus d'infos : https://developer.chrome.com/docs/webstore/publish/
