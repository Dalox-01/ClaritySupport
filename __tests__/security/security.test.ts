/**
 * Tests de sécurité et validation
 * Vérifie les protections contre les attaques courantes
 */

describe('Sécurité et Validation', () => {
  describe('Protection CSRF', () => {
    function validateCSRFToken(token: string, expectedToken: string): boolean {
      if (!token || !expectedToken) return false;
      if (token.length !== expectedToken.length) return false;
      
      // Comparaison en temps constant
      let result = 0;
      for (let i = 0; i < token.length; i++) {
        result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
      }
      return result === 0;
    }

    test('devrait valider un token CSRF correct', () => {
      const token = 'abc123xyz';
      expect(validateCSRFToken(token, token)).toBe(true);
    });

    test('devrait rejeter un token CSRF incorrect', () => {
      expect(validateCSRFToken('abc', 'xyz')).toBe(false);
    });

    test('devrait rejeter un token vide', () => {
      expect(validateCSRFToken('', 'token')).toBe(false);
      expect(validateCSRFToken('token', '')).toBe(false);
    });

    test('devrait rejeter des tokens de longueurs différentes', () => {
      expect(validateCSRFToken('short', 'verylongtoken')).toBe(false);
    });
  });

  describe('Protection XSS', () => {
    function sanitizeHtml(html: string): string {
      return html
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/&(?!lt;|gt;|quot;|#39;)/g, '&amp;');
    }

    test('devrait échapper les balises HTML', () => {
      const input = '<script>alert("XSS")</script>';
      const sanitized = sanitizeHtml(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    test('devrait échapper les guillemets', () => {
      const input = 'onload="alert(1)"';
      const sanitized = sanitizeHtml(input);
      expect(sanitized).toContain('&quot;');
    });

    test('devrait gérer le texte normal', () => {
      const input = 'Hello World';
      expect(sanitizeHtml(input)).toBe('Hello World');
    });
  });

  describe('Protection SQL Injection', () => {
    function containsSQLInjection(input: string): boolean {
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
        /--/,
        /;.*\b(SELECT|DROP|DELETE)\b/i,
        /'.*OR.*'.*=/i,
        /\bOR\s+1\s*=\s*1/i,
      ];
      
      return sqlPatterns.some(pattern => pattern.test(input));
    }

    test('devrait détecter les SELECT injectés', () => {
      expect(containsSQLInjection("'; SELECT * FROM users;--")).toBe(true);
    });

    test('devrait détecter les DROP injectés', () => {
      expect(containsSQLInjection("'; DROP TABLE users;--")).toBe(true);
    });

    test('devrait détecter OR 1=1', () => {
      expect(containsSQLInjection("' OR 1=1--")).toBe(true);
    });

    test('devrait accepter le texte normal', () => {
      expect(containsSQLInjection("Hello, how can I help you?")).toBe(false);
    });
  });

  describe('Validation des entrées', () => {
    function validateEmail(email: string): boolean {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email) && email.length <= 254;
    }

    function validatePassword(password: string): { valid: boolean; errors: string[] } {
      const errors: string[] = [];
      
      if (password.length < 8) errors.push('Minimum 8 caractères');
      if (!/[A-Z]/.test(password)) errors.push('Au moins une majuscule');
      if (!/[a-z]/.test(password)) errors.push('Au moins une minuscule');
      if (!/[0-9]/.test(password)) errors.push('Au moins un chiffre');
      
      return { valid: errors.length === 0, errors };
    }

    test('devrait valider les emails corrects', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    test('devrait rejeter les emails invalides', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test@domain')).toBe(false);
    });

    test('devrait valider les mots de passe forts', () => {
      const result = validatePassword('SecurePass123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('devrait rejeter les mots de passe faibles', () => {
      const result = validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Rate Limiting', () => {
    class RateLimiter {
      private requests: Map<string, { count: number; resetTime: number }> = new Map();
      
      constructor(
        private maxRequests: number = 100,
        private windowMs: number = 60000
      ) {}

      isAllowed(key: string): boolean {
        const now = Date.now();
        const record = this.requests.get(key);

        if (!record || now > record.resetTime) {
          this.requests.set(key, { count: 1, resetTime: now + this.windowMs });
          return true;
        }

        if (record.count >= this.maxRequests) {
          return false;
        }

        record.count++;
        return true;
      }

      getRemainingRequests(key: string): number {
        const record = this.requests.get(key);
        if (!record || Date.now() > record.resetTime) {
          return this.maxRequests;
        }
        return Math.max(0, this.maxRequests - record.count);
      }
    }

    test('devrait autoriser les requêtes sous la limite', () => {
      const limiter = new RateLimiter(5, 1000);
      
      for (let i = 0; i < 5; i++) {
        expect(limiter.isAllowed('user-1')).toBe(true);
      }
    });

    test('devrait bloquer les requêtes au-dessus de la limite', () => {
      const limiter = new RateLimiter(3, 10000);
      
      expect(limiter.isAllowed('user-1')).toBe(true);
      expect(limiter.isAllowed('user-1')).toBe(true);
      expect(limiter.isAllowed('user-1')).toBe(true);
      expect(limiter.isAllowed('user-1')).toBe(false);
    });

    test('devrait retourner le nombre de requêtes restantes', () => {
      const limiter = new RateLimiter(10, 10000);
      
      limiter.isAllowed('user-1');
      limiter.isAllowed('user-1');
      
      expect(limiter.getRemainingRequests('user-1')).toBe(8);
    });

    test('devrait séparer les limites par utilisateur', () => {
      const limiter = new RateLimiter(2, 10000);
      
      expect(limiter.isAllowed('user-1')).toBe(true);
      expect(limiter.isAllowed('user-1')).toBe(true);
      expect(limiter.isAllowed('user-1')).toBe(false);
      
      // User 2 devrait avoir sa propre limite
      expect(limiter.isAllowed('user-2')).toBe(true);
    });
  });

  describe('Validation des quotas', () => {
    interface UserQuota {
      plan: string;
      emailsUsed: number;
      emailsLimit: number;
    }

    function canSendEmail(quota: UserQuota): boolean {
      return quota.emailsUsed < quota.emailsLimit;
    }

    function getQuotaPercentage(quota: UserQuota): number {
      return Math.round((quota.emailsUsed / quota.emailsLimit) * 100);
    }

    function isQuotaNearLimit(quota: UserQuota, threshold: number = 80): boolean {
      return getQuotaPercentage(quota) >= threshold;
    }

    test('devrait autoriser l\'envoi sous la limite', () => {
      const quota: UserQuota = { plan: 'starter', emailsUsed: 100, emailsLimit: 5000 };
      expect(canSendEmail(quota)).toBe(true);
    });

    test('devrait bloquer l\'envoi à la limite', () => {
      const quota: UserQuota = { plan: 'starter', emailsUsed: 5000, emailsLimit: 5000 };
      expect(canSendEmail(quota)).toBe(false);
    });

    test('devrait calculer le pourcentage correctement', () => {
      const quota: UserQuota = { plan: 'pro', emailsUsed: 10000, emailsLimit: 20000 };
      expect(getQuotaPercentage(quota)).toBe(50);
    });

    test('devrait alerter quand proche de la limite', () => {
      const highUsage: UserQuota = { plan: 'scale', emailsUsed: 50000, emailsLimit: 60000 };
      const lowUsage: UserQuota = { plan: 'scale', emailsUsed: 10000, emailsLimit: 60000 };
      
      expect(isQuotaNearLimit(highUsage)).toBe(true);
      expect(isQuotaNearLimit(lowUsage)).toBe(false);
    });
  });
});

describe('Tests d\'intégrité des données', () => {
  describe('Validation des types de plans', () => {
    const VALID_PLANS = ['starter', 'pro', 'scale', 'ADMIN'];

    function isValidPlan(plan: string): boolean {
      return VALID_PLANS.includes(plan);
    }

    test('starter devrait être valide', () => {
      expect(isValidPlan('starter')).toBe(true);
    });

    test('pro devrait être valide', () => {
      expect(isValidPlan('pro')).toBe(true);
    });

    test('scale devrait être valide', () => {
      expect(isValidPlan('scale')).toBe(true);
    });

    test('FREE devrait être invalide (ancien plan)', () => {
      expect(isValidPlan('FREE')).toBe(false);
    });

    test('ENTERPRISE devrait être invalide (ancien plan)', () => {
      expect(isValidPlan('ENTERPRISE')).toBe(false);
    });
  });

  describe('Validation des montants', () => {
    function isValidPrice(price: number): boolean {
      return Number.isFinite(price) && price >= 0;
    }

    function isValidDiscount(discount: number): boolean {
      return Number.isFinite(discount) && discount >= 0 && discount <= 100;
    }

    test('les prix positifs devraient être valides', () => {
      expect(isValidPrice(49)).toBe(true);
      expect(isValidPrice(99)).toBe(true);
      expect(isValidPrice(199)).toBe(true);
    });

    test('les prix négatifs devraient être invalides', () => {
      expect(isValidPrice(-1)).toBe(false);
    });

    test('Infinity devrait être invalide', () => {
      expect(isValidPrice(Infinity)).toBe(false);
    });

    test('les réductions valides (0-100)', () => {
      expect(isValidDiscount(0)).toBe(true);
      expect(isValidDiscount(50)).toBe(true);
      expect(isValidDiscount(100)).toBe(true);
    });

    test('les réductions invalides', () => {
      expect(isValidDiscount(-10)).toBe(false);
      expect(isValidDiscount(150)).toBe(false);
    });
  });
});
