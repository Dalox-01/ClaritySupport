/**
 * Route de test de la base de données Shopify
 * URL: /api/shopify/test-db
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Test 1: Vérifier si la table existe et ses colonnes
    const { data: tableTest, error: tableError } = await supabase
      .from('shopify_shops')
      .select('*')
      .limit(1);

    // Test 2: Essayer d'insérer une boutique test
    const testShop = {
      user_id: userId,
      shop_domain: 'test-shop.myshopify.com',
      access_token: 'test_token_' + Date.now(),
      status: 'pending' as const,
      shopify_shop_id: 'test_' + Date.now(),
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('shopify_shops')
      .insert(testShop)
      .select()
      .single();

    // Si l'insertion a réussi, nettoyer
    if (insertTest?.id) {
      await supabase
        .from('shopify_shops')
        .delete()
        .eq('id', insertTest.id);
    }

    // Test 3: Tester la fonction RPC
    const { data: rpcTest, error: rpcError } = await supabase
      .rpc('check_shopify_shop_limit', { p_user_id: userId });

    return NextResponse.json({
      userId,
      tests: {
        tableExists: {
          success: !tableError,
          error: tableError?.message,
          columns: tableTest ? Object.keys(tableTest[0] || {}) : [],
        },
        insertTest: {
          success: !insertError,
          error: insertError?.message,
          errorDetails: insertError?.details,
          errorHint: insertError?.hint,
          insertedId: insertTest?.id,
        },
        rpcTest: {
          success: !rpcError,
          error: rpcError?.message,
          result: rpcTest,
        },
      },
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
