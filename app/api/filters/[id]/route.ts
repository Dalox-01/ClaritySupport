/**
 * API FILTRES - MODIFICATION ET SUPPRESSION
 * 
 * Routes dynamiques pour gérer un filtre spécifique:
 * - PATCH  /api/filters/[id]  → Modifier configuration d'un filtre personnalisé
 * - DELETE /api/filters/[id]  → Supprimer un filtre personnalisé
 * 
 * Restrictions:
 * - Les filtres de base (is_default = true) ne peuvent PAS être modifiés ni supprimés
 * - Seul le propriétaire peut modifier/supprimer ses filtres
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Client Supabase avec SERVICE_ROLE_KEY
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

async function getUserPlan(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('❌ Error fetching user plan:', error);
    throw new Error('Impossible de déterminer le plan utilisateur');
  }

  return data?.plan || 'FREE';
}

/**
 * PATCH - Modifier un filtre personnalisé
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`🟢 [FILTERS API] PATCH - Updating filter ${params.id}`);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const filterId = params.id;
    const body = await req.json();

    // Vérifier que le filtre existe et appartient à l'utilisateur
    const { data: existingFilter, error: fetchError } = await supabase
      .from('user_filters')
      .select('*')
      .eq('id', filterId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingFilter) {
      return NextResponse.json(
        { error: 'Filtre introuvable' },
        { status: 404 }
      );
    }

    const plan = await getUserPlan(userId);
    const canManageDefaultFilters = plan === 'PRO' || plan === 'ENTERPRISE';

    // Interdire la modification des filtres de base pour les plans limités
    if (existingFilter.is_default && !canManageDefaultFilters) {
      return NextResponse.json({
        error: 'Votre plan ne permet pas de modifier les filtres de base',
        details: 'Passez sur le plan PRO pour personnaliser ou supprimer ces filtres',
      }, { status: 403 });
    }

    console.log(`✅ Filter found, updating...`);

    // Préparer les champs à mettre à jour
    const allowedFields = [
      'name',
      'description',
      'color',
      'icon',
      'keywords',
      'detection_rules',
      'response_config',
      'is_active',
    ];

    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Aucun champ à mettre à jour' },
        { status: 400 }
      );
    }

    // Mise à jour
    const { data: updatedFilter, error: updateError } = await supabase
      .from('user_filters')
      .update(updates)
      .eq('id', filterId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating filter:', updateError);
      throw updateError;
    }

    console.log(`✅ Filter updated successfully`);

    return NextResponse.json({
      success: true,
      message: 'Filtre mis à jour avec succès',
      filter: updatedFilter,
    });

  } catch (error) {
    console.error('❌ [FILTERS API] PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprimer un filtre personnalisé
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`🟢 [FILTERS API] DELETE - Deleting filter ${params.id}`);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const filterId = params.id;

    // Vérifier que le filtre existe et appartient à l'utilisateur
    const { data: existingFilter, error: fetchError } = await supabase
      .from('user_filters')
      .select('*')
      .eq('id', filterId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingFilter) {
      return NextResponse.json(
        { error: 'Filtre introuvable' },
        { status: 404 }
      );
    }

    const plan = await getUserPlan(userId);
    const canManageDefaultFilters = plan === 'PRO' || plan === 'ENTERPRISE';

    if (existingFilter.is_default && !canManageDefaultFilters) {
      return NextResponse.json({
        error: 'Votre plan ne permet pas de supprimer les filtres de base',
        details: 'Passez sur le plan PRO pour retirer ces filtres',
      }, { status: 403 });
    }

    console.log(`✅ Filter found, deleting...`);

    // Suppression (ou archivage si vous préférez conserver les données)
    const { error: deleteError } = await supabase
      .from('user_filters')
      .delete()
      .eq('id', filterId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('❌ Error deleting filter:', deleteError);
      throw deleteError;
    }

    console.log(`✅ Filter deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Filtre supprimé avec succès',
    });

  } catch (error) {
    console.error('❌ [FILTERS API] DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * GET - Récupérer un filtre spécifique (pour détails/édition)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`🟢 [FILTERS API] GET - Fetching filter ${params.id}`);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const filterId = params.id;

    const { data: filter, error } = await supabase
      .from('user_filters')
      .select('*')
      .eq('id', filterId)
      .eq('user_id', userId)
      .single();

    if (error || !filter) {
      return NextResponse.json(
        { error: 'Filtre introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      filter,
    });

  } catch (error) {
    console.error('❌ [FILTERS API] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
