import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

// Constantes du système d'affiliation
const AFFILIATE_CONFIG = {
  REFERRER_BONUS: 1500, // Bonus pour le parrain
  REFERRED_BONUS: 500,  // Bonus pour le filleul
  QUALIFYING_PLANS: ['starter', 'pro', 'scale'],
};

// POST - Appliquer un code d'affiliation lors de l'inscription ou souscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { code, plan } = await request.json();
    const userId = session.user.id;

    if (!code) {
      return NextResponse.json(
        { error: 'Code d\'affiliation manquant' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà été parrainé
    const { data: existingReferral } = await supabase
      .from('affiliate_referrals')
      .select('id')
      .eq('referred_user_id', userId)
      .single();

    if (existingReferral) {
      return NextResponse.json({
        success: false,
        error: 'Vous avez déjà utilisé un code de parrainage',
      });
    }

    // Vérifier que le code existe et est actif
    const { data: affiliateCode, error: codeError } = await supabase
      .from('affiliate_codes')
      .select('id, user_id, is_active')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (codeError || !affiliateCode) {
      return NextResponse.json({
        success: false,
        error: 'Code d\'affiliation invalide ou expiré',
      });
    }

    // Vérifier que l'utilisateur ne s'auto-parraine pas
    if (affiliateCode.user_id === userId) {
      return NextResponse.json({
        success: false,
        error: 'Vous ne pouvez pas utiliser votre propre code de parrainage',
      });
    }

    // Créer le parrainage
    const { data: referral, error: referralError } = await supabase
      .from('affiliate_referrals')
      .insert({
        affiliate_code_id: affiliateCode.id,
        referred_user_id: userId,
        plan_subscribed: plan || 'FREE',
        status: 'pending',
      })
      .select()
      .single();

    if (referralError) {
      console.error('Erreur création parrainage:', referralError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement du parrainage' },
        { status: 500 }
      );
    }

    // Mettre à jour l'utilisateur avec la référence au code
    await supabase
      .from('users')
      .update({ referred_by: affiliateCode.id })
      .eq('id', userId);

    // Si le plan souscrit est qualifiant, attribuer les bonus
    if (plan && AFFILIATE_CONFIG.QUALIFYING_PLANS.includes(plan.toUpperCase())) {
      await awardAffiliateBonus(affiliateCode.user_id, userId, referral.id, plan);
      
      return NextResponse.json({
        success: true,
        message: `Parrainage validé ! Vous recevez ${AFFILIATE_CONFIG.REFERRED_BONUS} générations bonus.`,
        bonusAwarded: AFFILIATE_CONFIG.REFERRED_BONUS,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Code de parrainage enregistré. Les bonus seront attribués à la souscription d\'un plan payant.',
    });

  } catch (error) {
    console.error('Erreur API apply affiliate:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Fonction pour attribuer les bonus d'affiliation
async function awardAffiliateBonus(
  referrerUserId: string,
  referredUserId: string,
  referralId: string,
  plan: string
) {
  try {
    // Bonus pour le parrain
    await supabase
      .from('affiliate_bonus_transactions')
      .insert({
        user_id: referrerUserId,
        referral_id: referralId,
        bonus_type: 'referral_reward',
        amount: AFFILIATE_CONFIG.REFERRER_BONUS,
        description: `Bonus parrainage - Nouveau filleul (${plan})`,
      });

    // Mettre à jour les bonus_credits du parrain
    const { data: referrerData } = await supabase
      .from('users')
      .select('bonus_credits')
      .eq('id', referrerUserId)
      .single();

    await supabase
      .from('users')
      .update({
        bonus_credits: (referrerData?.bonus_credits || 0) + AFFILIATE_CONFIG.REFERRER_BONUS,
      })
      .eq('id', referrerUserId);

    // Bonus de bienvenue pour le filleul
    await supabase
      .from('affiliate_bonus_transactions')
      .insert({
        user_id: referredUserId,
        referral_id: referralId,
        bonus_type: 'welcome_bonus',
        amount: AFFILIATE_CONFIG.REFERRED_BONUS,
        description: 'Bonus de bienvenue - Parrainage',
      });

    // Mettre à jour les bonus_credits du filleul
    const { data: referredData } = await supabase
      .from('users')
      .select('bonus_credits')
      .eq('id', referredUserId)
      .single();

    await supabase
      .from('users')
      .update({
        bonus_credits: (referredData?.bonus_credits || 0) + AFFILIATE_CONFIG.REFERRED_BONUS,
      })
      .eq('id', referredUserId);

    // Mettre à jour les stats du code d'affiliation
    const { data: affiliateCodeData } = await supabase
      .from('affiliate_codes')
      .select('id, total_referrals, total_bonus_earned')
      .eq('user_id', referrerUserId)
      .single();

    if (affiliateCodeData) {
      await supabase
        .from('affiliate_codes')
        .update({
          total_referrals: (affiliateCodeData.total_referrals || 0) + 1,
          total_bonus_earned: (affiliateCodeData.total_bonus_earned || 0) + AFFILIATE_CONFIG.REFERRER_BONUS,
        })
        .eq('id', affiliateCodeData.id);
    }

    // Mettre à jour le statut du parrainage
    await supabase
      .from('affiliate_referrals')
      .update({
        status: 'completed',
        bonus_awarded: AFFILIATE_CONFIG.REFERRER_BONUS,
        subscription_date: new Date().toISOString(),
      })
      .eq('id', referralId);

    // Log de l'audit
    await supabase.from('audit_logs').insert({
      user_id: referredUserId,
      action: 'affiliate_bonus_awarded',
      meta: {
        referrer_id: referrerUserId,
        referral_id: referralId,
        referrer_bonus: AFFILIATE_CONFIG.REFERRER_BONUS,
        referred_bonus: AFFILIATE_CONFIG.REFERRED_BONUS,
        plan,
      },
    });

  } catch (error) {
    console.error('Erreur attribution bonus:', error);
    throw error;
  }
}
