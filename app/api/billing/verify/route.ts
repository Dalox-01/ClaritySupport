import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/db';
import { logInfo, logError } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('🔍 Verify Payment - Session:', session?.user?.email);

    if (!session?.user?.email) {
      console.error('❌ No user session');
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    console.log('🔍 Session ID:', sessionId);

    if (!sessionId) {
      console.error('❌ No session_id provided');
      return NextResponse.json(
        { success: false, message: 'Session ID manquant' },
        { status: 400 }
      );
    }

    // Récupérer la session Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('📡 Stripe Session:', {
      payment_status: checkoutSession.payment_status,
      status: checkoutSession.status,
      metadata: checkoutSession.metadata,
    });

    if (checkoutSession.payment_status === 'paid') {
      // Récupérer le plan depuis les metadata
      const plan = checkoutSession.metadata?.plan || 'PRO';

      console.log('✅ Payment successful, updating plan to:', plan);

      // Mettre à jour seulement le plan de l'utilisateur dans Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({ plan: plan })
        .eq('email', session.user.email);

      if (updateError) {
        console.error('❌ Error updating user plan:', updateError);
      } else {
        console.log('✅ User plan updated successfully to:', plan);
      }

      logInfo('Payment verified', { userId: session.user.email, sessionId, plan });

      return NextResponse.json({
        success: true,
        message: 'Paiement confirmé',
        status: checkoutSession.status,
        plan: plan,
      });
    } else {
      console.error('❌ Payment not completed:', checkoutSession.payment_status);
      return NextResponse.json({
        success: false,
        message: 'Paiement non confirmé',
        status: checkoutSession.payment_status,
      });
    }
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    logError('Payment verification failed', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la vérification du paiement',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
