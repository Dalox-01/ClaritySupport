// API Route: Vérification des nouveaux emails (polling automatique)

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
import { analyzeEmailWithAI } from '@/lib/mail-ai-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const newEmails: any[] = [];

    // Récupérer les comptes actifs
    const { data: accounts, error: accountsError } = await supabase
      .from('mail_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('sync_enabled', true);

    if (accountsError || !accounts || accounts.length === 0) {
      return NextResponse.json({ newEmails: [], count: 0 });
    }

    // Récupérer le dernier email en cache pour chaque compte
    for (const account of accounts) {
      try {
        // Récupérer la date de la dernière vérification OU la date du dernier email
        const lastCheckDate = account.last_sync_at 
          ? new Date(account.last_sync_at)
          : new Date(Date.now() - 24 * 60 * 60 * 1000); // Par défaut: dernières 24h

        let accessToken = decrypt(account.access_token);
        let messages: any[] = [];

        // Récupérer les messages selon le provider
        if (account.provider === 'gmail') {
          // Vérifier/rafraîchir le token Gmail
          if (account.expires_at && new Date(account.expires_at) <= new Date()) {
            const refreshToken = decrypt(account.refresh_token);
            const newTokens = await refreshGmailToken(refreshToken);
            accessToken = newTokens.access_token;
          }

          // Récupérer les 50 derniers messages pour être sûr de ne rien manquer
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

        // Traiter chaque message
        for (const rawMessage of messages) {
          try {
            let parsed: any;

            // Parser selon le provider
            if (account.provider === 'gmail') {
              parsed = parseGmailMessage(rawMessage);
            } else {
              parsed = parseOutlookMessage(rawMessage);
            }

            // Vérifier si l'email existe déjà dans la base
            const { data: existing } = await supabase
              .from('emails_cache')
              .select('id')
              .eq('message_id', parsed.message_id)
              .eq('account_id', account.id)
              .single();

            if (!existing) {
              // Nouvel email jamais vu
              // Analyser avec l'IA
              const analysis = await analyzeEmailWithAI(
                parsed.subject || '',
                parsed.body_text || parsed.body_html || '',
                parsed.from_email
              );

              // Sauvegarder dans la base
              const { data: savedEmail } = await supabase
                .from('emails_cache')
                .insert({
                  user_id: userId,
                  account_id: account.id,
                  message_id: parsed.message_id,
                  thread_id: parsed.thread_id,
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
                  ai_summary: analysis.reasoning || '',
                  ai_action_required: analysis.requires_validation || false
                })
                .select()
                .single();

              if (savedEmail) {
                newEmails.push(savedEmail);
                console.log(`✅ Nouvel email détecté et sauvegardé: ${savedEmail.subject}`);
              }
            } else {
              // Email existe déjà dans la base
              // Vérifier s'il est récent (reçu après la dernière vérification)
              const emailDate = new Date(parsed.received_at);
              if (emailDate > lastCheckDate) {
                // Email récent mais déjà en base, le renvoyer quand même pour l'afficher
                const { data: existingEmail } = await supabase
                  .from('emails_cache')
                  .select('*')
                  .eq('id', existing.id)
                  .single();
                
                if (existingEmail) {
                  newEmails.push(existingEmail);
                  console.log(`📬 Email récent trouvé en cache: ${existingEmail.subject}`);
                }
              }
            }
          } catch (emailError) {
            console.error('Error processing email:', emailError);
            // Continue avec le prochain email
          }
        }

        // Mettre à jour last_sync_at
        await supabase
          .from('mail_accounts')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('id', account.id);

      } catch (accountError) {
        console.error(`Error checking account ${account.email}:`, accountError);
        // Continue avec les autres comptes
      }
    }

    // Trier les nouveaux emails par date (plus récent en premier)
    newEmails.sort((a, b) => 
      new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );

    return NextResponse.json({ 
      newEmails,
      count: newEmails.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking new emails:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

