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
    <div className="rounded-xl border border-[#C3E6D1] bg-[#F6FFFB] p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-semibold text-[#004C3F]">
            Connecter une boutique Shopify
          </p>
          <p className="text-xs text-[#2F7766]">
            Ajoutez votre domaine <span className="font-medium">ma-boutique.myshopify.com</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="ma-boutique.myshopify.com"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            className="flex-1 rounded-lg border border-[#B3DCCA] px-3 py-2 text-sm focus:border-[#008060] focus:outline-none focus:ring-1 focus:ring-[#008060]"
          />
          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#008060] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#00664D] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg
              viewBox="0 0 32 32"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path
                fill="#FFFFFF"
                d="M25.5 7.2c-.4-1.6-1.8-2.8-3.4-3.1-.3 0-.6-.1-.9-.1-1.3 0-2.5.6-3.4 1.5-.9-.9-2.1-1.5-3.4-1.5-.3 0-.6 0-.9.1-1.6.3-3 1.5-3.4 3.1L6 8.5v17.3c0 .9.7 1.6 1.6 1.6h16.7c.9 0 1.6-.7 1.6-1.6V8.5l-.4-1.3zM18.3 6c.3-.3.8-.5 1.3-.5.1 0 .3 0 .4.1.7.1 1.2.7 1.4 1.4l.1.2-3.8.8c.1-.8.3-1.5.6-2zm-4.6 0c.3-.1.5-.1.8-.1.5 0 1 .2 1.3.5.3.4.5 1 .6 1.6l-3.7.8c.2-1 .5-1.9 1-2.8zm8.8 16.5c-.4 1.1-1.5 1.8-2.5 2.1-.5.1-1 .2-1.4.2-.9 0-1.8-.3-2.6-.8-.8.5-1.7.8-2.6.8h-.1c-.5 0-.9-.1-1.4-.2-1.1-.3-2.1-1-2.5-2.1-.2-.4-.2-.9 0-1.3.2-.5.6-.9 1.1-1.1l.1-.1c.4-.2.9-.3 1.3-.2.4 0 .8.1 1.1.3.5.3.9.8 1.1 1.3.2-.5.6-1 1.1-1.3.3-.2.7-.3 1.1-.3.4 0 .9 0 1.3.2l.1.1c.5.2.9.6 1.1 1.1.2.4.2.9 0 1.3z"
              />
            </svg>
            Shopify
          </button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
