'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSignature, Plus, Edit2, Trash2, Check, X, Loader2,
  Eye, Save, Copy, Star, Mail, Phone, Globe, MapPin,
  Facebook, Twitter, Instagram, Linkedin, Youtube, Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  CLOSING_TEXTS, 
  formatSignatureText, 
  formatSignatureHtml,
  type ShopEmailSignature,
  type CreateSignatureInput 
} from '@/lib/shop-types';
import { toast } from 'sonner';

interface SignatureEditorProps {
  shopId: string;
  shopName?: string;
  isLightMode?: boolean;
  userPlan?: string;
  onSignatureChange?: (signature: ShopEmailSignature | null) => void;
}

export function SignatureEditor({ 
  shopId, 
  shopName = 'Ma Boutique',
  isLightMode = true,
  userPlan,
  onSignatureChange 
}: SignatureEditorProps) {
  const [signatures, setSignatures] = useState<ShopEmailSignature[]>([]);
  const [meta, setMeta] = useState<{ maxSignatures: number; canAddMore: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSignature, setSelectedSignature] = useState<ShopEmailSignature | null>(null);
  
  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [signatureToDelete, setSignatureToDelete] = useState<ShopEmailSignature | null>(null);
  const [previewTab, setPreviewTab] = useState<'text' | 'html'>('text');
  
  // Form state
  const [formData, setFormData] = useState<Partial<CreateSignatureInput>>({
    name: '',
    closing_text: 'Cordialement,',
    sender_name: '',
    sender_email: '',
    sender_title: '',
    phone: '',
    website: '',
    address: '',
    social_links: {},
    logo_url: '',
    is_default: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (shopId) {
      loadSignatures();
    }
  }, [shopId]);

  const loadSignatures = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/shops/${shopId}/signatures`);
      if (!response.ok) throw new Error('Erreur chargement');
      
      const data = await response.json();
      setSignatures(data.data || []);
      setMeta(data.meta || null);
      
      // Sélectionner la signature par défaut
      const defaultSig = data.data?.find((s: ShopEmailSignature) => s.is_default);
      if (defaultSig) {
        setSelectedSignature(defaultSig);
        onSignatureChange?.(defaultSig);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les signatures');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.sender_name?.trim()) {
      toast.error('Le nom de l\'expéditeur est requis');
      return;
    }

    try {
      setIsSaving(true);
      
      const url = isEditing && selectedSignature
        ? `/api/shops/${shopId}/signatures/${selectedSignature.id}`
        : `/api/shops/${shopId}/signatures`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          shop_id: shopId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur sauvegarde');
      }

      toast.success(isEditing ? 'Signature mise à jour' : 'Signature créée');
      setIsEditorOpen(false);
      resetForm();
      loadSignatures();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!signatureToDelete) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/shops/${shopId}/signatures/${signatureToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur suppression');
      }

      toast.success('Signature supprimée');
      setIsDeleteDialogOpen(false);
      setSignatureToDelete(null);
      loadSignatures();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (signature: ShopEmailSignature) => {
    try {
      const response = await fetch(`/api/shops/${shopId}/signatures/${signature.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      });

      if (!response.ok) throw new Error('Erreur');

      toast.success('Signature par défaut mise à jour');
      loadSignatures();
    } catch (error) {
      toast.error('Erreur lors du changement');
    }
  };

  const openEditor = (signature?: ShopEmailSignature) => {
    if (signature) {
      setIsEditing(true);
      setSelectedSignature(signature);
      setFormData({
        name: signature.name,
        closing_text: signature.closing_text,
        sender_name: signature.sender_name,
        sender_email: signature.sender_email || '',
        sender_title: signature.sender_title || '',
        phone: signature.phone || '',
        website: signature.website || '',
        address: signature.address || '',
        social_links: signature.social_links || {},
        logo_url: signature.logo_url || '',
        is_default: signature.is_default,
      });
    } else {
      setIsEditing(false);
      setSelectedSignature(null);
      resetForm();
    }
    setIsEditorOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: 'Nouvelle signature',
      closing_text: 'Cordialement,',
      sender_name: `L'équipe ${shopName}`,
      sender_email: '',
      sender_title: '',
      phone: '',
      website: '',
      address: '',
      social_links: {},
      logo_url: '',
      is_default: signatures.length === 0,
    });
    setIsEditing(false);
    setSelectedSignature(null);
  };

  // Générer un aperçu de signature à partir du formulaire
  const previewSignature: ShopEmailSignature = {
    id: 'preview',
    shop_id: shopId,
    user_id: '',
    name: formData.name || '',
    closing_text: formData.closing_text || 'Cordialement,',
    sender_name: formData.sender_name || '',
    sender_email: formData.sender_email || null,
    sender_title: formData.sender_title || null,
    phone: formData.phone || null,
    website: formData.website || null,
    address: formData.address || null,
    social_links: formData.social_links || {},
    logo_url: formData.logo_url || null,
    logo_width: 150,
    custom_html: null,
    is_default: false,
    is_active: true,
    created_at: '',
    updated_at: '',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSignature className="w-5 h-5 text-purple-500" />
          <h3 className={cn("font-semibold", isLightMode ? "text-gray-900" : "text-white")}>
            Signatures Email
          </h3>
          <Badge variant="secondary">
            {signatures.length}{meta?.maxSignatures !== -1 ? `/${meta?.maxSignatures}` : ''}
          </Badge>
        </div>
        
        {meta?.canAddMore && (
          <Button size="sm" variant="outline" onClick={() => openEditor()} className="gap-1">
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        )}
      </div>

      {/* Liste des signatures */}
      {signatures.length === 0 ? (
        <Card className={cn(
          "p-6 text-center border-dashed",
          isLightMode ? "bg-gray-50" : "bg-white/5"
        )}>
          <FileSignature className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <p className="text-muted-foreground mb-3">Aucune signature configurée</p>
          <Button size="sm" onClick={() => openEditor()}>
            <Plus className="w-4 h-4 mr-1" />
            Créer une signature
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {signatures.map((sig) => (
            <Card 
              key={sig.id}
              className={cn(
                "p-3 flex items-center gap-3 group transition-colors cursor-pointer",
                isLightMode ? "hover:bg-gray-50" : "hover:bg-white/5",
                sig.is_default && "ring-1 ring-purple-500/50"
              )}
              onClick={() => { setSelectedSignature(sig); onSignatureChange?.(sig); }}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                isLightMode ? "bg-purple-50" : "bg-purple-500/10"
              )}>
                <FileSignature className="w-5 h-5 text-purple-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{sig.name}</span>
                  {sig.is_default && (
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                      <Star className="w-3 h-3 mr-0.5" />
                      Défaut
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {sig.sender_name} {sig.sender_email && `• ${sig.sender_email}`}
                </p>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!sig.is_default && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); handleSetDefault(sig); }}
                    title="Définir par défaut"
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8"
                  onClick={(e) => { e.stopPropagation(); openEditor(sig); }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                {signatures.length > 1 && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setSignatureToDelete(sig); 
                      setIsDeleteDialogOpen(true); 
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Éditeur */}
      <Dialog open={isEditorOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditorOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className={cn(
          "sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col",
          !isLightMode && "bg-[#1a1f3a] border-white/10"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-purple-500" />
              {isEditing ? 'Modifier la signature' : 'Nouvelle signature'}
            </DialogTitle>
            <DialogDescription>
              Cette signature sera automatiquement ajoutée aux réponses générées par l'IA
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-6 py-4">
              {/* Formulaire */}
              <div className="space-y-4">
                {/* Nom de la signature */}
                <div className="space-y-2">
                  <Label htmlFor="sig-name">Nom de la signature</Label>
                  <Input
                    id="sig-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Signature principale"
                  />
                </div>

                {/* Formule de politesse */}
                <div className="space-y-2">
                  <Label>Formule de politesse</Label>
                  <Select
                    value={formData.closing_text}
                    onValueChange={(value) => setFormData({ ...formData, closing_text: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CLOSING_TEXTS.map((text) => (
                        <SelectItem key={text} value={text}>{text}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nom expéditeur */}
                <div className="space-y-2">
                  <Label htmlFor="sender-name">Nom de l'expéditeur *</Label>
                  <Input
                    id="sender-name"
                    value={formData.sender_name}
                    onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                    placeholder="Ex: L'équipe Support"
                  />
                </div>

                {/* Titre */}
                <div className="space-y-2">
                  <Label htmlFor="sender-title">Titre / Fonction</Label>
                  <Input
                    id="sender-title"
                    value={formData.sender_title}
                    onChange={(e) => setFormData({ ...formData, sender_title: e.target.value })}
                    placeholder="Ex: Responsable Service Client"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="sender-email" className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </Label>
                  <Input
                    id="sender-email"
                    type="email"
                    value={formData.sender_email}
                    onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                    placeholder="support@monsite.fr"
                  />
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Téléphone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01 23 45 67 89"
                  />
                </div>

                {/* Site web */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Site web
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="www.monsite.fr"
                  />
                </div>

                {/* Adresse */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Adresse
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Rue Example, 75001 Paris"
                  />
                </div>
              </div>

              {/* Aperçu */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Aperçu</Label>
                  <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as 'text' | 'html')}>
                    <TabsList className="h-7">
                      <TabsTrigger value="text" className="text-xs px-2 py-1">Texte</TabsTrigger>
                      <TabsTrigger value="html" className="text-xs px-2 py-1">HTML</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Card className={cn(
                  "p-4 min-h-[300px]",
                  isLightMode ? "bg-gray-50" : "bg-black/20"
                )}>
                  {previewTab === 'text' ? (
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {formatSignatureText(previewSignature)}
                    </pre>
                  ) : (
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: formatSignatureHtml(previewSignature) }}
                    />
                  )}
                </Card>

                <p className="text-xs text-muted-foreground">
                  💡 Cette signature sera automatiquement ajoutée à la fin des réponses générées par l'IA.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !formData.sender_name?.trim()}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la signature ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La signature "{signatureToDelete?.name}" sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

export default SignatureEditor;
