import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateEmail } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { emailContent, subject, fromName } = await req.json();

    if (!emailContent) {
      return NextResponse.json(
        { error: 'Le contenu de l\'email est requis' },
        { status: 400 }
      );
    }

    // Générer la réponse avec l'IA
    const reply = await generateEmail({
      type: 'reponse',
      tone: 'pro',
      language: 'fr',
      length: 'moyen',
      context: `Email original de ${fromName}:
Sujet: ${subject}
Message: ${emailContent}

Génère une réponse professionnelle et courtoise qui répond de manière appropriée.`,
    });

    return NextResponse.json({ reply: reply.text });
  } catch (error) {
    console.error('Erreur génération réponse:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la réponse' },
      { status: 500 }
    );
  }
}
