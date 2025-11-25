import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getShopifyContext } from '@/lib/shopify-context';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const context = await getShopifyContext(userId);
    
    if (!context) {
      return NextResponse.json({ 
        message: 'No active Shopify shop found or no data available.',
        context: null 
      });
    }

    return NextResponse.json({ 
      success: true, 
      context 
    });
  } catch (error) {
    console.error('Error generating Shopify context:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
