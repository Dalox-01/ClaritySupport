import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

// Force dynamic rendering for entire app
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://claritysupport.vercel.app'),
  title: {
    default: 'ClaritySupport - Support Client Automatisé par IA',
    template: '%s | ClaritySupport'
  },
  description: 'Automatisez votre support client avec l\'IA. ClaritySupport centralise vos emails Gmail et Outlook, génère des réponses intelligentes et optimise votre service client 24/7.',
  keywords: ['support client', 'IA', 'automatisation', 'service client', 'emails', 'chatbot', 'GPT', 'intelligence artificielle', 'claritysupport', 'mail center'],
  authors: [{ name: 'ClaritySupport', url: 'https://claritysupport.vercel.app' }],
  creator: 'Laszlo Jean-Pierre',
  publisher: 'ClaritySupport',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://claritysupport.vercel.app',
    title: 'ClaritySupport - Support Client Automatisé par IA',
    description: 'Transformez votre support client avec l\'IA. Réponses automatiques, centralisation des emails et analyse intelligente.',
    siteName: 'ClaritySupport',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'ClaritySupport Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClaritySupport - Support Client Automatisé par IA',
    description: 'Transformez votre support client avec l\'IA. Réponses automatiques et centralisation des emails.',
    creator: '@claritysupport',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ClaritySupport',
              url: 'https://claritysupport.vercel.app',
              logo: 'https://claritysupport.vercel.app/logo.png',
              description: 'Support client automatisé par IA - Mail Center intelligent',
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
