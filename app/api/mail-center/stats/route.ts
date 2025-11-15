// API Route: Statistiques Mail Center - HAUTE PERFORMANCE
// Architecture: Service d'analytics optimisé + cache

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculateUserAnalytics, formatResponseTime } from '@/lib/analytics-service';
import type { AnalyticsPeriod } from '@/lib/analytics-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Timeout 10s

/**
 * GET /api/mail-center/stats
 * Statistiques optimisées pour le dashboard analytics
 * 
 * Query params:
 * - period: 'today' | 'week' | 'month' (default: 'week')
 * 
 * Performance: <200ms avec service optimisé
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') || 'week') as AnalyticsPeriod;
    const userId = session.user.id;

    // Validation du paramètre period
    if (!['today', 'week', 'month'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Use: today, week, or month' },
        { status: 400 }
      );
    }

    // CALCUL DES ANALYTICS via service optimisé
    const analyticsData = await calculateUserAnalytics(userId, period);

    // Formater le temps de réponse pour le frontend
    const formattedResponseTime = formatResponseTime(analyticsData.metrics.avg_response_time_minutes);

    // RÉPONSE OPTIMISÉE (structure pour composants Visactor)
    const response = {
      metrics: {
        total_emails: analyticsData.metrics.total_emails,
        unread_emails: analyticsData.metrics.unread_emails,
        urgent_emails: analyticsData.metrics.urgent_emails,
        avg_response_time: formattedResponseTime,
      },
      timeline: analyticsData.timeline,
      categories: analyticsData.categories,
      filters: analyticsData.filters,
      sentiment: analyticsData.sentiment,
    };

    const processingTime = Date.now() - startTime;
    
    console.log(
      `✅ [STATS API] ${processingTime}ms | ` +
      `Period: ${period} | ` +
      `Emails: ${analyticsData.metrics.total_emails} | ` +
      `Filters: ${analyticsData.filters.length}`
    );

    return NextResponse.json(response, {
      headers: {
        'X-Processing-Time': `${processingTime}ms`,
        'Cache-Control': 'private, max-age=60', // Cache 1 minute côté client
      },
    });

  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ [STATS API] Error after ${errorTime}ms:`, error);
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors du calcul des statistiques',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
