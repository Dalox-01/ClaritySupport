// API Route: Validation et envoi d'une réponse en attente

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { decrypt } from '@/lib/security';
import { sendGmailReply } from '@/lib/gmail-helpers';
import { sendOutlookReply } from '@/lib/outlook-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { replyId, action, editedSubject, editedBody } = await req.json();
    const userId = session.user.id;

    // Récupérer la réponse en attente
    const { data: pendingReply, error: replyError } = await supabase
      .from('pending_replies')
      .select('*, email:emails_cache(*, account:mail_accounts(*))')
      .eq('id', replyId)
      .eq('user_id', userId)
      .single();

    if (replyError || !pendingReply) {
      return NextResponse.json({ error: 'Réponse introuvable' }, { status: 404 });
    }

    // Action: approve (envoyer) ou reject (rejeter)
    if (action === 'reject') {
      await supabase
        .from('pending_replies')
        .update({
          status: 'rejected',
          validated_at: new Date().toISOString(),
        })
        .eq('id', replyId);

      await supabase
        .from('emails_cache')
        .update({
          reply_status: 'rejected',
        })
        .eq('id', pendingReply.email_id);

      return NextResponse.json({
        success: true,
        message: 'Réponse rejetée',
      });
    }

    if (action === 'approve') {
      // Utiliser le contenu édité ou original
      const finalSubject = editedSubject || pendingReply.generated_subject;
      const finalBody = editedBody || pendingReply.generated_body_html;

      try {
        const email = pendingReply.email;
        const account = email.account;
        const accessToken = decrypt(account.access_token);

        // Envoyer via le bon provider
        if (account.provider === 'gmail') {
          await sendGmailReply(
            accessToken,
            email.from_email,
            finalSubject,
            finalBody,
            email.thread_id
          );
        } else {
          await sendOutlookReply(
            accessToken,
            email.from_email,
            finalSubject,
            finalBody,
            email.external_message_id
          );
        }

        // Mettre à jour les statuts
        await supabase
          .from('pending_replies')
          .update({
            status: 'sent',
            validated_at: new Date().toISOString(),
            sent_at: new Date().toISOString(),
            edited_subject: editedSubject ? finalSubject : null,
            edited_body_html: editedBody ? finalBody : null,
          })
          .eq('id', replyId);

        await supabase
          .from('emails_cache')
          .update({
            is_auto_replied: true,
            reply_status: 'sent',
            is_read: true,
          })
          .eq('id', email.id);

        // Log l'activité
        await supabase
          .from('mail_ai_activity_logs')
          .insert({
            user_id: userId,
            email_id: email.id,
            rule_id: pendingReply.rule_id,
            action_type: 'validated_reply_sent',
            action_result: 'success',
            metadata: {
              was_edited: !!editedSubject || !!editedBody,
              category: email.category,
            },
            tokens_used: 0,
            processing_time_ms: null,
          });

        console.log(`✅ Validated reply sent for email ${email.id}`);

        return NextResponse.json({
          success: true,
          message: 'Réponse envoyée avec succès',
        });
      } catch (sendError) {
        console.error('Error sending validated reply:', sendError);
        return NextResponse.json({ 
          error: 'Erreur lors de l\'envoi',
          details: sendError instanceof Error ? sendError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  } catch (error) {
    console.error('Error in validate-reply:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

