'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, ChevronDown, Plus, Settings, Check, Loader2, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Shop } from '@/lib/shop-types';
import { toast } from 'sonner';

interface ShopSelectorProps {
  selectedShopId: string | null;
  onShopChange: (shopId: string) => void;
  onAddShop?: () => void;
  onManageShops?: () => void;
  isLightMode?: boolean;
  compact?: boolean;
  className?: string;
}

interface ShopsData {
  data: Shop[];
  meta: {
    total: number;
    maxShops: number;
    canAddMore: boolean;
    plan: string;
  };
}

export function ShopSelector({ 
  selectedShopId, 
  onShopChange, 
  onAddShop,
  onManageShops,
  isLightMode = true,
  compact = false,
  className
}: ShopSelectorProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [meta, setMeta] = useState<ShopsData['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const selectedShop = shops.find((s: Shop) => s.id === selectedShopId) || shops.find((s: Shop) => s.is_default) || shops[0];

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/shops');
      if (!response.ok) throw new Error('Erreur chargement boutiques');
      
      const data: ShopsData = await response.json();
      setShops(data.data || []);
      setMeta(data.meta || null);

      // Si aucune boutique sélectionnée, sélectionner la défaut
      if (!selectedShopId && data.data?.length > 0) {
        const defaultShop = data.data.find(s => s.is_default) || data.data[0];
        onShopChange(defaultShop.id);
      }
    } catch (error) {
      console.error('Erreur chargement boutiques:', error);
      toast.error('Impossible de charger les boutiques');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShopSelect = (shopId: string) => {
    onShopChange(shopId);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        isLightMode ? "bg-gray-100" : "bg-white/5",
        className
      )}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onAddShop}
        className={cn("gap-2", className)}
      >
        <Plus className="w-4 h-4" />
        Créer une boutique
      </Button>
    );
  }

  // Version compacte (juste les badges de boutiques)
  if (compact && shops.length <= 5) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {shops.map((shop: Shop) => (
          <button
            key={shop.id}
            onClick={() => handleShopSelect(shop.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              selectedShop?.id === shop.id
                ? "ring-2 ring-offset-2 shadow-sm"
                : "opacity-70 hover:opacity-100",
              isLightMode ? "ring-offset-white" : "ring-offset-[#0f111a]"
            )}
            style={{
              backgroundColor: selectedShop?.id === shop.id 
                ? shop.color 
                : isLightMode ? '#f3f4f6' : '#1f2937',
              color: selectedShop?.id === shop.id ? '#fff' : undefined,
              borderColor: shop.color,
            }}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedShop?.id === shop.id ? '#fff' : shop.color }}
            />
            <span className="max-w-[100px] truncate">
              {shop.display_name || shop.name}
            </span>
            {shop.is_default && (
              <Crown className="w-3 h-3 opacity-70" />
            )}
          </button>
        ))}
        
        {meta?.canAddMore && onAddShop && (
          <button
            onClick={onAddShop}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg border-2 border-dashed transition-colors",
              isLightMode 
                ? "border-gray-300 hover:border-gray-400 text-gray-400 hover:text-gray-600" 
                : "border-gray-600 hover:border-gray-500 text-gray-500 hover:text-gray-400"
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Version dropdown (pour beaucoup de boutiques ou mode non-compact)
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 min-w-[180px] justify-between",
            isLightMode ? "bg-white" : "bg-[#1a1f3a]",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full ring-2 ring-white"
              style={{ backgroundColor: selectedShop?.color || '#3B82F6' }}
            />
            <span className="max-w-[120px] truncate font-medium">
              {selectedShop?.display_name || selectedShop?.name || 'Sélectionner'}
            </span>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className={cn(
          "w-[260px] p-0",
          !isLightMode && "bg-[#1a1f3a] border-white/10"
        )}
      >
        {/* En-tête */}
        <div className={cn(
          "px-3 py-2 border-b flex items-center justify-between",
          isLightMode ? "border-gray-100" : "border-white/10"
        )}>
          <span className="text-xs font-semibold uppercase text-muted-foreground">
            Mes boutiques ({shops.length}{meta?.maxShops !== -1 ? `/${meta?.maxShops}` : ''})
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {meta?.plan}
          </Badge>
        </div>
        
        {/* Liste des boutiques */}
        <div className="max-h-[300px] overflow-y-auto py-1">
          {shops.map((shop) => (
            <DropdownMenuItem
              key={shop.id}
              onClick={() => handleShopSelect(shop.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
                selectedShop?.id === shop.id && (isLightMode ? "bg-blue-50" : "bg-blue-500/10")
              )}
            >
              <div 
                className="w-4 h-4 rounded-full ring-2 ring-offset-2 flex-shrink-0"
                style={{ 
                  backgroundColor: shop.color,
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {shop.display_name || shop.name}
                  </span>
                  {shop.is_default && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Défaut
                    </Badge>
                  )}
                </div>
                {shop.platform && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {shop.platform}
                  </span>
                )}
              </div>
              {selectedShop?.id === shop.id && (
                <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
        
        {/* Actions */}
        <DropdownMenuSeparator />
        <div className="p-2 space-y-1">
          {meta?.canAddMore && onAddShop && (
            <DropdownMenuItem 
              onClick={() => { onAddShop(); setIsOpen(false); }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter une boutique
            </DropdownMenuItem>
          )}
          {onManageShops && (
            <DropdownMenuItem 
              onClick={() => { onManageShops(); setIsOpen(false); }}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Gérer les boutiques
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ShopSelector;
