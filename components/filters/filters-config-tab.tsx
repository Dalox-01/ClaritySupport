'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { UserFilter, FilterLimits, FilterPlan } from '@/types/filters';
import { toast } from 'sonner';

const slugifyFilterKey = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || `filter_${Date.now()}`;

interface FiltersConfigTabProps {
  userPlan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  isLightMode?: boolean;
}

export function FiltersConfigTab({ userPlan, isLightMode = false }: FiltersConfigTabProps) {
  const [filters, setFilters] = useState<UserFilter[]>([]);
  const [limits, setLimits] = useState<FilterLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeywordInputs, setNewKeywordInputs] = useState<Record<string, string>>({});
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  const effectivePlan: FilterPlan = (limits?.plan as FilterPlan) || userPlan;
  const customFiltersLimit = limits?.max ?? (effectivePlan === 'PRO' ? 5 : effectivePlan === 'ENTERPRISE' ? 999999 : 0);
  const hasUnlimitedCustomFilters = customFiltersLimit >= 999999;

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    setIsLoading(true);
    try {
      const [filtersRes, limitsRes] = await Promise.all([
        fetch('/api/filters'),
        fetch('/api/filters/limits'),
      ]);

      if (filtersRes.ok) {
        const data = await filtersRes.json();
        setFilters(data.filters || []);
      } else {
        toast.error('Impossible de charger les filtres');
      }

      if (limitsRes.ok) {
        const data = await limitsRes.json();
        setLimits(data.limits || null);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des filtres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFilter = async () => {
    const customFiltersCount = filters.filter((f) => !f.is_default).length;

    if (!hasUnlimitedCustomFilters && customFiltersCount >= customFiltersLimit) {
      toast.error('Limite de filtres atteinte', {
        description: `Votre plan ${effectivePlan} autorise ${customFiltersLimit} filtre(s) personnalisé(s).`,
      });
      return;
    }

    try {
      const newFilter = {
        name: 'Nouveau filtre',
        filter_key: `filter_${Date.now()}`,
        keywords: [],
        detection_rules: {
          keywords: [],
          matchMode: 'any',
          patterns: [],
          requiresAIConfirmation: false,
          minConfidence: 0,
        },
        response_config: {
          tone: 'professional',
          language: 'fr',
          customInstructions: '',
          autoReply: false,
        },
        is_active: true,
      };

      const res = await fetch('/api/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFilter),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de la création');
      }

      await fetchFilters();
      toast.success('Filtre créé avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    }
  };

  const handleUpdateFilter = useCallback(
    async (filterId: string, updates: Partial<UserFilter>) => {
      setSavingStates((prev) => ({ ...prev, [filterId]: true }));
      try {
        const res = await fetch(`/api/filters/${filterId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Erreur lors de la sauvegarde');
        }

        await fetchFilters();
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors de la sauvegarde');
      } finally {
        setSavingStates((prev) => ({ ...prev, [filterId]: false }));
      }
    },
    []
  );

  const handleAddKeyword = async (filterId: string) => {
    const keyword = newKeywordInputs[filterId]?.trim();
    if (!keyword) return;

    const filter = filters.find((f) => f.id === filterId);
    if (!filter) return;

    const currentKeywords = filter.keywords || [];
    if (currentKeywords.includes(keyword)) {
      toast.info('Ce mot-clé existe déjà');
      return;
    }

    const updatedKeywords = [...currentKeywords, keyword];
    await handleUpdateFilter(filterId, {
      keywords: updatedKeywords,
    });

    setNewKeywordInputs((prev) => ({ ...prev, [filterId]: '' }));
  };

  const handleRemoveKeyword = async (filterId: string, keyword: string) => {
    const filter = filters.find((f) => f.id === filterId);
    if (!filter) return;

    const updatedKeywords = (filter.keywords || []).filter((k) => k !== keyword);
    await handleUpdateFilter(filterId, {
      keywords: updatedKeywords,
    });
  };

  const handleUpdateInstructions = async (filterId: string, instructions: string) => {
    const filter = filters.find((f) => f.id === filterId);
    if (!filter) return;

    await handleUpdateFilter(filterId, {
      response_config: {
        ...filter.response_config,
        customInstructions: instructions,
      },
    });
  };

  const handleDeleteFilter = async (filterId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce filtre ?')) return;

    try {
      const res = await fetch(`/api/filters/${filterId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Filtre supprimé avec succès');
        fetchFilters();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    }
  };

  const customFilters = filters.filter((f) => !f.is_default);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
          {hasUnlimitedCustomFilters
            ? 'Filtres personnalisés illimités'
            : `${customFilters.length} / ${customFiltersLimit} filtres personnalisés`}
        </p>
        <button
          onClick={handleCreateFilter}
          disabled={!hasUnlimitedCustomFilters && customFilters.length >= customFiltersLimit}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Créer un filtre
        </button>
      </div>

      <div className="space-y-3">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className={`rounded-lg border p-4 ${
              isLightMode ? 'border-gray-200 bg-white' : 'border-gray-700 bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                {filter.name}
                {filter.is_default && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    Par défaut
                  </span>
                )}
              </h3>
              {!filter.is_default && (
                <button
                  onClick={() => handleDeleteFilter(filter.id)}
                  className={`p-1.5 rounded hover:bg-red-500/20 transition-colors ${
                    isLightMode ? 'text-red-600' : 'text-red-400'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  Mots-clés
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(filter.keywords || []).map((keyword) => (
                    <span
                      key={keyword}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        isLightMode
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(filter.id, keyword)}
                        className="hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeywordInputs[filter.id] || ''}
                    onChange={(e) =>
                      setNewKeywordInputs((prev) => ({ ...prev, [filter.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddKeyword(filter.id);
                      }
                    }}
                    placeholder="Nouveau mot-clé"
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                      isLightMode
                        ? 'border-gray-300 bg-white text-gray-900'
                        : 'border-gray-600 bg-gray-700 text-white'
                    }`}
                  />
                  <button
                    onClick={() => handleAddKeyword(filter.id)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  Consignes IA
                </label>
                <textarea
                  value={filter.response_config?.customInstructions || ''}
                  onChange={(e) => handleUpdateInstructions(filter.id, e.target.value)}
                  placeholder="Instructions personnalisées pour l'IA lors de la classification de ce type d'email..."
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${
                    isLightMode
                      ? 'border-gray-300 bg-white text-gray-900'
                      : 'border-gray-600 bg-gray-700 text-white'
                  }`}
                />
                {savingStates[filter.id] && (
                  <p className="mt-1 text-xs text-blue-500">Sauvegarde en cours...</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
