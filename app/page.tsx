'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthButton } from '@/components/auth-button';
import { DarkHero } from '@/components/home/dark-hero';
import { TechStackBanner } from '@/components/home/tech-stack-banner';
import { DarkBentoFeatures } from '@/components/home/dark-bento-features';
import { ProofSection } from '@/components/home/ProofSection';
import { ReviewsSection } from '@/components/home/reviews-section';
import { DarkPricing } from '@/components/home/dark-pricing';
import { DarkFaq } from '@/components/home/dark-faq';
import { LightHero } from '@/components/home/light-hero';
import { LightFeatures } from '@/components/home/light-features';
import { LightPricing } from '@/components/home/light-pricing';
import { LightFaq } from '@/components/home/light-faq';

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [loading, setLoading] = useState<'STARTER' | 'PRO' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (session) {
      router.push('/mail-center');
    } else {
      signIn('google', { callbackUrl: '/mail-center' });
    }
  };

  const handleUpgrade = async (plan: 'STARTER' | 'PRO') => {
    if (!session) {
      signIn('google', { callbackUrl: '/mail-center' });
      return;
    }

    const currentPlan = session.user?.plan || 'FREE';

    if (currentPlan === 'PRO' && plan === 'STARTER') {
      toast.error("Vous ne pouvez pas rétrograder votre plan PRO vers STARTER. Résiliez d'abord votre abonnement depuis les paramètres.");
      return;
    }

    if (currentPlan === plan) {
      toast.info('Vous avez déjà ce plan !');
      return;
    }

    setLoading(plan);
    try {
      const priceId =
        plan === 'STARTER'
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;

      if (!priceId) {
        toast.error('Configuration Stripe manquante');
        setLoading(null);
        return;
      }

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, plan }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Erreur lors de la création de la session de paiement');
        setLoading(null);
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0E27] transition-colors duration-300">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-blue-500/10 dark:bg-[#0A0E27]/95">
        <div className="mx-auto flex h-14 xxs:h-16 sm:h-16 3xl:h-20 4xl:h-24 max-w-7xl 3xl:max-w-[1600px] 4xl:max-w-[1800px] items-center justify-between px-4 xxs:px-5 xs:px-6 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
          <div>
            <Link href="/" className="flex items-center gap-1.5 xxs:gap-2 font-bold text-gray-900 transition-opacity hover:opacity-80 dark:text-white">
              <Mail className="h-5 w-5 xxs:h-6 xxs:w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-sm xxs:text-base 3xl:text-lg 4xl:text-xl hidden xs:inline">ClaritySupport</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex lg:gap-8">
            {['features', 'pricing', 'contact'].map((item) => (
              <Link 
                key={item}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400" 
                href={item === 'contact' ? '/contact' : `#${item}`}
              >
                {item === 'features' ? 'Fonctionnalités' : item === 'pricing' ? 'Tarifs' : 'Contact'}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-1.5 xxs:gap-2 sm:gap-3">
            <ThemeToggle />
            <div className="hidden xs:block">
              <AuthButton />
            </div>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center rounded-lg p-1.5 xxs:p-2 text-gray-600 transition-colors hover:bg-gray-100 active:scale-95 dark:text-gray-300 dark:hover:bg-blue-500/10 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 xxs:h-6 xxs:w-6" /> : <Menu className="h-5 w-5 xxs:h-6 xxs:w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="animate-in fade-in slide-in-from-top-2 border-t border-gray-200 bg-white dark:border-blue-500/10 dark:bg-[#0A0E27] md:hidden">
            <div className="space-y-1 px-4 pb-3 xxs:pb-4 pt-2">
              {['features', 'pricing', 'contact'].map((item) => (
                <Link
                  key={item}
                  href={item === 'contact' ? '/contact' : `#${item}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 xxs:px-4 py-2.5 xxs:py-3 text-sm xxs:text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                >
                  {item === 'features' ? 'Fonctionnalités' : item === 'pricing' ? 'Tarifs' : 'Contact'}
                </Link>
              ))}
              <div className="pt-2 xs:hidden">
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <DarkHero onGetStarted={handleGetStarted} />
        <TechStackBanner />
        <div id="features">
          <DarkBentoFeatures />
        </div>
        <ProofSection />
        <ReviewsSection />
        <DarkPricing />
        <DarkFaq />
      </main>

      <footer className="relative overflow-hidden border-t border-gray-200 bg-gray-50 py-20 dark:border-blue-500/10 dark:bg-[#0A0E27]">
        {/* Decorative gradient */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-full -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl opacity-40 dark:bg-blue-500/10" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Link href="/" className="mb-4 inline-flex items-center gap-2 font-bold text-gray-900 transition-opacity hover:opacity-80 dark:text-white">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span>ClaritySupport</span>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ClaritySupport transforme votre support client en levier de croissance. Répondez instantanément, augmentez vos conversions et libérez votre équipe des tâches répétitives.
              </p>
            </div>
            
            <div>
              <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Produit</h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                {[
                  { href: '#features', label: 'Fonctionnalités' },
                  { href: '#pricing', label: 'Tarifs' },
                  { href: '/mail-center', label: 'Mail Center' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="transition-colors hover:text-blue-600 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Support</h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                {[
                  { href: '/contact', label: 'Contact' },
                  { href: '/legal', label: 'Mentions légales' },
                  { href: '/privacy', label: 'Confidentialité' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-16 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-blue-500/10">
            <p>© {new Date().getFullYear()} ClaritySupport. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
