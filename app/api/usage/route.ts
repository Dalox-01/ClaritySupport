import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserQuota, getCurrentUsageMonth } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    console.log('📊 [USAGE API] GET request received');
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('❌ [USAGE API] No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`📊 [USAGE API] User: ${session.user.email} (${session.user.id})`);

    const quota = await getUserQuota(session.user.id);
    const currentMonth = await getCurrentUsageMonth();

    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    resetDate.setHours(0, 0, 0, 0);

    const response = {
      success: true,
      data: {
        ...quota,
        percentage: quota.limit > 0 ? Math.round((quota.used / quota.limit) * 100) : 0,
        resetAt: resetDate.toISOString(),
        currentMonth,
      },
    };

    console.log(`✅ [USAGE API] Response:`, JSON.stringify(response.data));

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [USAGE API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
