// API Route: Créer une session Stripe Customer Portal

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPortalSession } from '@/lib/stripe';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer l'abonnement de l'utilisateur pour obtenir le stripe_customer_id
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Si pas d'abonnement dans subscriptions, chercher dans users
    if (error || !customerId) {
      const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', session.user.id)
        .single();
      
      customerId = userData?.stripe_customer_id;
    }

    if (!customerId) {
      return NextResponse.json({ 
        error: 'Aucun client Stripe trouvé' 
      }, { status: 404 });
    }

    // URL de retour
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/mail-center/billing`;

    // Créer la session de portail client
    const portalSession = await createPortalSession({
      customerId: customerId,
      returnUrl,
    });

    console.log(`✅ Session Portal créée pour user ${session.user.id}`);

    return NextResponse.json({
      url: portalSession.url,
    });

  } catch (error) {
    console.error('❌ Erreur création session Portal:', error);
    return NextResponse.json({ 
      error: 'Erreur création session portail',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
