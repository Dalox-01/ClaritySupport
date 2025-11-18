"use client";

import { useState } from 'react';
import { toast } from 'sonner';

export function ShopifyQuickConnect() {
  const [shopDomain, setShopDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!shopDomain.trim()) {
      setError('Entrez un domaine myshopify.com');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shopify/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopDomain }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de lancer la connexion Shopify');
      }

      toast.success('Redirection vers Shopify…');
      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Connecter Shopify</p>
          <p className="text-xs text-slate-500">
            Renseignez votre domaine <span className="font-medium text-slate-800">ma-boutique.myshopify.com</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="ma-boutique.myshopify.com"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-700 transition transform hover:-translate-y-0.5 hover:border-emerald-700 hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span>Connexion…</span>
            ) : (
              <>
                <svg
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path
                    fill="currentColor"
                    d="M25.5 7.2c-.4-1.6-1.8-2.8-3.4-3.1-.3 0-.6-.1-.9-.1-1.3 0-2.5.6-3.4 1.5-.9-.9-2.1-1.5-3.4-1.5-.3 0-.6 0-.9.1-1.6.3-3 1.5-3.4 3.1L6 8.5v17.3c0 .9.7 1.6 1.6 1.6h16.7c.9 0 1.6-.7 1.6-1.6V8.5l-.4-1.3zM18.3 6c.3-.3.8-.5 1.3-.5.1 0 .3 0 .4.1.7.1 1.2.7 1.4 1.4l.1.2-3.8.8c.1-.8.3-1.5.6-2zm-4.6 0c.3-.1.5-.1.8-.1.5 0 1 .2 1.3.5.3.4.5 1 .6 1.6l-3.7.8c.2-1 .5-1.9 1-2.8zm8.8 16.5c-.4 1.1-1.5 1.8-2.5 2.1-.5.1-1 .2-1.4.2-.9 0-1.8-.3-2.6-.8-.8.5-1.7.8-2.6.8h-.1c-.5 0-.9-.1-1.4-.2-1.1-.3-2.1-1-2.5-2.1-.2-.4-.2-.9 0-1.3.2-.5.6-.9 1.1-1.1l.1-.1c.4-.2.9-.3 1.3-.2.4 0 .8.1 1.1.3.5.3.9.8 1.1 1.3.2-.5.6-1 1.1-1.3.3-.2.7-.3 1.1-.3.4 0 .9 0 1.3.2l.1.1c.5.2.9.6 1.1 1.1.2.4.2.9 0 1.3z"
                  />
                </svg>
                Connecter Shopify
              </>
            )}
          </button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
