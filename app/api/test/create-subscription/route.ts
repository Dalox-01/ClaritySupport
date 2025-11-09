// API Route de TEST pour créer manuellement un abonnement
// À UTILISER UNIQUEMENT EN DÉVELOPPEMENT

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !['free', 'starter', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    console.log(`🧪 [TEST] Création abonnement ${plan} pour user ${session.user.email}`);

    // Créer l'abonnement dans la table subscriptions
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: session.user.id,
        plan: plan,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
        billing_period: 'monthly',
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création abonnement test:', error);
      return NextResponse.json({ 
        error: 'Erreur création abonnement',
        details: error.message 
      }, { status: 500 });
    }

    console.log(`✅ [TEST] Abonnement ${plan} créé pour ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: `Abonnement ${plan} créé avec succès (TEST)`,
      subscription: data,
    });

  } catch (error) {
    console.error('❌ Erreur route test subscription:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
