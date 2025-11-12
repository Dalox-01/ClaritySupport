// API Route: Synchronisation automatique en arrière-plan
// Récupère les nouveaux emails depuis Gmail/Outlook, les analyse avec l'IA et les sauvegarde

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { decrypt } from '@/lib/security';
import { 
  fetchGmailMessages, 
  parseGmailMessage, 
  refreshGmailToken 
} from '@/lib/gmail-helpers';
import {
  fetchOutlookMessages,
  parseOutlookMessage,
  refreshOutlookToken
} from '@/lib/outlook-helpers';
import { classifyEmailByHashtags, shouldRequireValidation } from '@/lib/mail-ai-helpers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 secondes max

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    let totalNewEmails = 0;
    const newEmails: any[] = [];

    console.log(`🔄 [AUTO-SYNC] Démarrage pour user ${userId}`);

    // Récupérer tous les comptes actifs
    const { data: accounts, error: accountsError } = await supabase
      .from('mail_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (accountsError || !accounts || accounts.length === 0) {
      console.log('❌ [AUTO-SYNC] Aucun compte actif');
      return NextResponse.json({ 
        success: false,
        newEmails: 0,
        message: 'Aucun compte actif'
      });
    }

    console.log(`📧 [AUTO-SYNC] ${accounts.length} compte(s) à synchroniser`);

    // Synchroniser chaque compte
    for (const account of accounts) {
      try {
        console.log(`🔍 [AUTO-SYNC] Traitement de ${account.email} (${account.provider})`);

        let accessToken = decrypt(account.access_token);
        let messages: any[] = [];

        // Récupérer les messages selon le provider
        if (account.provider === 'gmail') {
          // Vérifier/rafraîchir le token Gmail
          if (account.token_expires_at && new Date(account.token_expires_at) <= new Date()) {
            console.log('🔑 [AUTO-SYNC] Rafraîchissement du token Gmail');
            const refreshToken = decrypt(account.refresh_token);
            const newTokens = await refreshGmailToken(refreshToken);
            accessToken = newTokens.access_token;
          }

          // Récupérer les 20 derniers messages de Gmail
          messages = await fetchGmailMessages(accessToken, 20);
          console.log(`📥 [AUTO-SYNC] ${messages.length} messages récupérés de Gmail`);

        } else if (account.provider === 'outlook') {
          // Vérifier/rafraîchir le token Outlook
          if (account.expires_at && new Date(account.expires_at) <= new Date()) {
            console.log('🔑 [AUTO-SYNC] Rafraîchissement du token Outlook');
            const refreshToken = decrypt(account.refresh_token);
            const newTokens = await refreshOutlookToken(refreshToken);
            accessToken = newTokens.access_token;
          }

          messages = await fetchOutlookMessages(accessToken, 20);
          console.log(`📥 [AUTO-SYNC] ${messages.length} messages récupérés d'Outlook`);
        }

        // Traiter chaque message
        let accountNewCount = 0;
        for (const rawMessage of messages) {
          try {
            let parsed: any;

            // Parser selon le provider
            if (account.provider === 'gmail') {
              // rawMessage est déjà le message complet
              parsed = parseGmailMessage(rawMessage as any);
            } else {
              parsed = parseOutlookMessage(rawMessage);
            }

            // Vérifier si l'email existe déjà en base
            const { data: existing, error: checkError } = await supabase
              .from('emails_cache')
              .select('id')
              .eq('external_message_id', parsed.id)
              .eq('account_id', account.id)
              .single();

            if (checkError && checkError.code !== 'PGRST116') {
              // Erreur autre que "not found"
              console.error(`❌ [AUTO-SYNC] Erreur vérification doublon:`, checkError);
            }

            if (existing) {
              // Email déjà en base, passer au suivant
              console.log(`⏭️  [AUTO-SYNC] Email déjà en base: "${parsed.subject}"`);
              continue;
            }
            
            console.log(`🆕 [AUTO-SYNC] NOUVEL EMAIL trouvé: "${parsed.subject || '(sans objet)'}"`);
            console.log(`   📧 De: ${parsed.from_email}`);
            console.log(`   📅 Date: ${parsed.received_at}`);

            // NOUVEL EMAIL - Classifier avec hashtags (instantané, pas d'IA)
            console.log(`🏷️  [AUTO-SYNC] Classification par hashtags: "${parsed.subject || '(sans objet)'}"`);
            const analysis = classifyEmailByHashtags(
              parsed.subject || '',
              parsed.body_text || parsed.snippet || ''
            );

            // Sauvegarder dans la base
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // Expiration dans 30 jours
            
            const { data: savedEmail, error: saveError } = await supabase
              .from('emails_cache')
              .insert({
                user_id: userId,
                account_id: account.id,
                external_message_id: parsed.id,
                thread_id: parsed.threadId,
                from_email: parsed.from_email,
                from_name: parsed.from_name,
                to_email: parsed.to_email || account.email,
                subject: parsed.subject,
                snippet: parsed.subject?.substring(0, 200),
                body_text: parsed.body_text,
                body_html: parsed.body_html,
                received_at: parsed.received_at,
                has_attachments: parsed.has_attachments || false,
                is_read: parsed.is_read || false,
                category: analysis.category,
                sentiment: analysis.sentiment,
                urgency_score: analysis.urgency_score,
                requires_validation: shouldRequireValidation ? shouldRequireValidation(analysis) : false,
                support_category: analysis.support_category,
                detected_hashtags: analysis.detected_hashtags || [],
                expires_at: expiresAt.toISOString()
              })
              .select()
              .single();

            if (saveError) {
              console.error(`❌ [AUTO-SYNC] Erreur sauvegarde:`, saveError);
              continue;
            }

            if (savedEmail) {
              accountNewCount++;
              newEmails.push(savedEmail);
              console.log(`✅ [AUTO-SYNC] Email sauvegardé: "${savedEmail.subject}" (${analysis.support_category || analysis.category})`);
              console.log(`   🏷️  Hashtags détectés: ${analysis.detected_hashtags?.join(', ') || 'aucun'}`);
            }

          } catch (emailError) {
            console.error('❌ [AUTO-SYNC] Erreur traitement email:', emailError);
            continue;
          }
        }

        // Mettre à jour last_sync
        await supabase
          .from('mail_accounts')
          .update({ last_sync: new Date().toISOString() })
          .eq('id', account.id);

        totalNewEmails += accountNewCount;
        console.log(`✅ [AUTO-SYNC] ${account.email}: ${accountNewCount} nouveaux emails`);

      } catch (accountError) {
        console.error(`❌ [AUTO-SYNC] Erreur compte ${account.email}:`, accountError);
        continue;
      }
    }

    console.log(`🎉 [AUTO-SYNC] Terminé: ${totalNewEmails} nouveaux emails au total`);

    // Déclencher les réponses automatiques si l'IA est active
    if (totalNewEmails > 0) {
      console.log(`🤖 [AUTO-SYNC] Déclenchement des réponses automatiques...`);
      
      // Appel asynchrone à l'API auto-reply (ne pas attendre la réponse)
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/mail-center/auto-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('cookie') || '', // Transférer les cookies pour la session
        },
      }).catch(err => {
        console.error('❌ [AUTO-SYNC] Erreur auto-reply:', err);
      });
    }

    return NextResponse.json({ 
      success: true,
      newEmails: totalNewEmails,
      emails: newEmails,
      message: `${totalNewEmails} nouveaux emails synchronisés`
    });

  } catch (error) {
    console.error('❌ [AUTO-SYNC] Erreur générale:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erreur synchronisation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

