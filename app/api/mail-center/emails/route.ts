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
      console.error('❌ [GET /emails] Non authentifié - pas de session ou email');
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    console.log(`🔍 [GET /emails] Session trouvée - Email: ${session.user.email}, ID: ${session.user.id}`);

    // Récupérer l'ID utilisateur depuis Supabase via email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', session.user.email)
      .maybeSingle();

    if (userError) {
      console.error('❌ [GET /emails] Erreur Supabase lors de la recherche utilisateur:', userError);
      return NextResponse.json({ 
        error: 'Erreur base de données',
        details: userError.message 
      }, { status: 500 });
    }

    if (!user) {
      console.error('❌ [GET /emails] Utilisateur non trouvé dans la base:', session.user.email);
      return NextResponse.json({ 
        error: 'Utilisateur non trouvé',
        hint: 'Votre compte existe dans NextAuth mais pas dans Supabase. Reconnectez-vous.'
      }, { status: 404 });
    }

    const userId = user.id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log(`📧 [GET /emails] Récupération emails pour user_id: ${userId}, limit: ${limit}`);

    // Récupérer les emails directement depuis la base
    // Triés par date de réception (plus récent en premier)
    // Exclure les emails supprimés (soft delete)
    const { data: emails, error: emailsError } = await supabase
      .from('emails_cache')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('received_at', { ascending: false })
      .limit(limit);

    if (emailsError) {
      console.error('❌ [GET /emails] Erreur récupération emails depuis Supabase:', emailsError);
      return NextResponse.json({ 
        error: 'Erreur récupération emails',
        details: emailsError.message,
        code: emailsError.code
      }, { status: 500 });
    }

    console.log(`✅ [GET /emails] ${emails?.length || 0} emails trouvés dans emails_cache`);
    
    // Si pas d'emails, vérifier s'il y a des comptes connectés
    if (!emails || emails.length === 0) {
      const { data: accounts } = await supabase
        .from('mail_accounts')
        .select('id, email, provider')
        .eq('user_id', userId);
      
      console.log(`ℹ️ [GET /emails] Aucun email trouvé. Comptes connectés: ${accounts?.length || 0}`);
      
      if (!accounts || accounts.length === 0) {
        console.log(`💡 [GET /emails] Suggestion: Connecter un compte Gmail/Outlook`);
      } else {
        console.log(`💡 [GET /emails] Comptes trouvés mais pas d'emails. Suggestion: Cliquer sur Synchroniser`);
        console.log(`   Comptes:`, accounts.map(a => `${a.email} (${a.provider})`).join(', '));
      }
    }

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

