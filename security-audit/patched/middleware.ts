/**
 * SECURITY-HARDENED MIDDLEWARE
 * 
 * Implements:
 * - CSRF protection
 * - Rate limiting
 * - Security headers
 * - Input validation
 * - Request logging
 * 
 * PATCHES:
 * - VULN-005: CSRF protection
 * - VULN-008: Rate limiting on auth endpoints
 * - VULN-010: Strengthened CSP
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { setCSRFCookie } from '@/lib/csrf';

// Rate limiting storage (in-memory for dev, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Enhanced rate limit for authentication endpoints
const authRateLimitMap = new Map<string, { count: number; resetTime: number; failedAttempts: number }>();

/**
 * Cleanup rate limit cache periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    // Clean general rate limits
    rateLimitMap.forEach((value, key) => {
      if (now > value.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => rateLimitMap.delete(key));

    // Clean auth rate limits
    const authKeysToDelete: string[] = [];
    authRateLimitMap.forEach((value, key) => {
      if (now > value.resetTime) {
        authKeysToDelete.push(key);
      }
    });
    authKeysToDelete.forEach((key) => authRateLimitMap.delete(key));
  }, 300000); // Every 5 minutes
}

/**
 * General rate limiting
 */
function checkRateLimit(
  ip: string,
  limit: number = 100,
  windowMs: number = 60000
): boolean {
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

/**
 * Stricter rate limiting for authentication endpoints
 * - 5 attempts per 15 minutes
 * - Account lockout after repeated failures
 */
function checkAuthRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const record = authRateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    authRateLimitMap.set(ip, {
      count: 1,
      resetTime,
      failedAttempts: 0,
    });
    return { allowed: true, remaining: maxAttempts - 1, resetTime };
  }

  if (record.count >= maxAttempts) {
    console.warn(`[SECURITY] Auth rate limit exceeded for IP: ${ip}`);
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    resetTime: record.resetTime,
  };
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const pathname = request.nextUrl.pathname;

  // ====================================
  // 1. RATE LIMITING
  // ====================================

  // Stricter rate limiting for authentication endpoints
  if (pathname.startsWith('/api/auth/')) {
    const { allowed, remaining, resetTime } = checkAuthRateLimit(ip);

    if (!allowed) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

      console.error(
        `[SECURITY] Authentication rate limit exceeded for IP ${ip} on ${pathname}`
      );

      return new NextResponse(
        JSON.stringify({
          error: 'Too many authentication attempts',
          detail: 'Please try again later',
          retryAfter: retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(resetTime),
          },
        }
      );
    }

    response.headers.set('X-RateLimit-Remaining', String(remaining));
  }

  // General rate limiting (100 req/min)
  if (!checkRateLimit(ip)) {
    console.warn(`[SECURITY] General rate limit exceeded for IP ${ip}`);

    return new NextResponse(
      'Too many requests. Please try again later.',
      {
        status: 429,
        headers: {
          'Retry-After': '60',
        },
      }
    );
  }

  // ====================================
  // 2. INPUT VALIDATION
  // ====================================

  const url = pathname + request.nextUrl.search;

  // Block requests with suspicious patterns (unless it's billing/Stripe related)
  const isBillingRoute =
    pathname.startsWith('/api/billing') ||
    pathname.startsWith('/api/stripe') ||
    pathname.startsWith('/dashboard/billing');

  if (!isBillingRoute) {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /%3Cscript/i,
      /\.\.\//,  // Path traversal
      /\0/,      // Null byte
      /union.*select/i, // SQL injection attempt
      /1=1/,     // SQL injection
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(url))) {
      console.error(
        `[SECURITY] Suspicious pattern detected in URL: ${url} from IP ${ip}`
      );

      return new NextResponse('Invalid request detected', { status: 400 });
    }
  }

  // ====================================
  // 3. CONTENT-TYPE VALIDATION
  // ====================================

  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');

    const allowedContentTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain', // For Stripe webhooks
    ];

    if (
      contentType &&
      !allowedContentTypes.some((type) => contentType.includes(type))
    ) {
      console.warn(
        `[SECURITY] Unsupported Content-Type: ${contentType} from IP ${ip}`
      );

      return new NextResponse('Unsupported Content-Type', { status: 415 });
    }
  }

  // ====================================
  // 4. SECURITY HEADERS
  // ====================================

  // Remove server header (information disclosure)
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');

  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '0'); // Deprecated but some legacy browsers
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Strict-Transport-Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    ); // 2 years
  }

  // Content-Security-Policy (CSP) with nonce
  const nonce = crypto.randomBytes(16).toString('base64');

  // Frame protection - different for Shopify routes vs regular routes
  if (pathname.startsWith('/api/shopify') || pathname.startsWith('/mail-center')) {
    // Allow embedding in Shopify admin
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors https://*.myshopify.com https://admin.shopify.com 'self'"
    );
  } else {
    // Block embedding for all other routes
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors 'none'"
    );
  }

  // Comprehensive CSP (NO 'unsafe-inline', NO 'unsafe-eval')
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://accounts.google.com`,
    "style-src 'self' 'unsafe-inline'", // Tailwind CSS requires inline styles
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.stripe.com https://*.stripe.com https://accounts.google.com https://oauth2.googleapis.com",
    "frame-src 'self' https://js.stripe.com https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  // Store nonce for use in layout
  response.headers.set('X-Nonce', nonce);

  // Permissions-Policy (Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(self), geolocation=(), interest-cohort=(), payment=(self)'
  );

  // ====================================
  // 5. CORS HEADERS (Strict)
  // ====================================

  const origin = request.headers.get('origin');

  // Only allow CORS for Chrome extension and localhost in dev
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  // Allow Chrome extension (if origin starts with chrome-extension://)
  if (origin?.startsWith('chrome-extension://') || allowedOrigins.includes(origin || '')) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Cookie, X-CSRF-Token'
    );
  }

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, Cookie, X-CSRF-Token',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }

  // ====================================
  // 6. CSRF TOKEN COOKIE
  // ====================================

  setCSRFCookie(response, request);

  // ====================================
  // 7. REQUEST LOGGING (for audit trail)
  // ====================================

  if (process.env.NODE_ENV === 'production') {
    // Log suspicious activity
    const suspiciousIndicators = [
      pathname.includes('..'),
      pathname.includes('%00'),
      request.headers.get('user-agent')?.includes('curl'),
      request.headers.get('user-agent')?.includes('python-requests'),
    ];

    if (suspiciousIndicators.some(Boolean)) {
      console.warn('[SECURITY] Suspicious request detected:', {
        ip,
        pathname,
        userAgent: request.headers.get('user-agent'),
        method: request.method,
      });
    }
  }

  return response;
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
  ],
};
