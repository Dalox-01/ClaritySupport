/**
 * Utilitaires de sécurité pour protéger contre XSS, injections et autres attaques
 */

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!'; // 32 chars
const ALGORITHM = 'aes-256-cbc';

/**
 * Chiffre une chaîne de caractères
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Déchiffre une chaîne de caractères
 */
export function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Sanitize HTML pour prévenir les attaques XSS
 * Nettoie le contenu HTML en supprimant les scripts et attributs dangereux
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Liste des balises dangereuses à supprimer complètement
  const dangerousTags = [
    'script',
    'iframe',
    'object',
    'embed',
    'applet',
    'meta',
    'link',
    'style',
    'base',
    'form'
  ];
  
  // Supprimer les balises dangereuses
  let sanitized = html;
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gis');
    sanitized = sanitized.replace(regex, '');
    // Aussi les balises auto-fermantes
    const selfClosingRegex = new RegExp(`<${tag}[^>]*\/?>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });
  
  // Supprimer les attributs d'événements (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Supprimer javascript: dans les href et src
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
  
  // Supprimer data: URIs sauf pour les images
  sanitized = sanitized.replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href="#"');
  
  return sanitized;
}

/**
 * Échappe les caractères HTML spéciaux pour éviter les injections XSS
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Valide et sanitize une URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  // Supprimer les espaces
  url = url.trim();
  
  // Bloquer les protocoles dangereux
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase();
  
  if (dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol))) {
    return '#';
  }
  
  // Permettre seulement http, https et mailto
  if (!url.match(/^(https?:\/\/|mailto:|\/|#)/i)) {
    return '#';
  }
  
  return url;
}

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Sanitize input utilisateur (texte brut)
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  
  // Limiter la longueur
  let sanitized = input.substring(0, maxLength);
  
  // Supprimer les caractères de contrôle dangereux sauf newline, tab, carriage return
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Valide un nom de fichier pour éviter les path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  
  // Supprimer les chemins (path traversal)
  let sanitized = filename.replace(/^.*[\\\/]/, '');
  
  // Supprimer les caractères dangereux
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limiter la longueur
  sanitized = sanitized.substring(0, 255);
  
  return sanitized;
}

/**
 * Vérifie si une chaîne contient du code potentiellement malveillant
 */
export function containsMaliciousCode(input: string): boolean {
  if (!input) return false;
  
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /<iframe/i,
    /eval\(/i,
    /expression\(/i,
    /-moz-binding/i,
    /data:text\/html/i,
  ];
  
  return maliciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Génère un token CSRF sécurisé
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Valide les paramètres de requête contre les injections SQL
 * (bien que Supabase utilise des requêtes paramétrées, c'est une couche supplémentaire)
 */
export function validateSqlInput(input: string): boolean {
  if (!input) return true;
  
  // Patterns SQL dangereux
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/i,
    /(--|\;|\/\*|\*\/)/,
    /('|"|`)\s*(OR|AND)\s*('|"|`)?\s*\d+\s*=\s*\d+/i,
  ];
  
  return !sqlInjectionPatterns.some(pattern => pattern.test(input));
}

/**
 * Rate limiting simple en mémoire (pour le développement)
 * En production, utilisez Redis avec Upstash
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || now > record.resetTime) {
    // Nouvelle fenêtre
    const resetTime = now + windowMs;
    requestCounts.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

/**
 * Nettoie périodiquement le cache de rate limiting
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    requestCounts.forEach((value, key) => {
      if (now > value.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => requestCounts.delete(key));
  }, 60000); // Toutes les minutes
}

/**
 * Valide et sanitize un objet JSON
 */
export function sanitizeJson<T>(obj: any, allowedKeys: string[]): Partial<T> {
  if (!obj || typeof obj !== 'object') return {};
  
  const sanitized: any = {};
  
  for (const key of allowedKeys) {
    if (key in obj) {
      const value = obj[key];
      
      // Sanitize selon le type
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? sanitizeInput(item) : item
        );
      }
    }
  }
  
  return sanitized;
}

/**
 * Vérifie la force d'un mot de passe
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!password) {
    return { valid: false, errors: ['Le mot de passe est requis'] };
  }
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Protège contre les timing attacks lors de la comparaison de secrets
 */
export function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
