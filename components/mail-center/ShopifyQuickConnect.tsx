"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Store, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ShopifyConnectButtonProps = {
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
};

export function ShopifyQuickConnect() {
  return <ShopifyConnectButton />;
}

export function ShopifyConnectButton({ size = 'md', fullWidth = false, className }: ShopifyConnectButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shopDomain, setShopDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerClass = cn(
    'inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 text-white font-semibold shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
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

      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={closeDialog}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-2">
                    <Store className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-50">Connexion Shopify</p>
                    <p className="text-xs text-slate-400">Renseignez votre domaine puis validez.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Domaine Shopify</label>
                  <Input
                    placeholder="ma-boutique.myshopify.com"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    autoFocus
                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                  Tapez simplement « ma-boutique » : nous ajoutons automatiquement <span className="font-semibold">.myshopify.com</span>.
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-700/50 px-6 py-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connexion…
                    </>
                  ) : (
                    'Connecter ma boutique'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
