'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Trash2, Edit2, Check } from 'lucide-react';
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
  const [editingFilterName, setEditingFilterName] = useState<string | null>(null);
  const [tempFilterName, setTempFilterName] = useState<string>('');

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

  const handleStartEditName = (filter: UserFilter) => {
    setEditingFilterName(filter.id);
    setTempFilterName(filter.name);
  };

  const handleSaveFilterName = async (filterId: string) => {
    if (!tempFilterName.trim()) {
      toast.error('Le nom du filtre ne peut pas être vide');
      return;
    }

    await handleUpdateFilter(filterId, { name: tempFilterName.trim() });
    setEditingFilterName(null);
    setTempFilterName('');
  };

  const handleCancelEditName = () => {
    setEditingFilterName(null);
    setTempFilterName('');
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
            className={`rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
              isLightMode 
                ? 'border-gray-200 bg-gradient-to-br from-white to-gray-50/50' 
                : 'border-gray-700 bg-gradient-to-br from-gray-800 to-gray-800/50'
            }`}
          >
            {/* Header - Nom du filtre éditable */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 flex-1">
                {editingFilterName === filter.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={tempFilterName}
                      onChange={(e) => setTempFilterName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveFilterName(filter.id);
                        if (e.key === 'Escape') handleCancelEditName();
                      }}
                      autoFocus
                      className={`flex-1 px-3 py-1.5 rounded-lg border-2 font-semibold text-base ${
                        isLightMode
                          ? 'border-blue-400 bg-white text-gray-900 focus:border-blue-500'
                          : 'border-blue-500 bg-gray-700 text-white focus:border-blue-400'
                      }`}
                    />
                    <button
                      onClick={() => handleSaveFilterName(filter.id)}
                      className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                      title="Sauvegarder"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelEditName}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isLightMode
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      title="Annuler"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                      {filter.name}
                    </h3>
                    <button
                      onClick={() => handleStartEditName(filter)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isLightMode
                          ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                      }`}
                      title="Modifier le nom"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </>
                )}
                {filter.is_default && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    isLightMode
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    Par défaut
                  </span>
                )}
              </div>
              {!filter.is_default && (
                <button
                  onClick={() => handleDeleteFilter(filter.id)}
                  className={`p-2 rounded-lg transition-all hover:scale-105 ${
                    isLightMode 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-red-400 hover:bg-red-500/10'
                  }`}
                  title="Supprimer le filtre"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Section Mots-clés */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <label className={`block text-sm font-semibold ${
                  isLightMode ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  🏷️ Mots-clés de détection
                </label>
                <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {(filter.keywords || []).length} mot{(filter.keywords || []).length !== 1 ? 's' : ''}-clé{(filter.keywords || []).length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Affichage des mots-clés existants */}
              {(filter.keywords || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(filter.keywords || []).map((keyword) => (
                    <span
                      key={keyword}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                        isLightMode
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 hover:border-blue-300'
                          : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/30 hover:border-blue-400/40'
                      }`}
                    >
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(filter.id, keyword)}
                        className={`hover:scale-110 transition-transform ${
                          isLightMode ? 'hover:text-red-600' : 'hover:text-red-400'
                        }`}
                        title="Supprimer ce mot-clé"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Champ d'ajout de mot-clé */}
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
                  placeholder="Ajouter un mot-clé (ex: urgent, remboursement...)"
                  className={`flex-1 px-4 py-2.5 rounded-lg border-2 text-sm transition-colors ${
                    isLightMode
                      ? 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                      : 'border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
                <button
                  onClick={() => handleAddKeyword(filter.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </button>
              </div>
            </div>

            {/* Section Prompt Contexte */}
            <div className="space-y-3">
              <label className={`block text-sm font-semibold ${
                isLightMode ? 'text-gray-700' : 'text-gray-300'
              }`}>
                🤖 Prompt Contexte (Consignes IA)
              </label>
              <textarea
                value={filter.response_config?.customInstructions || ''}
                onChange={(e) => handleUpdateInstructions(filter.id, e.target.value)}
                placeholder="Exemple : Tu dois répondre avec empathie aux demandes de remboursement. Explique clairement la procédure et rassure le client..."
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border-2 text-sm resize-none transition-colors font-mono ${
                  isLightMode
                    ? 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                    : 'border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                }`}
              />
              {savingStates[filter.id] && (
                <div className="flex items-center gap-2 text-xs text-blue-500 animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Sauvegarde automatique en cours...
                </div>
              )}
              <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                💡 Ces consignes seront utilisées par l'IA lors de la classification et génération de réponses pour ce type d'email.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
