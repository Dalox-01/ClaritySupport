// API Route: Callback Outlook OAuth

import { NextRequest, NextResponse } from 'next/server';
import { exchangeOutlookCode } from '@/lib/outlook-helpers';
import { supabase } from '@/lib/db';
import { encrypt } from '@/lib/security';
import { canAddEmailAccount } from '@/lib/subscription-limits';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/mail-center?error=${error}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/mail-center?error=missing_params', req.url)
      );
    }

    // 🔒 VÉRIFICATION DES LIMITES : Peut-on ajouter un compte email ?
    const limitCheck = await canAddEmailAccount(state);
    
    if (!limitCheck.allowed) {
      console.log(`🚫 Limite comptes email atteinte pour user ${state}: ${limitCheck.reason}`);
      
      return NextResponse.redirect(
        new URL(
          `/mail-center?error=limit_reached&reason=${encodeURIComponent(limitCheck.reason || '')}&current=${limitCheck.currentUsage}&limit=${limitCheck.limit}`, 
          req.url
        )
      );
    }

    // Échanger le code contre des tokens
    const tokens = await exchangeOutlookCode(code);

    // Récupérer le profil Outlook
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileResponse.json();

    // Chiffrer les tokens
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = encrypt(tokens.refresh_token);

    // Sauvegarder dans la base de données
    const { error: dbError } = await supabase
      .from('mail_accounts')
      .upsert({
        user_id: state,
        provider: 'outlook',
        email: profile.userPrincipalName || profile.mail,
        access_token_encrypted: encryptedAccessToken,
        refresh_token_encrypted: encryptedRefreshToken,
        token_expires_at: new Date(tokens.expiry_date).toISOString(),
        is_active: true,
        sync_enabled: true,
      }, {
        onConflict: 'user_id,email',
      });

    if (dbError) {
      console.error('Error saving Outlook account:', dbError);
      return NextResponse.redirect(
        new URL('/mail-center?error=save_failed', req.url)
      );
    }

    return NextResponse.redirect(
      new URL('/mail-center?success=outlook_connected', req.url)
    );
  } catch (error) {
    console.error('Error in Outlook callback:', error);
    return NextResponse.redirect(
      new URL('/mail-center?error=server_error', req.url)
    );
  }
}
