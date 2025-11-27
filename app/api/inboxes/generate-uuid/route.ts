import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomUUID } from 'crypto';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

const INBOUND_DOMAIN = process.env.MAIL_INBOUND_DOMAIN || 'inbox.claritysupport.app';

function buildRoutingEmail(): string {
  return `${randomUUID().replace(/-/g, '')}@${INBOUND_DOMAIN}`;
}

function normalizeEmail(value?: string | null): string | undefined {
  if (!value) return undefined;
  return value.trim().toLowerCase();
}

function mapAccountPayload(account: any) {
  return {
    id: account.id,
    routingEmail: account.routing_email,
    supportEmail: account.support_email || account.email,
    status: account.verification_status || 'pending',
    lastInboundAt: account.last_inbound_at,
    verificationCode: account.verification_code,
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const supportEmail = normalizeEmail(body?.supportEmail);

    const { data: existing, error: fetchError } = await supabase
      .from('mail_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'resend')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ [INBOX] Error fetching account', fetchError);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }

    const now = new Date().toISOString();
    const verificationCode = Math.random().toString(36).slice(2, 8).toUpperCase();

    if (existing) {
      const updatePayload: Record<string, any> = {
        updated_at: now,
      };

      if (!existing.routing_email) {
        updatePayload.routing_email = buildRoutingEmail();
      }

      if (supportEmail) {
        updatePayload.email = supportEmail;
        updatePayload.support_email = supportEmail;
      }

      if (!existing.verification_code) {
        updatePayload.verification_code = verificationCode;
      }

      if (existing.verification_status === 'connected' && !existing.last_inbound_at) {
        updatePayload.verification_status = 'pending';
      }

      const { data: updated, error: updateError } = await supabase
        .from('mail_accounts')
        .update(updatePayload)
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [INBOX] Error updating account', updateError);
        return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
      }

      return NextResponse.json({ success: true, inbox: mapAccountPayload(updated) });
    }

    const routingEmail = buildRoutingEmail();

    const insertPayload = {
      user_id: userId,
      provider: 'resend' as const,
      email: supportEmail || routingEmail,
      support_email: supportEmail || null,
      routing_email: routingEmail,
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      is_active: true,
      last_sync: null,
      verification_status: 'pending',
      verification_code: verificationCode,
      resend_config: {
        onboarding_started_at: now,
      },
    };

    const { data: created, error: insertError } = await supabase
      .from('mail_accounts')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      console.error('❌ [INBOX] Error creating account', insertError);
      return NextResponse.json({ error: 'Erreur création' }, { status: 500 });
    }

    return NextResponse.json({ success: true, inbox: mapAccountPayload(created) });
  } catch (error) {
    console.error('❌ [INBOX] Unexpected error', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
