/**
 * API FILTRES PERSONNALISÉS - CRUD COMPLET
 * 
 * Gestion des filtres utilisateur avec limitations par plan:
 * - FREE/STARTER: 0 filtres personnalisés (seulement les filtres de base)
 * - PRO: 5 filtres personnalisés
 * - ENTERPRISE: Illimité
 * 
 * Routes:
 * - GET    /api/filters        → Liste tous les filtres (base + personnalisés)
 * - POST   /api/filters        → Créer un filtre personnalisé
 * - PATCH  /api/filters/[id]   → Modifier un filtre personnalisé
 * - DELETE /api/filters/[id]   → Supprimer un filtre personnalisé
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Client Supabase avec SERVICE_ROLE_KEY pour bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface LimitCheckResult {
  can_create: boolean;
  current_count: number;
  max_allowed: number;
  plan: string;
}

export interface UserFilter {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  is_default: boolean;
  filter_key: string;
  keywords: string[];
  detection_rules: {
    matchMode: 'any' | 'all';
    caseSensitive: boolean;
    regexPatterns?: string[];
    excludeKeywords?: string[];
  };
  response_config: {
    tone: 'pro' | 'cordial' | 'empathique' | 'technique';
    language: 'fr' | 'en';
    customInstructions?: string;
    responseTemplate?: string;
    autoReplyEnabled?: boolean;
    priorityLevel: 'high' | 'normal' | 'low';
  };
  usage_count: number;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * GET - Récupérer tous les filtres de l'utilisateur (base + personnalisés)
 */
export async function GET(req: NextRequest) {
  console.log('🟢 [FILTERS API] GET - Fetching user filters');

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer tous les filtres actifs
    const { data: filters, error } = await supabase
      .from('user_filters')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false }) // Filtres de base en premier
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    // Si aucun filtre (nouvel utilisateur), initialiser les filtres de base
    if (!filters || filters.length === 0) {
      console.log('🔵 No filters found, initializing defaults...');
      
      const { data: initResult, error: initError } = await supabase
        .rpc('initialize_default_filters', { p_user_id: userId });

      if (initError) {
        console.error('❌ Error initializing filters:', initError);
        throw initError;
      }

      console.log(`✅ Initialized ${initResult} default filters`);

      // Re-fetch après initialisation
      const { data: newFilters, error: refetchError } = await supabase
        .from('user_filters')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (refetchError) throw refetchError;

      return NextResponse.json({
        success: true,
        filters: newFilters || [],
        counts: {
          total: newFilters?.length || 0,
          default: newFilters?.filter(f => f.is_default).length || 0,
          custom: newFilters?.filter(f => !f.is_default).length || 0,
        },
      });
    }

    console.log(`✅ Found ${filters.length} filters`);

    return NextResponse.json({
      success: true,
      filters,
      counts: {
        total: filters.length,
        default: filters.filter(f => f.is_default).length,
        custom: filters.filter(f => !f.is_default).length,
      },
    });

  } catch (error) {
    console.error('❌ [FILTERS API] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer un nouveau filtre personnalisé
 */
export async function POST(req: NextRequest) {
  console.log('🟢 [FILTERS API] POST - Creating custom filter');

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    // Validation des champs requis
    const { name, description, color, icon, filter_key, keywords, detection_rules, response_config } = body;

    if (!name || !filter_key) {
      return NextResponse.json(
        { error: 'Les champs "name" et "filter_key" sont requis' },
        { status: 400 }
      );
    }

    // Vérifier la limite de filtres personnalisés pour le plan
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

    if (!limitCheck.can_create) {
      return NextResponse.json({
        error: 'Limite de filtres atteinte',
        details: {
          plan: limitCheck.plan,
          current: limitCheck.current_count,
          max: limitCheck.max_allowed,
          message: limitCheck.plan === 'FREE' || limitCheck.plan === 'STARTER'
            ? 'Passez au plan PRO pour créer des filtres personnalisés'
            : `Vous avez atteint la limite de ${limitCheck.max_allowed} filtres personnalisés`,
        },
      }, { status: 403 });
    }

    console.log(`✅ User can create filter (${limitCheck.current_count}/${limitCheck.max_allowed})`);

    // Créer le filtre
    const { data: newFilter, error: createError } = await supabase
      .from('user_filters')
      .insert({
        user_id: userId,
        name,
        description: description || null,
        color: color || '#3B82F6',
        icon: icon || 'Filter',
        is_default: false,
        filter_key,
        keywords: keywords || [],
        detection_rules: detection_rules || { matchMode: 'any', caseSensitive: false },
        response_config: response_config || { tone: 'cordial', language: 'fr', priorityLevel: 'normal' },
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating filter:', createError);
      
      // Erreur de clé dupliquée
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'Un filtre avec cette clé existe déjà' },
          { status: 409 }
        );
      }
      
      throw createError;
    }

    console.log(`✅ Filter created: ${newFilter.id}`);

    return NextResponse.json({
      success: true,
      message: 'Filtre créé avec succès',
      filter: newFilter,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [FILTERS API] POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
