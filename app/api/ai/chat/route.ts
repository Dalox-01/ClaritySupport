import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import { logError, logInfo } from '@/lib/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { messages, currentEmail } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, message: 'Messages invalides' },
        { status: 400 }
      );
    }

    // Détecter si c'est une demande de modification (consomme du quota)
    const lastMessage = messages[messages.length - 1]?.content || '';
    const isModificationRequest = /modifi(é|er|e)|chang(é|er|e)|amélio(ré|rer|re)|reformul(é|er|e)|rends (plus|moins)|raccourci|allonge|simplifie/i.test(lastMessage);

    console.log('💬 [CHAT] Request type:', isModificationRequest ? 'MODIFICATION (consomme quota)' : 'QUESTION (gratuit)');

    // VÉRIFIER LE QUOTA AVANT si c'est une modification
    if (isModificationRequest) {
      try {
        console.log('📊 [CHAT] Checking quota...');
        const { getUserQuota } = await import('@/lib/db');
        const quota = await getUserQuota(session.user.id);
        
        console.log('📊 [CHAT] Quota status:', quota);

        if (quota.used >= quota.limit) {
          console.log('❌ [CHAT] Quota exceeded:', { used: quota.used, limit: quota.limit });
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
        console.error('⚠️ [CHAT] Could not check quota, allowing generation:', quotaError);
      }
    }

    logInfo('Chat request', { messageCount: messages.length });

    const systemPrompt = `Tu es MailWizard Assistant, un expert en rédaction d'emails professionnels.

L'utilisateur a généré cet email :
---
Objet: ${currentEmail?.subject || 'N/A'}

${currentEmail?.text || 'Aucun email généré'}
---

Ton rôle est d'aider l'utilisateur à AMÉLIORER et AFFINER cet email selon ses besoins.

RÈGLES IMPORTANTES :
- Réponds de manière concise et claire
- Propose des améliorations concrètes et actionnables
- Si l'utilisateur demande de modifier quelque chose, fournis la VERSION COMPLÈTE de l'email modifié
- Garde toujours un ton professionnel et courtois
- Si l'utilisateur demande juste un conseil, donne-le sans réécrire tout l'email
- Identifie les demandes de modification (commençant par "modifie", "change", "améliore", "rends plus", etc.)

FORMAT DE RÉPONSE :
- Pour une question/conseil : réponds directement
- Pour une modification : commence par "Voici l'email modifié :" puis fournis l'email complet avec OBLIGATOIREMENT :
  * Une ligne "Objet: [le sujet]"
  * Puis le corps de l'email complet

EXEMPLES :
User: "C'est trop long"
Assistant: "Voici l'email modifié :

Objet: Candidature pour le poste de Développeur

Bonjour,

[Version raccourcie de l'email]

Cordialement,
[Votre nom]"

User: "Rends-le plus cordial"
Assistant: "Voici l'email modifié :

Objet: [Sujet amélioré]

[Email complet reformulé avec ton cordial]"

User: "Que penses-tu du sujet ?"
Assistant: "Le sujet est clair et direct. Pour le rendre plus accrocheur, vous pourriez essayer..."

IMPORTANT : Quand tu modifies l'email, fournis TOUJOURS la structure complète avec "Objet:" suivi du corps.`;

    const completion = await openai.chat.completions.create({
      model: process.env.DEFAULT_AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Vérifier si la réponse contient effectivement un email modifié
    const responseContainsEmail = 
      response.includes('Voici l\'email modifié') || 
      response.includes('Objet:');

    const shouldConsumeQuota = isModificationRequest || responseContainsEmail;

    console.log('💬 [CHAT] Response analysis:', { 
      isModificationRequest, 
      responseContainsEmail, 
      shouldConsumeQuota 
    });

    // Incrémenter l'utilisation si c'est une génération/modification d'email
    if (shouldConsumeQuota) {
      try {
        console.log('📊 [CHAT] Incrementing usage for email generation...');
        const { incrementUsage } = await import('@/lib/db');
        await incrementUsage(session.user.id, tokensUsed);
        console.log('✅ [CHAT] Usage incremented successfully');
      } catch (usageError) {
        console.error('❌ [CHAT] CRITICAL: Error incrementing usage:', usageError);
        logError('Error incrementing usage', usageError);
        
        return NextResponse.json(
          { 
            success: false, 
            message: 'Erreur lors de l\'enregistrement de l\'utilisation. Veuillez réessayer.',
            error: 'USAGE_INCREMENT_FAILED'
          },
          { status: 500 }
        );
      }
    } else {
      console.log('✅ [CHAT] Simple question - no quota used');
    }

    return NextResponse.json({
      success: true,
      data: {
        message: response,
        tokensUsed,
        quotaConsumed: shouldConsumeQuota, // Indique si du quota a été consommé
      },
    });
  } catch (error: any) {
    logError('Chat error', error);

    // Gestion de l'erreur de quota OpenAI
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      return NextResponse.json({
        success: true,
        data: {
          message: "Je suis là pour vous aider à améliorer votre email ! Malheureusement, le quota OpenAI est temporairement dépassé. Essayez de modifier l'email manuellement avec le bouton 'Modifier' en attendant. 😊",
          tokensUsed: 0,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la discussion avec l\'IA',
      },
      { status: 500 }
    );
  }
}
