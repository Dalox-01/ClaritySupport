// API Route: Supprimer un email du Mail Center

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Supprimer un email
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const emailId = params.id;

    console.log(`🗑️ Suppression email: ${emailId}`);

    // Vérifier que l'email appartient à l'utilisateur
    const { data: email } = await supabase
      .from('emails_cache')
      .select('id')
      .eq('id', emailId)
      .eq('user_id', userId)
      .single();

    if (!email) {
      return NextResponse.json({ error: 'Email non trouvé' }, { status: 404 });
    }

    // Soft delete: marquer comme supprimé au lieu de supprimer définitivement
    const { error: deleteError } = await supabase
      .from('emails_cache')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', emailId)
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`✅ Email marqué comme supprimé: ${emailId}`);

    return NextResponse.json({ 
      success: true,
      message: 'Email supprimé'
    });

  } catch (error) {
    console.error('❌ Erreur suppression email:', error);
    return NextResponse.json({ 
      error: 'Erreur suppression',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

