// API Route: Récupérer les emails depuis la base de données

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

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Récupérer les emails directement depuis la base
    // Triés par date de réception (plus récent en premier)
    const { data: emails, error } = await supabase
      .from('emails_cache')
      .select('*')
      .eq('user_id', userId)
      .order('received_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching emails from DB:', error);
      return NextResponse.json({ error: 'Erreur récupération emails' }, { status: 500 });
    }

    return NextResponse.json({ 
      emails: emails || [],
      count: emails?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in emails endpoint:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

