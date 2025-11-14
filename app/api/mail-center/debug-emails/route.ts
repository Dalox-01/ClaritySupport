// API Route: Diagnostic de la connexion et récupération d'emails
// Pour débugger les erreurs 500

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: []
  };

  try {
    // 1. Vérifier la session
    diagnostics.checks.push({ step: 'Session check', status: 'starting' });
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      diagnostics.checks.push({ 
        step: 'Session check', 
        status: 'FAILED', 
        error: 'No session or email',
        session: session ? 'exists but no email' : 'null'
      });
      return NextResponse.json(diagnostics, { status: 401 });
    }
    
    diagnostics.checks.push({ 
      step: 'Session check', 
      status: 'OK',
      email: session.user.email,
      userId: session.user.id
    });

    // 2. Vérifier Supabase
    diagnostics.checks.push({ step: 'Supabase connection', status: 'starting' });
    
    try {
      const { data: testQuery, error: testError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (testError) {
        diagnostics.checks.push({ 
          step: 'Supabase connection', 
          status: 'FAILED',
          error: testError.message,
          code: testError.code
        });
        return NextResponse.json(diagnostics, { status: 500 });
      }
      
      diagnostics.checks.push({ 
        step: 'Supabase connection', 
        status: 'OK',
        hasData: !!testQuery
      });
    } catch (sbError) {
      diagnostics.checks.push({ 
        step: 'Supabase connection', 
        status: 'EXCEPTION',
        error: sbError instanceof Error ? sbError.message : String(sbError)
      });
      return NextResponse.json(diagnostics, { status: 500 });
    }

    // 3. Vérifier l'utilisateur existe
    diagnostics.checks.push({ step: 'User lookup', status: 'starting' });
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', session.user.email)
      .single();

    if (userError) {
      diagnostics.checks.push({ 
        step: 'User lookup', 
        status: 'FAILED',
        error: userError.message,
        code: userError.code,
        searchEmail: session.user.email
      });
      return NextResponse.json(diagnostics, { status: 404 });
    }

    if (!user) {
      diagnostics.checks.push({ 
        step: 'User lookup', 
        status: 'FAILED',
        error: 'User not found',
        searchEmail: session.user.email
      });
      return NextResponse.json(diagnostics, { status: 404 });
    }

    diagnostics.checks.push({ 
      step: 'User lookup', 
      status: 'OK',
      userId: user.id
    });

    // 4. Vérifier emails_cache
    diagnostics.checks.push({ step: 'Emails query', status: 'starting' });
    
    const { data: emails, error: emailsError } = await supabase
      .from('emails_cache')
      .select('id, subject, from_email, received_at')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('received_at', { ascending: false })
      .limit(10);

    if (emailsError) {
      diagnostics.checks.push({ 
        step: 'Emails query', 
        status: 'FAILED',
        error: emailsError.message,
        code: emailsError.code
      });
      return NextResponse.json(diagnostics, { status: 500 });
    }

    diagnostics.checks.push({ 
      step: 'Emails query', 
      status: 'OK',
      emailCount: emails?.length || 0,
      sampleEmails: emails?.slice(0, 3).map(e => ({
        id: e.id,
        subject: e.subject,
        from: e.from_email,
        date: e.received_at
      }))
    });

    // 5. Vérifier les comptes mail
    diagnostics.checks.push({ step: 'Mail accounts', status: 'starting' });
    
    const { data: accounts, error: accountsError } = await supabase
      .from('mail_accounts')
      .select('id, email, provider, is_active')
      .eq('user_id', user.id);

    if (accountsError) {
      diagnostics.checks.push({ 
        step: 'Mail accounts', 
        status: 'FAILED',
        error: accountsError.message
      });
    } else {
      diagnostics.checks.push({ 
        step: 'Mail accounts', 
        status: 'OK',
        accountCount: accounts?.length || 0,
        accounts: accounts?.map(a => ({
          email: a.email,
          provider: a.provider,
          active: a.is_active
        }))
      });
    }

    // TOUT OK
    diagnostics.summary = {
      allChecksPass: true,
      recommendation: emails?.length === 0 
        ? 'No emails in cache. Try connecting a Gmail/Outlook account or click Sync.'
        : `Found ${emails.length} email(s). System is working correctly.`
    };

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error) {
    diagnostics.checks.push({
      step: 'Global exception',
      status: 'EXCEPTION',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(diagnostics, { status: 500 });
  }
}
