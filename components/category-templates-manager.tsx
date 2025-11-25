// Composant: Gestionnaire de prompts contextuels par catégorie
// Permet de créer, modifier et supprimer les prompts IA par filtre

'use client';

import { useState } from 'react';
import { useCategoryTemplates } from '@/hooks/use-category-templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Save, Edit2, X } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'urgent',
  'commande',
  'remboursement',
  'question-produit',
  'suivi-commande',
  'sav',
  'reclamation',
  'information',
  'facturation',
  'technique',
  'autre',
];

const CATEGORY_LABELS: Record<string, string> = {
  'urgent': '🔥 Urgent',
  'commande': '🛒 Commande',
  'remboursement': '💰 Remboursement',
  'question-produit': '❓ Question Produit',
  'suivi-commande': '📦 Suivi Commande',
  'sav': '🔧 SAV',
  'reclamation': '⚠️ Réclamation',
  'information': 'ℹ️ Information',
  'facturation': '💳 Facturation',
  'technique': '⚙️ Technique',
  'autre': '📝 Autre',
};

export default function CategoryTemplatesManager() {
  const { templates, loading, saving, upsertTemplate, deleteTemplate } = useCategoryTemplates();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  const handleEdit = (category: string) => {
    setEditingCategory(category);
    setEditingPrompt(templates[category] || '');
  };

  const handleSave = async (category: string) => {
    await upsertTemplate(category, editingPrompt);
    setEditingCategory(null);
    setEditingPrompt('');
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setEditingPrompt('');
  };

  const handleDelete = async (category: string) => {
    if (confirm(`Supprimer le template "${category}" ?`)) {
      await deleteTemplate(category);
    }
  };

  const handleCreateNew = async () => {
    if (!newCategory.trim() || !newPrompt.trim()) {
      return;
    }

    await upsertTemplate(newCategory.trim(), newPrompt.trim());
    setNewCategory('');
    setNewPrompt('');
    setShowNewForm(false);
  };

  // Catégories existantes + nouvelles catégories custom
  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...Object.keys(templates)])
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompts Contextuels</h2>
          <p className="text-sm text-muted-foreground">
            Configurez le comportement de l'IA pour chaque type d'email
          </p>
        </div>
        <Button
          onClick={() => setShowNewForm(!showNewForm)}
          variant={showNewForm ? 'outline' : 'default'}
          size="sm"
        >
          {showNewForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Filtre
            </>
          )}
        </Button>
      </div>

      {/* Formulaire de création */}
      {showNewForm && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Créer un nouveau filtre</CardTitle>
            <CardDescription>
              Ajoutez une catégorie personnalisée avec son prompt contextuel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nom de la catégorie
              </label>
              <Input
                placeholder="ex: livraison-internationale"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Prompt contextuel
              </label>
              <Textarea
                placeholder="Instructions pour l'IA lorsqu'un email de cette catégorie est détecté..."
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateNew}
                disabled={saving || !newCategory.trim() || !newPrompt.trim()}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Créer le filtre
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setNewCategory('');
                  setNewPrompt('');
                }}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des templates existants */}
      <div className="grid gap-4">
        {allCategories.map((category) => {
          const isEditing = editingCategory === category;
          const hasTemplate = templates[category];
          const isCustom = !DEFAULT_CATEGORIES.includes(category);

          return (
            <Card key={category} className={isEditing ? 'border-2 border-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {CATEGORY_LABELS[category] || `📌 ${category}`}
                    </CardTitle>
                    {isCustom && (
                      <Badge variant="secondary">Custom</Badge>
                    )}
                    {!hasTemplate && (
                      <Badge variant="outline">Non configuré</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSave(category)}
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {isCustom && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(category)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editingPrompt}
                    onChange={(e) => setEditingPrompt(e.target.value)}
                    rows={4}
                    placeholder="Instructions pour l'IA..."
                    className="font-mono text-sm"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {templates[category] || (
                      <span className="italic">Aucun prompt configuré pour cette catégorie</span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allCategories.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun template configuré. Créez votre premier filtre !
          </CardContent>
        </Card>
      )}
    </div>
  );
}
