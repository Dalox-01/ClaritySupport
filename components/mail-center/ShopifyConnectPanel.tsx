"use client";

import { useEffect, useState } from 'react';
import { ShopifyConnectButton } from './ShopifyQuickConnect';

type ShopifyShop = {
  id: string;
  shop_domain: string;
  shop_name: string | null;
  status: string;
  total_orders: number | null;
  total_revenue: number | null;
};

type PlanLimits = {
  plan: string;
  currentShops: number;
  maxShops: number;
  canAddMore: boolean;
  hasAccess: boolean;
};

export function ShopifyConnectPanel({ isLightMode }: { isLightMode?: boolean }) {
  const [shops, setShops] = useState<ShopifyShop[]>([]);
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedPlan = (limits?.plan || '').toUpperCase();
  const displayPlan = normalizedPlan.replace('_SHOPIFY', '') || 'FREE';
  const maxShops = limits && typeof limits.maxShops === 'number' ? limits.maxShops : 0;
  const hasShopifyAccess = limits
    ? Boolean(limits.hasAccess) || maxShops !== 0 || ['STARTER', 'PRO', 'SCALE'].includes(displayPlan)
    : false;
  const canAddMore = limits
    ? Boolean(limits.canAddMore ?? (maxShops === -1 || maxShops > shops.length))
    : false;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/shopify/connect');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Erreur de chargement Shopify');
        setShops(json.shops || []);
        setLimits(json.planLimits || null);
      } catch (e: any) {
        setError(e.message || 'Erreur');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="rounded-lg border p-4 text-sm">Chargement Shopify…</div>;
  }

  if (!hasShopifyAccess) {
    return (
      <div className="rounded-lg border p-4 text-sm">
        Votre plan actuel ne permet pas encore de connecter Shopify.
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Boutiques Shopify connectées</h3>
          {limits && (
            <p className="text-xs text-muted-foreground">
              {limits.currentShops}/{limits.maxShops === -1 ? '∞' : limits.maxShops} boutiques utilisées sur votre plan {displayPlan}
            </p>
          )}
        </div>
      </div>

      {shops.length > 0 && (
        <ul className="space-y-2 text-xs">
          {shops.map((shop) => (
            <li
              key={shop.id}
              className="flex items-center justify-between rounded border px-2 py-1"
            >
              <div>
                <div className="font-medium">{shop.shop_name || shop.shop_domain}</div>
                <div className="text-[11px] text-muted-foreground">
                  {shop.total_orders ?? 0} commandes · {shop.total_revenue ?? 0} € de CA
                </div>
              </div>
              <span className="text-[11px] uppercase text-green-700">{shop.status}</span>
            </li>
          ))}
        </ul>
      )}

      {canAddMore && (
        <div className="space-y-2">
          <label className="text-xs font-medium">
            Connecter une nouvelle boutique Shopify
          </label>
          <ShopifyConnectButton size="sm" fullWidth className="justify-center" isLightMode={isLightMode} />
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
