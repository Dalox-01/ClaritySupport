// API Route: Obtenir et gérer le quota Mail Center

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Obtenir le quota Mail Center actuel
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;

    // Vérifier et réinitialiser le quota si le mois a changé
    await checkAndResetQuota(userId);

    // Récupérer l'utilisateur
    const { data: user, error } = await supabase
      .from('users')
      .select('plan, usage_count')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Déterminer les limites selon le plan (QUOTA GLOBAL)
    const limits: Record<string, number> = {
      'FREE': 10,
      'STARTER': 2000,
      'PRO': 7500,
      'ENTERPRISE': 25000,
      'ADMIN': 999999
    };

    const limit = limits[user.plan] || 0;
    const used = user.usage_count || 0;
    const remaining = Math.max(0, limit - used);

    return NextResponse.json({
      plan: user.plan,
      limit,
      used,
      remaining,
      hasAccess: true // Tous les plans ont accès avec quota unifié
    });

  } catch (error) {
    console.error('❌ Erreur quota Mail Center:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Incrémenter le compteur Mail Center
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;

    // Vérifier le quota avant d'incrémenter
    const { data: user } = await supabase
      .from('users')
      .select('plan, usage_count')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier l'accès (FREE peut utiliser mais avec limite de 10)
    const limits: Record<string, number> = {
      'FREE': 10,
      'STARTER': 2000,
      'PRO': 7500,
      'ENTERPRISE': 25000,
      'ADMIN': 999999
    };

    const limit = limits[user.plan] || 0;
    const used = user.usage_count || 0;

    if (used >= limit) {
      return NextResponse.json({ 
        error: 'Quota dépassé',
        message: `Vous avez atteint votre limite de ${limit} générations ce mois-ci. ${user.plan === 'FREE' ? 'Passez à Starter ou Pro pour augmenter votre quota.' : ''}`
      }, { status: 429 });
    }

    // Incrémenter le compteur global
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        usage_count: used + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ Quota global incremented for user ${userId}: ${used + 1}/${limit}`);

    return NextResponse.json({
      success: true,
      used: used + 1,
      limit,
      remaining: limit - (used + 1)
    });

  } catch (error) {
    console.error('❌ Erreur incrémentation quota:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Fonction utilitaire pour vérifier et réinitialiser le quota mensuel
async function checkAndResetQuota(userId: string): Promise<void> {
  const currentMonth = parseInt(
    new Date().toISOString().slice(0, 7).replace('-', '')
  );

  const { data: user } = await supabase
    .from('users')
    .select('usage_month')
    .eq('id', userId)
    .single();

  if (!user) return;

  // Si le mois a changé, réinitialiser le compteur
  if (user.usage_month !== currentMonth) {
    await supabase
      .from('users')
      .update({
        usage_month: currentMonth,
        usage_count: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    console.log(`🔄 Quota global réinitialisé pour ${userId}`);
  }
}

