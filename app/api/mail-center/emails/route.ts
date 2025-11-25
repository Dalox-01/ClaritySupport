// API Route: GET emails - VERSION ULTRA-SIMPLIFIÉE
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      return NextResponse.json({
        error: 'ENV_MISSING',
        emails: [],
        count: 0
      });
    }
    
    const supabase = createClient(url, key);
    
    const { data, error } = await supabase
      .from('emails_cache')
      .select('*')
      .order('received_at', { ascending: false })
      .limit(50);
    
    if (error) {
      return NextResponse.json({
        error: 'DB_ERROR',
        details: error.message,
        emails: [],
        count: 0
      });
    }
    
    return NextResponse.json({
      emails: data || [],
      count: data?.length || 0,
      success: true
    });
    
  } catch (err) {
    return NextResponse.json({
      error: 'EXCEPTION',
      details: err instanceof Error ? err.message : String(err),
      emails: [],
      count: 0
    });
  }
}

