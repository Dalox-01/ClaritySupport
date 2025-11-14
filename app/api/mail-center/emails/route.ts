// API Route: Récupérer les emails depuis la base de données

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('📥 [GET /emails] Requête reçue');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.error('❌ [GET /emails] Non authentifié');
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    console.log(`🔍 [GET /emails] User email: ${session.user.email}`);

    // Récupérer l'ID utilisateur depuis Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      console.error('❌ [GET /emails] User not found in database:', session.user.email, userError);
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const userId = user.id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log(`📧 [GET /emails] Récupération pour user: ${userId}, limit: ${limit}`);

    // Récupérer les emails directement depuis la base
    // Triés par date de réception (plus récent en premier)
    // Exclure les emails supprimés (soft delete)
    const { data: emails, error } = await supabase
      .from('emails_cache')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('received_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ [GET /emails] Error fetching emails:', error);
      return NextResponse.json({ error: 'Erreur récupération emails' }, { status: 500 });
    }

    console.log(`✅ [GET /emails] ${emails?.length || 0} emails trouvés`);

    return NextResponse.json({ 
      emails: emails || [],
      count: emails?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [GET /emails] Exception globale:', error);
    console.error('❌ [GET /emails] Stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

