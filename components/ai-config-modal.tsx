'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2, Hash, Sparkles, MessageSquare, Palette, FileText, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { DraggableWindow } from './draggable-window';
import { 
  AIPromptConfig,
  DEFAULT_AI_CONFIG,
  loadAIConfig,
  saveAIConfig,
  PromptTone,
  ResponseStyle,
  ResponseLength
} from '@/lib/ai-prompt-config';
import { SUPPORT_CATEGORIES, SupportCategory } from '@/lib/support-categories';
import { toast } from 'sonner';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
}

export function AIConfigModal({ isOpen, onClose, zIndex, onFocus }: AIConfigModalProps) {
  const [config, setConfig] = useState<AIPromptConfig>(DEFAULT_AI_CONFIG);
  const [activeTab, setActiveTab] = useState<'general' | 'templates' | 'hashtags' | 'examples'>('general');

  // Charger la config au montage
  useEffect(() => {
    if (isOpen) {
      const savedConfig = loadAIConfig();
      if (savedConfig) {
        // Fusionner avec les hashtags par défaut pour les nouvelles catégories
        const mergedConfig = {
          ...DEFAULT_AI_CONFIG,
          ...savedConfig,
          categoryHashtags: {
            ...DEFAULT_AI_CONFIG.categoryHashtags,
            ...savedConfig.categoryHashtags
          }
        };
        setConfig(mergedConfig);
      } else {
        // Utiliser la config par défaut avec tous les hashtags
        setConfig(DEFAULT_AI_CONFIG);
      }
    }
  }, [isOpen]);

  const saveConfig = () => {
    saveAIConfig(config);
    toast.success('✅ Configuration IA sauvegardée');
  };

  const updateConfig = (updates: Partial<AIPromptConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addCustomInstruction = (instruction: string) => {
    if (instruction.trim()) {
      setConfig(prev => ({
        ...prev,
        customInstructions: [...prev.customInstructions, instruction]
      }));
    }
  };

  const removeCustomInstruction = (index: number) => {
    setConfig(prev => ({
      ...prev,
      customInstructions: prev.customInstructions.filter((_, i) => i !== index)
    }));
  };

  const addDoItem = (item: string) => {
    if (item.trim()) {
      setConfig(prev => ({
        ...prev,
        doList: [...prev.doList, item]
      }));
    }
  };

  const removeDoItem = (index: number) => {
    setConfig(prev => ({
      ...prev,
      doList: prev.doList.filter((_, i) => i !== index)
    }));
  };

  const addDontItem = (item: string) => {
    if (item.trim()) {
      setConfig(prev => ({
        ...prev,
        dontList: [...prev.dontList, item]
      }));
    }
  };

  const removeDontItem = (index: number) => {
    setConfig(prev => ({
      ...prev,
      dontList: prev.dontList.filter((_, i) => i !== index)
    }));
  };

  const addCompanyValue = (value: string) => {
    if (value.trim() && config.companyValues) {
      setConfig(prev => ({
        ...prev,
        companyValues: [...(prev.companyValues || []), value]
      }));
    }
  };

  const removeCompanyValue = (index: number) => {
    setConfig(prev => ({
      ...prev,
      companyValues: prev.companyValues?.filter((_, i) => i !== index) || []
    }));
  };

  const updateCategoryTemplate = (category: SupportCategory, template: string) => {
    setConfig(prev => ({
      ...prev,
      categoryTemplates: {
        ...prev.categoryTemplates,
        [category]: template
      }
    }));
  };

  const addHashtag = (category: SupportCategory, hashtag: string) => {
    if (!hashtag.trim()) return;
    
    // Créer la structure de hashtags si elle n'existe pas
    const currentHashtags = (config as any).categoryHashtags || {};
    const categoryHashtags = currentHashtags[category] || [];
    
    setConfig(prev => ({
      ...prev,
      categoryHashtags: {
        ...currentHashtags,
        [category]: [...categoryHashtags, hashtag.replace('#', '')]
      }
    } as any));
  };

  const removeHashtag = (category: SupportCategory, index: number) => {
    const currentHashtags = (config as any).categoryHashtags || {};
    const categoryHashtags = currentHashtags[category] || [];
    
    setConfig(prev => ({
      ...prev,
      categoryHashtags: {
        ...currentHashtags,
        [category]: categoryHashtags.filter((_: any, i: number) => i !== index)
      }
    } as any));
  };

  if (!isOpen) return null;

  return (
    <DraggableWindow
      title="⚙️ Configuration IA"
      isOpen={isOpen}
      width="1000px"
      height="700px"
      onClose={onClose}
      zIndex={zIndex}
      onFocus={onFocus}
    >
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Général
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs">
                <MessageSquare className="w-3 h-3 mr-1.5" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="text-xs">
                <Hash className="w-3 h-3 mr-1.5" />
                Hashtags
              </TabsTrigger>
              <TabsTrigger value="examples" className="text-xs">
                <FileText className="w-3 h-3 mr-1.5" />
                Exemples
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 pb-6">
            {/* Onglet Général */}
            <TabsContent value="general" className="space-y-6 mt-4">
              <Card className="p-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Style de communication
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ton de réponse</Label>
                    <Select
                      value={config.tone}
                      onValueChange={(value) => updateConfig({ tone: value as PromptTone })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professionnel">🎯 Professionnel</SelectItem>
                        <SelectItem value="amical">😊 Amical</SelectItem>
                        <SelectItem value="formel">📋 Formel</SelectItem>
                        <SelectItem value="empathique">❤️ Empathique</SelectItem>
                        <SelectItem value="direct">⚡ Direct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Style de réponse</Label>
                    <Select
                      value={config.style}
                      onValueChange={(value) => updateConfig({ style: value as ResponseStyle })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concis">✂️ Concis</SelectItem>
                        <SelectItem value="détaillé">📝 Détaillé</SelectItem>
                        <SelectItem value="bullet-points">📋 Bullet points</SelectItem>
                        <SelectItem value="conversationnel">💬 Conversationnel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Longueur de réponse</Label>
                    <Select
                      value={config.length}
                      onValueChange={(value) => updateConfig({ length: value as ResponseLength })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="court">📄 Court</SelectItem>
                        <SelectItem value="moyen">📃 Moyen</SelectItem>
                        <SelectItem value="long">📜 Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Langue</Label>
                    <Select
                      value={config.language}
                      onValueChange={(value) => updateConfig({ language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="p-4 space-y-4">
                <h3 className="font-semibold">🏢 Informations entreprise</h3>
                
                <div>
                  <Label>Nom de l'entreprise</Label>
                  <Input
                    value={config.companyName}
                    onChange={(e) => updateConfig({ companyName: e.target.value })}
                    placeholder="Ex: TechSupport Pro"
                  />
                </div>

                <div>
                  <Label>Valeurs de l'entreprise</Label>
                  <ListEditor
                    items={config.companyValues || []}
                    onAdd={addCompanyValue}
                    onRemove={removeCompanyValue}
                    placeholder="Ex: Satisfaction client prioritaire"
                  />
                </div>

                <div>
                  <Label>Voice de marque (optionnel)</Label>
                  <Textarea
                    value={config.brandVoice || ''}
                    onChange={(e) => updateConfig({ brandVoice: e.target.value })}
                    placeholder="Ex: Nous sommes une équipe jeune et dynamique qui privilégie la proximité avec nos clients..."
                    rows={3}
                  />
                </div>
              </Card>

              <Card className="p-4 space-y-4">
                <h3 className="font-semibold">📋 Instructions personnalisées</h3>
                <ListEditor
                  items={config.customInstructions}
                  onAdd={addCustomInstruction}
                  onRemove={removeCustomInstruction}
                  placeholder="Ex: Toujours saluer le client par son nom"
                />
              </Card>

              <Card className="p-4 space-y-4">
                <h3 className="font-semibold text-green-600 dark:text-green-400">✓ À FAIRE</h3>
                <ListEditor
                  items={config.doList}
                  onAdd={addDoItem}
                  onRemove={removeDoItem}
                  placeholder="Ex: Être empathique et compréhensif"
                />
              </Card>

              <Card className="p-4 space-y-4">
                <h3 className="font-semibold text-red-600 dark:text-red-400">✗ NE PAS FAIRE</h3>
                <ListEditor
                  items={config.dontList}
                  onAdd={addDontItem}
                  onRemove={removeDontItem}
                  placeholder="Ex: Ne jamais promettre ce qui ne peut être garanti"
                />
              </Card>

              <Card className="p-4 space-y-4">
                <h3 className="font-semibold">✍️ Signature</h3>
                
                <div className="flex items-center justify-between">
                  <Label>Activer la signature automatique</Label>
                  <Switch
                    checked={config.signature?.enabled || false}
                    onCheckedChange={(checked) => updateConfig({
                      signature: { ...config.signature, enabled: checked }
                    })}
                  />
                </div>

                {config.signature?.enabled && (
                  <div className="space-y-3 pl-4 border-l-2 border-purple-300 dark:border-purple-700">
                    <div>
                      <Label>Nom</Label>
                      <Input
                        value={config.signature.name || ''}
                        onChange={(e) => updateConfig({
                          signature: { enabled: true, ...config.signature, name: e.target.value }
                        })}
                        placeholder="Ex: L'équipe support"
                      />
                    </div>
                    <div>
                      <Label>Rôle/Poste</Label>
                      <Input
                        value={config.signature.role || ''}
                        onChange={(e) => updateConfig({
                          signature: { enabled: true, ...config.signature, role: e.target.value }
                        })}
                        placeholder="Ex: Service Client"
                      />
                    </div>
                    <div>
                      <Label>Texte personnalisé (optionnel)</Label>
                      <Textarea
                        value={config.signature.customText || ''}
                        onChange={(e) => updateConfig({
                          signature: { enabled: true, ...config.signature, customText: e.target.value }
                        })}
                        placeholder="Ex: Cordialement,\nL'équipe Support\nDisponible 24/7"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Onglet Templates */}
            <TabsContent value="templates" className="space-y-4 mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Personnalisez les instructions spécifiques pour chaque catégorie de demande client.
              </div>
              
              {SUPPORT_CATEGORIES.map((category) => (
                <Card key={category.id} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h4 className="font-semibold">{category.label}</h4>
                    <Badge variant="outline" className="ml-auto">
                      {category.priority === 'high' ? '🔴 Haute' : category.priority === 'medium' ? '🟡 Moyenne' : '🟢 Basse'}
                    </Badge>
                  </div>
                  <Textarea
                    value={config.categoryTemplates[category.id]}
                    onChange={(e) => updateCategoryTemplate(category.id, e.target.value)}
                    placeholder={`Instructions spécifiques pour ${category.label.toLowerCase()}...`}
                    rows={4}
                    className="text-sm"
                  />
                </Card>
              ))}
            </TabsContent>

            {/* Onglet Hashtags */}
            <TabsContent value="hashtags" className="space-y-4 mt-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Système de hashtags intelligent
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Définissez des mots-clés pour chaque catégorie. L'IA classera automatiquement les emails 
                  lorsqu'ils contiennent ces hashtags dans l'objet ou le contenu.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  💡 Exemple : Pour "Question produit", ajoutez : produit, article, spécifications, fonctionnalités
                </p>
              </div>

              {SUPPORT_CATEGORIES.map((category) => {
                const categoryHashtags = ((config as any).categoryHashtags || {})[category.id] || [];
                
                return (
                  <Card key={category.id} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{category.icon}</span>
                      <h4 className="font-semibold">{category.label}</h4>
                      <Badge variant="secondary" className="ml-auto">
                        {categoryHashtags.length} hashtag{categoryHashtags.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <HashtagEditor
                      hashtags={categoryHashtags}
                      onAdd={(hashtag) => addHashtag(category.id, hashtag)}
                      onRemove={(index) => removeHashtag(category.id, index)}
                      categoryColor={category.color.text}
                    />
                  </Card>
                );
              })}
            </TabsContent>

            {/* Onglet Exemples */}
            <TabsContent value="examples" className="space-y-4 mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ajoutez des exemples de bonnes et mauvaises réponses pour améliorer la qualité des réponses IA (few-shot learning).
              </div>
              
              <Card className="p-4">
                <p className="text-sm text-center text-gray-500">
                  Fonctionnalité avancée - À venir prochainement
                </p>
              </Card>
            </TabsContent>
          </ScrollArea>

          {/* Footer avec boutons */}
          <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="text-xs text-gray-500">
              {config.customInstructions.length + config.doList.length + config.dontList.length} règles configurées
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} size="sm">
                Annuler
              </Button>
              <Button onClick={saveConfig} size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
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

// Composant ListEditor réutilisable
function ListEditor({ 
  items, 
  onAdd, 
  onRemove, 
  placeholder 
}: {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem);
      setNewItem('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="flex-1 text-sm">{item}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Composant HashtagEditor
function HashtagEditor({
  hashtags,
  onAdd,
  onRemove,
  categoryColor
}: {
  hashtags: string[];
  onAdd: (hashtag: string) => void;
  onRemove: (index: number) => void;
  categoryColor: string;
}) {
  const [newHashtag, setNewHashtag] = useState('');

  const handleAdd = () => {
    if (newHashtag.trim()) {
      onAdd(newHashtag);
      setNewHashtag('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={newHashtag}
            onChange={(e) => setNewHashtag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="commande, livraison, suivi..."
            className="pl-9"
          />
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>
      
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={cn("group cursor-pointer hover:shadow-md transition-all", categoryColor)}
            >
              #{tag}
              <button
                onClick={() => onRemove(index)}
                className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {hashtags.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-2">
          Aucun hashtag défini pour cette catégorie
        </p>
      )}
    </div>
  );
}
