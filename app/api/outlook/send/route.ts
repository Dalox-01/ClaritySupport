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

    const { subject, body } = await request.json();

    // Récupérer le token Outlook de l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('outlook_access_token, outlook_refresh_token, outlook_token_expires_at')
      .eq('id', session.user.id)
      .single();

    if (userError || !user?.outlook_access_token) {
      return NextResponse.json(
        { error: 'Outlook non connecté', needsAuth: true },
        { status: 401 }
      );
    }

    // Vérifier si le token est expiré
    const tokenExpired = new Date(user.outlook_token_expires_at) < new Date();
    
    let accessToken = user.outlook_access_token;

    if (tokenExpired && user.outlook_refresh_token) {
      // Rafraîchir le token
      const refreshResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          refresh_token: user.outlook_refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok) {
        accessToken = refreshData.access_token;
        
        // Mettre à jour les tokens
        await supabase
          .from('users')
          .update({
            outlook_access_token: refreshData.access_token,
            outlook_refresh_token: refreshData.refresh_token || user.outlook_refresh_token,
            outlook_token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          })
          .eq('id', session.user.id);
      } else {
        return NextResponse.json(
          { error: 'Token expiré', needsAuth: true },
          { status: 401 }
        );
      }
    }

    // Créer un brouillon dans Outlook via Microsoft Graph API
    const messageResponse = await fetch('https://graph.microsoft.com/v1.0/me/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        body: {
          contentType: 'Text',
          content: body,
        },
        toRecipients: [],
      }),
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.json();
      console.error('Erreur création message:', error);
      return NextResponse.json(
        { error: 'Erreur création email', needsAuth: !messageResponse.status.toString().startsWith('4') },
        { status: messageResponse.status }
      );
    }

    const message = await messageResponse.json();

    return NextResponse.json({
      success: true,
      messageId: message.id,
      webLink: message.webLink,
    });
  } catch (error) {
    console.error('Erreur envoi Outlook:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
