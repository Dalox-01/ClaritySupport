# 🛡️ Guide Rapide - Sécurité pour Développeurs

## Avant de Coder

Toujours se rappeler : **Ne jamais faire confiance aux inputs utilisateurs !**

## 📋 Checklist pour Chaque Feature

Avant d'ajouter une nouvelle fonctionnalité :

- [ ] L'input utilisateur est-il validé ? (Zod, Joi, etc.)
- [ ] L'input est-il sanitizé ?
- [ ] L'authentification est-elle vérifiée ?
- [ ] Un rate limiting est-il nécessaire ?
- [ ] Les données sensibles sont-elles protégées ?
- [ ] Les logs ne contiennent-ils pas de secrets ?

## 🔧 Utilitaires Disponibles

### Dans les API Routes

```typescript
import { secureApiRoute } from '@/lib/api-helpers';

// Utilisation automatique de la sécurité
export const POST = secureApiRoute(
  async (req) => {
    // Votre logique ici
    const body = (req as any).sanitizedBody; // Déjà validé et nettoyé
    return NextResponse.json({ success: true });
  },
  {
    requireAuth: true,        // Authentification requise
    rateLimit: 30,            // 30 requêtes par minute
    allowedMethods: ['POST'], // Méthodes autorisées
    allowedBodyKeys: ['name', 'email', 'content'], // Clés autorisées
  }
);
```

### Validation avec Zod

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
});

const validated = schema.parse(userInput);
```

### Sanitization HTML

```typescript
import { sanitizeHtml, escapeHtml } from '@/lib/security';

// Pour du HTML à afficher
const cleanHtml = sanitizeHtml(userProvidedHtml);

// Pour du texte brut
const safeText = escapeHtml(userInput);
```

### Validation URL

```typescript
import { sanitizeUrl } from '@/lib/security';

const safeUrl = sanitizeUrl(userUrl);
// javascript:alert(1) → #
// https://safe.com → https://safe.com
```

## ❌ À NE JAMAIS FAIRE

```typescript
// ❌ DANGEREUX
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SÛR
import { sanitizeHtml } from '@/lib/security';
const clean = sanitizeHtml(userInput);
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

```typescript
// ❌ DANGEREUX
element.innerHTML = userInput;

// ✅ SÛR
import { escapeHtml } from '@/lib/security';
element.textContent = escapeHtml(userInput);
```

```typescript
// ❌ DANGEREUX
eval(userCode);

// ✅ N'utilisez JAMAIS eval avec des données utilisateur
```

## 🔑 Gestion des Secrets

```typescript
// ❌ DANGEREUX
const apiKey = 'sk-1234567890'; // Hardcodé

// ✅ SÛR
const apiKey = process.env.OPENAI_API_KEY;
```

```typescript
// ❌ DANGEREUX - Exposer au client
export default function Page() {
  const secret = process.env.STRIPE_SECRET_KEY; // ❌
  return <div>{secret}</div>;
}

// ✅ SÛR - Garder côté serveur
export async function getServerSideProps() {
  const secret = process.env.STRIPE_SECRET_KEY; // ✅
  // Utiliser le secret ici, NE PAS le retourner
}
```

## 📝 Logging Sécurisé

```typescript
import { logInfo, logError } from '@/lib/logger';

// ✅ SÛR
logInfo('User logged in', { userId: user.id });

// ❌ DANGEREUX
logInfo('User logged in', { 
  email: user.email, 
  password: user.password // ❌ NE JAMAIS LOGGER
});
```

## 🔐 Mots de Passe

```typescript
import { validatePasswordStrength } from '@/lib/security';
import bcrypt from 'bcryptjs';

// Validation
const result = validatePasswordStrength(password);
if (!result.valid) {
  return { error: result.errors };
}

// Hashage
const hashedPassword = await bcrypt.hash(password, 10);

// Vérification
const isValid = await bcrypt.compare(password, hashedPassword);
```

## 🌐 CORS et Headers

Le middleware gère automatiquement :
- Rate limiting
- Headers de sécurité
- Validation des Content-Types
- Protection contre les patterns suspects

```typescript
// Dans middleware.ts - Déjà configuré
// Pas besoin de modifier sauf cas particuliers
```

## 📊 Rate Limiting

```typescript
import { checkRateLimit } from '@/lib/security';

const result = checkRateLimit(userId, 10, 60000); // 10 req/min

if (!result.allowed) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  );
}
```

## 🧪 Tester la Sécurité

```bash
# Tester les utilitaires
npm run dev
# Puis dans un autre terminal
npx ts-node lib/test-security.ts

# Audit npm
npm audit
npm audit fix

# Build pour vérifier
npm run build
```

## 📚 Exemples Complets

### API Route Sécurisée Complète

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { secureApiRoute, errorResponse, successResponse } from '@/lib/api-helpers';
import { sanitizeInput, isValidEmail } from '@/lib/security';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
});

export const POST = secureApiRoute(
  async (req) => {
    try {
      const body = (req as any).sanitizedBody;
      
      // Validation supplémentaire
      const validated = contactSchema.parse(body);
      
      // Sanitization
      const cleanData = {
        name: sanitizeInput(validated.name, 100),
        email: validated.email,
        message: sanitizeInput(validated.message, 1000),
      };
      
      // Traitement...
      
      return successResponse({ message: 'Contact envoyé' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse('Validation failed', 400, error.errors);
      }
      return errorResponse('Internal error', 500);
    }
  },
  {
    requireAuth: false,
    rateLimit: 5, // 5 contacts par minute max
    allowedMethods: ['POST'],
    allowedBodyKeys: ['name', 'email', 'message'],
  }
);
```

### Composant Client Sécurisé

```typescript
'use client';

import { useState } from 'react';
import { sanitizeInput, isValidEmail } from '@/lib/security';

export default function ContactForm() {
  const [formData, setFormData] = useState({ email: '', message: '' });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    const newErrors: string[] = [];
    
    if (!isValidEmail(formData.email)) {
      newErrors.push('Email invalide');
    }
    
    if (formData.message.length < 10) {
      newErrors.push('Message trop court');
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Sanitization avant envoi
    const cleanData = {
      email: sanitizeInput(formData.email),
      message: sanitizeInput(formData.message, 1000),
    };
    
    // Envoi sécurisé
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanData),
    });
    
    // Traitement de la réponse...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire */}
    </form>
  );
}
```

## 🚨 Signaler une Vulnérabilité

Si vous découvrez une faille de sécurité :

1. **NE PAS** créer une issue publique GitHub
2. Contactez l'équipe en privé
3. Décrivez la vulnérabilité en détail
4. Attendez la correction avant de divulguer

## 📖 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- Documentation complète : `SECURITY.md`

---

**Dernière mise à jour:** 2025-11-02
**Maintenu par:** Équipe MailWiz
