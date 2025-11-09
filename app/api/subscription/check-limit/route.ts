// API Route: Vérifier si une action est autorisée selon le plan

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  canAddEmailAccount,
  canProcessEmail,
  canSendAutoReply,
  canAccessFeature,
} from '@/lib/subscription-limits';
import type { PlanFeatures } from '@/lib/pricing-plans';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { action, feature } = await req.json();

    let result;

    switch (action) {
      case 'add_email_account':
        result = await canAddEmailAccount(session.user.id);
        break;

      case 'process_email':
        result = await canProcessEmail(session.user.id);
        break;

      case 'send_auto_reply':
        result = await canSendAutoReply(session.user.id);
        break;

      case 'access_feature':
        if (!feature) {
          return NextResponse.json({ 
            error: 'Feature name required for access_feature action' 
          }, { status: 400 });
        }
        result = await canAccessFeature(session.user.id, feature as keyof PlanFeatures);
        break;

      default:
        return NextResponse.json({ 
          error: 'Action invalide',
          validActions: ['add_email_account', 'process_email', 'send_auto_reply', 'access_feature']
        }, { status: 400 });
    }

    if (!result.allowed) {
      return NextResponse.json({
        allowed: false,
        reason: result.reason,
        currentUsage: result.currentUsage,
        limit: result.limit,
        upgradePlans: result.upgradePlans,
      }, { status: 403 });
    }

    return NextResponse.json({
      allowed: true,
      message: 'Action autorisée',
    });

  } catch (error) {
    console.error('❌ Erreur vérification limite:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
