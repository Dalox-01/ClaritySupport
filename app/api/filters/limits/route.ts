/**
 * API STATISTIQUES FILTRES - Vérification limites et usage
 * 
 * GET /api/filters/limits
 * → Récupère les limites du plan actuel et l'usage des filtres
 * 
 * Response: {
 *   canCreate: boolean,
 *   current: number,
 *   max: number,
 *   plan: string,
 *   usage: FilterUsageStats[]
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

/**
 * GET - Récupérer les limites et statistiques d'utilisation
 */
export async function GET(req: NextRequest) {
  console.log('🟢 [FILTER LIMITS] GET - Checking filter limits');

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;

    // Vérifier les limites via RPC
    const { data: limitCheck, error: limitError } = await supabase
      .rpc('check_custom_filter_limit', { p_user_id: userId })
      .single();

    if (limitError) {
      console.error('❌ Error checking limits:', limitError);
      throw limitError;
    }

    if (!limitCheck) {
      throw new Error('Failed to check filter limits');
    }

    // Récupérer statistiques d'usage
    const { data: filters, error: filtersError } = await supabase
      .from('user_filters')
      .select('id, name, filter_key, is_default, usage_count, last_used_at, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    if (filtersError) {
      console.error('❌ Error fetching filters:', filtersError);
      throw filtersError;
    }

    // Calculer statistiques globales
    const totalUsage = filters?.reduce((sum, f) => sum + (f.usage_count || 0), 0) || 0;
    const mostUsed = filters && filters.length > 0 ? filters[0] : null;

    console.log(`✅ Limits: ${limitCheck.current_count}/${limitCheck.max_allowed} (Plan: ${limitCheck.plan})`);

    return NextResponse.json({
      success: true,
      limits: {
        canCreate: limitCheck.can_create,
        current: limitCheck.current_count,
        max: limitCheck.max_allowed,
        remaining: Math.max(0, limitCheck.max_allowed - limitCheck.current_count),
        plan: limitCheck.plan,
      },
      usage: {
        totalClassifications: totalUsage,
        filtersCount: filters?.length || 0,
        defaultFiltersCount: filters?.filter(f => f.is_default).length || 0,
        customFiltersCount: filters?.filter(f => !f.is_default).length || 0,
        mostUsedFilter: mostUsed ? {
          name: mostUsed.name,
          key: mostUsed.filter_key,
          count: mostUsed.usage_count,
        } : null,
      },
      filters: filters || [],
    });

  } catch (error) {
    console.error('❌ [FILTER LIMITS] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
