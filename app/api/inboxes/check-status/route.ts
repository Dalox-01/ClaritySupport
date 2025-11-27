import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

function mapAccountPayload(account: any) {
  return {
    id: account.id,
    routingEmail: account.routing_email,
    supportEmail: account.support_email || account.email,
    status: account.verification_status || 'pending',
    lastInboundAt: account.last_inbound_at,
    lastVerificationAt: account.last_verification_at,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const { data: account, error } = await supabase
      .from('mail_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'resend')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ [INBOX] Error fetching account status', error);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }

    if (!account) {
      return NextResponse.json({ error: 'Aucun inbox généré' }, { status: 404 });
    }

    const hasRecentInbound = account.last_inbound_at ? (Date.now() - new Date(account.last_inbound_at).getTime()) < 1000 * 60 * 60 * 24 : false;
    const nextStatus = hasRecentInbound ? 'connected' : (account.verification_status || 'pending');

    if (nextStatus !== account.verification_status) {
      await supabase
        .from('mail_accounts')
        .update({ verification_status: nextStatus })
        .eq('id', account.id);
      account.verification_status = nextStatus;
    }

    return NextResponse.json({ success: true, inbox: mapAccountPayload(account) });
  } catch (error) {
    console.error('❌ [INBOX] Status error', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
