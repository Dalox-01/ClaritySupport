// API Route: Envoyer une réponse email via Resend

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { canSendAutoReply } from '@/lib/plan-enforcement';

export const dynamic = 'force-dynamic';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'support@mailwizard.app';
const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || 'Clarity Support';

if (!RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY manquant - l\'envoi de réponses échouera.');
}

const resendClient = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

function ensureResendClient() {
  if (!resendClient) {
    throw new Error('Resend non configuré');
  }
  if (!RESEND_FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL manquant');
  }
  return resendClient;
}

function normalizeHtml(content: string): string {
  if (!content) return '<p>(Message vide)</p>';
  const containsTag = /<[^>]+>/.test(content);
  if (containsTag) return content;
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');
  return paragraphs || '<p>(Message vide)</p>';
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>(\s)*/gi, '\n')
    .replace(/<\/?p[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const { emailId, toEmail, subject, body, bodyHtml, bodyText } = await req.json();

    if (!emailId || !toEmail || !(body || bodyHtml)) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const limitCheck = await canSendAutoReply(userId);
    if (!limitCheck.allowed) {
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
        },
      }, { status: 403 });
    }

    const { data: originalEmail, error: emailError } = await supabase
      .from('emails_cache')
      .select('account_id, thread_id, external_message_id, subject')
      .eq('id', emailId)
      .single();

    if (emailError || !originalEmail) {
      console.error('❌ Erreur récupération email:', emailError);
      return NextResponse.json({ error: 'Email non trouvé' }, { status: 404 });
    }

    const { data: account, error: accountError } = await supabase
      .from('mail_accounts')
      .select('id, provider, email, support_email')
      .eq('id', originalEmail.account_id)
      .single();

    if (accountError || !account) {
      console.error('❌ Compte introuvable:', accountError);
      return NextResponse.json({ error: 'Compte non trouvé' }, { status: 404 });
    }

    if (account.provider !== 'resend') {
      return NextResponse.json({ error: 'Ce compte n\'utilise pas Resend' }, { status: 400 });
    }

    const resend = ensureResendClient();
    const htmlContent = normalizeHtml(bodyHtml || body || '');
    const textContent = bodyText || htmlToText(htmlContent);
    const replySubject = subject || `Re: ${originalEmail.subject || 'Votre message'}`;
    const replyTo = account.support_email || account.email;

    const headers: Record<string, string> = {};
    if (originalEmail.external_message_id) {
      headers['In-Reply-To'] = originalEmail.external_message_id;
      headers['References'] = originalEmail.external_message_id;
    }
    if (originalEmail.thread_id) {
      headers['X-Thread-Id'] = originalEmail.thread_id;
    }

    const sendResult = await resend.emails.send({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: toEmail,
      subject: replySubject,
      html: htmlContent,
      text: textContent,
      replyTo,
      headers,
      tags: [
        { name: 'mail_center', value: 'reply' },
        { name: 'account_id', value: account.id },
      ],
    });

    if (sendResult.error) {
      console.error('❌ Erreur Resend:', sendResult.error);
      return NextResponse.json({ error: 'Erreur envoi Resend' }, { status: 502 });
    }

    await supabase
      .from('emails_cache')
      .update({
        is_auto_replied: true,
        is_read: true,
        reply_status: 'sent',
        replied_at: new Date().toISOString(),
      })
      .eq('id', emailId);

    return NextResponse.json({ success: true, messageId: sendResult.data?.id || null });
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return NextResponse.json({
      error: 'Erreur envoi',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

