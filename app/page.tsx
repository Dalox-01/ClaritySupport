'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthButton } from '@/components/auth-button';
import { DarkHero } from '@/components/home/dark-hero';
import { DarkBentoFeatures } from '@/components/home/dark-bento-features';
import { ProofSection } from '@/components/home/ProofSection';
import { DarkPricing } from '@/components/home/dark-pricing';
import { DarkFaq } from '@/components/home/dark-faq';
import { SmoothScrollProvider } from '@/components/smooth-scroll-provider';

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
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
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#0A0E27]">
        <motion.header 
          className="fixed inset-x-0 top-0 z-50 border-b border-blue-500/10 bg-[#0A0E27]"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/" className="flex items-center gap-2 font-bold text-white">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.15 }}
                transition={{ duration: 0.5 }}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(59, 130, 246, 0.4)',
                    '0 0 20px 5px rgba(59, 130, 246, 0.2)',
                    '0 0 0 0 rgba(59, 130, 246, 0.4)',
                  ],
                }}
                style={{ borderRadius: '50%' }}
              >
                <Mail className="h-6 w-6 text-blue-400" />
              </motion.div>
              <motion.span
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:inline"
              >
                ClaritySupport
              </motion.span>
            </Link>
          </motion.div>
          
          {/* Desktop Navigation */}
          <motion.nav 
            className="hidden items-center gap-6 md:flex lg:gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {['features', 'pricing', 'contact'].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <Link 
                  className="relative text-sm font-medium text-gray-300 transition-colors hover:text-blue-400" 
                  href={item === 'contact' ? '/contact' : `#${item}`}
                >
                  <motion.span
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block"
                  >
                    {item === 'features' ? 'Fonctionnalités' : item === 'pricing' ? 'Tarifs' : 'Contact'}
                  </motion.span>
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-400 to-cyan-400"
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.nav>
          
          <motion.div 
            className="flex items-center gap-2 sm:gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <ThemeToggle />
            <div className="hidden sm:block">
              <AuthButton />
            </div>
            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center rounded-lg p-2 text-gray-300 hover:bg-blue-500/10 md:hidden"
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </motion.div>
        </div>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-blue-500/10 bg-[#0A0E27] md:hidden"
            >
              <div className="space-y-1 px-4 pb-4 pt-2">
                {['features', 'pricing', 'contact'].map((item) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      href={item === 'contact' ? '/contact' : `#${item}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg px-4 py-3 text-base font-medium text-gray-300 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                    >
                      {item === 'features' ? 'Fonctionnalités' : item === 'pricing' ? 'Tarifs' : 'Contact'}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="pt-2"
                >
                  <AuthButton />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main>
        <DarkHero onGetStarted={handleGetStarted} />
        <div id="features">
          <DarkBentoFeatures />
        </div>
        <ProofSection />
        <DarkPricing />
        <DarkFaq />
      </main>

      <motion.footer 
        className="relative overflow-hidden border-t border-blue-500/10 bg-[#0A0E27] py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Decorative gradient */}
        <motion.div 
          className="pointer-events-none absolute left-1/2 top-0 h-40 w-full -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div 
              className="sm:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/" className="mb-4 inline-flex items-center gap-2 font-bold text-white">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.15 }}
                  transition={{ duration: 0.5 }}
                >
                  <Mail className="h-6 w-6 text-blue-400" />
                </motion.div>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  ClaritySupport
                </motion.span>
              </Link>
              <p className="text-sm text-gray-400">
                Transformez votre support client avec l'IA. ClaritySupport centralise vos emails et automatise vos réponses pour un service exceptionnel 24/7.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="mb-4 text-sm font-bold text-white">Produit</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {[
                  { href: '#features', label: 'Fonctionnalités' },
                  { href: '#pricing', label: 'Tarifs' },
                  { href: '/mail-center', label: 'Mail Center' },
                ].map((link, index) => (
                  <motion.li 
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                  >
                    <Link 
                      href={link.href} 
                      className="inline-block transition-colors hover:text-gray-900 dark:hover:text-white"
                    >
                      <motion.span
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.label}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="mb-4 text-sm font-bold text-white">Support</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {[
                  { href: '/contact', label: 'Contact' },
                  { href: '/legal', label: 'Mentions légales' },
                  { href: '/privacy', label: 'Confidentialité' },
                ].map((link, index) => (
                  <motion.li 
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                  >
                    <Link 
                      href={link.href} 
                      className="inline-block transition-colors hover:text-blue-400"
                    >
                      <motion.span
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.label}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-16 border-t border-blue-500/10 pt-8 text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.p
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              © {new Date().getFullYear()} ClaritySupport. Tous droits réservés.
            </motion.p>
          </motion.div>
        </div>
      </motion.footer>
      </div>
    </SmoothScrollProvider>
  );
}
