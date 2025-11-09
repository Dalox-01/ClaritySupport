# Guide de Sécurité - MailWiz

## ✅ Mesures de Sécurité Implémentées

### 🛡️ 1. Protection XSS (Cross-Site Scripting)

#### Headers HTTP
- **X-XSS-Protection**: Activé avec mode=block
- **Content-Security-Policy**: Politique stricte limitant les sources de contenu
- **X-Content-Type-Options**: nosniff pour prévenir le MIME sniffing

#### Sanitization des Inputs
Fichier: `lib/security.ts`

- ✅ `sanitizeHtml()` - Nettoie le HTML en supprimant scripts et attributs dangereux
- ✅ `escapeHtml()` - Échappe les caractères spéciaux HTML
- ✅ `sanitizeInput()` - Nettoie les inputs texte bruts
- ✅ `containsMaliciousCode()` - Détecte le code malveillant

**Utilisation:**
```typescript
import { sanitizeHtml, escapeHtml } from '@/lib/security';

// Pour du contenu HTML
const cleanHtml = sanitizeHtml(userProvidedHtml);

// Pour du texte brut
const cleanText = escapeHtml(userInput);
```

### 🔒 2. Protection CSRF (Cross-Site Request Forgery)

- NextAuth inclut une protection CSRF native
- Token CSRF dans les headers: `X-CSRF-Token`
- Validation de l'origine des requêtes dans le middleware

### 🚫 3. Protection Clickjacking

**Headers configurés:**
- `X-Frame-Options: DENY` - Empêche l'intégration dans des iframes
- `frame-ancestors 'self'` dans CSP

### 🔐 4. Protection Injection SQL

**Supabase** utilise automatiquement des requêtes paramétrées, mais on ajoute:

```typescript
import { validateSqlInput } from '@/lib/security';

if (!validateSqlInput(userInput)) {
  return { error: 'Input invalide détecté' };
}
```

### ⚡ 5. Rate Limiting

**Middleware configuré** (`middleware.ts`):
- 100 requêtes par minute par IP
- Réponse 429 (Too Many Requests) si dépassé
- Headers: `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`

**Pour production avec Redis:**
```bash
# Dans .env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### 🔑 6. Authentification Sécurisée

**NextAuth configuré avec:**
- Sessions sécurisées
- Cookies httpOnly
- CSRF protection intégrée
- OAuth sécurisé (Google, Microsoft)

**Validation des mots de passe:**
```typescript
import { validatePasswordStrength } from '@/lib/security';

const result = validatePasswordStrength(password);
if (!result.valid) {
  console.log(result.errors); // Liste des erreurs
}
```

### 🌐 7. HTTPS et Transport Sécurisé

**HSTS (HTTP Strict Transport Security):**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**⚠️ Important:** Activez SSL/TLS en production avec votre hébergeur

### 📝 8. Validation des Inputs

**Toutes les API routes utilisent Zod pour la validation:**

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  content: z.string().max(5000),
});

const validated = schema.parse(body);
```

### 🗃️ 9. Sécurité des Données

**Stockage sécurisé:**
- Mots de passe hashés avec bcrypt (factor 10)
- Tokens sensibles stockés côté serveur uniquement
- Variables d'environnement pour les secrets
- Jamais de secrets dans le code source

**Supabase RLS (Row Level Security):**
- Politiques de sécurité au niveau base de données
- Utilisateurs ne peuvent accéder qu'à leurs propres données

### 🎯 10. Content Security Policy (CSP)

**Configuration stricte dans `next.config.js`:**

```javascript
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://accounts.google.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.supabase.co https://api.openai.com https://api.stripe.com;
  frame-src 'self' https://js.stripe.com https://accounts.google.com;
  object-src 'none';
```

### 🚨 11. Détection de Patterns Suspects

**Middleware bloque automatiquement:**
- Scripts dans les URLs (`<script`, `javascript:`)
- Path traversal (`../../../`)
- Null bytes (`\0`)
- Event handlers (`onclick=`, `onerror=`)

### 📊 12. Logging et Monitoring

**Logger sécurisé** (`lib/logger.ts`):
- Ne log jamais de données sensibles
- Suppression automatique des secrets
- Environnement détecté automatiquement

```typescript
import { logInfo, logError } from '@/lib/logger';

logInfo('Action performed', { userId: user.id }); // OK
// NE JAMAIS FAIRE:
// logInfo('Login', { password: 'secret' }); // ❌
```

## 🔧 Configuration de Production

### Variables d'Environnement Critiques

