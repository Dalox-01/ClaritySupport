'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FileText, Sparkles } from 'lucide-react';

type CreateTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateCreated?: () => void;
  initialSubject?: string;
  initialContent?: string;
};

const categories = [
  { value: 'business', label: 'Business' },
  { value: 'networking', label: 'Networking' },
  { value: 'customer-service', label: 'Service Client' },
  { value: 'hr', label: 'RH / Recrutement' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'personal', label: 'Personnel' },
  { value: 'other', label: 'Autre' }
];

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onTemplateCreated,
  initialSubject = '',
  initialContent = ''
}: CreateTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('business');
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Veuillez entrer un nom pour le template');
      return;
    }

    if (!subject.trim()) {
      toast.error('Veuillez entrer un objet');
      return;
    }

    if (!content.trim()) {
      toast.error('Veuillez entrer le contenu');
      return;
    }

    try {
      setSaving(true);

      // Détecter les variables dans le contenu (format {variable})
      const variableRegex = /\{(\w+)\}/g;
      const variables: string[] = [];
      let match;
      while ((match = variableRegex.exec(content)) !== null) {
        if (!variables.includes(match[1])) {
          variables.push(match[1]);
        }
      }

      const response = await fetch('/api/user-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category,
          subject,
          content,
          variables
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Template créé avec succès !');
        onTemplateCreated?.();
        onOpenChange(false);
        
        // Reset form
        setName('');
        setDescription('');
        setCategory('business');
        setSubject('');
        setContent('');
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Créer un template personnalisé
          </DialogTitle>
          <DialogDescription>
            Sauvegardez cet email comme template réutilisable. Utilisez {'{variable}'} pour créer des champs dynamiques.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nom du template */}
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Nom du template <span className="text-red-500">*</span>
            </Label>
            <Input
              id="template-name"
              placeholder="Ex: Email de suivi client"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Description (optionnel)</Label>
            <Input
              id="template-description"
              placeholder="Ex: Email pour relancer un client après une démo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="template-category">Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="template-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Objet */}
          <div className="space-y-2">
            <Label htmlFor="template-subject">
              Objet <span className="text-red-500">*</span>
            </Label>
            <Input
              id="template-subject"
              placeholder="Ex: Suivi après notre échange - {entreprise}"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Contenu */}
          <div className="space-y-2">
            <Label htmlFor="template-content">
              Contenu <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="template-content"
              placeholder="Bonjour {nom},&#10;&#10;Suite à notre échange concernant {sujet}...&#10;&#10;Utilisez {variable} pour créer des champs dynamiques"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Info sur les variables */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              💡 Astuce : Utilisez des variables dynamiques
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Exemple : &quot;Bonjour {'{nom}'}, merci pour votre intérêt pour {'{produit}'}...&quot;
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Les variables seront détectées automatiquement et pourront être remplies lors de l&apos;utilisation du template.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            <Sparkles className="mr-2 h-4 w-4" />
            {saving ? 'Création...' : 'Créer le template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
