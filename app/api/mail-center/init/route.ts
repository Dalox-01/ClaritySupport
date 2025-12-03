// API Route: Initialisation - Vérifier et créer les tables si nécessaires

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

    console.log('🔍 [INIT] Vérification des tables...');

    const checks: any = {};

    // Vérifier si la table emails_cache existe
    const { error: emailsError } = await supabase
      .from('emails_cache')
      .select('id')
      .limit(1);

    checks.emails_cache = {
      exists: !emailsError,
      error: emailsError?.message
    };

    // Vérifier si la table mail_accounts existe
    const { error: accountsError } = await supabase
      .from('mail_accounts')
      .select('id')
      .limit(1);

    checks.mail_accounts = {
      exists: !accountsError,
      error: accountsError?.message
    };

    // Vérifier si la table pending_replies existe
    const { error: pendingError } = await supabase
      .from('pending_replies')
      .select('id')
      .limit(1);

    checks.pending_replies = {
      exists: !pendingError,
      error: pendingError?.message
    };

    const allTablesExist = checks.emails_cache.exists && 
                           checks.mail_accounts.exists && 
                           checks.pending_replies.exists;

    console.log('📊 [INIT] Résultats:');
    console.log('  emails_cache:', checks.emails_cache.exists ? '✅' : '❌', checks.emails_cache.error || '');
    console.log('  mail_accounts:', checks.mail_accounts.exists ? '✅' : '❌', checks.mail_accounts.error || '');
    console.log('  pending_replies:', checks.pending_replies.exists ? '✅' : '❌', checks.pending_replies.error || '');

    return NextResponse.json({
      success: allTablesExist,
      checks,
      message: allTablesExist 
        ? 'Toutes les tables existent' 
        : 'Certaines tables sont manquantes - Appliquez les migrations Supabase'
    });

  } catch (error) {
    console.error('❌ [INIT] Erreur:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erreur vérification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

