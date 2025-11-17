'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Zap, Filter as FilterIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserFilter, FilterLimits, FilterUsage } from '@/types/filters';
import { FilterCard } from './filter-card';
import { FilterConfigModal } from './filter-config-modal';
import { toast } from 'sonner';

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

  // Fetch filters + usage + limits
  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    setIsLoading(true);
    try {
      const [filtersRes, usageRes, limitsRes] = await Promise.all([
        fetch('/api/filters'),
        fetch('/api/filters/usage'),
        fetch('/api/filters/limits'),
      ]);

      if (filtersRes.ok) {
        const data = await filtersRes.json();
        setFilters(data.filters || []);
      }

      if (usageRes.ok) {
        const data = await usageRes.json();
        setUsage(data);
      }

      if (limitsRes.ok) {
        const data = await limitsRes.json();
        setLimits(data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des filtres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFilter = () => {
    if (!limits) return;

    const customFiltersCount = filters.filter((f) => !f.is_default).length;

    if (limits.max_custom_filters !== -1 && customFiltersCount >= limits.max_custom_filters) {
      toast.error('Limite de filtres atteinte', {
        description: `Votre plan ${userPlan} autorise ${limits.max_custom_filters} filtre(s) personnalisé(s). Passez à un plan supérieur.`,
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
      setIsCreating(false);
      setSelectedFilter(filter);
      setIsModalOpen(true);
    }
  };

  const handleDeleteFilter = async (filterId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce filtre ?')) return;

    try {
      const res = await fetch('/api/filters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filterId }),
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

  const handleSaveFilter = async (data: Partial<UserFilter>) => {
    try {
      const method = isCreating ? 'POST' : 'PATCH';
      const res = await fetch('/api/filters', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await fetchFilters();
        setIsModalOpen(false);
      } else {
        const error = await res.json();
        throw new Error(error.error);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const defaultFilters = filters.filter((f) => f.is_default);
  const customFilters = filters.filter((f) => !f.is_default);

  const stats = [
    {
      icon: FilterIcon,
      label: 'Filtres actifs',
      value: usage?.total_active_filters || 0,
      color: '#3B82F6',
    },
    {
      icon: Zap,
      label: 'Emails traités',
      value: usage?.total_emails_processed || 0,
      color: '#10B981',
    },
    {
      icon: TrendingUp,
      label: 'Taux de succès',
      value: usage?.total_emails_processed
        ? `${Math.round((usage.successful_matches / usage.total_emails_processed) * 100)}%`
        : '0%',
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
            {limits && limits.max_custom_filters === -1
              ? 'Filtres personnalisés illimités'
              : `${customFilters.length} / ${limits?.max_custom_filters || 0} filtres personnalisés utilisés`}
          </p>
        </div>
        <button
          onClick={handleCreateFilter}
          disabled={
            limits?.max_custom_filters !== -1 &&
            customFilters.length >= (limits?.max_custom_filters || 0)
          }
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          Créer un filtre
        </button>
      </div>

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
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFilter}
        isLightMode={isLightMode}
      />
    </div>
  );
}
