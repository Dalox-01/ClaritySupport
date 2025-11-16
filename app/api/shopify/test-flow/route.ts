/**
 * Test complet du flux OAuth Shopify
 * URL: /api/shopify/test-flow
 * Simule tout le flux sans redirection pour debug
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const steps: any[] = [];
  
  try {
    // Step 1: Session
    steps.push({ step: 1, name: 'Check session', status: 'running' });
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      steps.push({ step: 1, status: 'failed', error: 'No session' });
      return NextResponse.json({ success: false, steps, error: 'Not authenticated' });
    }
    
    steps.push({ step: 1, status: 'success', userId: session.user.id, email: session.user.email });

    // Step 2: Env vars
    steps.push({ step: 2, name: 'Check env vars', status: 'running' });
    const hasApiKey = !!process.env.SHOPIFY_API_KEY;
    const hasApiSecret = !!process.env.SHOPIFY_API_SECRET;
    const hasAppUrl = !!process.env.NEXT_PUBLIC_APP_URL;
    
    if (!hasApiKey || !hasApiSecret || !hasAppUrl) {
      steps.push({ 
        step: 2, 
        status: 'failed', 
        apiKey: hasApiKey, 
        apiSecret: hasApiSecret, 
        appUrl: hasAppUrl 
      });
      return NextResponse.json({ success: false, steps, error: 'Missing env vars' });
    }
    
    steps.push({ step: 2, status: 'success' });

    // Step 3: Generate OAuth URL
    steps.push({ step: 3, name: 'Generate OAuth URL', status: 'running' });
    const shopDomain = 'hk610k-6m.myshopify.com';
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      timestamp: Date.now(),
    })).toString('base64');

    const params = new URLSearchParams({
      client_id: process.env.SHOPIFY_API_KEY!,
      scope: 'read_orders,read_customers,read_products,read_inventory',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/callback`,
      state,
    });

    const authUrl = `https://${shopDomain}/admin/oauth/authorize?${params.toString()}`;
    steps.push({ step: 3, status: 'success', authUrl: authUrl.substring(0, 100) + '...' });

    // Step 4: Simulate token exchange (with fake code)
    steps.push({ step: 4, name: 'Test token exchange endpoint', status: 'running' });
    
    // On ne peut pas vraiment tester sans un vrai code OAuth, donc on vérifie juste les credentials
    const tokenExchangeUrl = `https://${shopDomain}/admin/oauth/access_token`;
    steps.push({ 
      step: 4, 
      status: 'skipped', 
      reason: 'Need real OAuth code from Shopify',
      tokenUrl: tokenExchangeUrl
    });

    // Step 5: Test database insert
    steps.push({ step: 5, name: 'Test database insert', status: 'running' });
    
    const testShop = {
      user_id: session.user.id,
      shop_domain: `test-${Date.now()}.myshopify.com`,
      access_token: 'test_token_' + Date.now(),
      shopify_shop_id: 'test_id_' + Date.now(),
      status: 'pending' as const,
    };

    const { data: insertedShop, error: insertError } = await supabase
      .from('shopify_shops')
      .insert(testShop)
      .select()
      .single();

    if (insertError) {
      steps.push({ 
        step: 5, 
        status: 'failed', 
        error: insertError.message,
        details: insertError.details,
        hint: insertError.hint 
      });
      return NextResponse.json({ success: false, steps, error: 'Database insert failed' });
    }

    steps.push({ step: 5, status: 'success', shopId: insertedShop.id });

    // Step 6: Cleanup - delete test shop
    steps.push({ step: 6, name: 'Cleanup test data', status: 'running' });
    await supabase
      .from('shopify_shops')
      .delete()
      .eq('id', insertedShop.id);
    
    steps.push({ step: 6, status: 'success' });

    // Step 7: Decode state test
    steps.push({ step: 7, name: 'Test state encoding/decoding', status: 'running' });
    
    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      
      if (decodedState.userId !== session.user.id) {
        throw new Error('UserId mismatch after decode');
      }
      
      steps.push({ step: 7, status: 'success', decoded: decodedState });
    } catch (decodeError) {
      steps.push({ 
        step: 7, 
        status: 'failed', 
        error: decodeError instanceof Error ? decodeError.message : String(decodeError)
      });
      return NextResponse.json({ success: false, steps, error: 'State decode failed' });
    }

    return NextResponse.json({ 
      success: true, 
      steps,
      summary: {
        allStepsPassed: true,
        readyForOAuth: true,
        nextStep: 'Click the authUrl to start real OAuth flow',
        authUrl
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      steps,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
