import { NextRequest, NextResponse } from 'next/server';
import { generateEmail, EmailGenerationInput } from '@/lib/ai';
import { logError, logInfo } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const generateSchema = z.object({
  type: z.enum(['candidature', 'relance', 'prospection', 'support', 'reponse', 'negociation']),
  tone: z.enum(['pro', 'cordial', 'direct']),
  style: z.enum(['formel', 'creatif', 'technique', 'commercial']).optional(),
  language: z.enum(['fr', 'en', 'es', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'ar', 'zh', 'ja', 'ko']),
  length: z.enum(['court', 'moyen', 'long']).optional(),
  context: z.string().min(10, 'Le contexte doit contenir au moins 10 caractères'),
  attachments: z.boolean().optional(),
  keyPoints: z.array(z.string()).optional(),
  constraints: z.string().optional(),
  variables: z.record(z.string()).optional(),
  target: z
    .object({
      role: z.string().optional(),
      company: z.string().optional(),
      sector: z.string().optional(),
    })
    .optional(),
  customPrompt: z.string().optional(),
  saveAsEmail: z.boolean().optional(),
  title: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    console.log('📧 [GENERATE] Request received');
    
    // Vérifier la session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ [GENERATE] No session found');
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    console.log('✅ [GENERATE] Session OK:', session.user.email);

    // VÉRIFIER LE QUOTA AVANT LA GÉNÉRATION
    try {
      console.log('📊 [GENERATE] Checking quota...');
      const { getUserQuota } = await import('@/lib/db');
      const quota = await getUserQuota(session.user.id);
      
      console.log('📊 [GENERATE] Quota status:', quota);

      if (quota.used >= quota.limit) {
        console.log('❌ [GENERATE] Quota exceeded:', { used: quota.used, limit: quota.limit });
        return NextResponse.json(
          { 
            success: false, 
            message: `Limite de ${quota.limit} emails atteinte pour ce mois. Passez au plan PRO pour continuer.`,
            quotaExceeded: true,
            usage: { used: quota.used, limit: quota.limit, remaining: quota.remaining }
          },
          { status: 429 }
        );
      }
    } catch (quotaError) {
      console.error('⚠️ [GENERATE] Could not check quota, allowing generation:', quotaError);
    }

    const body = await req.json();
    console.log('📦 [GENERATE] Body received:', JSON.stringify(body, null, 2));
    
    const validated = generateSchema.parse(body);
    console.log('✅ [GENERATE] Validation OK');

    logInfo('Generating email', {
      type: validated.type,
      language: validated.language,
    });

    console.log('🤖 [GENERATE] Calling AI...');
    const result = await generateEmail(validated as EmailGenerationInput);
    console.log('✅ [GENERATE] AI response received:', {
      hasHtml: !!result.html,
      hasText: !!result.text,
      tokensUsed: result.tokensUsed
    });

    // Incrémenter l'utilisation - CRITIQUE
    try {
      console.log('📊 [GENERATE] Incrementing usage...');
      const { incrementUsage } = await import('@/lib/db');
      await incrementUsage(session.user.id, result.tokensUsed || 0);
      console.log('✅ [GENERATE] Usage incremented successfully');
    } catch (usageError) {
      console.error('❌ [GENERATE] CRITICAL: Error incrementing usage:', usageError);
      logError('Error incrementing usage', usageError);
      // NE PAS CONTINUER si l'incrémentation échoue pour éviter les abus
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erreur lors de l\'enregistrement de l\'utilisation. Veuillez réessayer.',
          error: 'USAGE_INCREMENT_FAILED'
        },
        { status: 500 }
      );
    }

    console.log('✅ [GENERATE] Success! Sending response');
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ [GENERATE] Error caught:', error);
    
    if (error instanceof z.ZodError) {
      console.error('❌ [GENERATE] Validation error:', error.errors);
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    logError('Error generating email', error);
    console.error('❌ [GENERATE] Stack:', error instanceof Error ? error.stack : 'No stack');

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Une erreur est survenue lors de la génération.',
      },
      { status: 500 }
    );
  }
}
