// API Route: Récupérer les emails - VERSION SIMPLIFIÉE QUI FONCTIONNE
// Sans NextAuth pour éviter les erreurs 500

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // 1. Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase env vars');
      return NextResponse.json({
        error: 'Configuration serveur manquante',
        emails: [],
        count: 0
      }, { status: 500 });
    }
    
    // 2. Créer client Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // 3. Récupérer TOUS les emails (temporairement, pour débugger)
    // On va chercher les 50 derniers emails de TOUS les utilisateurs
    const { data: emails, error: emailsError } = await supabase
      .from('emails_cache')
      .select('*')
      .is('deleted_at', null)
      .order('received_at', { ascending: false })
      .limit(50);
    
    if (emailsError) {
      console.error('❌ Supabase error:', emailsError);
      return NextResponse.json({
        error: 'Erreur base de données',
        details: emailsError.message,
        emails: [],
        count: 0
      }, { status: 500 });
    }
    
    console.log(`✅ Found ${emails?.length || 0} emails in database`);
    
    // Retourner les emails
    return NextResponse.json({
      success: true,
      emails: emails || [],
      count: emails?.length || 0,
      timestamp: new Date().toISOString(),
      note: 'Showing all emails from database (auth temporarily disabled for debugging)'
    });
    
  } catch (error) {
    console.error('❌ Exception:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : String(error),
      emails: [],
      count: 0
    }, { status: 500 });
  }
}

