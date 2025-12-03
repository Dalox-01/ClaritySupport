/**
 * SECURITY PATCH: IDOR (Insecure Direct Object Reference) Protection
 * 
 * FILE: app/api/filters/[id]/route.ts
 * VULNERABILITY: VULN-004 - Critical IDOR allowing users to modify/delete other users' filters
 * CWE: CWE-639 (Authorization Bypass Through User-Controlled Key)
 * CVSS: 8.1/10
 * 
 * CHANGES:
 * 1. Added ownership verification before PATCH/DELETE operations
 * 2. Prevent modification of default (system) filters
 * 3. Added comprehensive error messages
 * 4. Added audit logging for access attempts
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

/**
 * PATCH - Update a custom filter
 * ✅ SECURED: Now includes ownership verification
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔵 [FILTERS API] PATCH - Update filter');

  try {
    // 🔐 Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.warn('[SECURITY] Unauthenticated PATCH attempt');
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID du filtre requis' },
        { status: 400 }
      );
    }

    // 🔐 STEP 1: Fetch existing filter to verify ownership
    const { data: existingFilter, error: fetchError } = await supabase
      .from('user_filters')
      .select('user_id, is_default, name')
      .eq('id', id)
      .single();

    if (fetchError || !existingFilter) {
      console.warn(`[SECURITY] Filter not found: ${id} (User: ${userId})`);
      
      // Log potential IDOR attempt
      await logSecurityEvent({
        user_id: userId,
        action: 'filter_patch_not_found',
        resource_id: id,
        ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        success: false,
      });

      return NextResponse.json(
        { error: 'Filtre non trouvé' },
        { status: 404 }
      );
    }

    // 🔐 STEP 2: Authorization check - Verify ownership
    if (existingFilter.user_id !== userId) {
      console.error(
        `[SECURITY] IDOR attempt detected! User ${userId} tried to modify filter ${id} owned by ${existingFilter.user_id}`
      );

      // Log IDOR attempt
      await logSecurityEvent({
        user_id: userId,
        action: 'filter_idor_attempt',
        resource_id: id,
        resource_owner: existingFilter.user_id,
        ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        success: false,
        details: { attempted_resource: existingFilter.name },
      });

      return NextResponse.json(
        {
          error: 'Non autorisé',
          detail: 'Vous ne pouvez modifier que vos propres filtres',
        },
        { status: 403 }
      );
    }

    // 🔐 STEP 3: Prevent modification of system default filters
    if (existingFilter.is_default) {
      console.warn(
        `[SECURITY] User ${userId} attempted to modify default filter ${id}`
      );

      return NextResponse.json(
        {
          error: 'Modification interdite',
          detail: 'Les filtres par défaut ne peuvent pas être modifiés',
        },
        { status: 403 }
      );
    }

    // ✅ Authorization passed - proceed with update
    const body = await req.json();

    // Validate request body
    const allowedFields = [
      'name',
      'description',
      'color',
      'icon',
      'keywords',
      'detection_rules',
      'response_config',
    ];

    // Filter out any fields not in the allowlist (prevent mass assignment)
    const sanitizedBody = Object.keys(body)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {} as Record<string, any>);

    // Additional validation
    if (sanitizedBody.name && sanitizedBody.name.length > 100) {
      return NextResponse.json(
        { error: 'Le nom du filtre ne peut pas dépasser 100 caractères' },
        { status: 400 }
      );
    }

    if (sanitizedBody.keywords && !Array.isArray(sanitizedBody.keywords)) {
      return NextResponse.json(
        { error: 'Les mots-clés doivent être un tableau' },
        { status: 400 }
      );
    }

    // Update filter
    const { data: updatedFilter, error: updateError } = await supabase
      .from('user_filters')
      .update({
        ...sanitizedBody,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId) // ✅ Double-check ownership
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating filter:', updateError);
      throw updateError;
    }

    console.log(`✅ Filter ${id} updated by user ${userId}`);

    // Log successful update
    await logSecurityEvent({
      user_id: userId,
      action: 'filter_updated',
      resource_id: id,
      ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
      success: true,
      details: { updated_fields: Object.keys(sanitizedBody) },
    });

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
 * DELETE - Remove a custom filter
 * ✅ SECURED: Now includes ownership verification
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔴 [FILTERS API] DELETE - Remove filter');

  try {
    // 🔐 Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.warn('[SECURITY] Unauthenticated DELETE attempt');
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID du filtre requis' },
        { status: 400 }
      );
    }

    // 🔐 STEP 1: Fetch existing filter to verify ownership
    const { data: existingFilter, error: fetchError } = await supabase
      .from('user_filters')
      .select('user_id, is_default, name')
      .eq('id', id)
      .single();

    if (fetchError || !existingFilter) {
      console.warn(`[SECURITY] Filter not found for deletion: ${id}`);

      // Log potential IDOR attempt
      await logSecurityEvent({
        user_id: userId,
        action: 'filter_delete_not_found',
        resource_id: id,
        ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        success: false,
      });

      return NextResponse.json(
        { error: 'Filtre non trouvé' },
        { status: 404 }
      );
    }

    // 🔐 STEP 2: Authorization check - Verify ownership
    if (existingFilter.user_id !== userId) {
      console.error(
        `[SECURITY] IDOR attempt detected! User ${userId} tried to delete filter ${id} owned by ${existingFilter.user_id}`
      );

      // Log IDOR attempt
      await logSecurityEvent({
        user_id: userId,
        action: 'filter_delete_idor_attempt',
        resource_id: id,
        resource_owner: existingFilter.user_id,
        ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        success: false,
        details: { attempted_resource: existingFilter.name },
      });

      return NextResponse.json(
        {
          error: 'Non autorisé',
          detail: 'Vous ne pouvez supprimer que vos propres filtres',
        },
        { status: 403 }
      );
    }

    // 🔐 STEP 3: Prevent deletion of system default filters
    if (existingFilter.is_default) {
      console.warn(
        `[SECURITY] User ${userId} attempted to delete default filter ${id}`
      );

      return NextResponse.json(
        {
          error: 'Suppression interdite',
          detail: 'Les filtres par défaut ne peuvent pas être supprimés',
        },
        { status: 403 }
      );
    }

    // ✅ Authorization passed - proceed with deletion
    const { error: deleteError } = await supabase
      .from('user_filters')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // ✅ Double-check ownership

    if (deleteError) {
      console.error('❌ Error deleting filter:', deleteError);
      throw deleteError;
    }

    console.log(`✅ Filter ${id} deleted by user ${userId}`);

    // Log successful deletion
    await logSecurityEvent({
      user_id: userId,
      action: 'filter_deleted',
      resource_id: id,
      ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
      success: true,
      details: { filter_name: existingFilter.name },
    });

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
 * Log security events for audit trail
 */
async function logSecurityEvent(event: {
  user_id: string;
  action: string;
  resource_id?: string;
  resource_owner?: string;
  ip: string;
  success: boolean;
  details?: Record<string, any>;
}): Promise<void> {
  try {
    await supabase.from('security_audit_log').insert({
      user_id: event.user_id,
      action: event.action,
      resource_id: event.resource_id || null,
      resource_owner: event.resource_owner || null,
      ip_address: event.ip,
      success: event.success,
      details: event.details || {},
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw - logging failures shouldn't break the application
  }
}
