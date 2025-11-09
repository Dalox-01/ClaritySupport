// API Route: Tracking et vérification de l'usage selon le plan

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getUserSubscription, 
  getUserUsageStats,
  canAddEmailAccount,
  canProcessEmail,
  canSendAutoReply,
  canAccessFeature,
  getSubscriptionSummary
} from '@/lib/subscription-limits';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET: Récupérer l'usage actuel et les limites
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const summary = await getSubscriptionSummary(session.user.id);

    return NextResponse.json({
      success: true,
      data: summary,
    });

  } catch (error) {
    console.error('❌ Erreur récupération usage:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST: Incrémenter un compteur d'usage
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { action, metadata } = await req.json();

    // Valider l'action
    const validActions = ['email_processed', 'auto_reply_sent', 'template_created', 'automation_created'];
    
    if (!action || !validActions.includes(action)) {
      return NextResponse.json({ 
        error: 'Action invalide',
        validActions 
      }, { status: 400 });
    }

    // Logger l'action dans email_automations
    const { error: logError } = await supabase
      .from('email_automations')
      .insert({
        user_id: session.user.id,
        action_type: action,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('⚠️ Erreur logging action:', logError);
    }

    console.log(`✅ Action trackée: ${action} pour user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: `Action ${action} trackée avec succès`,
    });

  } catch (error) {
    console.error('❌ Erreur tracking usage:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
