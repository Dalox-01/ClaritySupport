/**
 * API DÉTECTION FILTRES - Classification automatique des emails
 * 
 * Endpoint utilisé par l'IA pour classifier automatiquement les emails entrants
 * selon les filtres configurés (base + personnalisés)
 * 
 * POST /api/filters/detect
 * Body: {
 *   subject: string,
 *   content: string,
 *   metadata?: { from: string, priority?: string }
 * }
 * 
 * Response: {
 *   detectedFilters: FilterMatch[],
 *   primaryFilter: FilterMatch,
 *   confidence: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

interface FilterMatch {
  filterId: string;
  filterName: string;
  filterKey: string;
  color: string;
  icon: string;
  matchedKeywords: string[];
  confidence: number; // 0-100
  responseConfig: any;
}

/**
 * POST - Détecter les filtres applicables à un email
 */
export async function POST(req: NextRequest) {
  console.log('🟢 [FILTER DETECTION] POST - Detecting filters for email');

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { subject, content, metadata } = body;

    if (!subject && !content) {
      return NextResponse.json(
        { error: 'Subject ou content requis' },
        { status: 400 }
      );
    }

    // Combiner sujet + contenu pour analyse
    const fullText = `${subject || ''} ${content || ''}`.toLowerCase();

    console.log(`🔵 Analyzing text (${fullText.length} chars)...`);

    // Récupérer tous les filtres actifs de l'utilisateur
    const { data: filters, error: filtersError } = await supabase
      .from('user_filters')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (filtersError) {
      console.error('❌ Error fetching filters:', filtersError);
      throw filtersError;
    }

    if (!filters || filters.length === 0) {
      console.log('⚠️ No filters configured for user');
      return NextResponse.json({
        success: true,
        detectedFilters: [],
        primaryFilter: null,
        confidence: 0,
      });
    }

    console.log(`✅ Analyzing with ${filters.length} filters`);

    // Analyser chaque filtre
    const matches: FilterMatch[] = [];

    for (const filter of filters) {
      const keywords: string[] = filter.keywords || [];
      const rules = filter.detection_rules || { matchMode: 'any', caseSensitive: false };
      
      const matchedKeywords: string[] = [];
      let matchCount = 0;

      // Analyser les mots-clés
      for (const keyword of keywords) {
        const searchTerm = rules.caseSensitive ? keyword : keyword.toLowerCase();
        const searchText = rules.caseSensitive ? `${subject || ''} ${content || ''}` : fullText;

        if (searchText.includes(searchTerm)) {
          matchedKeywords.push(keyword);
          matchCount++;
        }
      }

      // Vérifier les regex patterns si définis
      if (rules.regexPatterns && Array.isArray(rules.regexPatterns)) {
        for (const pattern of rules.regexPatterns) {
          try {
            const regex = new RegExp(pattern, rules.caseSensitive ? '' : 'i');
            if (regex.test(fullText)) {
              matchCount++;
              matchedKeywords.push(`regex:${pattern}`);
            }
          } catch (e) {
            console.warn(`⚠️ Invalid regex pattern: ${pattern}`);
          }
        }
      }

      // Vérifier les exclusions
      let isExcluded = false;
      if (rules.excludeKeywords && Array.isArray(rules.excludeKeywords)) {
        for (const excludeWord of rules.excludeKeywords) {
          const searchTerm = rules.caseSensitive ? excludeWord : excludeWord.toLowerCase();
          if (fullText.includes(searchTerm)) {
            isExcluded = true;
            console.log(`❌ Filter "${filter.name}" excluded by keyword: ${excludeWord}`);
            break;
          }
        }
      }

      // Calculer le match selon le mode
      let isMatch = false;
      if (!isExcluded && matchCount > 0) {
        if (rules.matchMode === 'all') {
          // Mode ALL: tous les mots-clés doivent matcher
          isMatch = matchCount === keywords.length;
        } else {
          // Mode ANY (défaut): au moins 1 mot-clé doit matcher
          isMatch = true;
        }
      }

      if (isMatch) {
        // Calculer score de confiance
        const confidence = Math.min(100, (matchCount / Math.max(1, keywords.length)) * 100);

        matches.push({
          filterId: filter.id,
          filterName: filter.name,
          filterKey: filter.filter_key,
          color: filter.color,
          icon: filter.icon,
          matchedKeywords,
          confidence: Math.round(confidence),
          responseConfig: filter.response_config,
        });

        console.log(`✅ Match: ${filter.name} (${Math.round(confidence)}% confidence)`);
      }
    }

    // Trier par confiance (le plus pertinent en premier)
    matches.sort((a, b) => b.confidence - a.confidence);

    // Filtre primaire = celui avec le plus haut score
    const primaryFilter = matches.length > 0 ? matches[0] : null;

    // Mettre à jour usage_count et last_used_at pour les filtres matchés
    if (matches.length > 0) {
      const filterIds = matches.map(m => m.filterId);
      await supabase
        .from('user_filters')
        .update({
          usage_count: supabase.raw('usage_count + 1'),
          last_used_at: new Date().toISOString(),
        })
        .in('id', filterIds);
    }

    console.log(`✅ Detection complete: ${matches.length} filter(s) matched`);

    return NextResponse.json({
      success: true,
      detectedFilters: matches,
      primaryFilter,
      confidence: primaryFilter?.confidence || 0,
      summary: {
        totalFilters: filters.length,
        matchedFilters: matches.length,
        topMatch: primaryFilter?.filterName || null,
      },
    });

  } catch (error) {
    console.error('❌ [FILTER DETECTION] POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
