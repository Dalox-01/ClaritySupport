/**
 * API Route: Récupérer le plan actuel de l'utilisateur
 * Utilise le nouveau système plan-enforcement.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserPlanInfo, getHumanReadablePlanName } from '@/lib/plan-enforcement';
import { getPlanLimits, type PlanName } from '@/lib/plan-limits';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer les infos du plan via le nouveau système
    const planInfo = await getUserPlanInfo(session.user.id);
    
    if (!planInfo) {
      return NextResponse.json({ 
        error: 'Impossible de récupérer le plan' 
      }, { status: 500 });
    }

    // Récupérer les limites du plan
    const limits = getPlanLimits(planInfo.plan);

    return NextResponse.json({
      success: true,
      plan: planInfo.plan,
      planDisplay: getHumanReadablePlanName(planInfo.plan),
      segment: planInfo.segment,
      status: planInfo.status,
      limits: {
        emailAccounts: limits.emailAccounts,
        autoRepliesPerMonth: limits.autoRepliesPerMonth,
        aiTemplates: limits.aiTemplates,
        prioritySupport: limits.prioritySupport,
        analytics: limits.analytics,
        multiShops: limits.multiShops,
        whiteLabel: limits.whiteLabel,
        customApi: limits.customApi,
      },
      subscription: {
        currentPeriodStart: planInfo.currentPeriodStart,
        currentPeriodEnd: planInfo.currentPeriodEnd,
        cancelAtPeriodEnd: planInfo.cancelAtPeriodEnd,
        stripeCustomerId: planInfo.stripeCustomerId,
        stripeSubscriptionId: planInfo.stripeSubscriptionId,
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération plan actuel:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
