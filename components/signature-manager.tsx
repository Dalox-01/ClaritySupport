'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Plus, Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

type Signature = {
  id: string;
  name: string;
  content: string;
  html_content: string;
  is_default: boolean;
  created_at: string;
};

type SignatureManagerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSignature?: (signature: Signature) => void;
};

export function SignatureManager({ open, onOpenChange, onSelectSignature }: SignatureManagerProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    is_default: false,
  });

  useEffect(() => {
    if (open) {
      loadSignatures();
    }
  }, [open]);

  const loadSignatures = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/signatures');
      const data = await response.json();

      if (data.success) {
        setSignatures(data.data);
      }
    } catch (error) {
      console.error('Error loading signatures:', error);
      toast.error('Erreur lors du chargement des signatures');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Nom et contenu requis');
      return;
    }

    try {
      const response = await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Signature créée !');
        setSignatures([data.data, ...signatures]);
        setFormData({ name: '', content: '', is_default: false });
        setShowCreateForm(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const signature = signatures.find(s => s.id === id);
      if (!signature) return;

      const response = await fetch(`/api/signatures/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signature.name,
          content: signature.content,
          is_default: signature.is_default,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Signature mise à jour !');
        setEditingId(null);
        loadSignatures();
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette signature ?')) return;

    try {
      const response = await fetch(`/api/signatures?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Signature supprimée');
        setSignatures(signatures.filter(s => s.id !== id));
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const signature = signatures.find(s => s.id === id);
      if (!signature) return;

      const response = await fetch(`/api/signatures/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...signature,
          is_default: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Signature par défaut mise à jour');
        loadSignatures();
      }
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Mes signatures</DialogTitle>
          <DialogDescription>
            Gérez vos signatures email pour gagner du temps
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            size="sm"
            variant={showCreateForm ? "secondary" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? 'Annuler' : 'Nouvelle signature'}
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Créer une signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de la signature</Label>
                <Input
                  placeholder="Ex: Signature professionnelle"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contenu</Label>
                <Textarea
                  placeholder="Ex: Cordialement,&#10;Jean Dupont&#10;Développeur Web&#10;jean@example.com&#10;+33 6 12 34 56 78"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, is_default: checked as boolean })
                  }
                />
                <Label htmlFor="default" className="cursor-pointer">
                  Définir comme signature par défaut
                </Label>
              </div>
              <Button onClick={handleCreate} className="w-full">
                Créer la signature
              </Button>
            </CardContent>
          </Card>
        )}

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Chargement...</p>
          ) : signatures.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune signature. Créez-en une !
            </p>
          ) : (
            <div className="space-y-3">
              {signatures.map((signature) => (
                <Card key={signature.id} className={signature.is_default ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {editingId === signature.id ? (
                          <Input
                            value={signature.name}
                            onChange={(e) => {
                              setSignatures(signatures.map(s =>
                                s.id === signature.id ? { ...s, name: e.target.value } : s
                              ));
                            }}
                            className="mb-2"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{signature.name}</h4>
                            {signature.is_default && (
                              <Star className="h-4 w-4 fill-primary text-primary" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {editingId === signature.id ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdate(signature.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(signature.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {!signature.is_default && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSetDefault(signature.id)}
                            title="Définir par défaut"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(signature.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {editingId === signature.id ? (
                      <Textarea
                        value={signature.content}
                        onChange={(e) => {
                          setSignatures(signatures.map(s =>
                            s.id === signature.id ? { ...s, content: e.target.value } : s
                          ));
                        }}
                        rows={4}
                      />
                    ) : (
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                        {signature.content}
                      </pre>
                    )}
                    {onSelectSignature && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 w-full"
                        onClick={() => {
                          onSelectSignature(signature);
                          onOpenChange(false);
                        }}
                      >
                        Utiliser cette signature
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
