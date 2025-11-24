// Route de test ULTRA-SIMPLE pour diagnostiquer le problème
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test 1: Variables d'environnement
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      return NextResponse.json({
        step: 'ENV_CHECK',
        error: 'Variables manquantes',
        hasUrl: !!url,
        hasKey: !!key
      });
    }
    
    // Test 2: Créer client
    const supabase = createClient(url, key);
    
    // Test 3: Query simple
    const { data, error } = await supabase
      .from('emails_cache')
      .select('id, subject, user_id')
      .limit(5);
    
    if (error) {
      return NextResponse.json({
        step: 'QUERY',
        error: error.message,
        code: error.code
      });
    }
    
    // Succès
    return NextResponse.json({
      step: 'SUCCESS',
      count: data?.length || 0,
      emails: data || [],
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    return NextResponse.json({
      step: 'EXCEPTION',
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
  }
}
