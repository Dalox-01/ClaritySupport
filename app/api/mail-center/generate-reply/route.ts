// API Route: Générer une réponse automatique avec l'IA

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateReplyWithAI } from '@/lib/mail-ai-helpers';
import { supabase } from '@/lib/db';
import { canSendAutoReply } from '@/lib/subscription-limits';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { emailId } = await req.json();

    if (!emailId) {
      return NextResponse.json({ error: 'Email ID manquant' }, { status: 400 });
    }

    // 🔒 VÉRIFICATION DES LIMITES : Peut-on générer une réponse automatique ?
    const limitCheck = await canSendAutoReply(session.user.id);
    
    if (!limitCheck.allowed) {
      console.log(`🚫 Limite atteinte pour user ${session.user.id}: ${limitCheck.reason}`);
      
      return NextResponse.json({
        error: 'Limite atteinte',
        reason: limitCheck.reason,
        currentUsage: limitCheck.currentUsage,
        limit: limitCheck.limit,
        upgradePlans: limitCheck.upgradePlans,
        limitReached: {
          feature: 'Réponses automatiques',
          current: limitCheck.currentUsage || 0,
          max: limitCheck.limit || 0,
        }
      }, { status: 403 });
    }

    // Récupérer l'email complet de la base
    const { data: email, error: emailError } = await supabase
      .from('emails_cache')
      .select('*')
      .eq('id', emailId)
      .single();

    if (emailError || !email) {
      return NextResponse.json({ error: 'Email non trouvé' }, { status: 404 });
    }

    console.log(`🤖 Génération réponse pour: ${email.subject}`);

    // Générer la réponse avec l'IA
    const reply = await generateReplyWithAI({
      email,
      tone: 'professionnel',
      language: 'fr',
    });

    console.log(`✅ Réponse générée: ${reply.subject}`);

    // ✅ Incrémenter le compteur d'usage (réponse automatique générée)
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/subscription/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          action: 'auto_reply_sent',
          metadata: {
            email_id: emailId,
            subject: email.subject,
          }
        })
      });
      console.log(`📊 Usage tracké: auto_reply_sent`);
    } catch (usageError) {
      console.error('⚠️ Erreur tracking usage:', usageError);
      // Ne pas bloquer la génération si le tracking échoue
    }

    // Incrémenter le compteur Mail Center (ancien système - à garder pour compatibilité)
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mail-center/quota`, {
        method: 'POST',
        headers: {
          'Cookie': req.headers.get('cookie') || ''
        }
      });
    } catch (quotaError) {
      console.error('⚠️ Erreur incrémentation quota:', quotaError);
    }

    return NextResponse.json({
      subject: reply.subject,
      body: reply.body_text,
      emailId,
    });

  } catch (error) {
    console.error('❌ Erreur génération réponse:', error);
    return NextResponse.json({ 
      error: 'Erreur génération',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

