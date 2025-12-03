/**
 * Tests des utilitaires et helpers
 */

describe('Utilitaires généraux', () => {
  describe('Formatage des montants', () => {
    function formatPrice(amount: number, currency: string = '€'): string {
      return `${amount.toLocaleString('fr-FR')}${currency}`;
    }

    function formatPriceWithPeriod(amount: number, period: 'monthly' | 'yearly'): string {
      const periodLabel = period === 'monthly' ? '/mois' : '/an';
      return `${amount}€${periodLabel}`;
    }

    test('devrait formater les prix en euros', () => {
      expect(formatPrice(49)).toBe('49€');
      expect(formatPrice(99)).toBe('99€');
      expect(formatPrice(199)).toBe('199€');
    });

    test('devrait formater les grands nombres', () => {
      expect(formatPrice(1990)).toContain('1');
      expect(formatPrice(1990)).toContain('990');
    });

    test('devrait ajouter la période', () => {
      expect(formatPriceWithPeriod(49, 'monthly')).toBe('49€/mois');
      expect(formatPriceWithPeriod(490, 'yearly')).toBe('490€/an');
    });
  });

  describe('Formatage des dates', () => {
    function formatDate(date: Date): string {
      return date.toLocaleDateString('fr-FR');
    }

    function formatDateTime(date: Date): string {
      return date.toLocaleString('fr-FR');
    }

    function isDateInPast(date: Date): boolean {
      return date < new Date();
    }

    function getDaysDifference(date1: Date, date2: Date): number {
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    test('devrait formater les dates en français', () => {
      const date = new Date(2025, 11, 3); // 3 décembre 2025
      const formatted = formatDate(date);
      expect(formatted).toContain('2025');
    });

    test('devrait détecter les dates passées', () => {
      const pastDate = new Date(2020, 0, 1);
      const futureDate = new Date(2030, 0, 1);
      
      expect(isDateInPast(pastDate)).toBe(true);
      expect(isDateInPast(futureDate)).toBe(false);
    });

    test('devrait calculer la différence en jours', () => {
      const date1 = new Date(2025, 11, 1);
      const date2 = new Date(2025, 11, 10);
      
      expect(getDaysDifference(date1, date2)).toBe(9);
    });
  });

  describe('Validation des chaînes', () => {
    function isEmpty(str: string | null | undefined): boolean {
      return !str || str.trim().length === 0;
    }

    function truncate(str: string, maxLength: number): string {
      if (str.length <= maxLength) return str;
      return str.substring(0, maxLength - 3) + '...';
    }

    function slugify(str: string): string {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    test('devrait détecter les chaînes vides', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('text')).toBe(false);
    });

    test('devrait tronquer les chaînes longues', () => {
      const longText = 'Ceci est un texte très long qui doit être tronqué';
      const truncated = truncate(longText, 20);
      
      expect(truncated.length).toBe(20);
      expect(truncated).toContain('...');
    });

    test('devrait créer des slugs valides', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Café résumé')).toBe('cafe-resume');
      expect(slugify('Test 123!')).toBe('test-123');
    });
  });

  describe('Manipulation de tableaux', () => {
    function unique<T>(array: T[]): T[] {
      const result: T[] = [];
      for (const item of array) {
        if (!result.includes(item)) {
          result.push(item);
        }
      }
      return result;
    }

    function chunk<T>(array: T[], size: number): T[][] {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    }

    function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
      return array.reduce((acc, item) => {
        const groupKey = String(item[key]);
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(item);
        return acc;
      }, {} as Record<string, T[]>);
    }

    test('devrait retirer les doublons', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });

    test('devrait diviser en chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
    });

    test('devrait grouper par clé', () => {
      const items = [
        { category: 'A', name: 'Item 1' },
        { category: 'B', name: 'Item 2' },
        { category: 'A', name: 'Item 3' },
      ];
      
      const grouped = groupBy(items, 'category');
      expect(grouped['A']).toHaveLength(2);
      expect(grouped['B']).toHaveLength(1);
    });
  });

  describe('Calculs numériques', () => {
    function percentage(value: number, total: number): number {
      if (total === 0) return 0;
      return Math.round((value / total) * 100);
    }

    function clamp(value: number, min: number, max: number): number {
      return Math.min(Math.max(value, min), max);
    }

    function roundToDecimal(value: number, decimals: number): number {
      const factor = Math.pow(10, decimals);
      return Math.round(value * factor) / factor;
    }

    test('devrait calculer les pourcentages', () => {
      expect(percentage(50, 100)).toBe(50);
      expect(percentage(25, 200)).toBe(13);
      expect(percentage(0, 100)).toBe(0);
      expect(percentage(100, 0)).toBe(0);
    });

    test('devrait limiter les valeurs (clamp)', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    test('devrait arrondir aux décimales', () => {
      expect(roundToDecimal(3.14159, 2)).toBe(3.14);
      expect(roundToDecimal(3.14159, 4)).toBe(3.1416);
      expect(roundToDecimal(3.5, 0)).toBe(4);
    });
  });

  describe('Génération d\'identifiants', () => {
    function generateId(length: number = 8): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    function generateNumericCode(length: number = 6): string {
      return Math.random().toString().substring(2, 2 + length);
    }

    test('devrait générer des IDs de la bonne longueur', () => {
      expect(generateId(8).length).toBe(8);
      expect(generateId(16).length).toBe(16);
    });

    test('devrait générer des IDs alphanumériques', () => {
      const id = generateId(100);
      expect(id).toMatch(/^[A-Za-z0-9]+$/);
    });

    test('devrait générer des codes numériques', () => {
      const code = generateNumericCode(6);
      expect(code).toMatch(/^[0-9]+$/);
    });

    test('devrait générer des IDs uniques', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateId(12));
      }
      expect(ids.size).toBe(1000);
    });
  });
});
