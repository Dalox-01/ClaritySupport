"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Plus, Trash2, ExternalLink, AlertCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShopifyShop {
  id: string;
  shop_domain: string;
  shop_name: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface ShopifyConnectSimpleProps {
  className?: string;
  isLightMode?: boolean;
}

export function ShopifyConnectSimple({ className, isLightMode = false }: ShopifyConnectSimpleProps) {
  const [shops, setShops] = useState<ShopifyShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [shopDomain, setShopDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [copied, setCopied] = useState(false);

  const loadShops = async () => {
    try {
      const res = await fetch('/api/shopify/shops');
      if (!res.ok) throw new Error('Erreur de chargement');
      
      const data = await res.json();
      setShops(data.shops || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const handleConnect = async () => {
    if (!shopDomain.trim() || !accessToken.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setConnecting(true);

    try {
      const res = await fetch('/api/shopify/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shopDomain: shopDomain.trim(), 
          accessToken: accessToken.trim() 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      toast.success(data.message || 'Boutique connectée !');
      setShopDomain('');
      setAccessToken('');
      setShowForm(false);
      await loadShops();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success('Boutique déconnectée');
      await loadShops();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copié !');
  };

  if (loading) return null;

  return (
    <Card className={cn(
      "p-4 border backdrop-blur-3xl transition-all duration-700 shadow-lg overflow-hidden group",
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
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          E-commerce
        </Badge>
      </div>

      {/* Boutiques connectées */}
      <div className="space-y-2 mb-3">
        {shops.length === 0 ? (
          <div className={cn(
            "text-xs text-center py-4 rounded-lg border border-dashed",
            isLightMode ? "text-gray-500 border-gray-300 bg-gray-50/50" : "text-gray-400 border-gray-700 bg-slate-800/30"
          )}>
            <AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-50" />
            Aucune boutique connectée
          </div>
        ) : (
          shops.map((shop) => (
            <div
              key={shop.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg border transition-colors",
                isLightMode 
                  ? "bg-green-50/50 border-green-200"
                  : "bg-green-500/10 border-green-500/30"
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <ShoppingBag className="w-4 h-4 text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-xs font-medium truncate",
                    isLightMode ? "text-gray-700" : "text-gray-200"
                  )}>
                    {shop.shop_name || shop.shop_domain}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {shop.shop_domain}
                  </div>
                </div>
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {shop.status}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-red-500/20 hover:text-red-400"
                onClick={() => handleDisconnect(shop.id, shop.shop_name || shop.shop_domain)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Formulaire de connexion */}
      {!showForm ? (
        <Button
          className={cn(
            "w-full gap-2 shadow-lg transition-all duration-300",
            isLightMode
              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          )}
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4" />
          Connecter boutique
        </Button>
      ) : (
        <div className="space-y-3">
          {/* Aide */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={cn(
              "w-full text-xs p-2 rounded-lg border text-left transition-colors",
              isLightMode
                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                : "bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
            )}
          >
            <div className="font-semibold mb-1">📖 Comment obtenir l'Access Token ?</div>
            {showHelp && (
              <ol className="list-decimal list-inside space-y-1 text-[11px] opacity-90 mt-2">
                <li>Connectez-vous à votre Shopify Admin</li>
                <li>Allez dans <strong>Paramètres → Apps et canaux de vente</strong></li>
                <li>Cliquez sur <strong>Développer des apps</strong></li>
                <li>Créez une nouvelle app ou sélectionnez une existante</li>
                <li>Dans <strong>API credentials</strong>, révélez l'<strong>Admin API access token</strong></li>
                <li>Copiez le token et collez-le ci-dessous</li>
              </ol>
            )}
          </button>

          {/* Domaine boutique */}
          <div>
            <label className={cn(
              "block text-xs font-medium mb-1",
              isLightMode ? "text-gray-700" : "text-gray-300"
            )}>
              Domaine Shopify
            </label>
            <input
              type="text"
              placeholder="ma-boutique.myshopify.com"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              className={cn(
                "w-full px-3 py-2 text-sm rounded-lg border transition-colors",
                isLightMode
                  ? "bg-white border-gray-300 focus:border-green-500 text-gray-900"
                  : "bg-slate-800/50 border-slate-600 focus:border-green-500 text-white"
              )}
            />
          </div>

          {/* Access Token */}
          <div>
            <label className={cn(
              "block text-xs font-medium mb-1",
              isLightMode ? "text-gray-700" : "text-gray-300"
            )}>
              Admin API Access Token
            </label>
            <input
              type="password"
              placeholder="shpat_xxxxxxxxxxxxx"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className={cn(
                "w-full px-3 py-2 text-sm rounded-lg border font-mono transition-colors",
                isLightMode
                  ? "bg-white border-gray-300 focus:border-green-500 text-gray-900"
                  : "bg-slate-800/50 border-slate-600 focus:border-green-500 text-white"
              )}
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowForm(false);
                setShopDomain('');
                setAccessToken('');
              }}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              className={cn(
                "flex-1",
                isLightMode
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              )}
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? 'Connexion...' : 'Connecter'}
            </Button>
          </div>
        </div>
      )}

      {/* Lien aide */}
      <a
        href="https://help.shopify.com/fr/manual/apps/app-types/custom-apps"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center justify-center gap-1 mt-3 text-xs transition-colors",
          isLightMode 
            ? "text-gray-500 hover:text-green-600"
            : "text-gray-400 hover:text-green-400"
        )}
      >
        <ExternalLink className="w-3 h-3" />
        Aide Shopify Custom Apps
      </a>
    </Card>
  );
}
