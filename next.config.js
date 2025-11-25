/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver la génération statique - tout sera rendu dynamiquement
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: false, // Activer l'optimisation d'images
    formats: ['image/avif', 'image/webp'], // Formats modernes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // Cache 1 an
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Optimisations de production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Supprimer console.log en prod
  },
  // Compression et minification
  compress: true,
  // Bundle analyzer (optionnel)
  productionBrowserSourceMaps: false,
  // Optimisation des polyfills
  swcMinify: true,
  // Optimisations supplémentaires
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Optimisations de build
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Protection XSS
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Empêcher le MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Protection contre le clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // Politique de referrer stricte
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // HSTS - Force HTTPS (à activer en production avec SSL)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          // Permissions Policy - Restreindre les APIs dangereuses mais autoriser le microphone pour ce site
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()'
          },
          // Content Security Policy (CSP)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://accounts.google.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.stripe.com https://*.stripe.com https://accounts.google.com https://oauth2.googleapis.com wss://*.supabase.co",
              "frame-src 'self' https://js.stripe.com https://accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
