// API Route: Connexion Gmail

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGmailAuthUrl } from '@/lib/gmail-helpers';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Générer l'URL d'authentification Gmail
    const authUrl = getGmailAuthUrl(session.user.id);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Gmail auth URL:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
