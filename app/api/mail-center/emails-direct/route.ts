// Version alternative sans NextAuth pour débugger
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const logs: string[] = [];
  
  try {
    logs.push('START /emails-direct');
    
    // Récupérer email depuis query params (pour test)
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('email');
    
    if (!userEmail) {
      logs.push('ERROR: No email provided in query params');
      return NextResponse.json({ 
        error: 'Provide ?email=your@email.com for testing',
        logs 
      }, { status: 400 });
    }
    
    logs.push(`Testing with email: ${userEmail}`);
    
    // Variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logs.push('ERROR: Missing Supabase env vars');
      return NextResponse.json({
        error: 'Supabase environment variables missing',
        supabaseUrl: supabaseUrl ? 'SET' : 'MISSING',
        supabaseKey: supabaseKey ? 'SET' : 'MISSING',
        logs
      }, { status: 500 });
    }
    
    logs.push('ENV vars OK');
    
    // Créer client
    const supabase = createClient(supabaseUrl, supabaseKey);
    logs.push('Supabase client created');
    
    // Chercher user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', userEmail)
      .maybeSingle();
    
    if (userError) {
      logs.push(`User query error: ${userError.message}`);
      return NextResponse.json({ error: 'User query failed', details: userError.message, logs }, { status: 500 });
    }
    
    if (!user) {
      logs.push('User not found');
      return NextResponse.json({ error: 'User not found', logs }, { status: 404 });
    }
    
    logs.push(`User found: ${user.id}`);
    
    // Récupérer emails
    const { data: emails, error: emailsError } = await supabase
      .from('emails_cache')
      .select('id, subject, from_email, received_at')
      .eq('user_id', user.id)
      .order('received_at', { ascending: false })
      .limit(10);
    
    if (emailsError) {
      logs.push(`Emails query error: ${emailsError.message}`);
      return NextResponse.json({ error: 'Emails query failed', details: emailsError.message, logs }, { status: 500 });
    }
    
    logs.push(`Found ${emails?.length || 0} emails`);
    
    return NextResponse.json({
      success: true,
      userId: user.id,
      emails: emails || [],
      count: emails?.length || 0,
      logs
    });
    
  } catch (error) {
    logs.push(`EXCEPTION: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ 
      error: 'Server exception',
      details: error instanceof Error ? error.message : String(error),
      logs
    }, { status: 500 });
  }
}
