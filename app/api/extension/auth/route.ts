import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserQuota } from '@/lib/db';

// Route API spéciale pour l'extension Chrome
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ 
        authenticated: false,
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Récupérer le quota de l'utilisateur
    const quota = await getUserQuota(session.user.id);

    return NextResponse.json({
      authenticated: true,
      token: 'session-token',
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        plan: session.user.plan || 'FREE'
      },
      usage: {
        plan: session.user.plan || 'FREE',
        used: quota.used || 0,
        limit: quota.limit || 10
      }
    });
  } catch (error) {
    console.error('Extension auth error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
