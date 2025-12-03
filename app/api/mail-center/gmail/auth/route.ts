// API Route: Connexion Gmail

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGmailAuthUrl } from '@/lib/gmail-helpers';
import { supabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer l'ID utilisateur depuis Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      console.error('User not found in database:', session.user.email);
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Générer l'URL d'authentification Gmail avec l'ID réel
    const authUrl = getGmailAuthUrl(user.id);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Gmail auth URL:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
