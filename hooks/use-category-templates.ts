// Hook pour gérer les category templates (prompts contextuels par filtre)

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export type CategoryTemplate = {
  [category: string]: string;
};

export function useCategoryTemplates() {
  const [templates, setTemplates] = useState<CategoryTemplate>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Charger les templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-config/category-templates');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }

      const data = await response.json();
      setTemplates(data.categoryTemplates || {});
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Impossible de charger les templates');
    } finally {
      setLoading(false);
    }
  };

  // Créer ou mettre à jour un template
  const upsertTemplate = async (category: string, prompt: string) => {
    try {
      setSaving(true);
      const response = await fetch('/api/ai-config/category-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, prompt }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const data = await response.json();
      setTemplates(data.categoryTemplates);
      toast.success(`Template "${category}" enregistré !`);
      return data;
    } catch (error) {
      console.error('Error upserting template:', error);
      toast.error('Erreur lors de la sauvegarde');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Supprimer un template
  const deleteTemplate = async (category: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/ai-config/category-templates?category=${encodeURIComponent(category)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      const data = await response.json();
      setTemplates(data.categoryTemplates);
      toast.success(`Template "${category}" supprimé`);
      return data;
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Erreur lors de la suppression');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Mettre à jour tous les templates en une fois
  const bulkUpdateTemplates = async (newTemplates: CategoryTemplate) => {
    try {
      setSaving(true);
      const response = await fetch('/api/ai-config/category-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryTemplates: newTemplates }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      const data = await response.json();
      setTemplates(data.categoryTemplates);
      toast.success('Tous les templates enregistrés !');
      return data;
    } catch (error) {
      console.error('Error bulk updating templates:', error);
      toast.error('Erreur lors de la mise à jour');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    templates,
    loading,
    saving,
    upsertTemplate,
    deleteTemplate,
    bulkUpdateTemplates,
    refresh: fetchTemplates,
  };
}
