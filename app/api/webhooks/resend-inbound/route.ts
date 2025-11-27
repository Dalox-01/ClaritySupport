import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { supabase } from '@/lib/db';
import {
  analyzeEmailWithAI,
  classifyEmailByHashtags,
  shouldRequireValidation,
  textToSimpleHTML,
} from '@/lib/mail-ai-helpers';

export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.RESEND_INBOUND_WEBHOOK_SECRET || process.env.RESEND_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.warn('⚠️ RESEND_WEBHOOK_SECRET non configuré. Les webhooks seront rejetés.');
}

type ResendAddress = { email?: string; address?: string; name?: string } | string;

type ResendInboundEvent = {
  type?: string;
  data?: {
    id?: string;
    to?: ResendAddress[];
    from?: ResendAddress;
    subject?: string;
    text?: string;
    html?: string;
    headers?: Record<string, string>;
    date?: string;
    attachments?: Array<{ filename?: string }>;
    tags?: Record<string, string>;
  };
  id?: string;
};

function extractAddress(entry?: ResendAddress | null): { email: string | null; name: string | null } {
  if (!entry) return { email: null, name: null };
  if (typeof entry === 'string') {
    return { email: entry.toLowerCase(), name: null };
  }
  return {
    email: (entry.email || entry.address || '').toLowerCase() || null,
    name: entry.name || null,
  };
}

async function enrichEmail(emailId: string, fromEmail: string, subject: string, body: string) {
  try {
    const analysis = await analyzeEmailWithAI(fromEmail, subject, body);
    await supabase
      .from('emails_cache')
      .update({
        category: analysis.category,
        sentiment: analysis.sentiment,
        urgency_score: analysis.urgency_score,
        requires_validation: shouldRequireValidation(analysis),
        detected_entities: analysis.detected_entities || {},
        support_category: analysis.support_category || null,
      })
      .eq('id', emailId);
  } catch (error) {
    console.error('❌ [WEBHOOK] AI enrichment failed', error);
  }
}

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook désactivé' }, { status: 503 });
  }

  const payload = await req.text();
  const headers = {
    'svix-id': req.headers.get('svix-id') ?? '',
    'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
    'svix-signature': req.headers.get('svix-signature') ?? '',
  };

  let event: ResendInboundEvent;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(payload, headers) as ResendInboundEvent;
  } catch (error) {
    console.error('❌ [WEBHOOK] Signature invalide', error);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  const data = event.data || {};
  const toAddress = extractAddress(data.to?.[0]).email;
  const from = extractAddress(data.from);

  if (!toAddress) {
    console.warn('⚠️ [WEBHOOK] Aucune adresse de destination', data);
    return NextResponse.json({ success: true });
  }

  const { data: account, error: accountError } = await supabase
    .from('mail_accounts')
    .select('id, user_id, routing_email, support_email')
    .eq('routing_email', toAddress)
    .eq('provider', 'resend')
    .maybeSingle();

  if (accountError) {
    console.error('❌ [WEBHOOK] Erreur recherche compte', accountError);
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
  }

  if (!account) {
    console.warn('⚠️ [WEBHOOK] Aucun compte lié à', toAddress);
    return NextResponse.json({ success: true });
  }

  const messageId = data.headers?.['message-id'] || data.headers?.['Message-Id'] || event.id || data.id || randomUUID();
  const threadId = data.headers?.['in-reply-to'] || data.headers?.['In-Reply-To'] || null;
  const subject = data.subject || '(Sans objet)';
  const textBody = data.text || '';
  const htmlBody = data.html || textToSimpleHTML(textBody || '(Email)');
  const snippet = textBody.substring(0, 180);
  const receivedAt = data.date || new Date().toISOString();
  const hasAttachments = Boolean(data.attachments?.length);

  const duplicateCheck = await supabase
    .from('emails_cache')
    .select('id')
    .eq('account_id', account.id)
    .eq('external_message_id', messageId)
    .maybeSingle();

  if (duplicateCheck.data) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  const quickAnalysis = classifyEmailByHashtags(subject, textBody || htmlBody);

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: inserted, error: insertError } = await supabase
    .from('emails_cache')
    .insert({
      user_id: account.user_id,
      account_id: account.id,
      external_message_id: messageId,
      thread_id: threadId,
      from_email: from.email || 'inconnu@client.com',
      from_name: from.name,
      to_email: toAddress,
      subject,
      snippet,
      body_text: textBody,
      body_html: htmlBody,
      received_at: receivedAt,
      category: quickAnalysis.category,
      sentiment: quickAnalysis.sentiment,
      urgency_score: quickAnalysis.urgency_score,
      requires_validation: quickAnalysis.requires_validation,
      detected_entities: quickAnalysis.detected_entities,
      support_category: quickAnalysis.support_category,
      detected_hashtags: quickAnalysis.detected_hashtags || [],
      has_attachments: hasAttachments,
      labels: ['inbox', 'resend'],
      is_read: false,
      is_auto_replied: false,
      is_archived: false,
      reply_status: 'pending',
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ [WEBHOOK] Erreur insertion email', insertError);
    return NextResponse.json({ error: 'Erreur insertion' }, { status: 500 });
  }

  await supabase
    .from('mail_accounts')
    .update({
      last_inbound_at: receivedAt,
      last_verification_at: receivedAt,
      verification_status: 'connected',
      last_sync: new Date().toISOString(),
    })
    .eq('id', account.id);

  enrichEmail(inserted.id, from.email || 'client@unknown.com', subject, textBody || htmlBody).catch((error) =>
    console.error('❌ [WEBHOOK] Enrichment failure', error)
  );

  return NextResponse.json({ success: true });
}
