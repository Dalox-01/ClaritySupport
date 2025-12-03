/**
 * API Route: Invalider le cache d'optimisation IA
 * Appeler cette route quand la configuration IA de l'utilisateur change
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { invalidateOptimizedCache } from '@/lib/token-optimizer';

export const dynamic = 'force-dynamic';

// POST - Invalider le cache d'optimisation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;

    // Invalider le cache
    await invalidateOptimizedCache(userId);

    console.log(`🗑️ Cache IA invalidé pour user ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Cache d\'optimisation invalidé avec succès',
      userId,
    });

  } catch (error) {
    console.error('❌ Erreur invalidation cache:', error);
    return NextResponse.json({ 
      error: 'Erreur invalidation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Obtenir les statistiques d'optimisation
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { getOptimizedPrompt } = await import('@/lib/token-optimizer');
    const optimizedData = await getOptimizedPrompt(session.user.id);

    return NextResponse.json({
      success: true,
      optimization: {
        tokensEstimated: optimizedData.tokensEstimated,
        originalTokensEstimated: optimizedData.originalTokensEstimated,
        compressionRatio: optimizedData.compressionRatio,
        cacheHit: optimizedData.cacheHit,
        tokensSaved: optimizedData.originalTokensEstimated - optimizedData.tokensEstimated,
      },
    });

  } catch (error) {
    console.error('❌ Erreur stats optimisation:', error);
    return NextResponse.json({ 
      error: 'Erreur récupération stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
