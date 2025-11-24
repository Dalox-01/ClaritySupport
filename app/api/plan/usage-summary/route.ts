/**
 * API Route: Résumé complet de l'utilisation et des limites
 * 
 * Retourne toutes les informations sur le plan actuel, l'utilisation,
 * et les fonctionnalités disponibles.
 * 
 * Usage:
 * GET /api/plan/usage-summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsageSummary } from '@/lib/plan-enforcement';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const summary = await getUsageSummary(session.user.id);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ Erreur récupération usage summary:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
