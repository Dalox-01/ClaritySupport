import { NextRequest, NextResponse } from 'next/server';
import { generateEmail, EmailGenerationInput } from '@/lib/ai';
import { logError, logInfo } from '@/lib/logger';
import { z } from 'zod';

const generateSchema = z.object({
  emailType: z.string(),
  tone: z.string(),
  style: z.string().optional(),
  language: z.string().optional(),
  context: z.string().min(10, 'Le contexte doit contenir au moins 10 caractères'),
});

// Route API spéciale pour l'extension Chrome (sans vérification de session stricte)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = generateSchema.parse(body);

    logInfo('Generating email from extension', {
      type: validated.emailType,
      language: validated.language || 'fr',
    });

    // Mapper les valeurs de l'extension vers le format attendu
    const input: EmailGenerationInput = {
      type: validated.emailType as any,
      tone: validated.tone as any,
      style: (validated.style || 'formel') as any,
      language: (validated.language || 'fr') as any,
      length: 'moyen',
      context: validated.context,
    };

    const result = await generateEmail(input);

    return NextResponse.json({
      success: true,
      subject: result.subject,
      html: result.html,
      text: result.text,
      tokensUsed: result.tokensUsed,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    logError('Error generating email from extension', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Une erreur est survenue lors de la génération.',
      },
      { status: 500 }
    );
  }
}
