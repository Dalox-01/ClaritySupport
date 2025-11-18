// API Route: Générer une réponse automatique avec l'IA

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateReplyWithAI } from '@/lib/mail-ai-helpers';
import { supabase } from '@/lib/db';
import { canSendAutoReply } from '@/lib/plan-enforcement';

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
        suggestedPlans: limitCheck.suggestedPlans,
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

    // CHARGER LA CONFIGURATION IA DE L'UTILISATEUR
    const { data: userData } = await supabase
      .from('users')
      .select('ai_prompt_config, knowledge_base')
      .eq('id', session.user.id)
      .single();

    const aiConfig = userData?.ai_prompt_config || null;
    const knowledgeBase = userData?.knowledge_base || null;

    console.log(`🎨 Config IA chargée:`, {
      hasConfig: !!aiConfig,
      creativity: aiConfig?.creativity,
      tone: aiConfig?.tone,
      style: aiConfig?.style,
      hasKnowledgeBase: !!knowledgeBase
    });

    // 🔍 GÉNÉRER CONTEXTE BASE DE CONNAISSANCES (si disponible)
    let knowledgeBaseContext: string | undefined;
    if (knowledgeBase) {
      try {
        const { KnowledgeBaseManager } = await import('@/lib/product-knowledge');
        const kbManager = new KnowledgeBaseManager(knowledgeBase);
        knowledgeBaseContext = kbManager.generateContextForAI({
          includeProducts: true,
          includeCompanyInfo: true,
          includeFAQ: true,
          includeBusinessRules: true,
        });
        console.log(`📚 Base de connaissances chargée: ${knowledgeBaseContext.length} caractères`);
      } catch (error) {
        console.warn('⚠️ Erreur chargement base de connaissances:', error);
      }
    }

    // 🛒 TENTER DE RÉCUPÉRER LE CONTEXTE SHOPIFY POUR LES EMAILS DE COMMANDE/LIVRAISON
    let shopifyContext: any | undefined;
    try {
      const isOrderEmail = /commande|colis|livraison|suivi|tracking|retard/i.test(
        `${email.subject} ${email.body_text || ''}`
      );

      if (isOrderEmail && email.from_email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const shopifyRes = await fetch(`${baseUrl}/api/shopify/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: req.headers.get('cookie') || '',
          },
          body: JSON.stringify({
            customerEmail: email.from_email,
            emailSubject: email.subject,
            emailBody: email.body_text || email.snippet || '',
          }),
        });

        if (shopifyRes.ok) {
          const data = await shopifyRes.json();
          if (data.found && data.order) {
            shopifyContext = {
              type: 'shopify_order_context',
              order: data.order,
              instructions: 'Utilise ces informations de commande pour répondre avec précision sur le statut, la date d\'expédition et le suivi. Si rien ne correspond exactement, reste transparent et propose de vérifier manuellement.',
            };
          }
        }
      }
    } catch (e) {
      console.warn('Shopify context fetch failed, continuing without it', e);
    }

    // Générer la réponse avec l'IA + config utilisateur + base de connaissances + contexte Shopify
    const reply = await generateReplyWithAI({
      email,
      tone: aiConfig?.tone || 'professionnel',
      language: aiConfig?.language || 'fr',
      user_context: {
        company_name: aiConfig?.companyName || '',
        signature: aiConfig?.signature || '',
      },
      aiConfig: aiConfig || undefined, // Config complète (créativité, do/don't lists, etc.)
      knowledgeBaseContext, // 📚 BASE DE CONNAISSANCES
      shopifyContext, // 🛒 CONTEXTE SHOPIFY
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

