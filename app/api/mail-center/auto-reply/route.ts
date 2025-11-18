import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { generateReplyWithAI } from '@/lib/mail-ai-helpers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * API de réponse automatique par IA
 * - Vérifie si l'IA est active
 * - Pour chaque nouveau email (non urgent)
 * - Génère une réponse avec l'IA
 * - Envoie automatiquement la réponse
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    console.log(`🤖 [AUTO-REPLY] Démarrage pour user ${userId}`);

    // 1. Vérifier si l'IA est active
    const { data: aiSettings } = await supabase
      .from('ai_settings')
      .select('enabled')
      .eq('user_id', userId)
      .single();

    if (!aiSettings || !aiSettings.enabled) {
      console.log('⚠️ [AUTO-REPLY] IA désactivée, aucune action');
      return NextResponse.json({
        message: 'IA inactive, aucune réponse automatique',
        processed: 0
      });
    }

    console.log(`✅ [AUTO-REPLY] IA activée`);

    // Charger la configuration IA de l'utilisateur (créativité, ton, style, etc.)
    const { data: userData } = await supabase
      .from('users')
      .select('ai_prompt_config, knowledge_base')
      .eq('id', userId)
      .single();

    const aiConfig = userData?.ai_prompt_config || null;
    console.log(`🎨 [AUTO-REPLY] Config IA:`, {
      hasConfig: !!aiConfig,
      creativity: aiConfig?.creativity,
      tone: aiConfig?.tone,
      style: aiConfig?.style
    });

    // 2. Récupérer les emails non traités (sans réponse automatique)
    const { data: emails, error: emailsError } = await supabase
      .from('emails_cache')
      .select('*')
      .eq('user_id', userId)
      .or('is_auto_replied.is.null,is_auto_replied.eq.false')
      .order('received_at', { ascending: false })
      .limit(10); // Traiter maximum 10 emails à la fois

    if (emailsError || !emails || emails.length === 0) {
      return NextResponse.json({
        message: 'Aucun email à traiter',
        processed: 0
      });
    }

    let processed = 0;
    let errors: string[] = [];

    // 3. Pour chaque email, générer et envoyer une réponse
    for (const email of emails) {
      try {
        // SÉCURITÉ: Ne JAMAIS envoyer de réponse automatique pour "urgent" et "autre"
        // L'IA ne doit répondre QU'aux emails de support client classiques
        if (email.category === 'urgent' || email.category === 'autre') {
          console.log(`⚠️ Email ${email.id} ignoré - Catégorie ${email.category} nécessite validation manuelle`);
          
          // Marquer comme nécessitant validation
          await supabase
            .from('emails_cache')
            .update({
              requires_validation: true,
              reply_status: 'pending',
            })
            .eq('id', email.id);
          
          continue;
        }

        // De même pour les support_category
        if (email.support_category === 'urgent' || email.support_category === 'autre') {
          console.log(`⚠️ Email ${email.id} ignoré - Support catégorie ${email.support_category} nécessite validation manuelle`);
          
          await supabase
            .from('emails_cache')
            .update({
              requires_validation: true,
              reply_status: 'pending',
            })
            .eq('id', email.id);
          
          continue;
        }

        console.log(`📧 [AUTO-REPLY] Traitement email ${email.id}: ${email.subject}`);

        // 🔍 CHARGER BASE DE CONNAISSANCES
        let knowledgeBaseContext: string | undefined;
        if (userData?.knowledge_base) {
          try {
            const { KnowledgeBaseManager } = await import('@/lib/product-knowledge');
            const kbManager = new KnowledgeBaseManager(userData.knowledge_base);
            knowledgeBaseContext = kbManager.generateContextForAI();
          } catch (error) {
            console.warn('⚠️ Erreur chargement KB:', error);
          }
        }

        // 🛒 CONTEXTE SHOPIFY POUR EMAILS DE COMMANDE/LIVRAISON
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
          console.warn('Shopify context fetch failed in auto-reply, continuing without it', e);
        }

        // Générer la réponse avec l'IA + configuration utilisateur + base de connaissances + Shopify
        const aiReplyResult = await generateReplyWithAI({
          email: {
            id: email.id,
            external_message_id: email.external_message_id,
            thread_id: email.thread_id,
            from_email: email.from_email,
            from_name: email.from_name,
            to_email: email.to_email,
            subject: email.subject,
            body_html: email.body_html,
            body_text: email.body_text,
            received_at: email.received_at,
            has_attachments: email.has_attachments,
            labels: email.labels,
            is_read: email.is_read,
            category: email.category,
            support_category: email.support_category,
            detected_hashtags: email.detected_hashtags,
            account_id: email.account_id,
            user_id: email.user_id,
            snippet: email.snippet,
            sentiment: email.sentiment,
            urgency_score: email.urgency_score,
            requires_validation: email.requires_validation,
            detected_entities: email.detected_entities,
            is_auto_replied: email.is_auto_replied,
            is_archived: email.is_archived,
            reply_status: email.reply_status,
            replied_at: email.replied_at,
            created_at: email.created_at,
            expires_at: email.expires_at,
            deleted_at: email.deleted_at,
          },
          tone: aiConfig?.tone || 'professionnel',
          language: aiConfig?.language || 'fr',
          user_context: {
            company_name: aiConfig?.companyName || session.user.name || 'Notre équipe',
            signature: aiConfig?.signature || '',
          },
          aiConfig: aiConfig || undefined, // Passer la config complète (créativité, do/don't lists, etc.)
          knowledgeBaseContext, // 📚 BASE DE CONNAISSANCES
          shopifyContext, // 🛒 CONTEXTE SHOPIFY
        });

        if (!aiReplyResult || !aiReplyResult.body_text) {
          const errorMsg = `Échec génération réponse pour ${email.id}`;
          console.error(`❌ [AUTO-REPLY] ${errorMsg}`);
          errors.push(errorMsg);
          continue;
        }

        console.log(`✅ [AUTO-REPLY] Réponse générée pour ${email.id}: "${aiReplyResult.subject}"`);

        // Envoyer la réponse via l'API Gmail
        const sendResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/mail-center/send-reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailId: email.id,
            to: email.from_email,
            subject: aiReplyResult.subject || `Re: ${email.subject}`,
            body: aiReplyResult.body_html || aiReplyResult.body_text,
            threadId: email.thread_id,
            inReplyTo: email.external_message_id,
          }),
        });

        if (!sendResponse.ok) {
          errors.push(`Échec envoi réponse pour ${email.id}`);
          continue;
        }

        // Marquer l'email comme ayant reçu une réponse automatique
        await supabase
          .from('emails_cache')
          .update({
            is_auto_replied: true,
            replied_at: new Date().toISOString(),
            reply_status: 'sent'
          })
          .eq('id', email.id);

        processed++;

      } catch (emailError) {
        console.error(`Erreur traitement email ${email.id}:`, emailError);
        errors.push(`Erreur ${email.id}: ${emailError}`);
      }
    }

    return NextResponse.json({
      message: `${processed} réponse(s) automatique(s) envoyée(s)`,
      processed,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Erreur auto-reply:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error },
      { status: 500 }
    );
  }
}
