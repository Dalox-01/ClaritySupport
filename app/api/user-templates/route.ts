import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { canUseCustomTemplates, getMaxCustomTemplates } from '@/lib/plan-features';

// GET - Récupérer tous les templates de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('user_templates')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user templates:', error);
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la récupération des templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error: any) {
    console.error('Error in GET /api/user-templates:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau template
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier le plan de l'utilisateur
    const { data: user } = await supabase
      .from('users')
      .select('plan')
      .eq('id', session.user.id)
      .single();

    if (!user || !canUseCustomTemplates(user.plan)) {
      return NextResponse.json(
        { success: false, message: 'Fonctionnalité non disponible avec votre plan. Passez au plan STARTER ou PRO.' },
        { status: 403 }
      );
    }

    // Vérifier la limite de templates
    const maxTemplates = getMaxCustomTemplates(user.plan);
    if (maxTemplates > 0) {
      const { count } = await supabase
        .from('user_templates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      if (count !== null && count >= maxTemplates) {
        return NextResponse.json(
          { success: false, message: `Limite de ${maxTemplates} templates atteinte. Passez au plan PRO pour des templates illimités.` },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { name, description, category, subject, content, variables } = body;

    if (!name || !category || !subject || !content) {
      return NextResponse.json(
        { success: false, message: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_templates')
      .insert({
        user_id: session.user.id,
        name,
        description: description || '',
        category,
        subject,
        content,
        variables: variables || [],
        is_favorite: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la création du template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error('Error in POST /api/user-templates:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un template
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID du template requis' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error in DELETE /api/user-templates:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
