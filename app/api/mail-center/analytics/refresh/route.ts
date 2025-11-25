// API Route: Rafraîchissement des analytics pré-calculées
// Endpoint à appeler via CRON ou manuellement pour recalculer les stats

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { recalculateDailyAnalytics } from '@/lib/analytics-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30s pour le cron job

/**
 * POST /api/mail-center/analytics/refresh
 * Recalcule les analytics pré-agrégées pour optimiser les performances
 * 
 * Body (optionnel):
 * - date: Date à recalculer (ISO string) - défaut: aujourd'hui
 * 
 * Auth: Requiert utilisateur authentifié
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    
    // Date à recalculer (par défaut: aujourd'hui)
    const targetDate = body.date ? new Date(body.date) : new Date();

    // Vérifier que la date n'est pas dans le futur
    const now = new Date();
    if (targetDate > now) {
      return NextResponse.json(
        { error: 'Cannot calculate analytics for future dates' },
        { status: 400 }
      );
    }

    // Recalculer les analytics
    await recalculateDailyAnalytics(userId, targetDate);

    return NextResponse.json({
      success: true,
      message: 'Analytics recalculées avec succès',
      date: targetDate.toISOString().split('T')[0],
    });

  } catch (error) {
    console.error('❌ [ANALYTICS REFRESH] Error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du rafraîchissement des analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
