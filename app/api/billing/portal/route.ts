import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCustomerPortalSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.stripeCustomerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const portalSession = await createCustomerPortalSession(
      session.user.stripeCustomerId,
      `${appUrl}/app/settings/billing`
    );

    return NextResponse.json({
      success: true,
      url: portalSession.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create portal session',
      },
      { status: 500 }
    );
  }
}
