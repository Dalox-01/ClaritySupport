// API Route: Synchronisation des emails

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
import { classifyEmailByHashtags } from '@/lib/mail-ai-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stream = searchParams.get('stream') === 'true';

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;

    // Mode streaming : envoyer les emails au fur et à mesure
    if (stream) {
      return handleStreamSync(userId);
    }

    // Récupérer les comptes actifs
    const { data: accounts, error: accountsError } = await supabase
      .from('mail_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('sync_enabled', true);

    if (accountsError || !accounts) {
      return NextResponse.json({ error: 'Erreur récupération comptes' }, { status: 500 });
    }

    if (accounts.length === 0) {
      return NextResponse.json({ emails: [], message: 'Aucun compte connecté' });
    }

    const allEmails = [];

    // Synchroniser chaque compte
    for (const account of accounts) {
      try {
        // Vérifier si le token a expiré
        const tokenExpiry = new Date(account.token_expires_at);
        let accessToken = decrypt(account.access_token_encrypted);

        if (tokenExpiry < new Date()) {
          console.log(`Token expired for ${account.email}, refreshing...`);
          
          // Rafraîchir le token
          const refreshToken = decrypt(account.refresh_token_encrypted);
          let newTokens;

          if (account.provider === 'gmail') {
            newTokens = await refreshGmailToken(refreshToken);
          } else {
            newTokens = await refreshOutlookToken(refreshToken);
          }

          // Mettre à jour en base
          const { encrypt } = await import('@/lib/security');
          await supabase
            .from('mail_accounts')
            .update({
              access_token_encrypted: encrypt(newTokens.access_token),
              token_expires_at: new Date(newTokens.expiry_date).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', account.id);

          accessToken = newTokens.access_token;
        }

        // Récupérer les emails
        let messages;
        if (account.provider === 'gmail') {
          const gmailMessages = await fetchGmailMessages(accessToken, 50);
          messages = gmailMessages.map(parseGmailMessage);
        } else {
          const outlookMessages = await fetchOutlookMessages(accessToken, 50);
          messages = outlookMessages.map(parseOutlookMessage);
        }

        // Traiter et insérer les emails
        for (const msg of messages) {
          // Vérifier si l'email existe déjà
          const { data: existing } = await supabase
            .from('emails_cache')
            .select('id')
            .eq('account_id', account.id)
            .eq('external_message_id', msg.id)
            .single();

          if (existing) continue; // Skip si déjà en cache

          // Classifier avec hashtags
          console.log(`Classifying email: ${msg.subject}`);
          const analysis = classifyEmailByHashtags(
            msg.subject || '',
            msg.body_text || msg.snippet || ''
          );

          // Insérer en base
          const { error: insertError } = await supabase
            .from('emails_cache')
            .insert({
              account_id: account.id,
              user_id: userId,
              external_message_id: msg.id,
              thread_id: msg.threadId,
              from_email: msg.from_email,
              from_name: msg.from_name,
              to_email: msg.to_email,
              subject: msg.subject,
              snippet: msg.snippet,
              body_text: msg.body_text,
              body_html: msg.body_html,
              received_at: msg.received_at,
              category: analysis.category,
              sentiment: analysis.sentiment,
              urgency_score: analysis.urgency_score,
              requires_validation: analysis.requires_validation,
              detected_entities: analysis.detected_entities,
              support_category: analysis.support_category,
              detected_hashtags: analysis.detected_hashtags || [],
              has_attachments: msg.has_attachments,
              labels: msg.labels,
            });

          if (insertError) {
            console.error('Error inserting email:', insertError);
          }
        }

        // Mettre à jour la date de dernière sync
        await supabase
          .from('mail_accounts')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('id', account.id);

        allEmails.push(...messages);
      } catch (error) {
        console.error(`Error syncing account ${account.email}:`, error);
        // Continue avec les autres comptes même si un échoue
      }
    }

    // Récupérer les emails depuis la base (avec cache)
    const { data: cachedEmails } = await supabase
      .from('emails_cache')
      .select('*')
      .eq('user_id', userId)
      .order('received_at', { ascending: false })
      .limit(50);

    return NextResponse.json({ 
      emails: cachedEmails || [],
      synced: allEmails.length,
      message: `${allEmails.length} nouveaux emails synchronisés`
    });
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la synchronisation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Fonction de streaming pour afficher les emails au fur et à mesure
async function handleStreamSync(userId: string) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Récupérer les comptes actifs
        const { data: accounts, error: accountsError } = await supabase
          .from('mail_accounts')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .eq('sync_enabled', true);

        if (accountsError || !accounts || accounts.length === 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Aucun compte actif' })}\n\n`));
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', count: accounts.length })}\n\n`));

        // Traiter chaque compte
        for (const account of accounts) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'account', email: account.email, provider: account.provider })}\n\n`));

            let messages: any[] = [];
            let accessToken = decrypt(account.access_token);

            // Récupérer les messages selon le provider
            if (account.provider === 'gmail') {
              // Vérifier/rafraîchir le token Gmail
              if (account.expires_at && new Date(account.expires_at) <= new Date()) {
                const refreshToken = decrypt(account.refresh_token);
                const newTokens = await refreshGmailToken(refreshToken);
                accessToken = newTokens.access_token;
              }

              messages = await fetchGmailMessages(accessToken, 50);
            } else if (account.provider === 'outlook') {
              // Vérifier/rafraîchir le token Outlook
              if (account.expires_at && new Date(account.expires_at) <= new Date()) {
                const refreshToken = decrypt(account.refresh_token);
                const newTokens = await refreshOutlookToken(refreshToken);
                accessToken = newTokens.access_token;
              }

              messages = await fetchOutlookMessages(accessToken, 50);
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'fetched', count: messages.length })}\n\n`));

            // Traiter chaque message individuellement
            for (let i = 0; i < messages.length; i++) {
              try {
                const rawMessage = messages[i];
                let parsed: any;

                // Parser selon le provider
                if (account.provider === 'gmail') {
                  parsed = parseGmailMessage(rawMessage);
                } else {
                  parsed = parseOutlookMessage(rawMessage);
                }

                // Vérifier si l'email existe déjà
                const { data: existing } = await supabase
                  .from('emails_cache')
                  .select('id')
                  .eq('external_message_id', parsed.id)
                  .eq('account_id', account.id)
                  .single();

                if (!existing) {
                  // Classifier avec hashtags
                  const analysis = classifyEmailByHashtags(
                    parsed.subject || '',
                    parsed.body_text || parsed.snippet || ''
                  );

                  // Sauvegarder dans la base
                  const { data: savedEmail } = await supabase
                    .from('emails_cache')
                    .insert({
                      user_id: userId,
                      account_id: account.id,
                      external_message_id: parsed.id,
                      thread_id: parsed.threadId,
                      from_email: parsed.from_email,
                      from_name: parsed.from_name,
                      to_email: parsed.to_email,
                      subject: parsed.subject,
                      body_text: parsed.body_text,
                      body_html: parsed.body_html,
                      received_at: parsed.received_at,
                      has_attachments: parsed.has_attachments,
                      is_read: parsed.is_read,
                      category: analysis.category,
                      sentiment: analysis.sentiment,
                      urgency_score: analysis.urgency_score,
                      requires_validation: analysis.requires_validation,
                      detected_entities: analysis.detected_entities,
                      support_category: analysis.support_category,
                      detected_hashtags: analysis.detected_hashtags || []
                    })
                    .select()
                    .single();

                  // Envoyer l'email analysé au client
                  if (savedEmail) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      type: 'email', 
                      email: savedEmail,
                      progress: `${i + 1}/${messages.length}`
                    })}\n\n`));
                  }
                } else {
                  // Email déjà existant, on l'envoie quand même pour l'afficher
                  const { data: existingEmail } = await supabase
                    .from('emails_cache')
                    .select('*')
                    .eq('id', existing.id)
                    .single();

                  if (existingEmail) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      type: 'email', 
                      email: existingEmail,
                      progress: `${i + 1}/${messages.length}`,
                      cached: true
                    })}\n\n`));
                  }
                }

                // Petite pause pour éviter de surcharger
                await new Promise(resolve => setTimeout(resolve, 100));
              } catch (emailError) {
                console.error('Error processing email:', emailError);
                // Continue avec le prochain email
              }
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'account-complete', email: account.email })}\n\n`));

            // Mettre à jour last_sync_at
            await supabase
              .from('mail_accounts')
              .update({ last_sync_at: new Date().toISOString() })
              .eq('id', account.id);

          } catch (accountError) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: `Erreur pour ${account.email}` })}\n\n`));
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`));
        controller.close();
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Erreur de synchronisation' })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
