// API Route: Envoyer une réponse email

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { decrypt, encrypt } from '@/lib/security';
import { sendGmailReply, refreshGmailToken } from '@/lib/gmail-helpers';
import { canSendAutoReply } from '@/lib/plan-enforcement';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const { emailId, toEmail, subject, body } = await req.json();

    if (!toEmail || !body) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // 🔒 VÉRIFICATION DES LIMITES : Peut-on envoyer une réponse ?
    const limitCheck = await canSendAutoReply(userId);
    
    if (!limitCheck.allowed) {
      console.log(`🚫 Limite réponses atteinte pour user ${userId}: ${limitCheck.reason}`);
      
      return NextResponse.json({
        error: 'Limite atteinte',
        reason: limitCheck.reason,
        currentUsage: limitCheck.currentUsage,
        limit: limitCheck.limit,
        suggestedPlans: limitCheck.suggestedPlans,
        requiresUpgrade: limitCheck.requiresUpgrade,
        limitReached: {
          feature: 'Réponses email',
          current: limitCheck.currentUsage || 0,
          max: limitCheck.limit || 0,
        }
      }, { status: 403 });
    }

    console.log(`📧 Envoi réponse à: ${toEmail}`);
    console.log(`📧 Email ID: ${emailId}`);

    // Récupérer l'email original pour connaître le compte
    const { data: originalEmail, error: emailError } = await supabase
      .from('emails_cache')
      .select('account_id, thread_id, external_message_id')
      .eq('id', emailId)
      .single();

    if (emailError || !originalEmail) {
      console.error('❌ Erreur récupération email:', emailError);
      return NextResponse.json({ error: 'Email non trouvé', details: emailError?.message }, { status: 404 });
    }

    console.log(`✅ Email trouvé, account_id: ${originalEmail.account_id}`);

    // Récupérer le compte email
    const { data: account, error: accountError } = await supabase
      .from('mail_accounts')
      .select('*')
      .eq('id', originalEmail.account_id)
      .single();

    if (accountError || !account) {
      console.error('❌ Erreur récupération compte:', accountError);
      return NextResponse.json({ error: 'Compte non trouvé', details: accountError?.message }, { status: 404 });
    }

    console.log(`✅ Compte trouvé: ${account.email}, provider: ${account.provider}`);

    // Décrypter et vérifier/rafraîchir le token
    let accessToken: string;
    try {
      accessToken = decrypt(account.access_token);
      console.log('✅ Token décrypté');
      
      // Vérifier si le token est expiré
      if (account.expires_at && new Date(account.expires_at) <= new Date()) {
        console.log('🔑 Token expiré, rafraîchissement en cours...');
        
        // Décrypter le refresh_token
        const refreshToken = decrypt(account.refresh_token);
        
        // Obtenir un nouveau access_token
        const newTokens = await refreshGmailToken(refreshToken);
        accessToken = newTokens.access_token;
        
        // Sauvegarder le nouveau token en base
        await supabase
          .from('mail_accounts')
          .update({
            access_token: encrypt(newTokens.access_token),
            expires_at: new Date(newTokens.expiry_date).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', account.id);
        
        console.log('✅ Token rafraîchi et sauvegardé');
      } else {
        console.log('✅ Token encore valide');
      }
    } catch (decryptError) {
      console.error('❌ Erreur décryptage/refresh token:', decryptError);
      return NextResponse.json({ 
        error: 'Erreur gestion token', 
        details: decryptError instanceof Error ? decryptError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Envoyer via Gmail
    if (account.provider === 'gmail') {
      try {
        console.log(`📧 Envoi via Gmail API...`);
        
        // Convertir le body en HTML si ce n'est pas déjà fait
        const bodyHtml = body.includes('<') ? body : `<p>${body.replace(/\n/g, '<br>')}</p>`;
        
        await sendGmailReply(
          accessToken,
          toEmail,
          subject,
          bodyHtml,
          originalEmail.thread_id
        );
        console.log('✅ Email envoyé via Gmail API');
      } catch (gmailError) {
        console.error('❌ Erreur Gmail API:', gmailError);
        return NextResponse.json({ 
          error: 'Erreur envoi Gmail', 
          details: gmailError instanceof Error ? gmailError.message : 'Unknown error'
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Provider non supporté' }, { status: 400 });
    }

    // Mettre à jour l'email comme "répondu"
    await supabase
      .from('emails_cache')
      .update({ 
        is_auto_replied: true,
        is_read: true,
        replied_at: new Date().toISOString()
      })
      .eq('id', emailId);

    console.log(`✅ Email envoyé à: ${toEmail}`);

    return NextResponse.json({ 
      success: true,
      message: 'Email envoyé'
    });

  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return NextResponse.json({ 
      error: 'Erreur envoi',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

