// API Route: Réponses en attente de validation

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: pendingReplies, error } = await supabase
      .from('pending_replies')
      .select(`
        *,
        email:emails_cache(*)
      `)
      .eq('user_id', session.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending replies:', error);
      return NextResponse.json({ error: 'Erreur récupération réponses' }, { status: 500 });
    }

    return NextResponse.json(pendingReplies || []);
  } catch (error) {
    console.error('Error in pending replies endpoint:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
