import { NextRequest, NextResponse } from 'next/server';
import {
  checkShopifyAccess,
  disconnectShop,
  generateShopifyAuthUrl,
  getUserShops,
} from '@/lib/shopify-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [shops, limits] = await Promise.all([
    getUserShops(userId),
    checkShopifyAccess(userId),
  ]);
  return NextResponse.json({ shops, planLimits: limits });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const shopDomain = (body.shopDomain as string | undefined)?.trim();
  if (!shopDomain || !shopDomain.endsWith('.myshopify.com')) {
    return NextResponse.json({ error: 'Invalid shopDomain' }, { status: 400 });
  }
  const limits = await checkShopifyAccess(userId);
  if (!limits.hasAccess || !limits.canAddMore) {
    return NextResponse.json({ 
      error: 'Plan limit reached',
      details: {
        plan: limits.plan,
        currentShops: limits.currentShops,
        maxShops: limits.maxShops
      }
    }, { status: 403 });
  }
  const authUrl = generateShopifyAuthUrl(shopDomain, userId);
  return NextResponse.json({ success: true, authUrl });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const shopId = body.shopId as string | undefined;
  if (!shopId) {
    return NextResponse.json({ error: 'Missing shopId' }, { status: 400 });
  }
  await disconnectShop(shopId, userId);
  return NextResponse.json({ success: true });
}
