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
const AWS_WEBHOOK_SECRET = process.env.AWS_SES_WEBHOOK_SECRET || WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.warn('⚠️ RESEND_WEBHOOK_SECRET non configuré. Les webhooks seront rejetés.');
}

type NormalizedInboundEmail = {
  providerLabel: string;
  toAddress: string;
  fromEmail: string;
  fromName: string | null;
  subject: string;
  textBody: string;
  htmlBody: string;
  receivedAt: string;
  messageId: string;
  threadId: string | null;
  headers: Record<string, string>;
  hasAttachments: boolean;
};

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

type AwsProxyPayload = ResendInboundEvent & { provider?: string };

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

function isResendRequest(req: NextRequest) {
  return Boolean(req.headers.get('svix-id') && req.headers.get('svix-signature'));
}

function normalizeHeaders(headers?: Record<string, string> | Map<string, string>): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Map) {
    return Object.fromEntries(headers.entries());
  }
  return headers;
}

function buildNormalizedPayload(event: ResendInboundEvent, providerLabel: string): NormalizedInboundEmail | null {
  const data = event.data || {};
  const toAddress = extractAddress(data.to?.[0]).email;
  const from = extractAddress(data.from);

  if (!toAddress || !from.email) {
    console.warn('⚠️ [WEBHOOK] Aucune adresse de destination ou expéditeur', data);
    return null;
  }

  const messageId = data.headers?.['message-id'] || data.headers?.['Message-Id'] || event.id || data.id || randomUUID();
  const threadId = data.headers?.['in-reply-to'] || data.headers?.['In-Reply-To'] || null;
  const subject = data.subject || '(Sans objet)';
  const textBody = data.text || '';
  const htmlBody = data.html || textToSimpleHTML(textBody || '(Email)');
  const receivedAt = data.date || new Date().toISOString();
  const hasAttachments = Boolean(data.attachments?.length);
  const headers = normalizeHeaders(data.headers);

  return {
    providerLabel,
    toAddress,
    fromEmail: from.email,
    fromName: from.name,
    subject,
    textBody,
    htmlBody,
    receivedAt,
    messageId,
    threadId,
    headers,
    hasAttachments,
  };
}

async function persistInboundEmail(normalized: NormalizedInboundEmail) {
  const { toAddress } = normalized;

  const { data: account, error: accountError } = await supabase
    .from('mail_accounts')
    .select('id, user_id, routing_email, support_email')
    .eq('routing_email', toAddress)
    .maybeSingle();

  if (accountError) {
    console.error('❌ [WEBHOOK] Erreur recherche compte', accountError);
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
  }

  if (!account) {
    console.warn('⚠️ [WEBHOOK] Aucun compte lié à', toAddress);
    return NextResponse.json({ success: true });
  }

  const duplicateCheck = await supabase
    .from('emails_cache')
    .select('id')
    .eq('account_id', account.id)
    .eq('external_message_id', normalized.messageId)
    .maybeSingle();

  if (duplicateCheck.data) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  const quickAnalysis = classifyEmailByHashtags(normalized.subject, normalized.textBody || normalized.htmlBody);
  const snippet = normalized.textBody.substring(0, 180);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: inserted, error: insertError } = await supabase
    .from('emails_cache')
    .insert({
      user_id: account.user_id,
      account_id: account.id,
      external_message_id: normalized.messageId,
      thread_id: normalized.threadId,
      from_email: normalized.fromEmail,
      from_name: normalized.fromName,
      to_email: normalized.toAddress,
      subject: normalized.subject,
      snippet,
      body_text: normalized.textBody,
      body_html: normalized.htmlBody,
      received_at: normalized.receivedAt,
      category: quickAnalysis.category,
      sentiment: quickAnalysis.sentiment,
      urgency_score: quickAnalysis.urgency_score,
      requires_validation: quickAnalysis.requires_validation,
      detected_entities: quickAnalysis.detected_entities,
      support_category: quickAnalysis.support_category,
      detected_hashtags: quickAnalysis.detected_hashtags || [],
      has_attachments: normalized.hasAttachments,
      labels: ['inbox', normalized.providerLabel],
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
      last_inbound_at: normalized.receivedAt,
      last_verification_at: normalized.receivedAt,
      verification_status: 'connected',
      last_sync: new Date().toISOString(),
    })
    .eq('id', account.id);

  enrichEmail(inserted.id, normalized.fromEmail, normalized.subject, normalized.textBody || normalized.htmlBody).catch((error) =>
    console.error('❌ [WEBHOOK] Enrichment failure', error)
  );

  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook désactivé' }, { status: 503 });
  }

  const payload = await req.text();
  const resendRequest = isResendRequest(req);

  let event: ResendInboundEvent;
  let providerLabel = 'resend';

  if (resendRequest) {
    const headers = {
      'svix-id': req.headers.get('svix-id') ?? '',
      'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
      'svix-signature': req.headers.get('svix-signature') ?? '',
    };

    try {
      const wh = new Webhook(WEBHOOK_SECRET);
      event = wh.verify(payload, headers) as ResendInboundEvent;
    } catch (error) {
      console.error('❌ [WEBHOOK] Signature invalide', error);
      return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
    }
  } else {
    const providedSecret = req.nextUrl.searchParams.get('secret') ?? req.headers.get('x-internal-secret');
    if (!providedSecret || providedSecret !== AWS_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    try {
      const awsEvent = JSON.parse(payload) as AwsProxyPayload;
      event = awsEvent;
      providerLabel = awsEvent.provider || 'aws-ses';
    } catch (error) {
      console.error('❌ [WEBHOOK] Payload SES invalide', error);
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }
  }

  const normalized = buildNormalizedPayload(event, providerLabel);
  if (!normalized) {
    return NextResponse.json({ success: true });
  }

  return persistInboundEmail(normalized);
}
