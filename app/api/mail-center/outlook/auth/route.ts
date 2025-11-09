// API Route: Connexion Outlook

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOutlookAuthUrl } from '@/lib/outlook-helpers';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Générer l'URL d'authentification Outlook
    const authUrl = await getOutlookAuthUrl(session.user.id);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Outlook auth URL:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
