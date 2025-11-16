"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Plus, Trash2, ExternalLink, AlertCircle, HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShopifyShop {
  id: string;
  shop_domain: string;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
}

interface ShopifyConnectButtonProps {
  className?: string;
  isLightMode?: boolean;
}

interface CustomDomainError {
  error: string;
  customDomain: string;
  message: string;
  helpUrl: string;
}

export function ShopifyConnectButton({ className, isLightMode = false }: ShopifyConnectButtonProps) {
  const [shops, setShops] = useState<ShopifyShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [shopDomain, setShopDomain] = useState('');
  const [maxShops, setMaxShops] = useState(1);
  const [customDomainError, setCustomDomainError] = useState<CustomDomainError | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Charger les boutiques connectées
  const loadShops = async () => {
    try {
      const res = await fetch('/api/shopify/connect');
      const data = await res.json();

      if (res.status === 403) {
        // Utilisateur n'a pas accès à Shopify (plan freelance)
        return null;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de chargement');
      }

      setShops(data.shops || []);
      setMaxShops(data.planLimits?.maxShops || 1);
    } catch (error) {
      console.error('Erreur chargement boutiques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const handleConnect = async () => {
    if (!shopDomain.trim()) {
      toast.error('Veuillez entrer le domaine de votre boutique');
      return;
    }

    setConnecting(true);
    setCustomDomainError(null);

    try {
      const res = await fetch('/api/shopify/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopDomain: shopDomain.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Gérer l'erreur de domaine personnalisé
        if (res.status === 400 && data.customDomain) {
          setCustomDomainError(data as CustomDomainError);
          return;
        }
        
        throw new Error(data.message || data.error || 'Erreur de connexion');
      }

      toast.success(data.message || 'Boutique connectée !');
      setShopDomain('');
      setShowDialog(false);
      setCustomDomainError(null);
      await loadShops();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (shopId: string, shopDomain: string) => {
    if (!confirm(`Déconnecter ${shopDomain} ?`)) return;

    try {
      const res = await fetch('/api/shopify/connect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur de déconnexion');
      }

      toast.success('Boutique déconnectée');
      await loadShops();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de déconnexion');
    }
  };

  // Si loading ou pas d'accès (retour 403), ne rien afficher
  if (loading) return null;

  return (
    <Card className={cn(
      "p-4 border backdrop-blur-3xl transition-all duration-700 shadow-lg overflow-hidden group",
      isLightMode 
        ? "border-gray-200 bg-white shadow-gray-100/50 hover:shadow-lg" 
        : "border-slate-700/40 bg-slate-900/30 shadow-black/20 hover:bg-slate-900/40 hover:border-slate-600/50",
      className
    )}>
      {/* Effet de brillance */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br",
        isLightMode 
          ? "from-green-50/50 via-transparent to-green-50/50"
          : "from-green-500/5 via-transparent to-emerald-500/5"
      )} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
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
      <div className="space-y-2 mb-3 relative z-10">
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
                  ? "bg-green-50/50 border-green-200 hover:bg-green-100/50"
                  : "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <ShoppingBag className="w-4 h-4 text-green-500 shrink-0" />
                <span className={cn(
                  "text-xs font-medium truncate",
                  isLightMode ? "text-gray-700" : "text-gray-200"
                )}>
                  {shop.shop_domain}
                </span>
                <Badge 
                  variant={shop.status === 'active' ? 'default' : 'secondary'}
                  className="text-[10px] px-1.5 py-0"
                >
                  {shop.status}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-red-500/20 hover:text-red-400"
                onClick={() => handleDisconnect(shop.id, shop.shop_domain)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Bouton d'ajout */}
      {!showDialog ? (
        <Button
          className={cn(
            "w-full gap-2 shadow-lg transition-all duration-300",
            shops.length >= maxShops
              ? "opacity-50 cursor-not-allowed"
              : "",
            isLightMode
              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-500/30"
              : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-green-500/50"
          )}
          onClick={() => setShowDialog(true)}
          disabled={shops.length >= maxShops}
        >
          <Plus className="w-4 h-4" />
          Connecter boutique
          {shops.length > 0 && ` (${shops.length}/${maxShops})`}
        </Button>
      ) : (
        <div className="space-y-2">
          {/* Message d'erreur domaine personnalisé */}
          {customDomainError && (
            <div className={cn(
              "p-3 rounded-lg border space-y-2",
              isLightMode
                ? "bg-orange-50 border-orange-300 text-orange-900"
                : "bg-orange-500/10 border-orange-500/30 text-orange-300"
            )}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1 text-xs">
                  <div className="font-semibold mb-1">⚠️ Domaine personnalisé détecté</div>
                  <div className="text-xs opacity-90 whitespace-pre-line">
                    {customDomainError.message}
                  </div>
                </div>
              </div>
              <a
                href={customDomainError.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-1 text-xs font-medium transition-colors",
                  isLightMode
                    ? "text-orange-700 hover:text-orange-900"
                    : "text-orange-400 hover:text-orange-300"
                )}
              >
                <ExternalLink className="w-3 h-3" />
                Aide Shopify
              </a>
            </div>
          )}

          {/* Input avec tooltip */}
          <div className="relative">
            <input
              type="text"
              placeholder="Exemple: ma-boutique ou ma-boutique.myshopify.com"
              value={shopDomain}
              onChange={(e) => {
                setShopDomain(e.target.value);
                setCustomDomainError(null);
              }}
              className={cn(
                "w-full px-3 py-2 pr-8 text-sm rounded-lg border transition-colors",
                isLightMode
                  ? "bg-white border-gray-300 focus:border-green-500 text-gray-900 placeholder:text-gray-400"
                  : "bg-slate-800/50 border-slate-600 focus:border-green-500 text-white placeholder:text-gray-500"
              )}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            />
            
            {/* Tooltip icon */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className={cn(
                  "p-1 rounded-full transition-colors",
                  isLightMode
                    ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    : "text-gray-500 hover:text-gray-300 hover:bg-slate-700"
                )}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              
              {/* Tooltip content */}
              {showTooltip && (
                <div className={cn(
                  "absolute right-0 bottom-full mb-2 w-64 p-3 rounded-lg shadow-xl text-xs z-50 border",
                  isLightMode
                    ? "bg-white border-gray-200 text-gray-700"
                    : "bg-slate-800 border-slate-600 text-gray-200"
                )}>
                  <div className="font-semibold mb-1.5 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Comment trouver mon domaine Shopify ?
                  </div>
                  <ol className="space-y-1 list-decimal list-inside text-xs opacity-90">
                    <li>Connectez-vous à Shopify Admin</li>
                    <li>Allez dans Paramètres → Domaines</li>
                    <li>Cherchez le domaine se terminant par <span className="font-mono font-semibold">.myshopify.com</span></li>
                    <li>Copiez-le ici (exemple: <span className="font-mono">ma-boutique.myshopify.com</span>)</li>
                  </ol>
                  <div className={cn(
                    "mt-2 pt-2 border-t text-xs",
                    isLightMode ? "border-gray-200" : "border-slate-600"
                  )}>
                    💡 N'utilisez pas votre domaine personnalisé
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowDialog(false);
                setShopDomain('');
                setCustomDomainError(null);
              }}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              className={cn(
                "flex-1 gap-2",
                isLightMode
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              )}
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? 'Connexion...' : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  Connecter
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Lien vers la doc Shopify */}
      <a
        href="https://help.shopify.com/fr"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center justify-center gap-1 mt-3 text-xs transition-colors relative z-10",
          isLightMode 
            ? "text-gray-500 hover:text-green-600"
            : "text-gray-400 hover:text-green-400"
        )}
      >
        <ExternalLink className="w-3 h-3" />
        Aide Shopify
      </a>
    </Card>
  );
}
