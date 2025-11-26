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

interface LimitCheckResult {
  can_create: boolean;
  current_count: number;
  max_allowed: number;
  plan: string;
}

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
    let limitCheck: LimitCheckResult;

    const { data, error: limitError } = await supabase
      .rpc('check_custom_filter_limit', { p_user_id: userId })
      .single();

    if (limitError) {
      console.warn('⚠️ RPC check_custom_filter_limit failed, falling back to manual check:', limitError.message);
      
      // Fallback: Récupérer le plan et compter manuellement
      const { data: user } = await supabase
        .from('users')
        .select('plan')
        .eq('id', userId)
        .single();
        
      const plan = (user?.plan || 'FREE').toUpperCase();
      
      // Limites hardcodées (fallback)
      let maxAllowed = 0;
      if (plan === 'PRO') maxAllowed = 5;
      if (plan === 'ENTERPRISE' || plan === 'SCALE') maxAllowed = 999999;
      
      const { count } = await supabase
        .from('user_filters')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_default', false)
        .eq('is_active', true);
        
      const currentCount = count || 0;
      
      limitCheck = {
        can_create: currentCount < maxAllowed,
        current_count: currentCount,
        max_allowed: maxAllowed,
        plan: plan
      };
    } else {
      if (!data) throw new Error('Failed to check filter limits');
      limitCheck = data as LimitCheckResult;
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
