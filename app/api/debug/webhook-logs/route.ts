// Route pour voir les derniers logs du webhook
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Créer la table de logs si elle n'existe pas (SQL manuel via Supabase)
    // Pour l'instant, on va juste retourner les abonnements existants
    
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ 
        error: 'Erreur lecture subscriptions', 
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Derniers abonnements dans la base',
      subscriptions,
      count: subscriptions?.length || 0,
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
