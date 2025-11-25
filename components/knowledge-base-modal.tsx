'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Edit, Search, Tag, DollarSign, Package, Database, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { DraggableWindow } from './draggable-window';
import { 
  Product, 
  CompanyInfo, 
  FAQ,
  KnowledgeBaseManager,
  loadKnowledgeBase,
  saveKnowledgeBase 
} from '@/lib/product-knowledge';
import { toast } from 'sonner';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
}

export function KnowledgeBaseModal({ isOpen, onClose, zIndex, onFocus }: KnowledgeBaseModalProps) {
  const [kb, setKb] = useState<KnowledgeBaseManager | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'company' | 'faq'>('products');
  
  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  
  // Company Info
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({ name: '' });
  
  // FAQ
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingFAQ, setEditingFAQ] = useState<{ index: number; faq: FAQ } | null>(null);
  const [showFAQForm, setShowFAQForm] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    if (isOpen) {
      const savedKB = loadKnowledgeBase();
      const manager = new KnowledgeBaseManager(savedKB || undefined);
      setKb(manager);
      
      const data = manager.export();
      setProducts(data.products);
      setCompanyInfo(data.companyInfo);
      setFaqs(data.generalFAQ);
    }
  }, [isOpen]);

  const saveAll = () => {
    if (!kb) return;
    const data = kb.export();
    saveKnowledgeBase(data);
    toast.success('Base de connaissances sauvegardée');
  };

  const addProduct = (product: Product) => {
    if (!kb) return;
    kb.addProduct(product);
    setProducts(kb.export().products);
    setShowProductForm(false);
    setEditingProduct(null);
    saveAll();
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    if (!kb) return;
    kb.updateProduct(productId, updates);
    setProducts(kb.export().products);
    setShowProductForm(false);
    setEditingProduct(null);
    saveAll();
  };

  const deleteProduct = (productId: string) => {
    if (!kb) return;
    kb.deleteProduct(productId);
    setProducts(kb.export().products);
    saveAll();
  };

  const updateCompanyInfo = (updates: Partial<CompanyInfo>) => {
    if (!kb) return;
    kb.updateCompanyInfo(updates);
    setCompanyInfo(kb.getCompanyInfo());
    saveAll();
  };

  const addFAQ = (faq: FAQ) => {
    if (!kb) return;
    kb.addFAQ(faq);
    setFaqs(kb.export().generalFAQ);
    setShowFAQForm(false);
    setEditingFAQ(null);
    saveAll();
  };

  const updateFAQ = (index: number, faq: FAQ) => {
    if (!kb) return;
    kb.updateFAQ(index, faq);
    setFaqs(kb.export().generalFAQ);
    setShowFAQForm(false);
    setEditingFAQ(null);
    saveAll();
  };

  const deleteFAQ = (index: number) => {
    if (!kb) return;
    kb.deleteFAQ(index);
    setFaqs(kb.export().generalFAQ);
    saveAll();
  };

  if (!isOpen) return null;

  return (
    <DraggableWindow
      title="📚 Base de Connaissances"
      isOpen={isOpen}
      width="1100px"
      height="750px"
      onClose={onClose}
      zIndex={zIndex}
      onFocus={onFocus}
    >
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">
                <Package className="w-4 h-4 mr-2" />
                Produits
              </TabsTrigger>
              <TabsTrigger value="company">
                <DollarSign className="w-4 h-4 mr-2" />
                Entreprise
              </TabsTrigger>
              <TabsTrigger value="faq">
                <Tag className="w-4 h-4 mr-2" />
                FAQ
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 pb-6">
            <TabsContent value="products" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    Catalogue Produits ({products.length})
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Documentez vos produits pour enrichir les réponses IA
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductForm(true);
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau produit
                </Button>
              </div>

              {showProductForm && (
                <ProductForm
                  product={editingProduct}
                  onSave={(product) => {
                    if (editingProduct) {
                      updateProduct(editingProduct.id, product);
                    } else {
                      addProduct({ ...product, id: Date.now().toString() });
                    }
                  }}
                  onCancel={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                />
              )}

              <div className="grid gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{product.name}</h4>
                          {product.price && (
                            <Badge className="bg-green-500">{product.price}€</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {product.description}
                        </p>
                        {product.features.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Caractéristiques:</p>
                            <div className="flex flex-wrap gap-1">
                              {product.features.map((feature, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {product.tags.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {product.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">#{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {products.length === 0 && !showProductForm && (
                  <Card className="p-8 text-center">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Aucun produit dans le catalogue</p>
                    <p className="text-xs text-gray-400 mt-1">Ajoutez votre premier produit pour commencer</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="company" className="space-y-4 mt-4">
              <CompanyInfoForm
                companyInfo={companyInfo}
                onSave={updateCompanyInfo}
              />
            </TabsContent>

            <TabsContent value="faq" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    FAQ Générale ({faqs.length})
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Questions fréquentes pour réponses rapides
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEditingFAQ(null);
                    setShowFAQForm(true);
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle FAQ
                </Button>
              </div>

              {showFAQForm && (
                <FAQForm
                  faq={editingFAQ?.faq || null}
                  onSave={(faq) => {
                    if (editingFAQ !== null) {
                      updateFAQ(editingFAQ.index, faq);
                    } else {
                      addFAQ(faq);
                    }
                  }}
                  onCancel={() => {
                    setShowFAQForm(false);
                    setEditingFAQ(null);
                  }}
                />
              )}

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-700 dark:text-purple-300">Q: {faq.question}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          R: {faq.answer}
                        </p>
                        {faq.tags.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {faq.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">#{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingFAQ({ index, faq });
                            setShowFAQForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFAQ(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {faqs.length === 0 && !showFAQForm && (
                  <Card className="p-8 text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Aucune FAQ configurée</p>
                    <p className="text-xs text-gray-400 mt-1">Ajoutez des questions fréquentes</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="text-xs text-gray-500">
              {products.length} produit{products.length > 1 ? 's' : ''} • {faqs.length} FAQ
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} size="sm">
                Fermer
              </Button>
              <Button onClick={saveAll} size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </Tabs>
      </div>
    </DraggableWindow>
  );
}

// Formulaire de produit
function ProductForm({ product, onSave, onCancel }: {
  product: Product | null;
  onSave: (product: Omit<Product, 'id'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price || 0,
    features: product?.features || [],
    specifications: product?.specifications || {},
    faq: product?.faq || [],
    commonIssues: product?.commonIssues || [],
    tags: product?.tags || [],
  });

  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <Label>Nom du produit</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Catégorie</Label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div>
            <Label>Prix (€)</Label>
            <Input
              type="number"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
        
        <div>
          <Label>Caractéristiques</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Ajouter une caractéristique"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newFeature) {
                  setFormData({ ...formData, features: [...formData.features, newFeature] });
                  setNewFeature('');
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                if (newFeature) {
                  setFormData({ ...formData, features: [...formData.features, newFeature] });
                  setNewFeature('');
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {formData.features.map((feature, idx) => (
              <Badge key={idx} variant="secondary">
                {feature}
                <button
                  onClick={() => setFormData({
                    ...formData,
                    features: formData.features.filter((_, i) => i !== idx)
                  })}
                  className="ml-2"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>Tags</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Ajouter un tag"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTag) {
                  setFormData({ ...formData, tags: [...formData.tags, newTag] });
                  setNewTag('');
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                if (newTag) {
                  setFormData({ ...formData, tags: [...formData.tags, newTag] });
                  setNewTag('');
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {formData.tags.map((tag, idx) => (
              <Badge key={idx}>
                {tag}
                <button
                  onClick={() => setFormData({
                    ...formData,
                    tags: formData.tags.filter((_, i) => i !== idx)
                  })}
                  className="ml-2"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Formulaire informations entreprise
function CompanyInfoForm({ companyInfo, onSave }: {
  companyInfo: CompanyInfo;
  onSave: (info: Partial<CompanyInfo>) => void;
}) {
  const [formData, setFormData] = useState(companyInfo);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <Label>Nom de l&apos;entreprise</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>Adresse</Label>
          <Textarea
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={2}
          />
        </div>
        <div>
          <Label>Horaires</Label>
          <Input
            value={formData.workingHours || ''}
            onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
            placeholder="Ex: Lun-Ven 9h-18h"
          />
        </div>
        <div>
          <Label>Politique de retour</Label>
          <Textarea
            value={formData.returnPolicy || ''}
            onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
            rows={3}
          />
        </div>
        <div>
          <Label>Politique de livraison</Label>
          <Textarea
            value={formData.shippingPolicy || ''}
            onChange={(e) => setFormData({ ...formData, shippingPolicy: e.target.value })}
            rows={3}
          />
        </div>
        <div>
          <Label>Politique de garantie</Label>
          <Textarea
            value={formData.warrantyPolicy || ''}
            onChange={(e) => setFormData({ ...formData, warrantyPolicy: e.target.value })}
            rows={3}
          />
        </div>
        <Button onClick={() => onSave(formData)}>
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
        </Button>
      </div>
    </Card>
  );
}

// Formulaire FAQ
function FAQForm({ faq, onSave, onCancel }: {
  faq: FAQ | null;
  onSave: (faq: FAQ) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<FAQ>({
    question: faq?.question || '',
    answer: faq?.answer || '',
    tags: faq?.tags || [],
  });

  const [newTag, setNewTag] = useState('');

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <Label>Question</Label>
          <Input
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          />
        </div>
        <div>
          <Label>Réponse</Label>
          <Textarea
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            rows={4}
          />
        </div>
        <div>
          <Label>Tags</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Ajouter un tag"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTag) {
                  setFormData({ ...formData, tags: [...formData.tags, newTag] });
                  setNewTag('');
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                if (newTag) {
                  setFormData({ ...formData, tags: [...formData.tags, newTag] });
                  setNewTag('');
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {formData.tags.map((tag, idx) => (
              <Badge key={idx}>
                {tag}
                <button
                  onClick={() => setFormData({
                    ...formData,
                    tags: formData.tags.filter((_, i) => i !== idx)
                  })}
                  className="ml-2"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </Card>
  );
}
