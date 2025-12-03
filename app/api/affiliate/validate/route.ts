import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Valider un code d'affiliation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Code manquant' },
        { status: 400 }
      );
    }

    // Vérifier si le code existe et est actif
    const { data: affiliateCode, error } = await supabase
      .from('affiliate_codes')
      .select(`
        id,
        code,
        is_active,
        user:users!user_id (
          name,
          plan
        )
      `)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !affiliateCode) {
      return NextResponse.json({
        valid: false,
        error: 'Code d\'affiliation invalide ou expiré',
      });
    }

    return NextResponse.json({
      valid: true,
      code: affiliateCode.code,
      referrerName: (affiliateCode.user as any)?.name || 'Un membre',
      message: `Code valide ! Vous avez été parrainé par ${(affiliateCode.user as any)?.name || 'un membre'}.`,
    });

  } catch (error) {
    console.error('Erreur validation code:', error);
    return NextResponse.json(
      { valid: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
