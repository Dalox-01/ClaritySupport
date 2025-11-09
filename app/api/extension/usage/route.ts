import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { incrementUsage } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      // Même si pas de session, on retourne success pour ne pas bloquer l'extension
      return NextResponse.json({ success: true });
    }

    const { tokensUsed } = await req.json();

    await incrementUsage(session.user.id, tokensUsed || 1000);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Extension usage increment error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
