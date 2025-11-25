import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { tokensUsed = 0 } = await req.json();

    // Récupérer l'utilisateur actuel
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, usage_month, usage_count, tokens_used, plan')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le mois actuel
    const now = new Date();
    const currentMonth = parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`);

    let newUsageCount = user.usage_count || 0;
    let newTokensUsed = user.tokens_used || 0;

    // Réinitialiser si nouveau mois
    if (user.usage_month !== currentMonth) {
      newUsageCount = 1;
      newTokensUsed = tokensUsed;
    } else {
      newUsageCount = (user.usage_count || 0) + 1;
      newTokensUsed = (user.tokens_used || 0) + tokensUsed;
    }

    // Vérifier la limite selon le plan
    let limit = 10; // FREE par défaut
    if (user.plan === 'PRO') {
      limit = 5000;
    } else if (user.plan === 'STARTER') {
      limit = 500;
    }
    
    console.log(`📊 [USAGE] User: ${session.user.email}, Plan: ${user.plan}, Used: ${newUsageCount}/${limit}`);
    
    if (newUsageCount > limit) {
      console.log(`❌ [USAGE] Quota exceeded for ${session.user.email}`);
      return NextResponse.json(
        { 
          success: false, 
          message: `Limite de ${limit} emails atteinte pour ce mois`,
          quotaExceeded: true,
          usage: {
            used: user.usage_count,
            limit,
            remaining: 0
          }
        },
        { status: 429 }
      );
    }

    // Mettre à jour l'utilisation
    const { error: updateError } = await supabase
      .from('users')
      .update({
        usage_month: currentMonth,
        usage_count: newUsageCount,
        tokens_used: newTokensUsed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating usage:', updateError);
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      usage: {
        used: newUsageCount,
        limit,
        remaining: limit - newUsageCount,
        tokensUsed: newTokensUsed,
      }
    });

  } catch (error) {
    console.error('Error in increment usage:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
