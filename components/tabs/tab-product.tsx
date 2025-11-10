'use client';

import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Image, 
  FileText, 
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Code,
  TestTube
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RegexTester } from '@/components/regex-tester';

interface ProductRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    type: 'keyword' | 'regex' | 'entity';
    value: string;
    field: 'subject' | 'body' | 'from';
  }[];
  action: {
    type: 'assign_tag' | 'force_category' | 'route_to_team' | 'mark_review';
    value: string;
  };
}

interface Product {
  product_id?: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  images: string[];
  default_templates: Record<string, string>;
  product_docs: string[];
  default_priority: 'Low' | 'Normal' | 'High' | 'Critical';
  default_sla_hours: number;
  product_rules: ProductRule[];
  metadata: Record<string, string>;
  visibility: 'public' | 'internal';
}

export function TabProduct({ onChange }: { onChange?: () => void }) {
  const [products, setProducts] = useState<Product[]>([
    {
      name: '',
      sku: '',
      description: '',
      category: '',
      images: [],
      default_templates: {},
      product_docs: [],
      default_priority: 'Normal',
      default_sla_hours: 24,
      product_rules: [],
      metadata: {},
      visibility: 'public',
    },
  ]);

  const [selectedProduct, setSelectedProduct] = useState(0);
  const [showRegexTester, setShowRegexTester] = useState(false);
  const [testEmailSubject, setTestEmailSubject] = useState('');
  const [testEmailBody, setTestEmailBody] = useState('');

  const product = products[selectedProduct];

  const handleProductChange = (field: keyof Product, value: any) => {
    setProducts(prev => {
      const newProducts = [...prev];
      newProducts[selectedProduct] = {
        ...newProducts[selectedProduct],
        [field]: value,
      };
      return newProducts;
    });
    onChange?.();
  };

  const addRule = () => {
    const newRule: ProductRule = {
      id: `rule_${Date.now()}`,
      name: `Nouvelle règle`,
      enabled: true,
      conditions: [{
        type: 'keyword',
        value: '',
        field: 'subject',
      }],
      action: {
        type: 'assign_tag',
        value: '',
      },
    };

    handleProductChange('product_rules', [...product.product_rules, newRule]);
  };

  const removeRule = (ruleId: string) => {
    handleProductChange(
      'product_rules',
      product.product_rules.filter(r => r.id !== ruleId)
    );
  };

  const updateRule = (ruleId: string, updates: Partial<ProductRule>) => {
    handleProductChange(
      'product_rules',
      product.product_rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
    );
  };

  const testRulesOnEmail = () => {
    const matchedRules = product.product_rules.filter(rule => {
      if (!rule.enabled) return false;

      return rule.conditions.some(condition => {
        const text = condition.field === 'subject' ? testEmailSubject : testEmailBody;
        
        if (condition.type === 'keyword') {
          return text.toLowerCase().includes(condition.value.toLowerCase());
        } else if (condition.type === 'regex') {
          try {
            return new RegExp(condition.value, 'i').test(text);
          } catch {
            return false;
          }
        }
        return false;
      });
    });

    return matchedRules;
  };

  const matchedRules = testRulesOnEmail();

  return (
    <div className="space-y-6">
      {/* Product Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Configuration Produit
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Définissez vos produits, règles et templates
          </p>
        </div>

        <Button
          onClick={() => {
            setProducts([...products, {
              name: '',
              sku: '',
              description: '',
              category: '',
              images: [],
              default_templates: {},
              product_docs: [],
              default_priority: 'Normal',
              default_sla_hours: 24,
              product_rules: [],
              metadata: {},
              visibility: 'public',
            }]);
            setSelectedProduct(products.length);
            onChange?.();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Product List Sidebar */}
        <div className="col-span-3 space-y-2">
          {products.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedProduct(idx)}
              className={cn(
                'w-full text-left p-3 rounded-lg border transition-all',
                selectedProduct === idx
                  ? 'bg-blue-100 dark:bg-blue-500/20 border-blue-400 dark:border-blue-500'
                  : 'bg-white dark:bg-[#1a1f3a] border-gray-200 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40'
              )}
            >
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {p.name || 'Produit sans nom'}
              </p>
              {p.sku && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SKU: {p.sku}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Product Form */}
        <div className="col-span-9 space-y-6">
          <Card className="p-6 border-blue-200/50 dark:border-blue-500/20 bg-white/80 dark:bg-[#1a1f3a]/80">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Informations du produit
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={product.name}
                  onChange={(e) => handleProductChange('name', e.target.value)}
                  placeholder="Ex: Laptop Pro X1"
                  className="border-blue-200 dark:border-blue-500/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={product.sku}
                  onChange={(e) => handleProductChange('sku', e.target.value)}
                  placeholder="Ex: LPX1-2024"
                  className="border-blue-200 dark:border-blue-500/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={product.category}
                  onValueChange={(value) => handleProductChange('category', value)}
                >
                  <SelectTrigger className="border-blue-200 dark:border-blue-500/30">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Électronique</SelectItem>
                    <SelectItem value="software">Logiciel</SelectItem>
                    <SelectItem value="hardware">Matériel</SelectItem>
                    <SelectItem value="accessories">Accessoires</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibilité</Label>
                <Select
                  value={product.visibility}
                  onValueChange={(value: 'public' | 'internal') => handleProductChange('visibility', value)}
                >
                  <SelectTrigger className="border-blue-200 dark:border-blue-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="internal">Interne uniquement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description (Markdown supporté)</Label>
                <Textarea
                  id="description"
                  value={product.description}
                  onChange={(e) => handleProductChange('description', e.target.value)}
                  placeholder="Description détaillée du produit..."
                  rows={4}
                  className="border-blue-200 dark:border-blue-500/30 font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priorité par défaut</Label>
                <Select
                  value={product.default_priority}
                  onValueChange={(value: Product['default_priority']) => handleProductChange('default_priority', value)}
                >
                  <SelectTrigger className="border-blue-200 dark:border-blue-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Basse</SelectItem>
                    <SelectItem value="Normal">Normale</SelectItem>
                    <SelectItem value="High">Haute</SelectItem>
                    <SelectItem value="Critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sla">SLA (heures)</Label>
                <Input
                  id="sla"
                  type="number"
                  value={product.default_sla_hours}
                  onChange={(e) => handleProductChange('default_sla_hours', parseInt(e.target.value))}
                  className="border-blue-200 dark:border-blue-500/30"
                />
              </div>
            </div>
          </Card>

          {/* Product Rules */}
          <Card className="p-6 border-blue-200/50 dark:border-blue-500/20 bg-white/80 dark:bg-[#1a1f3a]/80">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Règles d'automatisation
              </h4>
              <Button
                onClick={addRule}
                variant="outline"
                size="sm"
                className="border-blue-400 dark:border-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une règle
              </Button>
            </div>

            <Reorder.Group
              axis="y"
              values={product.product_rules}
              onReorder={(newOrder) => handleProductChange('product_rules', newOrder)}
              className="space-y-3"
            >
              {product.product_rules.map((rule) => (
                <Reorder.Item
                  key={rule.id}
                  value={rule}
                  className="bg-gray-50 dark:bg-[#0f1320] border border-gray-200 dark:border-blue-500/20 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <Input
                          value={rule.name}
                          onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                          className="flex-1 font-medium border-blue-200 dark:border-blue-500/30"
                          placeholder="Nom de la règle"
                        />

                        <div className="flex items-center gap-2 ml-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                              className="rounded"
                            />
                            Activée
                          </label>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRule(rule.id)}
                            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Rule conditions preview */}
                      <div className="flex flex-wrap gap-2">
                        {rule.conditions.map((cond, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cond.field}: {cond.type} = "{cond.value}"
                          </Badge>
                        ))}
                      </div>

                      {/* Rule action */}
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Action:</span> {rule.action.type} → {rule.action.value}
                      </div>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {product.product_rules.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune règle définie</p>
              </div>
            )}
          </Card>

          {/* Rule Tester */}
          <Card className="p-6 border-blue-200/50 dark:border-blue-500/20 bg-white/80 dark:bg-[#1a1f3a]/80">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TestTube className="w-5 h-5 text-blue-500" />
                Testeur de règles
              </h4>
              <Button
                onClick={() => setShowRegexTester(!showRegexTester)}
                variant="outline"
                size="sm"
                className="border-blue-400 dark:border-blue-500"
              >
                <Code className="w-4 h-4 mr-2" />
                Regex Tester
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Sujet de test</Label>
                <Input
                  value={testEmailSubject}
                  onChange={(e) => setTestEmailSubject(e.target.value)}
                  placeholder="Ex: Problème avec mon Laptop Pro X1"
                  className="border-blue-200 dark:border-blue-500/30"
                />
              </div>

              <div>
                <Label>Corps du message</Label>
                <Textarea
                  value={testEmailBody}
                  onChange={(e) => setTestEmailBody(e.target.value)}
                  placeholder="Ex: J'ai un problème avec la garantie..."
                  rows={3}
                  className="border-blue-200 dark:border-blue-500/30"
                />
              </div>

              {/* Matched Rules */}
              {(testEmailSubject || testEmailBody) && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg">
                  <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                    {matchedRules.length > 0 ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        Règles correspondantes ({matchedRules.length})
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        Aucune règle ne correspond
                      </>
                    )}
                  </h5>

                  {matchedRules.map(rule => (
                    <div key={rule.id} className="mt-2 p-2 bg-white dark:bg-[#0f1320] rounded border border-blue-200 dark:border-blue-500/20">
                      <p className="font-medium text-sm">{rule.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        → {rule.action.type}: {rule.action.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {showRegexTester && <RegexTester />}
        </div>
      </div>
    </div>
  );
}
