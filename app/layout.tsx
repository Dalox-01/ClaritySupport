import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

// Force dynamic rendering for entire app
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://mailwizard.vercel.app'),
  title: {
    default: 'MailWizard - Génération d\'emails professionnels par IA',
    template: '%s | MailWizard'
  },
  description: 'Créez des emails professionnels parfaits en quelques secondes grâce à l\'intelligence artificielle. Candidatures, relances, prospection B2B et plus encore.',
  keywords: ['email', 'IA', 'génération', 'professionnel', 'candidature', 'prospection', 'GPT', 'intelligence artificielle', 'mailwizard'],
  authors: [{ name: 'MailWizard', url: 'https://mailwizard.vercel.app' }],
  creator: 'Laszlo Jean-Pierre',
  publisher: 'MailWizard',
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
    url: 'https://mailwizard.vercel.app',
    title: 'MailWizard - Génération d\'emails professionnels par IA',
    description: 'Créez des emails professionnels parfaits en quelques secondes grâce à l\'IA',
    siteName: 'MailWizard',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'MailWizard Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MailWizard - Génération d\'emails professionnels par IA',
    description: 'Créez des emails professionnels parfaits en quelques secondes grâce à l\'IA',
    creator: '@mailwizard',
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
              name: 'MailWizard',
              url: 'https://mailwizard.vercel.app',
              logo: 'https://mailwizard.vercel.app/logo.png',
              description: 'Génération d\'emails professionnels par IA',
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
