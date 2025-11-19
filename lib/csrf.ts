/**
 * CSRF Protection Middleware
 * 
 * SECURITY: VULN-005 - Critical CSRF vulnerability protection
 * CWE: CWE-352 (Cross-Site Request Forgery)
 * CVSS: 8.1/10
 * 
 * Implements synchronizer token pattern to prevent CSRF attacks
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token from request
 * Compares token from header with token in cookie
 */
export function validateCSRFToken(req: NextRequest): boolean {
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!headerToken || !cookieToken) {
    console.warn('[CSRF] Missing CSRF token in request');
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (!secureCompare(headerToken, cookieToken)) {
    console.warn('[CSRF] CSRF token mismatch');
    return false;
  }

  return true;
}

/**
 * Secure string comparison (constant time)
 * Prevents timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * CSRF Protection Higher-Order Function
 * Wrap API route handlers to enforce CSRF validation
 * 
 * @example
 * export const POST = withCSRFProtection(async (req) => {
 *   // Your handler code here
 * });
 */
export function withCSRFProtection(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    // Only check CSRF for state-changing methods
    const METHOD_REQUIRES_CSRF = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (METHOD_REQUIRES_CSRF.includes(req.method)) {
      // Skip CSRF for certain safe endpoints (e.g., webhooks with their own signature verification)
      const CSRF_EXEMPT_PATHS = [
        '/api/stripe/webhook',
        '/api/shopify/callback',
      ];

      const pathname = req.nextUrl.pathname;
      const isExempt = CSRF_EXEMPT_PATHS.some((path) => pathname.startsWith(path));

      if (!isExempt && !validateCSRFToken(req)) {
        console.error(`[CSRF] CSRF attack blocked on ${req.method} ${pathname}`);

        return NextResponse.json(
          {
            error: 'Invalid CSRF token',
            detail: 'This request appears to be a Cross-Site Request Forgery attack.',
            code: 'CSRF_VALIDATION_FAILED',
          },
          { status: 403 }
        );
      }
    }

    return handler(req, context);
  };
}

/**
 * Middleware to set CSRF token cookie
 * Add this to your middleware.ts file
 */
export function setCSRFCookie(response: NextResponse, request: NextRequest): NextResponse {
  // Only set cookie if not already present
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME);

  if (!existingToken) {
    const token = generateCSRFToken();

    response.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    console.log('[CSRF] New CSRF token generated');
  }

  return response;
}

/**
 * Client-side helper to get CSRF token from cookie
 * Use this in your frontend API calls
 * 
 * @example
 * import { getCSRFToken } from '@/lib/csrf-client';
 * 
 * fetch('/api/filters', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'X-CSRF-Token': getCSRFToken()
 *   },
 *   body: JSON.stringify(data)
 * });
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split('; ');
  const csrfCookie = cookies.find((cookie) => cookie.startsWith(CSRF_COOKIE_NAME + '='));

  if (!csrfCookie) {
    console.warn('[CSRF] CSRF token cookie not found');
    return null;
  }

  return csrfCookie.split('=')[1];
}
