"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Plus, Trash2, Zap, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShopifyShop {
  id: string;
  shop_domain: string;
  shop_name: string;
  status: 'active' | 'inactive';
}

interface ShopifyOneClickProps {
  className?: string;
  isLightMode?: boolean;
}

export function ShopifyOneClick({ className, isLightMode = false }: ShopifyOneClickProps) {
  const [shops, setShops] = useState<ShopifyShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [shopDomain, setShopDomain] = useState('');

  const loadShops = async () => {
    try {
      const res = await fetch('/api/shopify/shops');
      if (res.ok) {
        const data = await res.json();
        setShops(data.shops || []);
      }
    } catch (error) {
      console.error('Error loading shops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();

    // Détecter succès OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get('shopify_success') === 'true') {
      const shopName = params.get('shop');
      toast.success(`✅ Boutique ${shopName} connectée !`);
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => loadShops(), 500);
    } else if (params.get('shopify_error')) {
      toast.error(`❌ Erreur: ${params.get('shopify_error')}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleConnect = async () => {
    if (!shopDomain.trim()) {
      toast.error('Entrez le nom de votre boutique');
      return;
    }

    setConnecting(true);

    try {
      const res = await fetch('/api/shopify/oauth/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopDomain: shopDomain.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur');
      }

      // Rediriger vers Shopify pour autorisation
      window.location.href = data.authUrl;

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur');
      setConnecting(false);
    }
  };

  const handleDisconnect = async (shopId: string, shopName: string) => {
    if (!confirm(`Déconnecter ${shopName} ?`)) return;

    try {
      const res = await fetch('/api/shopify/shops', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId }),
      });

      if (!res.ok) throw new Error('Erreur');

      toast.success('Boutique déconnectée');
      await loadShops();

    } catch (error) {
      toast.error('Erreur de déconnexion');
    }
  };

  if (loading) return null;

  return (
    <Card className={cn(
      "p-4 border backdrop-blur-3xl transition-all duration-700 shadow-lg",
      isLightMode 
        ? "border-gray-200 bg-white shadow-gray-100/50" 
        : "border-slate-700/40 bg-slate-900/30 shadow-black/20",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn(
          "font-semibold text-xs uppercase tracking-wide flex items-center gap-2",
          isLightMode ? "text-gray-700" : "text-slate-200"
        )}>
          <ShoppingBag className={cn("w-4 h-4", isLightMode ? "text-green-600" : "text-green-400")} />
          Shopify
        </h3>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          1 clic
        </Badge>
      </div>

      {/* Boutiques connectées */}
      <div className="space-y-2 mb-3">
        {shops.length === 0 ? (
          <div className={cn(
            "text-xs text-center py-3 rounded-lg border border-dashed",
            isLightMode ? "text-gray-500 border-gray-300 bg-gray-50/50" : "text-gray-400 border-gray-700 bg-slate-800/30"
          )}>
            Aucune boutique connectée
          </div>
        ) : (
          shops.map((shop) => (
            <div
              key={shop.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg border",
                isLightMode 
                  ? "bg-green-50/50 border-green-200"
                  : "bg-green-500/10 border-green-500/30"
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                <Check className="w-4 h-4 text-green-500" />
                <div className="flex-1">
                  <div className={cn(
                    "text-xs font-medium",
                    isLightMode ? "text-gray-700" : "text-gray-200"
                  )}>
                    {shop.shop_name}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {shop.shop_domain}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-red-500/20 hover:text-red-400"
                onClick={() => handleDisconnect(shop.id, shop.shop_name)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Formulaire 1 clic */}
      {!showForm ? (
        <Button
          className={cn(
            "w-full gap-2 shadow-lg",
            isLightMode
              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          )}
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4" />
          Connecter en 1 clic
        </Button>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="ma-boutique (ou ma-boutique.myshopify.com)"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            className={cn(
              "w-full px-3 py-2 text-sm rounded-lg border",
              isLightMode
                ? "bg-white border-gray-300 focus:border-green-500 text-gray-900"
                : "bg-slate-800/50 border-slate-600 focus:border-green-500 text-white"
            )}
            autoFocus
          />
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowForm(false);
                setShopDomain('');
              }}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              className={cn(
                "flex-1 gap-1",
                isLightMode
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              )}
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? (
                'Redirection...'
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  Connecter
                </>
              )}
            </Button>
          </div>

          <p className={cn(
            "text-[10px] text-center",
            isLightMode ? "text-gray-500" : "text-gray-400"
          )}>
            Vous serez redirigé vers Shopify pour autoriser l'accès
          </p>
        </div>
      )}
    </Card>
  );
}
