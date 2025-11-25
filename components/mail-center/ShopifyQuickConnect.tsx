"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Store, X, CheckCircle2, ArrowRight, ShoppingBag, Globe, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ShopifyConnectButtonProps = {
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
  isLightMode?: boolean;
};

export function ShopifyQuickConnect({ isLightMode, fullWidth }: { isLightMode?: boolean; fullWidth?: boolean }) {
  return <ShopifyConnectButton isLightMode={isLightMode} fullWidth={fullWidth} />;
}

export function ShopifyConnectButton({ size = 'md', fullWidth = false, className, isLightMode = false }: ShopifyConnectButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shopDomain, setShopDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerClass = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    isLightMode 
      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-emerald-500/30' 
      : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-emerald-500/20',
    size === 'sm' ? 'px-4 py-1.5 text-xs' : 'px-5 py-2 text-sm',
    fullWidth && 'w-full',
    className,
  );

  const normalizeDomain = (value: string) => {
    if (!value) return '';
    let domain = value.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, '');
    domain = domain.split('/')[0];
    domain = domain.replace(/\s+/g, '');
    if (!domain) return '';
    if (!domain.endsWith('.myshopify.com')) {
      domain = domain.replace(/\.myshopify\.com$/, '');
      domain = `${domain}.myshopify.com`;
    }
    return domain;
  };

  const handleConnect = async () => {
    const domain = normalizeDomain(shopDomain);
    if (!domain) {
      setError('Entrez un domaine Shopify valide');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shopify/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopDomain: domain }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de lancer la connexion Shopify');
      }

      toast.success('Redirection vers Shopify…');
      setIsDialogOpen(false);
      setTimeout(() => {
        window.location.href = data.authUrl;
      }, 150);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setError(null);
    }, 200);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsDialogOpen(true);
        }}
        className={triggerClass}
      >
        <Store className="h-4 w-4" />
        Shopify
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isDialogOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "absolute inset-0 backdrop-blur-sm",
                  isLightMode ? "bg-black/20" : "bg-black/60"
                )}
                onClick={closeDialog}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={cn(
                  "relative w-full max-w-2xl rounded-2xl border shadow-2xl backdrop-blur-xl overflow-hidden",
                  isLightMode 
                    ? "bg-white/95 border-white/20 shadow-xl" 
                    : "bg-[#0f172a]/95 border-slate-700/50 shadow-black/50"
                )}
              >
                {/* Header avec gradient */}
                <div className={cn(
                  "relative px-6 py-6 overflow-hidden",
                  isLightMode 
                    ? "bg-gradient-to-br from-emerald-50 to-teal-50" 
                    : "bg-gradient-to-br from-emerald-900/20 to-teal-900/20"
                )}>
                  <div className="absolute top-0 right-0 p-4">
                    <button
                      type="button"
                      onClick={closeDialog}
                      className={cn(
                        "rounded-full p-2 transition-colors",
                        isLightMode 
                          ? "text-gray-400 hover:bg-white hover:text-gray-600" 
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      )}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 relative z-10">
                    <div className={cn(
                      "p-3 rounded-xl shadow-lg",
                      isLightMode 
                        ? "bg-white text-emerald-600 shadow-emerald-100" 
                        : "bg-emerald-500/20 text-emerald-400 shadow-emerald-900/20"
                    )}>
                      <Store className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className={cn(
                        "text-xl font-bold",
                        isLightMode ? "text-gray-900" : "text-white"
                      )}>
                        Connecter votre boutique Shopify
                      </h2>
                      <p className={cn(
                        "text-sm mt-1",
                        isLightMode ? "text-gray-600" : "text-slate-400"
                      )}>
                        Synchronisez vos commandes et clients en temps réel
                      </p>
                    </div>
                  </div>

                  {/* Decorative circles */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl" />
                </div>

                <div className="flex flex-col md:flex-row">
                  {/* Formulaire */}
                  <div className="flex-1 p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className={cn(
                          "text-sm font-semibold flex items-center gap-2",
                          isLightMode ? "text-gray-700" : "text-slate-300"
                        )}>
                          <Globe className="w-4 h-4" />
                          URL de votre boutique
                        </label>
                        <div className="relative">
                          <Input
                            placeholder="ma-boutique"
                            value={shopDomain}
                            onChange={(e) => setShopDomain(e.target.value)}
                            autoFocus
                            className={cn(
                              "pl-4 pr-32 h-12 text-base transition-all",
                              isLightMode 
                                ? "bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20" 
                                : "bg-slate-800/50 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20"
                            )}
                          />
                          <div className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none select-none",
                            isLightMode ? "text-gray-400" : "text-slate-500"
                          )}>
                            .myshopify.com
                          </div>
                        </div>
                        <p className={cn(
                          "text-xs",
                          isLightMode ? "text-gray-500" : "text-slate-500"
                        )}>
                          Entrez simplement le nom de votre boutique, nous ajoutons l&apos;extension automatiquement.
                        </p>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          {error}
                        </motion.div>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={handleConnect}
                        disabled={loading}
                        className={cn(
                          "w-full h-12 text-base font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
                          isLightMode
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                        )}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Connexion en cours...
                          </>
                        ) : (
                          <>
                            Connecter ma boutique
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Documentation / Info */}
                  <div className={cn(
                    "md:w-72 p-6 border-t md:border-t-0 md:border-l",
                    isLightMode 
                      ? "bg-gray-50/50 border-gray-100" 
                      : "bg-slate-800/30 border-slate-700/50"
                  )}>
                    <h3 className={cn(
                      "text-sm font-semibold mb-4 flex items-center gap-2",
                      isLightMode ? "text-gray-900" : "text-white"
                    )}>
                      <HelpCircle className="w-4 h-4" />
                      Comment ça marche ?
                    </h3>
                    
                    <ul className="space-y-4">
                      {[
                        { text: "Entrez le nom de votre boutique Shopify", icon: ShoppingBag },
                        { text: "Validez la connexion sur votre admin Shopify", icon: CheckCircle2 },
                        { text: "Accédez aux commandes directement dans le support", icon: Store }
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <div className={cn(
                            "mt-0.5 p-1.5 rounded-full h-fit",
                            isLightMode ? "bg-emerald-100 text-emerald-600" : "bg-emerald-500/10 text-emerald-400"
                          )}>
                            <item.icon className="w-3 h-3" />
                          </div>
                          <span className={cn(
                            "text-xs leading-relaxed",
                            isLightMode ? "text-gray-600" : "text-slate-400"
                          )}>
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className={cn(
                      "mt-6 p-3 rounded-lg text-xs",
                      isLightMode 
                        ? "bg-blue-50 text-blue-700 border border-blue-100" 
                        : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    )}>
                      <strong>Note :</strong> Vous devez être administrateur de la boutique pour autoriser la connexion.
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

