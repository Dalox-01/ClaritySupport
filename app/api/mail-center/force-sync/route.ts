// API Route: Forcer la synchronisation avec logs détaillés

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { decrypt } from '@/lib/security';
import { fetchGmailMessages, parseGmailMessage } from '@/lib/gmail-helpers';
import { analyzeEmailWithAI } from '@/lib/mail-ai-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const logs: string[] = [];
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié', logs }, { status: 401 });
    }

    const userId = session.user.id;
    logs.push(`✅ User ID: ${userId}`);

    // 1. Vérifier les comptes
    const { data: accounts, error: accountsError } = await supabase
      .from('mail_accounts')
      .select('*')
      .eq('user_id', userId);

    if (accountsError) {
      logs.push(`❌ Erreur récupération comptes: ${accountsError.message}`);
      return NextResponse.json({ error: 'Erreur comptes', logs, accountsError }, { status: 500 });
    }

    logs.push(`📧 Comptes trouvés: ${accounts?.length || 0}`);
    
    if (!accounts || accounts.length === 0) {
      logs.push(`❌ AUCUN COMPTE GMAIL CONNECTÉ !`);
      return NextResponse.json({ error: 'Pas de compte', logs }, { status: 404 });
    }

    const account = accounts[0];
    logs.push(`✅ Compte: ${account.email} (${account.provider})`);

    // 2. Décrypter le token
    let accessToken;
    try {
      accessToken = decrypt(account.access_token);
      logs.push(`✅ Token décrypté`);
    } catch (decryptError: any) {
      logs.push(`❌ Erreur décryptage token: ${decryptError.message}`);
      return NextResponse.json({ error: 'Erreur token', logs, decryptError }, { status: 500 });
    }

    // 3. Appeler Gmail API
    let messages;
    try {
      messages = await fetchGmailMessages(accessToken, 10); // Juste 10 pour tester
      logs.push(`✅ Gmail API OK: ${messages.length} messages récupérés`);
    } catch (gmailError: any) {
      logs.push(`❌ Erreur Gmail API: ${gmailError.message}`);
      return NextResponse.json({ error: 'Erreur Gmail', logs, gmailError: gmailError.message }, { status: 500 });
    }

    if (messages.length === 0) {
      logs.push(`⚠️ AUCUN MESSAGE dans Gmail !`);
      return NextResponse.json({ logs, messages: [] });
    }

    // 4. Parser et sauvegarder chaque message
    const savedEmails = [];
    
    for (let i = 0; i < Math.min(messages.length, 5); i++) {
      const msg = messages[i];
      logs.push(`\n📧 Email ${i + 1}/${messages.length}`);
      
      try {
        // Parser (msg est déjà le message complet !)
        const parsed = parseGmailMessage(msg as any);
        logs.push(`  ✅ Parsé: "${parsed.subject || '(sans objet)'}"`);
        logs.push(`     De: ${parsed.from_email}`);
        logs.push(`     Date: ${parsed.received_at}`);

        // Vérifier si existe déjà
        const { data: existing } = await supabase
          .from('emails_cache')
          .select('id')
          .eq('external_message_id', parsed.id)
          .eq('account_id', account.id)
          .single();

        if (existing) {
          logs.push(`  ⏭️  Déjà en base`);
          continue;
        }

        // Analyser avec IA
        const analysis = await analyzeEmailWithAI(
          parsed.subject || '',
          parsed.body_text || '',
          parsed.from_email
        );
        logs.push(`  ✅ Analysé: ${analysis.category} / ${analysis.sentiment}`);

        // Sauvegarder
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

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
            category: analysis.category,
            sentiment: analysis.sentiment,
            urgency_score: analysis.urgency_score || 0,
            requires_validation: false,
            has_attachments: parsed.has_attachments || false,
            is_read: false,
            is_auto_replied: false,
            expires_at: expiresAt.toISOString()
          })
          .select()
          .single();

        if (saveError) {
          logs.push(`  ❌ Erreur sauvegarde: ${saveError.message}`);
          logs.push(`  Détails: ${JSON.stringify(saveError)}`);
        } else {
          logs.push(`  ✅ SAUVEGARDÉ en base`);
          savedEmails.push(savedEmail);
        }

      } catch (emailError: any) {
        logs.push(`  ❌ Erreur email: ${emailError.message}`);
      }
    }

    logs.push(`\n🎉 TERMINÉ: ${savedEmails.length} emails sauvegardés`);

    return NextResponse.json({ 
      success: true,
      logs,
      savedEmails: savedEmails.length,
      totalMessages: messages.length
    });

  } catch (error: any) {
    logs.push(`❌ ERREUR GÉNÉRALE: ${error.message}`);
    console.error('Force sync error:', error);
    return NextResponse.json({ 
      error: error.message,
      logs,
      stack: error.stack
    }, { status: 500 });
  }
}

