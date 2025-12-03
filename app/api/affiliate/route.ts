import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

// Constantes du système d'affiliation
const AFFILIATE_CONFIG = {
  REFERRER_BONUS: 1500, // Bonus pour le parrain (celui qui génère le lien)
  REFERRED_BONUS: 500,  // Bonus de bienvenue pour le filleul (celui qui utilise le lien)
  ELIGIBLE_PLANS: ['pro', 'scale'], // Plans pouvant générer un code
  QUALIFYING_PLANS: ['starter', 'pro', 'scale'], // Plans comptant comme parrainage réussi
  BASE_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://claritysupport.fr',
};

// GET - Récupérer les infos d'affiliation de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer le code d'affiliation de l'utilisateur
    const { data: affiliateCode, error: codeError } = await supabase
      .from('affiliate_codes')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Récupérer les parrainages
    let referrals: any[] = [];
    if (affiliateCode) {
      const { data: referralsData } = await supabase
        .from('affiliate_referrals')
        .select(`
          id,
          plan_subscribed,
          bonus_awarded,
          status,
          subscription_date,
          created_at,
          referred_user:users!referred_user_id (
            name,
            email
          )
        `)
        .eq('affiliate_code_id', affiliateCode.id)
        .order('created_at', { ascending: false });
      
      referrals = referralsData || [];
    }

    // Récupérer l'historique des bonus
    const { data: bonusHistory } = await supabase
      .from('affiliate_bonus_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Récupérer le plan et bonus_credits de l'utilisateur
    const { data: userData } = await supabase
      .from('users')
      .select('plan, bonus_credits, name')
      .eq('id', userId)
      .single();

    const canGenerateCode = userData && AFFILIATE_CONFIG.ELIGIBLE_PLANS.includes(userData.plan);

    return NextResponse.json({
      affiliateCode: affiliateCode || null,
      referrals,
      bonusHistory: bonusHistory || [],
      stats: {
        totalReferrals: affiliateCode?.total_referrals || 0,
        totalBonusEarned: affiliateCode?.total_bonus_earned || 0,
        currentBonusCredits: userData?.bonus_credits || 0,
        pendingReferrals: referrals.filter(r => r.status === 'pending').length,
        completedReferrals: referrals.filter(r => r.status === 'completed').length,
      },
      config: {
        referrerBonus: AFFILIATE_CONFIG.REFERRER_BONUS,
        referredBonus: AFFILIATE_CONFIG.REFERRED_BONUS,
        eligiblePlans: AFFILIATE_CONFIG.ELIGIBLE_PLANS,
      },
      canGenerateCode,
      userPlan: userData?.plan || 'FREE',
    });

  } catch (error) {
    console.error('Erreur API affiliation GET:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Générer un code d'affiliation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    // Vérifier si l'utilisateur a déjà un code
    const { data: existingCode } = await supabase
      .from('affiliate_codes')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingCode) {
      return NextResponse.json({
        success: true,
        affiliateCode: existingCode,
        message: 'Code d\'affiliation existant récupéré',
      });
    }

    // Vérifier le plan de l'utilisateur
    const { data: userData } = await supabase
      .from('users')
      .select('plan, name, email')
      .eq('id', userId)
      .single();

    if (!userData || !AFFILIATE_CONFIG.ELIGIBLE_PLANS.includes(userData.plan)) {
      return NextResponse.json(
        { 
          error: 'Plan non éligible', 
          message: `Vous devez avoir un plan ${AFFILIATE_CONFIG.ELIGIBLE_PLANS.join(' ou ')} pour générer un code d'affiliation.`,
          requiredPlans: AFFILIATE_CONFIG.ELIGIBLE_PLANS,
        },
        { status: 403 }
      );
    }

    // Générer un code unique
    const userName = userData.name || userData.email?.split('@')[0] || 'USER';
    const code = generateAffiliateCode(userName);
    const referralLink = `${AFFILIATE_CONFIG.BASE_URL}/pricing?ref=${code}`;

    // Créer le code d'affiliation
    const { data: newCode, error: insertError } = await supabase
      .from('affiliate_codes')
      .insert({
        user_id: userId,
        code,
        referral_link: referralLink,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erreur création code:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du code' },
        { status: 500 }
      );
    }

    // Log de l'audit
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'affiliate_code_created',
      meta: { code, referral_link: referralLink },
    });

    return NextResponse.json({
      success: true,
      affiliateCode: newCode,
      message: 'Code d\'affiliation créé avec succès !',
    });

  } catch (error) {
    console.error('Erreur API affiliation POST:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Fonction pour générer un code d'affiliation
function generateAffiliateCode(userName: string): string {
  // Nettoyer le nom et prendre les 4 premières lettres
  let baseCode = userName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 4);
  
  // Compléter si nécessaire
  while (baseCode.length < 4) {
    baseCode += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }
  
  // Générer un suffixe aléatoire
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const year = new Date().getFullYear().toString().substring(2);
  
  return `${baseCode}-${randomPart}${year}`;
}
