// API Route: Callback Gmail OAuth

import { NextRequest, NextResponse } from 'next/server';
import { exchangeGmailCode } from '@/lib/gmail-helpers';
import { supabase } from '@/lib/db';
import { encrypt } from '@/lib/security';
import { canAddEmailAccount } from '@/lib/subscription-limits';

export async function GET(req: NextRequest) {
  console.log('🔵 [GMAIL CALLBACK] Début du callback OAuth Gmail');
  
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId
    const error = searchParams.get('error');

    console.log('📋 [GMAIL CALLBACK] Paramètres reçus:', { 
      hasCode: !!code, 
      hasState: !!state, 
      error: error,
      state: state 
    });

    if (error) {
      console.error('❌ [GMAIL CALLBACK] Erreur OAuth:', error);
      return NextResponse.redirect(
        new URL(`/mail-center?error=${error}`, req.url)
      );
    }

    if (!code || !state) {
      console.error('❌ [GMAIL CALLBACK] Paramètres manquants:', { code: !!code, state: !!state });
      return NextResponse.redirect(
        new URL('/mail-center?error=missing_params', req.url)
      );
    }

    console.log('📧 [GMAIL CALLBACK] User ID:', state);

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

    console.log('✅ [GMAIL CALLBACK] Limite vérifiée, échange du code...');

    // Échanger le code contre des tokens
    const tokens = await exchangeGmailCode(code);
    console.log('✅ [GMAIL CALLBACK] Tokens reçus, expiration:', new Date(tokens.expiry_date).toISOString());

    // Récupérer l'email Gmail de l'utilisateur
    const gmailResponse = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/profile',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );
    const gmailProfile = await gmailResponse.json();
    console.log('✅ [GMAIL CALLBACK] Profil Gmail récupéré:', gmailProfile.emailAddress);

    // Chiffrer les tokens
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = encrypt(tokens.refresh_token);
    console.log('✅ [GMAIL CALLBACK] Tokens chiffrés');

    // Sauvegarder dans la base de données
    console.log('💾 [GMAIL CALLBACK] Tentative d\'enregistrement dans mail_accounts...', {
      user_id: state,
      provider: 'gmail',
      email: gmailProfile.emailAddress,
      is_active: true,
    });

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
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ [GMAIL CALLBACK] Error saving Gmail account:', dbError);
      console.error('❌ [GMAIL CALLBACK] Error details:', JSON.stringify(dbError, null, 2));
      return NextResponse.redirect(
        new URL('/mail-center?error=save_failed&details=' + encodeURIComponent(dbError.message), req.url)
      );
    }

    console.log('✅ [GMAIL CALLBACK] Gmail account saved:', gmailProfile.emailAddress, 'Account ID:', savedAccount.id);

    // Déclencher la synchronisation initiale des emails
    console.log('🔄 [GMAIL CALLBACK] Début de la synchronisation initiale des emails...');
    
    try {
      // Importer les fonctions nécessaires
      const { fetchGmailMessages, parseGmailMessage } = await import('@/lib/gmail-helpers');
      const { analyzeEmailWithAI } = await import('@/lib/mail-ai-helpers');

      console.log('📥 [GMAIL CALLBACK] Récupération des 50 derniers emails...');

      // Récupérer les 50 derniers emails
      const gmailMessages = await fetchGmailMessages(tokens.access_token, 50);
      console.log(`✅ [GMAIL CALLBACK] ${gmailMessages.length} emails récupérés de Gmail`);

      let processedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      // Traiter et insérer les emails
      for (const gmailMsg of gmailMessages) {
        try {
          const msg = parseGmailMessage(gmailMsg as any);

          // Vérifier si l'email existe déjà
          const { data: existing } = await supabase
            .from('emails_cache')
            .select('id')
            .eq('external_message_id', msg.id)
            .eq('account_id', savedAccount.id)
            .single();

          if (existing) {
            skippedCount++;
            continue; // Skip si déjà en cache
          }

          console.log(`📧 [GMAIL CALLBACK] Traitement email: ${msg.subject || '(sans objet)'}`);

          // Analyser avec IA
          const analysis = await analyzeEmailWithAI(
            msg.from_email,
            msg.subject || '',
            msg.body_text || msg.snippet || ''
          );

          console.log(`🤖 [GMAIL CALLBACK] IA analyse terminée - Catégorie: ${analysis.category}, Sentiment: ${analysis.sentiment}`);

          // Insérer en base
          const { error: insertError } = await supabase.from('emails_cache').insert({
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

          if (insertError) {
            console.error(`❌ [GMAIL CALLBACK] Erreur insertion email:`, insertError);
            errorCount++;
          } else {
            processedCount++;
          }
        } catch (emailError) {
          console.error(`❌ [GMAIL CALLBACK] Erreur traitement email individuel:`, emailError);
          errorCount++;
        }
      }

      console.log(`📊 [GMAIL CALLBACK] Synchronisation terminée - Traités: ${processedCount}, Ignorés: ${skippedCount}, Erreurs: ${errorCount}`);

      // Mettre à jour la date de dernière sync
      await supabase
        .from('mail_accounts')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', savedAccount.id);

      console.log(`✅ [GMAIL CALLBACK] Synchronisation complète - ${processedCount} emails ajoutés`);
    } catch (syncError) {
      console.error('❌ [GMAIL CALLBACK] Erreur pendant la synchronisation initiale:', syncError);
      console.error('❌ [GMAIL CALLBACK] Stack trace:', syncError instanceof Error ? syncError.stack : syncError);
      // Ne pas bloquer la connexion si la sync échoue
      // L'utilisateur pourra cliquer sur le bouton refresh
    }

    // Rediriger vers Mail Center avec succès
    console.log('🎉 [GMAIL CALLBACK] Redirection vers Mail Center avec succès');
    return NextResponse.redirect(
      new URL('/mail-center?success=gmail_connected', req.url)
    );
  } catch (error) {
    console.error('❌ [GMAIL CALLBACK] Erreur générale:', error);
    console.error('❌ [GMAIL CALLBACK] Stack:', error instanceof Error ? error.stack : error);
    return NextResponse.redirect(
      new URL('/mail-center?error=server_error', req.url)
    );
  }
}
