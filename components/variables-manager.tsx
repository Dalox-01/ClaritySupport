'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

type VariablesManagerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVariablesUpdated?: () => void;
};

const DEFAULT_VARIABLES = [
  { key: 'nom', label: 'Nom complet', placeholder: 'Jean Dupont' },
  { key: 'prenom', label: 'Prénom', placeholder: 'Jean' },
  { key: 'nom_famille', label: 'Nom de famille', placeholder: 'Dupont' },
  { key: 'entreprise', label: 'Entreprise', placeholder: 'Acme Corp' },
  { key: 'poste', label: 'Poste', placeholder: 'Développeur Web' },
  { key: 'email', label: 'Email', placeholder: 'jean@example.com' },
  { key: 'telephone', label: 'Téléphone', placeholder: '+33 6 12 34 56 78' },
  { key: 'ville', label: 'Ville', placeholder: 'Paris' },
  { key: 'pays', label: 'Pays', placeholder: 'France' },
  { key: 'site_web', label: 'Site web', placeholder: 'https://example.com' },
];

export function VariablesManager({ open, onOpenChange, onVariablesUpdated }: VariablesManagerProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadVariables();
    }
  }, [open]);

  const loadVariables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/variables');
      const data = await response.json();

      if (data.success) {
        setVariables(data.data || {});
      }
    } catch (error) {
      console.error('Error loading variables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Variables sauvegardées !');
        onVariablesUpdated?.();
        onOpenChange(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Mes variables d&apos;autoremplissage
          </DialogTitle>
          <DialogDescription>
            Ces informations seront utilisées pour remplir automatiquement les templates avec des variables comme {'{nom}'}, {'{entreprise}'}, etc.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Chargement...</p>
        ) : (
          <div className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations personnelles</CardTitle>
                <CardDescription className="text-xs">
                  Utilisez ces variables dans vos templates : {'{nom}'}, {'{entreprise}'}, {'{poste}'}, etc.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {DEFAULT_VARIABLES.map((variable) => (
                  <div key={variable.key} className="space-y-2">
                    <Label htmlFor={variable.key}>
                      {variable.label}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({'{' + variable.key + '}'})
                      </span>
                    </Label>
                    <Input
                      id={variable.key}
                      placeholder={variable.placeholder}
                      value={variables[variable.key] || ''}
                      onChange={(e) =>
                        setVariables({ ...variables, [variable.key]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">💡 Comment utiliser ?</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Remplissez vos informations ci-dessus</li>
                <li>• Dans les templates, les variables {'{nom}'}, {'{entreprise}'}, etc. seront automatiquement remplacées</li>
                <li>• Exemple : &quot;Cordialement, {'{nom}'}&quot; devient &quot;Cordialement, Jean Dupont&quot;</li>
                <li>• Activez/désactivez l&apos;autoremplissage avec la checkbox dans les templates</li>
              </ul>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
