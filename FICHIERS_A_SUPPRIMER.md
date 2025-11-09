# 🗑️ Fichiers à supprimer (Ancien système)

## Analyse complète avant suppression

### ✅ APIs UTILISÉES par le Mail Center actuel :
- `/api/auth/*` - NextAuth (authentification)
- `/api/mail-center/*` - TOUT le Mail Center (cœur du système)
- `/api/stripe/*` - Paiements Stripe
- `/api/subscription/*` - Gestion abonnements
- `/api/contact/*` - Formulaire contact
- `/api/signatures/*` - Signatures emails (Mail Center)
- `/api/user-templates/*` - Templates utilisateur (Mail Center)
- `/api/ai/generate` - Génération emails IA
- `/api/ai/generate-reply` - Génération réponses IA
- `/api/usage` - Suivi usage quotas
- `/api/test/*` - Routes de test (dev)

### ❌ APIs OBSOLÈTES (à supprimer) :

1. **`/api/billing/*`** - OBSOLÈTE
   - Remplacé par `/api/stripe/*`
   - Fichiers marqués comme obsolètes dans le code
   - checkout.route.ts retourne erreur 410
   
2. **`/api/emails/*`** - Ancien système
   - send/ - envoi emails (remplacé par `/api/mail-center/send-reply`)
   - [id]/favorite/ - favoris (non utilisé)
   
3. **`/api/templates/*`** - Ancien système
   - Différent de `/api/user-templates/*`
   - Non utilisé dans le Mail Center
   
4. **`/api/variables/*`** - Ancien système
   - Variables emails (non utilisé)
   
5. **`/api/history/*`** - Ancien système
   - [id]/ - historique (non utilisé)
   
6. **`/api/analytics/*`** - Ancien système
   - Analytics basiques (non utilisé)
   
7. **`/api/extension/*`** - Extension Chrome
   - auth/, generate/, usage/ (non utilisé)
   
8. **`/api/gmail/*`** - Ancien OAuth
   - auth/, callback/, send/ (remplacé par `/api/mail-center/gmail/*`)
   
9. **`/api/outlook/*`** - Ancien OAuth
   - auth/, callback/, send/ (remplacé par `/api/mail-center/outlook/*`)
   
10. **`/api/ai/chat`** - Chat IA
    - Non utilisé dans le projet actuel
    
11. **`/api/ai/transcribe`** - Transcription
    - Non utilisé dans le projet actuel

### ❌ PAGES OBSOLÈTES (à supprimer) :

1. **`/app/extension-auth/`** - Auth extension Chrome
   - Non utilisé dans Mail Center

### ✅ PAGES À GARDER :

- `/app/page.tsx` - Home (page d'accueil)
- `/app/mail-center/` - Mail Center (cœur)
- `/app/contact/` - Page contact
- `/app/auth/` - Authentification
- `/app/checkout/` - Paiement

## Commandes de suppression (PowerShell)

```powershell
# Se placer dans le dossier du projet
cd C:\Users\laszl\Desktop\SiteDalox\IAmailcenter\project

# Supprimer les API obsolètes
Remove-Item -Recurse -Force "app\api\billing"
Remove-Item -Recurse -Force "app\api\emails"
Remove-Item -Recurse -Force "app\api\templates"
Remove-Item -Recurse -Force "app\api\variables"
Remove-Item -Recurse -Force "app\api\history"
Remove-Item -Recurse -Force "app\api\analytics"
Remove-Item -Recurse -Force "app\api\extension"
Remove-Item -Recurse -Force "app\api\gmail"
Remove-Item -Recurse -Force "app\api\outlook"
Remove-Item -Recurse -Force "app\api\ai\chat"
Remove-Item -Recurse -Force "app\api\ai\transcribe"

# Supprimer la page obsolète
Remove-Item -Recurse -Force "app\extension-auth"

# Vérifier que tout compile encore
npm run build
```

## ⚠️ IMPORTANT - Vérifier avant suppression

1. **Faire un commit Git AVANT** :
   ```bash
   git add -A
   git commit -m "checkpoint: before cleaning old code"
   git push origin clean-main
   ```

2. **Tester après suppression** :
   - Build réussit : `npm run build`
   - Home fonctionne : http://localhost:3000
   - Mail Center fonctionne : http://localhost:3000/mail-center
   - Contact fonctionne : http://localhost:3000/contact
   - Auth fonctionne
   - Paiement fonctionne

3. **Si problème** :
   ```bash
   git reset --hard HEAD
   ```

## 📊 Gain d'espace estimé

- ~15 fichiers API obsolètes
- ~500 lignes de code inutile
- Architecture plus claire
- Maintenance facilitée
