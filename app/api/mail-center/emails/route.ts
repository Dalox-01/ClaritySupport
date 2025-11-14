// API Route: Récupérer les emails depuis la base de données
// REFAIT COMPLÈTEMENT - Version robuste avec gestion d'erreur totale

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Client Supabase avec service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  const logs: string[] = [];
  
  try {
    logs.push('📥 START - GET /emails');
    
    // ÉTAPE 1: Vérifier la session NextAuth
    logs.push('STEP 1: Checking NextAuth session...');
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (authError) {
      logs.push(`ERROR in getServerSession: ${authError}`);
      console.error('❌ Auth Error:', logs);
      return NextResponse.json({ 
        error: 'Erreur authentification',
        logs 
      }, { status: 500 });
    }
    
    if (!session?.user?.email) {
      logs.push('ERROR: No session or email found');
      console.error('❌', logs);
      return NextResponse.json({ 
        error: 'Non authentifié',
        logs 
      }, { status: 401 });
    }
    
    logs.push(`✅ Session OK - Email: ${session.user.email}`);
    
    // ÉTAPE 2: Créer client Supabase
    logs.push('STEP 2: Creating Supabase client...');
    let supabase;
    try {
      supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      logs.push('✅ Supabase client created');
    } catch (sbError) {
      logs.push(`ERROR creating Supabase client: ${sbError}`);
      console.error('❌', logs);
      return NextResponse.json({ 
        error: 'Erreur connexion base de données',
        logs 
      }, { status: 500 });
    }
    
    // ÉTAPE 3: Chercher l'utilisateur
    logs.push(`STEP 3: Looking up user by email: ${session.user.email}`);
    let userId;
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', session.user.email)
        .maybeSingle();
      
      if (userError) {
        logs.push(`ERROR in users query: ${userError.message} (code: ${userError.code})`);
        console.error('❌', logs);
        return NextResponse.json({ 
          error: 'Erreur requête utilisateur',
          details: userError.message,
          logs 
        }, { status: 500 });
      }
      
      if (!userData) {
        logs.push('ERROR: User not found in database');
        console.error('❌', logs);
        return NextResponse.json({ 
          error: 'Utilisateur non trouvé dans la base',
          hint: 'Reconnectez-vous ou contactez le support',
          logs 
        }, { status: 404 });
      }
      
      userId = userData.id;
      logs.push(`✅ User found - ID: ${userId}`);
      
    } catch (userLookupError) {
      logs.push(`EXCEPTION in user lookup: ${userLookupError}`);
      console.error('❌', logs);
      return NextResponse.json({ 
        error: 'Exception lors de la recherche utilisateur',
        logs 
      }, { status: 500 });
    }
    
    // ÉTAPE 4: Récupérer les paramètres
    logs.push('STEP 4: Parsing request parameters...');
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    logs.push(`✅ Limit: ${limit}`);
    
    // ÉTAPE 5: Récupérer les emails
    logs.push(`STEP 5: Fetching emails from emails_cache for user_id: ${userId}`);
    try {
      const { data: emails, error: emailsError } = await supabase
        .from('emails_cache')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('received_at', { ascending: false })
        .limit(limit);
      
      if (emailsError) {
        logs.push(`ERROR in emails query: ${emailsError.message} (code: ${emailsError.code})`);
        console.error('❌', logs);
        return NextResponse.json({ 
          error: 'Erreur requête emails',
          details: emailsError.message,
          logs 
        }, { status: 500 });
      }
      
      const emailCount = emails?.length || 0;
      logs.push(`✅ Emails fetched: ${emailCount}`);
      
      // ÉTAPE 6: Si pas d'emails, vérifier les comptes
      if (emailCount === 0) {
        logs.push('STEP 6: No emails found, checking mail accounts...');
        const { data: accounts, error: accountsError } = await supabase
          .from('mail_accounts')
          .select('id, email, provider, is_active')
          .eq('user_id', userId);
        
        if (!accountsError && accounts) {
          logs.push(`📧 Mail accounts: ${accounts.length}`);
          accounts.forEach(acc => {
            logs.push(`   - ${acc.email} (${acc.provider}) ${acc.is_active ? '✅' : '❌'}`);
          });
          
          if (accounts.length === 0) {
            logs.push('💡 SUGGESTION: Connect a Gmail/Outlook account');
          } else {
            logs.push('💡 SUGGESTION: Click Sync button to fetch emails');
          }
        }
      }
      
      // SUCCÈS
      logs.push('✅ SUCCESS - Returning response');
      console.log('✅ [GET /emails]', logs.join(' | '));
      
      return NextResponse.json({ 
        success: true,
        emails: emails || [],
        count: emailCount,
        timestamp: new Date().toISOString(),
        debug: {
          userId,
          limit,
          logsCount: logs.length
        }
      });
      
    } catch (emailsFetchError) {
      logs.push(`EXCEPTION in emails fetch: ${emailsFetchError}`);
      console.error('❌', logs);
      return NextResponse.json({ 
        error: 'Exception lors de la récupération des emails',
        logs 
      }, { status: 500 });
    }
    
  } catch (globalError) {
    logs.push(`GLOBAL EXCEPTION: ${globalError}`);
    logs.push(`Stack: ${globalError instanceof Error ? globalError.stack : 'No stack'}`);
    console.error('❌ [GET /emails] GLOBAL ERROR:', logs);
    
    return NextResponse.json({ 
      error: 'Erreur serveur globale',
      details: globalError instanceof Error ? globalError.message : String(globalError),
      logs
    }, { status: 500 });
  }
}

