import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { to, subject, body, html } = await request.json();

    // Récupérer le token Gmail de l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('gmail_access_token, gmail_refresh_token, gmail_token_expires_at, email')
      .eq('id', session.user.id)
      .single();

    if (userError || !user?.gmail_access_token) {
      return NextResponse.json(
        { error: 'Gmail non connecté', needsAuth: true },
        { status: 401 }
      );
    }

    // Vérifier si le token est expiré
    const tokenExpired = new Date(user.gmail_token_expires_at) < new Date();
    
    let accessToken = user.gmail_access_token;

    if (tokenExpired && user.gmail_refresh_token) {
      // Rafraîchir le token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: user.gmail_refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok) {
        accessToken = refreshData.access_token;
        
        // Mettre à jour le token
        await supabase
          .from('users')
          .update({
            gmail_access_token: refreshData.access_token,
            gmail_token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          })
          .eq('id', session.user.id);
      } else {
        return NextResponse.json(
          { error: 'Token expiré', needsAuth: true },
          { status: 401 }
        );
      }
    }

    // Créer l'email au format RFC 2822
    const emailContent = [
      `From: ${user.email}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html || body,
    ].join('\r\n');

    // Encoder en base64url
    const encodedEmail = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Envoyer via l'API Gmail
    const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedEmail,
      }),
    });

    if (!sendResponse.ok) {
      const error = await sendResponse.json();
      console.error('Erreur envoi Gmail:', error);
      return NextResponse.json(
        { error: 'Erreur envoi email', needsAuth: sendResponse.status === 401 },
        { status: sendResponse.status }
      );
    }

    const result = await sendResponse.json();

    return NextResponse.json({
      success: true,
      messageId: result.id,
    });
  } catch (error) {
    console.error('Erreur envoi Gmail:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
