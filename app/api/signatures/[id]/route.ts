import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

// PATCH - Mettre à jour une signature
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, content, html_content, is_default } = body;

    // Si c'est la signature par défaut, désactiver les autres
    if (is_default) {
      await supabase
        .from('signatures')
        .update({ is_default: false })
        .eq('user_id', session.user.id);
    }

    const { data, error } = await supabase
      .from('signatures')
      .update({
        name,
        content,
        html_content: html_content || content?.replace(/\n/g, '<br>'),
        is_default,
      })
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: 'Signature mise à jour',
    });
  } catch (error: any) {
    console.error('Update signature error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
