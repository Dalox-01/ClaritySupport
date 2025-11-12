// API Route: Callback Gmail OAuth

import { NextRequest, NextResponse } from 'next/server';
import { exchangeGmailCode } from '@/lib/gmail-helpers';
import { supabase } from '@/lib/db';
import { encrypt } from '@/lib/security';
import { canAddEmailAccount } from '@/lib/subscription-limits';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/mail-center?error=${error}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/mail-center?error=missing_params', req.url)
      );
    }

    // 🔒 VÉRIFICATION DES LIMITES : Peut-on ajouter un compte email ?
    const limitCheck = await canAddEmailAccount(state);
    
    if (!limitCheck.allowed) {
      console.log(`🚫 Limite comptes email atteinte pour user ${state}: ${limitCheck.reason}`);
      
      return NextResponse.redirect(
        new URL(
          `/mail-center?error=limit_reached&reason=${encodeURIComponent(limitCheck.reason || '')}&current=${limitCheck.currentUsage}&limit=${limitCheck.limit}`, 
          req.url
        )
      );
    }

    // Échanger le code contre des tokens
    const tokens = await exchangeGmailCode(code);

    // Récupérer l'email Gmail de l'utilisateur
    const gmailResponse = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/profile',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );
    const gmailProfile = await gmailResponse.json();

    // Chiffrer les tokens
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = encrypt(tokens.refresh_token);

    // Sauvegarder dans la base de données
    const { data: savedAccount, error: dbError } = await supabase
      .from('mail_accounts')
      .upsert({
        user_id: state,
        provider: 'gmail',
        email: gmailProfile.emailAddress,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: new Date(tokens.expiry_date).toISOString(),
        is_active: true,
      }, {
        onConflict: 'user_id,email',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving Gmail account:', dbError);
      return NextResponse.redirect(
        new URL('/mail-center?error=save_failed&details=' + encodeURIComponent(dbError.message), req.url)
      );
    }

    console.log('✅ Gmail account saved:', gmailProfile.emailAddress);

    // Déclencher la synchronisation initiale des emails
    try {
      // Importer les fonctions nécessaires
      const { fetchGmailMessages, parseGmailMessage } = await import('@/lib/gmail-helpers');
      const { analyzeEmailWithAI } = await import('@/lib/mail-ai-helpers');

      console.log('🔄 Starting initial email sync...');

      // Récupérer les 50 derniers emails
      const gmailMessages = await fetchGmailMessages(tokens.access_token, 50);
      console.log(`📧 Fetched ${gmailMessages.length} emails from Gmail`);

      // Traiter et insérer les emails
      for (const gmailMsg of gmailMessages) {
        const msg = parseGmailMessage(gmailMsg as any);

        // Vérifier si l'email existe déjà
        const { data: existing } = await supabase
          .from('emails_cache')
          .select('id')
          .eq('external_message_id', msg.id)
          .eq('account_id', savedAccount.id)
          .single();

        if (existing) continue; // Skip si déjà en cache

        // Analyser avec IA
        const analysis = await analyzeEmailWithAI(
          msg.from_email,
          msg.subject || '',
          msg.body_text || msg.snippet || ''
        );

        // Insérer en base
        await supabase.from('emails_cache').insert({
          user_id: state,
          account_id: savedAccount.id,
          external_message_id: msg.id,
          thread_id: msg.threadId,
          from_email: msg.from_email,
          from_name: msg.from_name,
          to_email: msg.to_email || gmailProfile.emailAddress,
          subject: msg.subject,
          snippet: msg.snippet,
          body_text: msg.body_text,
          body_html: msg.body_html,
          received_at: msg.received_at,
          category: analysis.category,
          sentiment: analysis.sentiment,
          urgency_score: analysis.urgency_score || 0,
          requires_validation: analysis.requires_validation || false,
          has_attachments: msg.has_attachments || false,
          is_read: false,
          is_auto_replied: false,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      // Mettre à jour la date de dernière sync
      await supabase
        .from('mail_accounts')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', savedAccount.id);

      console.log(`✅ Successfully synced ${gmailMessages.length} emails`);
    } catch (syncError) {
      console.error('⚠️ Error during initial sync:', syncError);
      // Ne pas bloquer la connexion si la sync échoue
      // L'utilisateur pourra cliquer sur le bouton refresh
    }

    // Rediriger vers Mail Center avec succès
    return NextResponse.redirect(
      new URL('/mail-center?success=gmail_connected', req.url)
    );
  } catch (error) {
    console.error('Error in Gmail callback:', error);
    return NextResponse.redirect(
      new URL('/mail-center?error=server_error', req.url)
    );
  }
}
