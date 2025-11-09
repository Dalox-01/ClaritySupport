import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

// PATCH /api/emails/[id]/favorite - Toggle favorite status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer l'email actuel
    const { data: currentEmail } = await supabase
      .from('emails')
      .select('is_favorite, user_id')
      .eq('id', params.id)
      .single();

    if (!currentEmail || currentEmail.user_id !== user.id) {
      return NextResponse.json({ error: 'Email non trouvé' }, { status: 404 });
    }

    // Toggle favorite
    const { data: email, error } = await supabase
      .from('emails')
      .update({ is_favorite: !currentEmail.is_favorite })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ success: true, email });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
