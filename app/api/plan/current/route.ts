/**
 * API Route: Récupérer le plan actuel de l'utilisateur
 * Utilise le nouveau système plan-enforcement.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserPlanInfo } from '@/lib/plan-enforcement';
import { PLAN_LIMITS, type PlanName } from '@/lib/plan-limits';

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
    const limits = PLAN_LIMITS[planInfo.plan as PlanName] || PLAN_LIMITS.FREE;

    // Formater le nom du plan pour l'affichage
    const planLabels: Record<string, string> = {
      'FREE': 'Gratuit',
      'STARTER': 'Starter',
      'PRO': 'Pro',
      'SCALE': 'Scale',
      'SOLO': 'Solo',
      'UNLIMITED': 'Unlimited',
    };

    return NextResponse.json({
      success: true,
      data: {
        plan: planInfo.plan,
        planLabel: planLabels[planInfo.plan] || planInfo.plan,
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
      },
    });

  } catch (error) {
    console.error('❌ Erreur récupération plan actuel:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
