// API Route: Traitement automatique des réponses
// Cette route est appelée automatiquement après la synchronisation des emails

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { decrypt } from '@/lib/security';
import { 
  generateReplyWithAI, 
  shouldRequireValidation,
  extractEmailVariables,
  replaceTemplateVariables
} from '@/lib/mail-ai-helpers';
import { sendGmailReply } from '@/lib/gmail-helpers';
import { sendOutlookReply } from '@/lib/outlook-helpers';
import { canSendAutoReply } from '@/lib/plan-enforcement';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { emailId } = await req.json();
    const userId = session.user.id;

    // 🔒 VÉRIFICATION DES LIMITES : Peut-on envoyer une réponse automatique ?
    const autoReplyLimitCheck = await canSendAutoReply(userId);
    
    if (!autoReplyLimitCheck.allowed) {
      console.log(`🚫 Limite réponses auto atteinte pour user ${userId}: ${autoReplyLimitCheck.reason}`);
      
      return NextResponse.json({
        error: 'Limite atteinte',
        reason: autoReplyLimitCheck.reason,
        currentUsage: autoReplyLimitCheck.currentUsage,
        limit: autoReplyLimitCheck.limit,
        suggestedPlans: autoReplyLimitCheck.suggestedPlans,
        requiresUpgrade: autoReplyLimitCheck.requiresUpgrade,
        skipped: true,
        limitReached: {
          feature: 'Réponses automatiques',
          current: autoReplyLimitCheck.currentUsage || 0,
          max: autoReplyLimitCheck.limit || 0,
        }
      }, { status: 403 });
    }

    // Récupérer l'email
    const { data: email, error: emailError } = await supabase
      .from('emails_cache')
      .select('*, account:mail_accounts(*)')
      .eq('id', emailId)
      .eq('user_id', userId)
      .single();

    if (emailError || !email) {
      return NextResponse.json({ error: 'Email introuvable' }, { status: 404 });
    }

    // Si déjà répondu, skip
    if (email.is_auto_replied || email.reply_status === 'sent') {
      return NextResponse.json({ 
        message: 'Email déjà traité',
        skipped: true 
      });
    }

    // Récupérer la configuration IA de l'utilisateur
    const { data: aiConfig } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Déterminer si on doit traiter cet email
    const categoryConfig = aiConfig?.config?.[email.category];
    
    if (!categoryConfig?.enabled) {
      console.log(`Category ${email.category} not enabled for auto-reply`);
      return NextResponse.json({ 
        message: 'Catégorie désactivée',
        skipped: true 
      });
    }

    // Ignorer les spams
    if (email.category === 'spam') {
      return NextResponse.json({ 
        message: 'Spam ignoré',
        skipped: true 
      });
    }

    // SÉCURITÉ: Ne JAMAIS envoyer de réponse automatique pour "urgent" et "autre"
    // L'IA ne doit répondre QU'aux emails de support client classiques
    if (email.category === 'urgent' || email.category === 'autre') {
      console.log(`⚠️ Auto-reply BLOCKED for category: ${email.category} - Requires manual handling`);
      
      // Marquer comme nécessitant une validation manuelle
      await supabase
        .from('emails_cache')
        .update({
          requires_validation: true,
          reply_status: 'pending',
        })
        .eq('id', email.id);

      return NextResponse.json({ 
        message: `Catégorie ${email.category} - Validation manuelle obligatoire`,
        skipped: true,
        reason: 'auto_reply_disabled_for_category'
      });
    }

    // De même pour les support_category "urgent" et "autre"
    if (email.support_category === 'urgent' || email.support_category === 'autre') {
      console.log(`⚠️ Auto-reply BLOCKED for support_category: ${email.support_category} - Requires manual handling`);
      
      await supabase
        .from('emails_cache')
        .update({
          requires_validation: true,
          reply_status: 'pending',
        })
        .eq('id', email.id);

      return NextResponse.json({ 
        message: `Support catégorie ${email.support_category} - Validation manuelle obligatoire`,
        skipped: true,
        reason: 'auto_reply_disabled_for_support_category'
      });
    }

    // Vérifier si validation requise
    const requiresValidation = shouldRequireValidation({
      category: email.category,
      sentiment: email.sentiment,
      urgency_score: email.urgency_score,
      requires_validation: email.requires_validation,
      detected_entities: email.detected_entities,
    }, {
      require_validation_if_urgent: categoryConfig.requireValidation,
      mode: categoryConfig.autoReply ? 'auto' : 'validation',
    });

    // Générer la réponse avec l'IA
    const variables = extractEmailVariables(email);
    const template = categoryConfig.responseTemplate 
      ? replaceTemplateVariables(categoryConfig.responseTemplate, variables)
      : undefined;

    const generatedReply = await generateReplyWithAI({
      email,
      template_body: template,
      custom_prompt: categoryConfig.customPrompt,
      user_context: {
        company_name: session.user.name || 'Notre équipe',
        signature: '---\nCordialement,\n' + (session.user.name || 'L\'équipe'),
      },
      tone: categoryConfig.tone,
      language: 'fr',
    });

    // Sauvegarder la réponse générée
    const { data: pendingReply, error: pendingError } = await supabase
      .from('pending_replies')
      .insert({
        email_id: email.id,
        user_id: userId,
        rule_id: null, // TODO: lier avec une règle si applicable
        template_id: null,
        generated_subject: generatedReply.subject,
        generated_body_text: generatedReply.body_text,
        generated_body_html: generatedReply.body_html,
        ai_prompt_used: categoryConfig.customPrompt,
        ai_model_used: generatedReply.model_used,
        status: requiresValidation ? 'pending' : 'approved',
        reason_for_validation: requiresValidation 
          ? `Email ${email.category} avec urgence ${email.urgency_score}/10`
          : null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
      })
      .select()
      .single();

    if (pendingError) {
      console.error('Error saving pending reply:', pendingError);
      return NextResponse.json({ error: 'Erreur sauvegarde réponse' }, { status: 500 });
    }

    // Si pas de validation requise ET mode auto activé, envoyer immédiatement
    if (!requiresValidation && categoryConfig.autoReply) {
      try {
        // Attendre le délai configuré
        if (categoryConfig.delayMinutes > 0) {
          await new Promise(resolve => setTimeout(resolve, categoryConfig.delayMinutes * 60 * 1000));
        }

        // Envoyer la réponse
        const accessToken = decrypt(email.account.access_token);
        
        if (email.account.provider === 'gmail') {
          await sendGmailReply(
            accessToken,
            email.from_email,
            generatedReply.subject,
            generatedReply.body_html,
            email.thread_id
          );
        } else {
          await sendOutlookReply(
            accessToken,
            email.from_email,
            generatedReply.subject,
            generatedReply.body_html,
            email.external_message_id
          );
        }

        // Mettre à jour les statuts
        await supabase
          .from('pending_replies')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', pendingReply.id);

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
            rule_id: null,
            action_type: 'auto_reply_sent',
            action_result: 'success',
            metadata: {
              category: email.category,
              urgency: email.urgency_score,
              tokens_used: generatedReply.tokens_used,
            },
            tokens_used: generatedReply.tokens_used,
            processing_time_ms: null,
          });

        // ✅ Tracker l'usage : email traité + réponse automatique envoyée
        try {
          await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/subscription/usage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': req.headers.get('cookie') || ''
            },
            body: JSON.stringify({
              action: 'email_processed',
              metadata: {
                email_id: emailId,
                category: email.category,
              }
            })
          });

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
                pending_reply_id: pendingReply.id,
              }
            })
          });

          console.log(`📊 Usage tracké: email_processed + auto_reply_sent`);
        } catch (usageError) {
          console.error('⚠️ Erreur tracking usage:', usageError);
        }

        console.log(`✅ Auto-reply sent for email ${email.id}`);

        return NextResponse.json({
          success: true,
          auto_sent: true,
          reply: generatedReply,
          message: 'Réponse automatique envoyée',
        });
      } catch (sendError) {
        console.error('Error sending auto-reply:', sendError);
        
        // Marquer comme erreur mais garder en pending pour validation manuelle
        await supabase
          .from('pending_replies')
          .update({
            status: 'pending',
            reason_for_validation: 'Erreur envoi automatique - validation manuelle requise',
          })
          .eq('id', pendingReply.id);

        return NextResponse.json({
          success: false,
          error: 'Erreur envoi automatique',
          reply_saved_for_validation: true,
        }, { status: 500 });
      }
    } else {
      // Réponse en attente de validation
      await supabase
        .from('emails_cache')
        .update({
          requires_validation: true,
          reply_status: 'pending',
        })
        .eq('id', email.id);

      console.log(`⏳ Reply generated and awaiting validation for email ${email.id}`);

      return NextResponse.json({
        success: true,
        auto_sent: false,
        awaiting_validation: true,
        reply: generatedReply,
        message: 'Réponse générée, validation requise',
      });
    }
  } catch (error) {
    console.error('Error in process-auto-reply:', error);
    return NextResponse.json({ 
      error: 'Erreur traitement automatique',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

