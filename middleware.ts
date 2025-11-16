import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting simple en mémoire
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Nettoyer le cache toutes les 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    rateLimitMap.forEach((value, key) => {
      if (now > value.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => rateLimitMap.delete(key));
  }, 300000);
}

function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const origin = request.headers.get('origin');
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Rate limiting - 100 requêtes par minute par IP
  if (!checkRateLimit(ip)) {
    return new NextResponse('Trop de requêtes. Veuillez réessayer plus tard.', {
      status: 429,
      headers: {
        'Retry-After': '60',
      },
    });
  }
  
  // Bloquer les requêtes avec des patterns suspects dans l'URL
  const url = request.nextUrl.pathname + request.nextUrl.search;
  
  // Exclure les routes de paiement Stripe des vérifications strictes
  const isBillingRoute = request.nextUrl.pathname.startsWith('/api/billing') || 
                         request.nextUrl.pathname.startsWith('/dashboard/billing');
  
  if (!isBillingRoute) {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /%3Cscript/i,
      /\.\.\/\.\.\//,  // Path traversal
      /\0/,  // Null byte
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(url))) {
      return new NextResponse('Requête invalide détectée', { status: 400 });
    }
  }
  
  // Vérifier le Content-Type pour les POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    
    // Autoriser seulement JSON et form-urlencoded
    if (contentType && 
        !contentType.includes('application/json') && 
        !contentType.includes('application/x-www-form-urlencoded') &&
        !contentType.includes('multipart/form-data')) {
      return new NextResponse('Content-Type non autorisé', { status: 415 });
    }
  }
  
  // Headers de sécurité supplémentaires
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Autoriser Shopify à afficher l'app dans iframe
  // Ne pas utiliser X-Frame-Options avec CSP frame-ancestors (conflit)
  const url = request.nextUrl.pathname;
  
  // Pour les routes Shopify, autoriser l'embedding
  if (url.startsWith('/api/shopify') || url.startsWith('/mail-center')) {
    response.headers.set('Content-Security-Policy', "frame-ancestors https://*.myshopify.com https://admin.shopify.com");
  } else {
    // Pour les autres routes, bloquer l'embedding
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
  }
  
  // Permettre les requêtes depuis l'extension Chrome (avec validation)
  if (origin && (origin.startsWith('chrome-extension://') || origin.includes('localhost'))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-CSRF-Token');
  }

  // Gérer les requêtes OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-CSRF-Token',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return response;
}

// Appliquer le middleware aux routes API et sensibles
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
  ],
};