```bash
# .env.production

# NextAuth - GÉNÉRER UNE NOUVELLE CLÉ!
NEXTAUTH_SECRET=CHANGEZ_CETTE_CLE_AVEC_UNE_LONGUE_CHAINE_ALEATOIRE
NEXTAUTH_URL=https://votredomaine.com

# Database
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# APIs - Utilisez les clés LIVE
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...

# Email
RESEND_API_KEY=re_...

# Security
NODE_ENV=production
```

### Générer une clé sécurisée

```bash
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Ou en ligne
https://generate-secret.vercel.app/32
```

## ✅ Checklist de Sécurité

Avant le déploiement:

- [ ] Toutes les variables `.env.example` sont configurées
- [ ] `NEXTAUTH_SECRET` est unique et sécurisé (32+ caractères)
- [ ] `NEXTAUTH_URL` pointe vers le domaine de production
- [ ] SSL/TLS est activé sur le serveur
- [ ] Rate limiting est configuré (avec Redis en prod)
- [ ] Logs de sécurité sont configurés
- [ ] Backup de la base de données est automatisé
- [ ] Les dépendances npm sont à jour: `npm audit fix`
- [ ] Pas de `console.log` avec données sensibles
- [ ] Stripe utilise les clés LIVE (pas TEST)
- [ ] Google OAuth configuré avec le bon domaine
- [ ] Permissions minimales sur les clés API
- [ ] CORS configuré correctement
- [ ] Headers de sécurité testés sur https://securityheaders.com/

## 🛠️ Tests de Sécurité

### Tester les headers de sécurité

```bash
# Avec curl
curl -I https://votredomaine.com

# Vérifier CSP, HSTS, X-Frame-Options, etc.
```

### Scan de vulnérabilités

```bash
# NPM Audit
npm audit

# Fix automatique
npm audit fix

# Fix forcing
npm audit fix --force
```

### Tester Rate Limiting

```bash
# Envoyer 101 requêtes rapidement
for ($i=0; $i -lt 101; $i++) {
  curl https://votredomaine.com/api/test
}
# La 101ème doit retourner 429
```

## 🚨 En Cas d'Incident

### Si une faille est détectée:

1. **Isoler immédiatement** - Mettre le site en maintenance
2. **Analyser les logs** - Identifier l'attaque
3. **Patcher la faille** - Corriger le code
4. **Changer les secrets** - Régénérer toutes les clés
5. **Notifier les utilisateurs** si données compromises
6. **Audit complet** - Vérifier toute la codebase

### Contacts d'urgence

```
Supabase: support@supabase.io
Stripe: https://support.stripe.com
Vercel: https://vercel.com/support
```

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

## 📝 Utilisation des Utilitaires de Sécurité

### Dans une API Route

```typescript
import { secureApiRoute } from '@/lib/api-helpers';
import { sanitizeInput, sanitizeHtml } from '@/lib/security';

export const POST = secureApiRoute(
  async (req) => {
    const body = (req as any).sanitizedBody;
    
    // Le body est déjà validé et sanitizé
    const cleanContent = sanitizeHtml(body.content);
    
    // Traitement...
    
    return NextResponse.json({ success: true });
  },
  {
    requireAuth: true,
    rateLimit: 30,
    allowedMethods: ['POST'],
    allowedBodyKeys: ['title', 'content', 'type'],
  }
);
```

### Dans un Composant Client

```typescript
'use client';

import { escapeHtml, sanitizeUrl } from '@/lib/security';

function MyComponent({ userContent, userUrl }) {
  const safeContent = escapeHtml(userContent);
  const safeUrl = sanitizeUrl(userUrl);
  
  return (
    <div>
      <p>{safeContent}</p>
      <a href={safeUrl}>Lien</a>
    </div>
  );
}
```

## ⚠️ Points d'Attention

### Ne JAMAIS faire:

❌ `eval(userInput)`
❌ `dangerouslySetInnerHTML={{ __html: userInput }}` sans sanitization
❌ `innerHTML = userInput`
❌ Stocker des mots de passe en clair
❌ Logger des données sensibles
❌ Exposer des clés API côté client
❌ Accepter n'importe quel Content-Type
❌ Faire confiance à l'input utilisateur

### TOUJOURS faire:

✅ Valider avec Zod ou similaire
✅ Sanitizer les inputs utilisateurs
✅ Utiliser des requêtes paramétrées
✅ Hasher les mots de passe (bcrypt)
✅ Vérifier l'authentification
✅ Limiter le rate
✅ Logger les événements de sécurité
✅ Garder les dépendances à jour
✅ Utiliser HTTPS en production
✅ Configurer CSP stricte

---

**Dernière mise à jour:** 2025-11-02
**Version:** 1.0.0
**Statut:** ✅ Production Ready
