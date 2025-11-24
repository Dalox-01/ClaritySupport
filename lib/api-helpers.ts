/**
 * Helper pour créer des API routes sécurisées avec validation et protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { sanitizeInput, sanitizeJson, checkRateLimit } from './security';

export type ApiHandler = (
  req: NextRequest,
  context?: any
) => Promise<NextResponse> | NextResponse;

export interface SecureApiOptions {
  // Requiert une authentification
  requireAuth?: boolean;
  // Limite de requêtes (par minute)
  rateLimit?: number;
  // Méthodes HTTP autorisées
  allowedMethods?: string[];
  // Clés autorisées dans le body
  allowedBodyKeys?: string[];
  // Validation personnalisée du body
  validateBody?: (body: any) => { valid: boolean; errors?: string[] };
}

/**
 * Wrapper pour sécuriser les API routes
 */
export function secureApiRoute(
  handler: ApiHandler,
  options: SecureApiOptions = {}
) {
  return async (req: NextRequest, context?: any) => {
    try {
      const {
        requireAuth = false,
        rateLimit = 60,
        allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
        allowedBodyKeys,
        validateBody,
      } = options;

      // 1. Vérifier la méthode HTTP
      if (!allowedMethods.includes(req.method)) {
        return NextResponse.json(
          { error: 'Méthode non autorisée' },
          { status: 405 }
        );
      }

      // 2. Rate limiting
      const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
      const rateLimitResult = checkRateLimit(ip, rateLimit, 60000);
      
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
          { 
            status: 429,
            headers: {
              'Retry-After': '60',
              'X-RateLimit-Limit': rateLimit.toString(),
              'X-RateLimit-Remaining': '0',
            }
          }
        );
      }

      // 3. Vérifier l'authentification si requise
      if (requireAuth) {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user) {
          return NextResponse.json(
            { error: 'Non authentifié' },
            { status: 401 }
          );
        }
      }

      // 4. Valider et sanitizer le body pour POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        try {
          const body = await req.json();

          // Sanitizer selon les clés autorisées
          if (allowedBodyKeys) {
            const sanitized = sanitizeJson(body, allowedBodyKeys);
            // Remplacer le body par la version sanitizée
            (req as any).sanitizedBody = sanitized;
          } else {
            (req as any).sanitizedBody = body;
          }

          // Validation personnalisée
          if (validateBody) {
            const validation = validateBody((req as any).sanitizedBody);
            if (!validation.valid) {
              return NextResponse.json(
                { error: 'Validation échouée', details: validation.errors },
                { status: 400 }
              );
            }
          }
        } catch (error) {
          return NextResponse.json(
            { error: 'Corps de requête invalide' },
            { status: 400 }
          );
        }
      }

      // 5. Ajouter les headers de sécurité à la réponse
      const response = await handler(req, context);
      
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set(
        'X-RateLimit-Limit',
        rateLimit.toString()
      );
      response.headers.set(
        'X-RateLimit-Remaining',
        rateLimitResult.remaining.toString()
      );

      return response;
    } catch (error) {
      console.error('Erreur dans API route sécurisée:', error);
      
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper pour valider les emails
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Helper pour créer une réponse d'erreur standardisée
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: any
) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Helper pour créer une réponse de succès standardisée
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Middleware pour logger les requêtes API (pour le monitoring)
 */
export function logApiRequest(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.nextUrl.pathname;
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
}

/**
 * Extrait et valide les paramètres de pagination
 */
export function getPaginationParams(req: NextRequest): {
  page: number;
  limit: number;
  offset: number;
} {
  const { searchParams } = req.nextUrl;
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}
