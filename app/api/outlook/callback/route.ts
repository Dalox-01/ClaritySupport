import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=outlook_auth_failed`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=invalid_callback`);
    }

    // Échanger le code contre un access token
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/outlook/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Erreur token Outlook:', tokenData);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=token_failed`);
    }

    // Stocker le token dans la base de données
    const { error: dbError } = await supabase
      .from('users')
      .update({
        outlook_access_token: tokenData.access_token,
        outlook_refresh_token: tokenData.refresh_token,
        outlook_token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      })
      .eq('id', state);

    if (dbError) {
      console.error('Erreur sauvegarde token:', dbError);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=db_failed`);
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?outlook_connected=true`);
  } catch (error) {
    console.error('Erreur callback Outlook:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=server_error`);
  }
}
