# Configuration de Google OAuth pour MailWizard

## 📋 Prérequis

Vous devez avoir un compte Google pour créer un projet OAuth.

## 🔧 Étapes de configuration

### 1. Accéder à Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google

### 2. Créer un nouveau projet

1. Cliquez sur le sélecteur de projet en haut de la page
2. Cliquez sur **"Nouveau projet"**
3. Donnez un nom à votre projet (ex: "MailWizard")
4. Cliquez sur **"Créer"**

### 3. Activer l'API Google+

1. Dans le menu latéral, allez dans **"APIs & Services"** > **"Bibliothèque"**
2. Recherchez **"Google+ API"**
3. Cliquez dessus et activez l'API

### 4. Configurer l'écran de consentement OAuth

1. Allez dans **"APIs & Services"** > **"Écran de consentement OAuth"**
2. Sélectionnez **"Externe"** comme type d'utilisateur
3. Cliquez sur **"Créer"**
4. Remplissez les informations requises :
   - **Nom de l'application** : MailWizard
   - **E-mail d'assistance utilisateur** : votre email
   - **Domaine autorisé** : localhost (pour le développement)
   - **E-mail de contact du développeur** : votre email
5. Cliquez sur **"Enregistrer et continuer"**
6. **Étendues** : Ignorez cette étape (cliquez sur "Enregistrer et continuer")
7. **Utilisateurs test** : Ajoutez votre email de test
8. Cliquez sur **"Enregistrer et continuer"**

### 5. Créer les identifiants OAuth 2.0

1. Allez dans **"APIs & Services"** > **"Identifiants"**
2. Cliquez sur **"+ Créer des identifiants"**
3. Sélectionnez **"ID client OAuth"**
4. Type d'application : **"Application Web"**
5. Nom : **"MailWizard Web Client"**
6. **URI de redirection autorisés** : Ajoutez :
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Cliquez sur **"Créer"**

### 6. Récupérer les clés

1. Une fenêtre s'affichera avec votre **ID client** et votre **Secret client**
2. **Copiez ces deux valeurs !**

### 7. Configurer les variables d'environnement

1. Ouvrez le fichier `.env` dans votre projet
2. Remplacez les valeurs par défaut :

```env
GOOGLE_CLIENT_ID=votre-id-client-ici.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-secret-client-ici
```

### 8. Redémarrer le serveur

```bash
npm run dev
```

## ✅ Vérification

1. Allez sur http://localhost:3000
2. Cliquez sur **"Se connecter avec Google"**
3. Vous devriez être redirigé vers la page de connexion Google
4. Après authentification, vous serez redirigé vers le dashboard

## 🚀 Pour la production

Quand vous déployez en production, n'oubliez pas de :

1. Retourner dans Google Cloud Console
2. Ajouter votre domaine de production dans les **URI de redirection autorisés** :
   ```
   https://votredomaine.com/api/auth/callback/google
   ```
3. Mettre à jour la variable `NEXTAUTH_URL` dans votre fichier `.env` de production :
   ```env
   NEXTAUTH_URL=https://votredomaine.com
   ```

## 🔒 Sécurité

- **Ne partagez JAMAIS** votre `GOOGLE_CLIENT_SECRET`
- Ajoutez `.env` à votre `.gitignore`
- Utilisez des variables d'environnement dans votre plateforme de déploiement

## ❓ Problèmes courants

### Erreur "redirect_uri_mismatch"
- Vérifiez que l'URI de redirection dans Google Cloud Console correspond exactement à celle utilisée par NextAuth
- Format : `http://localhost:3000/api/auth/callback/google` (pas de slash à la fin)

### "Access blocked: This app's request is invalid"
- Vérifiez que vous avez bien configuré l'écran de consentement OAuth
- Ajoutez votre email en tant qu'utilisateur test

### L'authentification ne fonctionne pas
- Vérifiez que le serveur Next.js est bien redémarré après avoir modifié `.env`
- Vérifiez que `NEXTAUTH_SECRET` est bien défini dans `.env`

## 📚 Ressources

- [Documentation NextAuth.js](https://next-auth.js.org/providers/google)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
