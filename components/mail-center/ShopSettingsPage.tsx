'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Plus, Edit2, Trash2, Check, X, Loader2, 
  Settings, Palette, Link2, Crown, Mail, FileSignature,
  Bot, ChevronRight, ExternalLink, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { SHOP_COLORS, type Shop, type CreateShopInput } from '@/lib/shop-types';
import { toast } from 'sonner';

interface ShopSettingsPageProps {
  isLightMode?: boolean;
  onShopSelect?: (shopId: string) => void;
}

interface ShopWithDetails extends Shop {
  signatures_count?: number;
  has_ai_config?: boolean;
  email_accounts_count?: number;
}

export function ShopSettingsPage({ isLightMode = true, onShopSelect }: ShopSettingsPageProps) {
  const [shops, setShops] = useState<ShopWithDetails[]>([]);
  const [meta, setMeta] = useState<{ maxShops: number; canAddMore: boolean; plan: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<ShopWithDetails | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<ShopWithDetails | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateShopInput>({
    name: '',
    display_name: '',
    description: '',
    color: '#3B82F6',
    platform: null,
    shop_domain: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/shops');
      if (!response.ok) throw new Error('Erreur chargement');
      
      const data = await response.json();
      setShops(data.data || []);
      setMeta(data.meta || null);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les boutiques');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShop = async () => {
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur création');
      }

      toast.success('Boutique créée avec succès');
      setIsAddModalOpen(false);
      resetForm();
      loadShops();
    } catch (error: any) {
      console.error('Erreur création:', error);
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateShop = async () => {
    if (!selectedShop) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/shops/${selectedShop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur mise à jour');
      }

      toast.success('Boutique mise à jour');
      setIsEditModalOpen(false);
      setSelectedShop(null);
      resetForm();
      loadShops();
    } catch (error: any) {
      console.error('Erreur mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteShop = async () => {
    if (!shopToDelete) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/shops/${shopToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur suppression');
      }

      toast.success('Boutique supprimée');
      setIsDeleteDialogOpen(false);
      setShopToDelete(null);
      loadShops();
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (shop: ShopWithDetails) => {
    try {
      const response = await fetch(`/api/shops/${shop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      });

      if (!response.ok) throw new Error('Erreur');

      toast.success(`${shop.display_name || shop.name} est maintenant la boutique par défaut`);
      loadShops();
    } catch (error) {
      toast.error('Erreur lors du changement');
    }
  };

  const openEditModal = (shop: ShopWithDetails) => {
    setSelectedShop(shop);
    setFormData({
      name: shop.name,
      display_name: shop.display_name || '',
      description: shop.description || '',
      color: shop.color,
      platform: shop.platform,
      shop_domain: shop.shop_domain || '',
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      color: '#3B82F6',
      platform: null,
      shop_domain: '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn("text-2xl font-bold", isLightMode ? "text-gray-900" : "text-white")}>
            Paramètres Boutiques
          </h2>
          <p className="text-muted-foreground mt-1">
            Gérez vos boutiques et leurs configurations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {shops.length}{meta?.maxShops !== -1 ? `/${meta?.maxShops}` : ''} boutique{shops.length > 1 ? 's' : ''}
          </Badge>
          
          {meta?.canAddMore && (
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle boutique
            </Button>
          )}
        </div>
      </div>

      {/* Liste des boutiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shops.map((shop) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <Card 
                className={cn(
                  "relative overflow-hidden transition-all hover:shadow-md cursor-pointer group",
                  isLightMode ? "bg-white border-gray-200" : "bg-[#1a1f3a] border-white/10",
                  shop.is_default && "ring-2 ring-offset-2",
                  isLightMode ? "ring-offset-white" : "ring-offset-[#0f111a]"
                )}
                style={{ 
                  borderTopColor: shop.color, 
                  borderTopWidth: '3px',
                }}
                onClick={() => onShopSelect?.(shop.id)}
              >
                {/* Badge par défaut */}
                {shop.is_default && (
                  <div 
                    className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                    style={{ backgroundColor: shop.color }}
                  >
                    <Crown className="w-3 h-3" />
                    Défaut
                  </div>
                )}

                {/* Menu actions */}
                <div 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!shop.is_default && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(shop)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSetDefault(shop)}>
                          <Crown className="w-4 h-4 mr-2" />
                          Définir par défaut
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => { setShopToDelete(shop); setIsDeleteDialogOpen(true); }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="p-4 pt-6">
                  {/* Nom et description */}
                  <div className="flex items-start gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: shop.color + '20' }}
                    >
                      <Store className="w-5 h-5" style={{ color: shop.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-semibold truncate",
                        isLightMode ? "text-gray-900" : "text-white"
                      )}>
                        {shop.display_name || shop.name}
                      </h3>
                      {shop.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                          {shop.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className={cn(
                      "flex flex-col items-center p-2 rounded-lg",
                      isLightMode ? "bg-gray-50" : "bg-white/5"
                    )}>
                      <Mail className="w-4 h-4 text-blue-500 mb-1" />
                      <span className="text-xs font-semibold">{shop.email_accounts_count || 0}</span>
                      <span className="text-[10px] text-muted-foreground">Emails</span>
                    </div>
                    <div className={cn(
                      "flex flex-col items-center p-2 rounded-lg",
                      isLightMode ? "bg-gray-50" : "bg-white/5"
                    )}>
                      <FileSignature className="w-4 h-4 text-purple-500 mb-1" />
                      <span className="text-xs font-semibold">{shop.signatures_count || 0}</span>
                      <span className="text-[10px] text-muted-foreground">Signatures</span>
                    </div>
                    <div className={cn(
                      "flex flex-col items-center p-2 rounded-lg",
                      isLightMode ? "bg-gray-50" : "bg-white/5"
                    )}>
                      <Bot className="w-4 h-4 text-green-500 mb-1" />
                      <span className="text-xs font-semibold">{shop.has_ai_config ? '✓' : '—'}</span>
                      <span className="text-[10px] text-muted-foreground">IA</span>
                    </div>
                  </div>

                  {/* Plateforme */}
                  {shop.platform && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Link2 className="w-3 h-3" />
                      <span className="capitalize">{shop.platform}</span>
                      {shop.shop_domain && (
                        <>
                          <span>•</span>
                          <a 
                            href={`https://${shop.shop_domain}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-500 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {shop.shop_domain}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => { e.stopPropagation(); openEditModal(shop); }}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Configurer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); /* TODO: Navigate to signatures */ }}
                    >
                      <FileSignature className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Carte d'ajout */}
          {meta?.canAddMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card 
                className={cn(
                  "h-full min-h-[200px] flex flex-col items-center justify-center cursor-pointer border-2 border-dashed transition-colors",
                  isLightMode 
                    ? "bg-gray-50/50 border-gray-200 hover:border-blue-400 hover:bg-blue-50/50" 
                    : "bg-white/5 border-white/10 hover:border-blue-400 hover:bg-blue-500/10"
                )}
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-muted-foreground">
                  Ajouter une boutique
                </span>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Création/Édition */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedShop(null);
          resetForm();
        }
      }}>
        <DialogContent className={cn(
          "sm:max-w-[500px]",
          !isLightMode && "bg-[#1a1f3a] border-white/10"
        )}>
          <DialogHeader>
            <DialogTitle>
              {isEditModalOpen ? 'Modifier la boutique' : 'Nouvelle boutique'}
            </DialogTitle>
            <DialogDescription>
              {isEditModalOpen 
                ? 'Modifiez les informations de votre boutique' 
                : 'Créez une nouvelle boutique pour gérer vos emails et configurations IA'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la boutique *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Ma Boutique Mode"
              />
            </div>

            {/* Nom d'affichage */}
            <div className="space-y-2">
              <Label htmlFor="display_name">Nom d'affichage</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Ex: Boutique Mode (affiché dans les signatures)"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez brièvement votre boutique..."
                rows={2}
              />
            </div>

            {/* Couleur */}
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2">
                {SHOP_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={cn(
                      "w-8 h-8 rounded-lg transition-transform hover:scale-110",
                      formData.color === color.value && "ring-2 ring-offset-2 scale-110"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {formData.color === color.value && (
                      <Check className="w-4 h-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Plateforme (optionnel) */}
            <div className="space-y-2">
              <Label htmlFor="shop_domain">Domaine de la boutique (optionnel)</Label>
              <Input
                id="shop_domain"
                value={formData.shop_domain}
                onChange={(e) => setFormData({ ...formData, shop_domain: e.target.value })}
                placeholder="Ex: maboutique.myshopify.com"
              />
              <p className="text-xs text-muted-foreground">
                Si votre boutique est liée à une plateforme e-commerce
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={isEditModalOpen ? handleUpdateShop : handleCreateShop}
              disabled={isSaving || !formData.name.trim()}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isEditModalOpen ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isEditModalOpen ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la boutique ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les signatures et configurations IA 
              associées à "{shopToDelete?.display_name || shopToDelete?.name}" seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteShop}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ShopSettingsPage;
