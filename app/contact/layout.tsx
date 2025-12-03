import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez ClaritySupport pour toute question ou demande concernant notre solution de support client automatisé par IA.',
  openGraph: {
    title: 'Contact - ClaritySupport',
    description: 'Contactez-nous pour toute question ou demande d\'assistance',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
