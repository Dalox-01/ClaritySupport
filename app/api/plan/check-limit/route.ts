/**
 * API Route: Vérification centralisée des limites de plan
 * 
 * Cette API est appelée avant toute action nécessitant une vérification de limite.
 * Elle retourne si l'action est autorisée et fournit les détails pour l'UI.
 * 
 * Usage:
 * POST /api/plan/check-limit
 * Body: { action: 'add_email_account' | 'send_auto_reply' | 'add_shopify_store' | 'access_feature', feature?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  canAddEmailAccount,
  canSendAutoReply,
  canAddShopifyStore,
  canAccessFeature,
} from '@/lib/plan-enforcement';

export const dynamic = 'force-dynamic';

type CheckAction = 
  | 'add_email_account'
  | 'send_auto_reply'
  | 'add_shopify_store'
  | 'access_feature';

type AccessFeature = 
  | 'aiTemplates'
  | 'prioritySupport'
  | 'analytics'
  | 'whiteLabel'
  | 'customApi'
  | 'signatureDynamique'
  | 'upsellAuto'
  | 'orderTracking';

export async function POST(req: NextRequest) {
  try {
    // Authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, feature } = body as { action: CheckAction; feature?: AccessFeature };

    if (!action) {
      return NextResponse.json(
        { error: 'Action requise' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'add_email_account':
        result = await canAddEmailAccount(session.user.id);
        break;

      case 'send_auto_reply':
        result = await canSendAutoReply(session.user.id);
        break;

      case 'add_shopify_store':
        result = await canAddShopifyStore(session.user.id);
        break;

      case 'access_feature':
        if (!feature) {
          return NextResponse.json(
            { error: 'Nom de fonctionnalité requis pour access_feature' },
            { status: 400 }
          );
        }
        result = await canAccessFeature(session.user.id, feature);
        break;

      default:
        return NextResponse.json(
          {
            error: 'Action invalide',
            validActions: [
              'add_email_account',
              'send_auto_reply',
              'add_shopify_store',
              'access_feature',
            ],
          },
          { status: 400 }
        );
    }

    if (!result.allowed) {
      return NextResponse.json(
        {
          allowed: false,
          reason: result.reason,
          currentUsage: result.currentUsage,
          limit: result.limit,
          usagePercentage: result.usagePercentage,
          suggestedPlans: result.suggestedPlans,
          requiresUpgrade: result.requiresUpgrade,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      allowed: true,
      currentUsage: result.currentUsage,
      limit: result.limit,
      usagePercentage: result.usagePercentage,
    });

  } catch (error) {
    console.error('❌ Erreur vérification limite:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur lors de la vérification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
