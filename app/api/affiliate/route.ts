import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

interface Affiliation {
  id: string;
  status: string;
  referrer_monthly_credits: number;
  referee_monthly_credits: number;
  referee?: { id: string; name: string; email: string } | null;
  referrer?: { id: string; name: string; email: string } | null;
}

// GET: Récupérer les infos d'affiliation de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer le code de parrainage de l'utilisateur
    const { data: referralCode } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Si pas de code, en créer un
    let userReferralCode = referralCode;
    if (!referralCode) {
      const userName = session.user.name || session.user.email?.split('@')[0] || 'USER';
      const prefix = userName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'REF';
      const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newCode = `${prefix}${suffix}`;

      const { data: createdCode, error: createError } = await supabase
        .from('referral_codes')
        .insert({
          user_id: userId,
          code: newCode,
          is_active: true,
        })
        .select()
        .single();

      if (createError) {
        console.error('Erreur création code:', createError);
      } else {
        userReferralCode = createdCode;
      }
    }

    // Récupérer les affiliations où l'utilisateur est parrain
    const { data: asReferrer } = await supabase
      .from('affiliations')
      .select(`
        *,
        referee:users!referee_id(id, name, email)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    // Récupérer l'affiliation où l'utilisateur est filleul
    const { data: asReferee } = await supabase
      .from('affiliations')
      .select(`
        *,
        referrer:users!referrer_id(id, name, email)
      `)
      .eq('referee_id', userId)
      .single();

    // Calculer les crédits bonus totaux
    const affiliations = (asReferrer || []) as Affiliation[];
    const activeReferrals = affiliations.filter((a: Affiliation) => a.status === 'active');
    const referrerBonus = activeReferrals.length * 1500; // 1500 par filleul actif
    const refereeBonus = asReferee?.status === 'active' ? 500 : 0; // 500 si filleul actif
    const totalBonusCredits = referrerBonus + refereeBonus;

    return NextResponse.json({
      referralCode: userReferralCode,
      asReferrer: asReferrer || [],
      asReferee: asReferee || null,
      stats: {
        totalReferrals: (asReferrer || []).length,
        activeReferrals: activeReferrals.length,
        referrerBonus,
        refereeBonus,
        totalBonusCredits,
      },
    });
  } catch (error) {
    console.error('Erreur API affiliation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST: Appliquer un code de parrainage
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json({ error: 'Code de parrainage requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur n'est pas déjà filleul
    const { data: existingReferee } = await supabase
      .from('affiliations')
      .select('id')
      .eq('referee_id', userId)
      .single();

    if (existingReferee) {
      return NextResponse.json({ error: 'Vous avez déjà un parrain' }, { status: 400 });
    }

    // Vérifier que le code existe et est actif
    const { data: codeData, error: codeError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', referralCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (codeError || !codeData) {
      return NextResponse.json({ error: 'Code de parrainage invalide' }, { status: 400 });
    }

    // Vérifier que l'utilisateur ne s'auto-parraine pas
    if (codeData.user_id === userId) {
      return NextResponse.json({ error: 'Vous ne pouvez pas utiliser votre propre code' }, { status: 400 });
    }

    // Vérifier les limites d'utilisation
    if (codeData.max_uses && codeData.uses_count >= codeData.max_uses) {
      return NextResponse.json({ error: 'Ce code a atteint sa limite d\'utilisation' }, { status: 400 });
    }

    // Vérifier si l'utilisateur a un abonnement actif
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();

    const affiliationStatus = subscription ? 'active' : 'pending';

    // Créer l'affiliation
    const { data: affiliation, error: affiliationError } = await supabase
      .from('affiliations')
      .insert({
        referrer_id: codeData.user_id,
        referee_id: userId,
        referral_code: referralCode.toUpperCase(),
        status: affiliationStatus,
        activated_at: subscription ? new Date().toISOString() : null,
        referrer_monthly_credits: 1500,
        referee_monthly_credits: 500,
      })
      .select()
      .single();

    if (affiliationError) {
      console.error('Erreur création affiliation:', affiliationError);
      return NextResponse.json({ error: 'Erreur lors de l\'application du code' }, { status: 500 });
    }

    // Incrémenter le compteur d'utilisation
    await supabase
      .from('referral_codes')
      .update({ 
        uses_count: codeData.uses_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', codeData.id);

    // Sauvegarder le code utilisé dans le profil utilisateur
    await supabase
      .from('users')
      .update({ referred_by_code: referralCode.toUpperCase() })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      affiliation,
      message: affiliationStatus === 'active' 
        ? 'Code appliqué ! Vous recevez +500 crédits/mois et votre parrain +1500 crédits/mois.' 
        : 'Code enregistré ! Les bonus seront activés dès que vous souscrirez un abonnement.',
    });
  } catch (error) {
    console.error('Erreur API affiliation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
