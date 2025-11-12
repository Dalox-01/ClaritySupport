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

    // 1. Vérifier si l'IA est active
    const { data: aiSettings } = await supabase
      .from('ai_settings')
      .select('enabled, auto_reply_urgent')
      .eq('user_id', userId)
      .single();

    if (!aiSettings || !aiSettings.enabled) {
      return NextResponse.json({
        message: 'IA inactive, aucune réponse automatique',
        processed: 0
      });
    }

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

        // Générer la réponse avec l'IA
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
          },
          tone: 'professionnel',
          language: 'fr',
        });

        if (!aiReplyResult || !aiReplyResult.body_text) {
          errors.push(`Échec génération réponse pour ${email.id}`);
          continue;
        }

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
