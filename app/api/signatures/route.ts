import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { canUseSignatures, getMaxSignatures } from '@/lib/plan-features';

// GET - Récupérer toutes les signatures de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('signatures')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('Get signatures error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle signature
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le plan de l'utilisateur
    const { data: user } = await supabase
      .from('users')
      .select('plan')
      .eq('id', session.user.id)
      .single();

    if (!user || !canUseSignatures(user.plan)) {
      return NextResponse.json(
        { success: false, message: 'Fonctionnalité non disponible avec votre plan. Passez au plan STARTER ou PRO.' },
        { status: 403 }
      );
    }

    // Vérifier la limite de signatures
    const maxSignatures = getMaxSignatures(user.plan);
    if (maxSignatures > 0) {
      const { count } = await supabase
        .from('signatures')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      if (count !== null && count >= maxSignatures) {
        return NextResponse.json(
          { success: false, message: `Limite de ${maxSignatures} signatures atteinte. Passez au plan PRO pour des signatures illimitées.` },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { name, content, html_content, is_default } = body;

    if (!name || !content) {
      return NextResponse.json(
        { success: false, message: 'Nom et contenu requis' },
        { status: 400 }
      );
    }

    // Si c'est la signature par défaut, désactiver les autres
    if (is_default) {
      await supabase
        .from('signatures')
        .update({ is_default: false })
        .eq('user_id', session.user.id);
    }

    const { data, error } = await supabase
      .from('signatures')
      .insert({
        user_id: session.user.id,
        name,
        content,
        html_content: html_content || content.replace(/\n/g, '<br>'),
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: 'Signature créée avec succès',
    });
  } catch (error: any) {
    console.error('Create signature error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une signature
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID requis' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('signatures')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Signature supprimée',
    });
  } catch (error: any) {
    console.error('Delete signature error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
