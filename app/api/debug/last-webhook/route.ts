// Route de debug pour voir le dernier événement webhook reçu
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Vérifier la table subscriptions
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({ 
        error: 'Erreur lecture subscriptions', 
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({
      subscriptions,
      count: subscriptions?.length || 0,
      message: subscriptions?.length === 0 
        ? '⚠️ Aucun abonnement trouvé - Le webhook n\'a pas créé d\'abonnement'
        : '✅ Abonnements trouvés'
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
