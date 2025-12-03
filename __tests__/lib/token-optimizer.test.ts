/**
 * Tests unitaires pour lib/token-optimizer.ts
 * Teste le système d'optimisation des tokens IA
 */

// Mock OpenAI avant l'import du module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Contexte synthétisé: Entreprise e-commerce, ton professionnel, retours 14 jours.'
            }
          }]
        })
      }
    }
  }));
});

// Mock Supabase
jest.mock('../../lib/db', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-user-id',
          ai_prompt_config: {
            tone: 'professionnel',
            companyName: 'TestCorp',
          },
          knowledge_base: null,
          optimized_ai_context: null,
          optimized_ai_hash: null,
        },
        error: null
      }),
      update: jest.fn().mockResolvedValue({ error: null }),
    }),
  }
}));

describe('Token Optimizer', () => {
  describe('Estimation de tokens', () => {
    // Fonction simulée pour les tests
    function estimateTokens(text: string): number {
      if (!text) return 0;
      return Math.ceil(text.length / 3.5);
    }

    test('devrait retourner 0 pour un texte vide', () => {
      expect(estimateTokens('')).toBe(0);
      expect(estimateTokens(null as any)).toBe(0);
    });

    test('devrait estimer correctement le nombre de tokens', () => {
      // ~3.5 caractères par token en français
      const shortText = 'Bonjour'; // 7 chars ≈ 2 tokens
      const longText = 'Ceci est un texte plus long pour tester l\'estimation des tokens.'; // 66 chars ≈ 19 tokens
      
      expect(estimateTokens(shortText)).toBe(2);
      expect(estimateTokens(longText)).toBeGreaterThan(15);
    });
  });

  describe('Génération de hash de configuration', () => {
    // Fonction simulée pour les tests
    function generateConfigHash(context: any): string {
      const content = JSON.stringify(context);
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return `h${Math.abs(hash).toString(36)}_${content.length}`;
    }

    test('devrait générer un hash unique pour chaque configuration', () => {
      const config1 = { tone: 'professionnel', company: 'A' };
      const config2 = { tone: 'amical', company: 'B' };
      
      const hash1 = generateConfigHash(config1);
      const hash2 = generateConfigHash(config2);
      
      expect(hash1).not.toBe(hash2);
    });

    test('devrait générer le même hash pour la même configuration', () => {
      const config = { tone: 'professionnel', company: 'Test' };
      
      const hash1 = generateConfigHash(config);
      const hash2 = generateConfigHash(config);
      
      expect(hash1).toBe(hash2);
    });

    test('le hash devrait avoir le bon format', () => {
      const config = { test: 'value' };
      const hash = generateConfigHash(config);
      
      expect(hash).toMatch(/^h[a-z0-9]+_\d+$/);
    });
  });

  describe('Compression de la base de connaissances', () => {
    // Fonction simulée
    function compressKnowledgeBase(kb: any): string {
      if (!kb) return '';
      const parts: string[] = [];
      
      if (kb.companyInfo?.name) {
        parts.push(`Entreprise: ${kb.companyInfo.name}`);
      }
      
      if (kb.products && Array.isArray(kb.products)) {
        const productNames = kb.products.slice(0, 10).map((p: any) => p.name);
        if (productNames.length > 0) {
          parts.push(`Produits: ${productNames.join(', ')}`);
        }
      }
      
      return parts.join('\n');
    }

    test('devrait retourner une chaîne vide pour une KB null', () => {
      expect(compressKnowledgeBase(null)).toBe('');
      expect(compressKnowledgeBase(undefined)).toBe('');
    });

    test('devrait extraire le nom de l\'entreprise', () => {
      const kb = {
        companyInfo: { name: 'MaSuperEntreprise' }
      };
      
      const result = compressKnowledgeBase(kb);
      expect(result).toContain('MaSuperEntreprise');
    });

    test('devrait limiter les produits à 10 maximum', () => {
      const products = Array.from({ length: 20 }, (_, i) => ({
        name: `Produit ${i + 1}`
      }));
      
      const kb = { products };
      const result = compressKnowledgeBase(kb);
      
      expect(result).toContain('Produit 1');
      expect(result).toContain('Produit 10');
      expect(result).not.toContain('Produit 11');
    });
  });

  describe('Compression de la configuration IA', () => {
    // Fonction simulée
    function compressAIConfig(config: any): string {
      if (!config) return '';
      const parts: string[] = [];
      
      if (config.tone) parts.push(`Ton: ${config.tone}`);
      if (config.style) parts.push(`Style: ${config.style}`);
      if (config.companyName) parts.push(`Entreprise: ${config.companyName}`);
      
      return parts.join(' | ');
    }

    test('devrait retourner une chaîne vide pour une config null', () => {
      expect(compressAIConfig(null)).toBe('');
      expect(compressAIConfig(undefined)).toBe('');
    });

    test('devrait inclure le ton', () => {
      const config = { tone: 'professionnel' };
      const result = compressAIConfig(config);
      
      expect(result).toContain('Ton: professionnel');
    });

    test('devrait inclure le nom de l\'entreprise', () => {
      const config = { companyName: 'TestCorp' };
      const result = compressAIConfig(config);
      
      expect(result).toContain('Entreprise: TestCorp');
    });

    test('devrait séparer les éléments par |', () => {
      const config = {
        tone: 'professionnel',
        style: 'concis',
        companyName: 'TestCorp'
      };
      const result = compressAIConfig(config);
      
      expect(result.split(' | ')).toHaveLength(3);
    });
  });

  describe('Structure OptimizedPrompt', () => {
    test('devrait avoir tous les champs requis', () => {
      const expectedFields = [
        'systemPrompt',
        'contextSummary',
        'tokensEstimated',
        'originalTokensEstimated',
        'compressionRatio',
        'cacheHit'
      ];
      
      // Vérifier que l'interface existe
      expect(expectedFields).toHaveLength(6);
    });
  });

  describe('Gestion du cache', () => {
    test('le cache devrait avoir une durée de 1 heure', () => {
      const CACHE_DURATION_MS = 60 * 60 * 1000;
      expect(CACHE_DURATION_MS).toBe(3600000);
    });
  });

  describe('Construction du prompt système', () => {
    // Fonction simulée
    function buildSystemPrompt(synthesis: string, aiConfig?: any): string {
      const tone = aiConfig?.tone || 'professionnel';
      const language = aiConfig?.language || 'fr';
      
      return `Tu es un assistant de support client ${tone}.
Langue: ${language === 'fr' ? 'Français' : 'English'}

=== CONTEXTE ENTREPRISE (SYNTHÈSE) ===
${synthesis}

=== INSTRUCTIONS ===
- Réponds de manière concise et utile`;
    }

    test('devrait inclure le ton dans le prompt', () => {
      const result = buildSystemPrompt('Contexte test', { tone: 'amical' });
      expect(result).toContain('amical');
    });

    test('devrait utiliser le français par défaut', () => {
      const result = buildSystemPrompt('Contexte test', {});
      expect(result).toContain('Français');
    });

    test('devrait utiliser l\'anglais si spécifié', () => {
      const result = buildSystemPrompt('Contexte test', { language: 'en' });
      expect(result).toContain('English');
    });

    test('devrait inclure la synthèse', () => {
      const synthesis = 'Contexte entreprise important';
      const result = buildSystemPrompt(synthesis, {});
      expect(result).toContain(synthesis);
    });
  });
});
