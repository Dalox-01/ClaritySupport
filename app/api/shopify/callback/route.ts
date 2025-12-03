import { NextRequest, NextResponse } from 'next/server';
import { exchangeShopifyCode, saveShopToDatabase } from '@/lib/shopify-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const state = searchParams.get('state');

  if (!code || !shop || !state) {
    return NextResponse.redirect('/mail-center?shopify_error=missing_params');
  }

  try {
    const accessToken = await exchangeShopifyCode(shop, code);
    await saveShopToDatabase(state, shop, accessToken, null);
    return NextResponse.redirect(
      `/mail-center?shopify_success=true&shop=${encodeURIComponent(shop)}`
    );
  } catch (e) {
    return NextResponse.redirect('/mail-center?shopify_error=server_error');
  }
}
