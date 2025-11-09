import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez MailWizard pour toute question ou demande d\'assistance concernant la génération d\'emails par IA.',
  openGraph: {
    title: 'Contact - MailWizard',
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
