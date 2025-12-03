// Route de test minimaliste - Sans dépendances complexes
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const report: any = {
    timestamp: new Date().toISOString(),
    environment: {},
    tests: []
  };

  try {
    // Test 1: Variables d'environnement
    report.environment = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
    };

    // Test 2: Import Supabase
    report.tests.push({ test: 'Import @supabase/supabase-js', status: 'starting' });
    try {
      const { createClient } = await import('@supabase/supabase-js');
      report.tests.push({ test: 'Import @supabase/supabase-js', status: 'OK' });
      
      // Test 3: Créer client Supabase
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        report.tests.push({ test: 'Create Supabase client', status: 'starting' });
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        report.tests.push({ test: 'Create Supabase client', status: 'OK' });
        
        // Test 4: Query simple
        report.tests.push({ test: 'Test query', status: 'starting' });
        const { data, error } = await supabase.from('users').select('id').limit(1);
        if (error) {
          report.tests.push({ test: 'Test query', status: 'FAILED', error: error.message });
        } else {
          report.tests.push({ test: 'Test query', status: 'OK', rowCount: data?.length || 0 });
        }
      } else {
        report.tests.push({ test: 'Create Supabase client', status: 'SKIPPED', reason: 'Missing env vars' });
      }
    } catch (importError) {
      report.tests.push({ 
        test: 'Import @supabase/supabase-js', 
        status: 'FAILED', 
        error: importError instanceof Error ? importError.message : String(importError)
      });
    }

    // Test 5: Import NextAuth
    report.tests.push({ test: 'Import next-auth', status: 'starting' });
    try {
      const { getServerSession } = await import('next-auth');
      report.tests.push({ test: 'Import next-auth', status: 'OK' });
    } catch (authImportError) {
      report.tests.push({ 
        test: 'Import next-auth', 
        status: 'FAILED', 
        error: authImportError instanceof Error ? authImportError.message : String(authImportError)
      });
    }

    return NextResponse.json(report);

  } catch (error) {
    report.globalError = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    };
    return NextResponse.json(report, { status: 500 });
  }
}
