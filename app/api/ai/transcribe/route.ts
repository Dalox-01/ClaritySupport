import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, message: 'Fichier audio manquant' },
        { status: 400 }
      );
    }

    // Convertir en format optimal pour Whisper (MP3 ou WAV)
    // Whisper fonctionne mieux avec MP3/WAV qu'avec WebM
    const arrayBuffer = await audioFile.arrayBuffer();
    
    // Créer un nouveau fichier avec extension mp3 pour meilleure compatibilité
    const mp3File = new File([arrayBuffer], 'audio.mp3', { 
      type: 'audio/mpeg' 
    });

    // Transcription avec Whisper - Paramètres ultra-optimisés
    const transcription = await openai.audio.transcriptions.create({
      file: mp3File,
      model: 'whisper-1',
      language: 'fr', // Force français
      // Prompt détaillé avec vocabulaire technique et contexte métier
      prompt: 'Transcription précise en français pour un email professionnel. Vocabulaire : candidature, réunion, proposition, offre, devis, facture, livraison, confirmation, rendez-vous, projet, collaboration, partenariat, service, client, fournisseur, deadline, échéance, budget, tarif, conditions, contrat, accord, signature, validation, approbation, recommandation, référence, expertise, compétence, expérience, qualité, performance, résultat, objectif, stratégie, solution, innovation, développement, croissance, opportunité, challenge, engagement, responsabilité, disponibilité, flexibilité, réactivité, efficacité, optimisation, amélioration, suivi, reporting, analyse, étude, recherche, formation, conseil, accompagnement, support, assistance, service client, satisfaction, fidélisation, relation client.',
      response_format: 'verbose_json',
      temperature: 0, // Maximum précision, zéro créativité
    });

    return NextResponse.json({
      success: true,
      data: {
        text: transcription.text,
      },
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    
    // Messages d'erreur plus détaillés
    let errorMessage = 'Erreur lors de la transcription';
    
    if (error.code === 'invalid_audio') {
      errorMessage = 'Format audio invalide. Veuillez réessayer.';
    } else if (error.code === 'audio_too_short') {
      errorMessage = 'Audio trop court. Parlez plus longtemps.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Trop de demandes. Attendez quelques secondes.';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
