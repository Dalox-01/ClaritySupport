'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Zap, Filter as FilterIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserFilter, FilterLimits, FilterUsage, FilterUpsertPayload, FilterPlan } from '@/types/filters';
import { FilterCard } from './filter-card';
import { FilterConfigModal } from './filter-config-modal';
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
  const [usage, setUsage] = useState<FilterUsage | null>(null);
  const [limits, setLimits] = useState<FilterLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<UserFilter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const effectivePlan: FilterPlan = (limits?.plan as FilterPlan) || userPlan;
  const customFiltersLimit = limits?.max ?? (effectivePlan === 'PRO' ? 5 : effectivePlan === 'ENTERPRISE' ? 999999 : 0);
  const hasUnlimitedCustomFilters = customFiltersLimit >= 999999;
  const canManageDefaultFilters = effectivePlan === 'PRO' || effectivePlan === 'ENTERPRISE';

  // Fetch filters + usage + limits
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
        console.error('Erreur chargement filtres', await filtersRes.text());
        toast.error('Impossible de charger les filtres');
      }

      if (limitsRes.ok) {
        const data = await limitsRes.json();
        setLimits(data.limits || null);
        setUsage(data.usage || null);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des filtres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFilter = () => {
    const customFiltersCount = filters.filter((f) => !f.is_default).length;

    if (!hasUnlimitedCustomFilters && customFiltersCount >= customFiltersLimit) {
      toast.error('Limite de filtres atteinte', {
        description: `Votre plan ${effectivePlan} autorise ${customFiltersLimit} filtre(s) personnalisé(s). Passez à un plan supérieur.`,
      });
      return;
    }

    setIsCreating(true);
    setSelectedFilter(null);
    setIsModalOpen(true);
  };

  const handleConfigureFilter = (filterId: string) => {
    const filter = filters.find((f) => f.id === filterId);
    if (filter) {
      if (filter.is_default && !canManageDefaultFilters) {
        toast.info('Les filtres de base sont modifiables à partir du plan PRO');
        return;
      }
      setIsCreating(false);
      setSelectedFilter(filter);
      setIsModalOpen(true);
    }
  };

  const handleDeleteFilter = async (filterId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce filtre ?')) return;

    const filter = filters.find((f) => f.id === filterId);
    if (!filter) return;

    if (filter.is_default && !canManageDefaultFilters) {
      toast.info('Les filtres de base ne peuvent être retirés qu’avec le plan PRO/Ultimate.');
      return;
    }

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

  const handleSaveFilter = async (data: FilterUpsertPayload) => {
    try {
      const isEditing = Boolean(data.id);
      const endpoint = isEditing ? `/api/filters/${data.id}` : '/api/filters';
      const method = isEditing ? 'PATCH' : 'POST';
      const payload: Record<string, any> = {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        keywords: data.keywords,
        detection_rules: data.detection_rules,
        response_config: data.response_config,
        is_active: data.is_active,
      };

      if (!isEditing) {
        payload.filter_key = data.filter_key || slugifyFilterKey(data.name);
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(error.error || 'Erreur lors de la sauvegarde');
      }

      await fetchFilters();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
      throw error;
    }
  };

  const defaultFilters = filters.filter((f) => f.is_default);
  const customFilters = filters.filter((f) => !f.is_default);

  const stats = [
    {
      icon: FilterIcon,
      label: 'Filtres actifs',
      value: filters.length,
      color: '#3B82F6',
    },
    {
      icon: Zap,
      label: 'Classifications IA',
      value: usage?.totalClassifications || 0,
      color: '#10B981',
    },
    {
      icon: TrendingUp,
      label: 'Filtres personnalisés',
      value: hasUnlimitedCustomFilters
        ? `${customFilters.length} actifs`
        : `${customFilters.length} / ${customFiltersLimit}`,
      color: '#F59E0B',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
            Gestion des Filtres
          </h2>
          <p className={`mt-1 text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
            {hasUnlimitedCustomFilters
              ? 'Filtres personnalisés illimités'
              : `${customFilters.length} / ${customFiltersLimit} filtres personnalisés utilisés`}
          </p>
        </div>
        <button
          onClick={handleCreateFilter}
          disabled={!hasUnlimitedCustomFilters && customFilters.length >= customFiltersLimit}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          Créer un filtre
        </button>
      </div>

      {!canManageDefaultFilters && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            isLightMode
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
          }`}
        >
          ✨ Les filtres basés sur l'IA et la suppression des filtres par défaut sont disponibles à partir du plan PRO.
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border-2 p-4 ${
                isLightMode
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: stat.color + '20' }}
                >
                  <Icon className="h-6 w-6" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filtres par défaut */}
      {defaultFilters.length > 0 && (
        <div>
          <h3 className={`mb-3 text-lg font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
            Filtres par défaut
          </h3>
          <div className="space-y-3">
            {defaultFilters.map((filter) => (
              <FilterCard
                key={filter.id}
                filter={filter}
                isDefault={true}
                onConfigure={handleConfigureFilter}
                onDelete={canManageDefaultFilters ? handleDeleteFilter : undefined}
                canDeleteDefault={canManageDefaultFilters}
                isLightMode={isLightMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filtres personnalisés */}
      <div>
        <h3 className={`mb-3 text-lg font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
          Filtres personnalisés
        </h3>
        {customFilters.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 ${
              isLightMode ? 'border-gray-300 bg-gray-50' : 'border-gray-700 bg-gray-800'
            }`}
          >
            <FilterIcon className={`mb-4 h-12 w-12 ${isLightMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <p className={`text-lg font-semibold ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
              Aucun filtre personnalisé
            </p>
            <p className={`mt-1 text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Cliquez sur "Créer un filtre" pour commencer
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {customFilters.map((filter) => (
              <FilterCard
                key={filter.id}
                filter={filter}
                isDefault={false}
                onConfigure={handleConfigureFilter}
                onDelete={handleDeleteFilter}
                canDeleteDefault={canManageDefaultFilters}
                isLightMode={isLightMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <FilterConfigModal
        filter={selectedFilter}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFilter(null);
        }}
        onSave={handleSaveFilter}
        isLightMode={isLightMode}
      />
    </div>
  );
}
