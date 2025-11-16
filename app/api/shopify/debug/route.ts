/**
 * Route de diagnostic Shopify
 * URL: /api/shopify/debug
 * Retourne l'état complet de la configuration Shopify
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const diagnostic = {
      timestamp: new Date().toISOString(),
      authentication: {
        isAuthenticated: !!session,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
      },
      environmentVariables: {
        SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ? '✅ Configurée (masquée)' : '❌ MANQUANTE',
        SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET ? '✅ Configurée (masquée)' : '❌ MANQUANTE',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '❌ MANQUANTE',
      },
      shopifyConfig: {
        apiKeyLength: process.env.SHOPIFY_API_KEY?.length || 0,
        apiSecretLength: process.env.SHOPIFY_API_SECRET?.length || 0,
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/callback`,
        scopes: 'read_orders,read_customers,read_products,read_inventory',
      },
      testOAuthUrl: null as string | null,
      errors: [] as string[],
    };

    // Tester la génération d'URL OAuth si les variables existent
    if (process.env.SHOPIFY_API_KEY && session?.user?.id) {
      try {
        const testShop = 'hk610k-6m.myshopify.com';
        const state = Buffer.from(JSON.stringify({
          userId: session.user.id,
          timestamp: Date.now(),
        })).toString('base64');

        const params = new URLSearchParams({
          client_id: process.env.SHOPIFY_API_KEY,
          scope: 'read_orders,read_customers,read_products,read_inventory',
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/callback`,
          state,
        });

        diagnostic.testOAuthUrl = `https://${testShop}/admin/oauth/authorize?${params.toString()}`;
      } catch (error) {
        diagnostic.errors.push(`Erreur génération OAuth URL: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      if (!process.env.SHOPIFY_API_KEY) {
        diagnostic.errors.push('SHOPIFY_API_KEY manquante - Ajoutez-la dans Vercel Environment Variables');
      }
      if (!session?.user?.id) {
        diagnostic.errors.push('Utilisateur non authentifié - Connectez-vous d\'abord');
      }
    }

    return NextResponse.json(diagnostic, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
    }, { status: 500 });
  }
}
