# 🚀 Quick Start - Vérification Sécurité

## 1️⃣ Vérifier que tout compile

```bash
npm run typecheck
```

✅ Pas d'erreurs TypeScript

## 2️⃣ Tester les utilitaires de sécurité

```bash
npm run security:test
```

✅ Tous les tests passent

## 3️⃣ Vérifier les vulnérabilités npm

```bash
npm run security:audit
```

✅ Aucune vulnérabilité critique

## 4️⃣ Tester le serveur avec les nouveaux headers

```bash
# Terminal 1: Lancer le serveur
npm run dev

# Terminal 2: Tester les headers
curl -I http://localhost:3000
```

✅ Vérifier la présence de:
- `X-XSS-Protection`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Content-Security-Policy`

## 5️⃣ Tester le rate limiting

```powershell
# Envoyer 101 requêtes rapidement
for ($i=0; $i -lt 101; $i++) {
  curl http://localhost:3000/api/test -s -o $null
  Write-Host "Request $i"
}
```

✅ Les requêtes après 100 doivent être bloquées (429)

## 6️⃣ Tester la protection XSS

Dans votre navigateur:

1. Ouvrir http://localhost:3000
2. Ouvrir la console développeur (F12)
3. Essayer d'injecter un script:

```javascript
// Ces tentatives doivent être bloquées
fetch('/api/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: '<script>alert("XSS")</script>'
  })
});
```

✅ Le script doit être sanitizé

## 7️⃣ Vérifier le CSP

Dans la console navigateur (F12), vérifiez les headers de réponse:

```
Content-Security-Policy: default-src 'self'; script-src 'self' ...
```

✅ CSP présent et strict

## 📝 Checklist Complète

Avant le déploiement:

- [ ] `npm run typecheck` ✅
- [ ] `npm run security:test` ✅
- [ ] `npm run security:audit` ✅
- [ ] Headers de sécurité présents ✅
- [ ] Rate limiting fonctionne ✅
- [ ] XSS protection active ✅
- [ ] `.env` configuré avec vraies valeurs
- [ ] `NEXTAUTH_SECRET` changé (32+ chars)
- [ ] SSL/TLS activé sur le serveur
- [ ] Documentation lue (`SECURITY.md`)

## 🎯 Résultat Attendu

Tous les tests doivent passer sans erreur. Si vous rencontrez un problème, consultez:

- `SECURITY.md` - Documentation complète
- `SECURITY_DEV.md` - Guide développeurs
- `SECURISATION_RAPPORT.md` - Rapport détaillé

## ⚡ Commandes Rapides

```bash
# Tout tester d'un coup
npm run typecheck && npm run security:audit

# Lancer le serveur
npm run dev

# Build production
npm run build

# Démarrer en production
npm start
```

## 🔥 En Production

```bash
# Variables d'environnement
NODE_ENV=production
NEXTAUTH_URL=https://votredomaine.com
NEXTAUTH_SECRET=votre-secret-unique-32-chars

# Vérifier les headers après déploiement
curl -I https://votredomaine.com

# Tester SSL
curl -vI https://votredomaine.com 2>&1 | grep -i "ssl\|tls"
```

---

✅ **Vous êtes prêt !** Votre application est sécurisée.
