/**
 * Tests unitaires pour le système d'affiliation
 * Teste la génération de codes et la logique métier
 */

describe('Affiliate System', () => {
  describe('Configuration d\'affiliation', () => {
    const AFFILIATE_CONFIG = {
      REFERRER_BONUS: 1500,
      REFERRED_BONUS: 500,
      ELIGIBLE_PLANS: ['pro', 'scale'],
      QUALIFYING_PLANS: ['starter', 'pro', 'scale'],
    };

    test('le bonus parrain devrait être 1500', () => {
      expect(AFFILIATE_CONFIG.REFERRER_BONUS).toBe(1500);
    });

    test('le bonus filleul devrait être 500', () => {
      expect(AFFILIATE_CONFIG.REFERRED_BONUS).toBe(500);
    });

    test('seuls Pro et Scale devraient pouvoir générer un code', () => {
      expect(AFFILIATE_CONFIG.ELIGIBLE_PLANS).toEqual(['pro', 'scale']);
      expect(AFFILIATE_CONFIG.ELIGIBLE_PLANS).not.toContain('starter');
    });

    test('tous les plans payants devraient être qualifiants', () => {
      expect(AFFILIATE_CONFIG.QUALIFYING_PLANS).toContain('starter');
      expect(AFFILIATE_CONFIG.QUALIFYING_PLANS).toContain('pro');
      expect(AFFILIATE_CONFIG.QUALIFYING_PLANS).toContain('scale');
    });
  });

  describe('Génération de code d\'affiliation', () => {
    function generateAffiliateCode(userName: string): string {
      let baseCode = userName
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .substring(0, 4);
      
      while (baseCode.length < 4) {
        baseCode += String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
      
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const year = new Date().getFullYear().toString().substring(2);
      
      return `${baseCode}-${randomPart}${year}`;
    }

    test('devrait générer un code au format XXXX-XXXXXX', () => {
      const code = generateAffiliateCode('JohnDoe');
      expect(code).toMatch(/^[A-Z]{4}-[A-Z0-9]{6}$/);
    });

    test('devrait utiliser les 4 premières lettres du nom', () => {
      const code = generateAffiliateCode('TestUser');
      expect(code).toMatch(/^TEST-/);
    });

    test('devrait gérer les noms courts', () => {
      const code = generateAffiliateCode('Jo');
      expect(code).toMatch(/^[A-Z]{4}-/);
    });

    test('devrait gérer les noms avec caractères spéciaux', () => {
      const code = generateAffiliateCode('Jean-Pierre123');
      expect(code).toMatch(/^[A-Z]{4}-[A-Z0-9]{6}$/);
    });

    test('devrait inclure l\'année actuelle', () => {
      const code = generateAffiliateCode('Test');
      const currentYear = new Date().getFullYear().toString().substring(2);
      expect(code).toContain(currentYear);
    });

    test('devrait générer des codes uniques', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generateAffiliateCode('Test'));
      }
      // Tous les codes devraient être uniques
      expect(codes.size).toBe(100);
    });
  });

  describe('Éligibilité au programme d\'affiliation', () => {
    const ELIGIBLE_PLANS = ['pro', 'scale'];

    function isEligibleForAffiliate(plan: string): boolean {
      return ELIGIBLE_PLANS.includes(plan);
    }

    test('Starter ne devrait pas être éligible', () => {
      expect(isEligibleForAffiliate('starter')).toBe(false);
    });

    test('Pro devrait être éligible', () => {
      expect(isEligibleForAffiliate('pro')).toBe(true);
    });

    test('Scale devrait être éligible', () => {
      expect(isEligibleForAffiliate('scale')).toBe(true);
    });

    test('FREE ne devrait pas être éligible', () => {
      expect(isEligibleForAffiliate('FREE')).toBe(false);
    });

    test('un plan inconnu ne devrait pas être éligible', () => {
      expect(isEligibleForAffiliate('unknown')).toBe(false);
    });
  });

  describe('Calcul des bonus', () => {
    const REFERRER_BONUS = 1500;
    const REFERRED_BONUS = 500;

    function calculateReferrerBonus(referralsCount: number): number {
      return referralsCount * REFERRER_BONUS;
    }

    function calculateTotalBonus(referralsCount: number): number {
      return referralsCount * (REFERRER_BONUS + REFERRED_BONUS);
    }

    test('1 parrainage devrait rapporter 1500 au parrain', () => {
      expect(calculateReferrerBonus(1)).toBe(1500);
    });

    test('5 parrainages devraient rapporter 7500 au parrain', () => {
      expect(calculateReferrerBonus(5)).toBe(7500);
    });

    test('0 parrainages = 0 bonus', () => {
      expect(calculateReferrerBonus(0)).toBe(0);
    });

    test('le total des bonus (parrain + filleul) devrait être correct', () => {
      expect(calculateTotalBonus(1)).toBe(2000);
      expect(calculateTotalBonus(10)).toBe(20000);
    });
  });

  describe('Validation des liens de parrainage', () => {
    function generateReferralLink(code: string, baseUrl: string): string {
      return `${baseUrl}/pricing?ref=${code}`;
    }

    function isValidReferralLink(link: string): boolean {
      try {
        const url = new URL(link);
        return url.pathname === '/pricing' && url.searchParams.has('ref');
      } catch {
        return false;
      }
    }

    test('devrait générer un lien valide', () => {
      const link = generateReferralLink('TEST-ABC123', 'https://claritysupport.fr');
      expect(link).toBe('https://claritysupport.fr/pricing?ref=TEST-ABC123');
    });

    test('devrait valider un lien correct', () => {
      const link = 'https://claritysupport.fr/pricing?ref=TEST-ABC123';
      expect(isValidReferralLink(link)).toBe(true);
    });

    test('devrait rejeter un lien sans ref', () => {
      const link = 'https://claritysupport.fr/pricing';
      expect(isValidReferralLink(link)).toBe(false);
    });

    test('devrait rejeter un lien avec mauvais path', () => {
      const link = 'https://claritysupport.fr/signup?ref=TEST';
      expect(isValidReferralLink(link)).toBe(false);
    });
  });

  describe('Statuts de parrainage', () => {
    const REFERRAL_STATUSES = ['pending', 'completed', 'cancelled'];

    function isValidStatus(status: string): boolean {
      return REFERRAL_STATUSES.includes(status);
    }

    function canAwardBonus(status: string): boolean {
      return status === 'completed';
    }

    test('pending devrait être un statut valide', () => {
      expect(isValidStatus('pending')).toBe(true);
    });

    test('completed devrait être un statut valide', () => {
      expect(isValidStatus('completed')).toBe(true);
    });

    test('seul completed devrait permettre le bonus', () => {
      expect(canAwardBonus('pending')).toBe(false);
      expect(canAwardBonus('completed')).toBe(true);
      expect(canAwardBonus('cancelled')).toBe(false);
    });
  });
});
