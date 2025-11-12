// API Route: Liste des comptes connectés

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

    const { data: accounts, error } = await supabase
      .from('mail_accounts')
      .select('id, provider, email, is_active, last_sync, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mail accounts:', error);
      return NextResponse.json({ error: 'Erreur récupération comptes' }, { status: 500 });
    }

    return NextResponse.json(accounts || []);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
