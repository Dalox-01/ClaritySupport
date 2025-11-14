// API Route: Debug - Vérifier la configuration et l'état du système

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { decrypt } from '@/lib/security';
import { fetchGmailMessages } from '@/lib/gmail-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const debug: any = {
      userId,
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // 1. Vérifier les comptes connectés
    console.log('🔍 [DEBUG] Vérification des comptes...');
    const { data: accounts, error: accountsError } = await supabase
      .from('mail_accounts')
      .select('*')
      .eq('user_id', userId);

    debug.checks.accounts = {
      success: !accountsError,
      error: accountsError?.message,
      count: accounts?.length || 0,
      accounts: accounts?.map(a => ({
        id: a.id,
        email: a.email,
        provider: a.provider,
        is_active: a.is_active,
        last_sync: a.last_sync,
        created_at: a.created_at
      }))
    };

    // 2. Vérifier les emails en cache
    console.log('🔍 [DEBUG] Vérification des emails en cache...');
    const { data: cachedEmails, error: cacheError } = await supabase
      .from('emails_cache')
      .select('id, subject, from_email, received_at, category')
      .eq('user_id', userId)
      ;
      .order('received_at', { ascending: false })
      .limit(10);

    debug.checks.cache = {
      success: !cacheError,
      error: cacheError?.message,
      count: cachedEmails?.length || 0,
      latestEmails: cachedEmails
    };

    // 3. Vérifier le compte total d'emails
    const { count: totalEmailCount } = await supabase
      .from('emails_cache')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      ;

    debug.checks.totalEmailsInDB = totalEmailCount || 0;

    // 4. Tester la connexion Gmail si un compte existe
    if (accounts && accounts.length > 0) {
      const gmailAccount = accounts.find(a => a.provider === 'gmail' && a.is_active);
      
      if (gmailAccount) {
        console.log('🔍 [DEBUG] Test connexion Gmail...');
        try {
          const accessToken = decrypt(gmailAccount.access_token);
          const messages = await fetchGmailMessages(accessToken, 5);
          
          debug.checks.gmailConnection = {
            success: true,
            messagesFound: messages.length,
            messageIds: messages.map((m: any) => m.id)
          };

          console.log(`✅ [DEBUG] Gmail OK: ${messages.length} messages trouvés`);
        } catch (gmailError: any) {
          debug.checks.gmailConnection = {
            success: false,
            error: gmailError.message
          };
          console.error('❌ [DEBUG] Erreur Gmail:', gmailError);
        }
      } else {
        debug.checks.gmailConnection = {
          success: false,
          error: 'Aucun compte Gmail actif trouvé'
        };
      }
    }

    // 5. Vérifier la table emails_cache existe
    const { error: tableCheckError } = await supabase
      .from('emails_cache')
      .select('id')
      .limit(1);

    debug.checks.tableExists = {
      emails_cache: !tableCheckError,
      error: tableCheckError?.message
    };

    console.log('✅ [DEBUG] Diagnostic terminé');
    console.log(JSON.stringify(debug, null, 2));

    return NextResponse.json(debug);

  } catch (error) {
    console.error('❌ [DEBUG] Erreur générale:', error);
    return NextResponse.json({ 
      error: 'Erreur diagnostic',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

