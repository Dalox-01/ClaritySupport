'use client';

import { Settings, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserFilter } from '@/types/filters';
import * as Icons from 'lucide-react';

interface FilterCardProps {
  filter: UserFilter;
  isDefault: boolean;
  onConfigure: (filterId: string) => void;
  onDelete?: (filterId: string) => void;
  isLightMode?: boolean;
  canDeleteDefault?: boolean;
}

export function FilterCard({ filter, isDefault, onConfigure, onDelete, isLightMode = false, canDeleteDefault = false }: FilterCardProps) {
  // Récupérer l'icône dynamiquement
  const IconComponent = (Icons as any)[filter.icon] || Icons.Filter;
  const allowDeletion = onDelete && (!isDefault || canDeleteDefault);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
        isLightMode
          ? 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
          : 'border-gray-700 bg-gray-800 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10'
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Badge couleur avec icône */}
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
          style={{ backgroundColor: filter.color }}
        >
          <IconComponent className="h-6 w-6 text-white" strokeWidth={2} />
        </div>

        {/* Informations */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold truncate ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              {filter.name}
            </h3>
            {isDefault && (
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                Par défaut
              </span>
            )}
          </div>
          
          <div className={`mt-1 flex items-center gap-3 text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
            <span>{filter.usage_count} utilisations</span>
            <span>•</span>
            <span>{filter.keywords.length} mots-clés</span>
          </div>

          {filter.description && (
            <p className={`mt-1 text-xs truncate ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {filter.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onConfigure(filter.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              isLightMode
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-blue-900/50 text-blue-400 hover:bg-blue-900'
            }`}
          >
            <Settings className="h-4 w-4" />
            {isDefault ? 'Configurer' : 'Modifier'}
          </button>

          {allowDeletion && (
            <button
              onClick={() => onDelete(filter.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                isLightMode
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-red-900/50 text-red-400 hover:bg-red-900'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              {isDefault ? 'Retirer' : 'Supprimer'}
            </button>
          )}
        </div>
      </div>

      {/* Barre de progression (optionnel - pour visualiser l'activité) */}
      {!filter.is_active && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
          <div className="h-full bg-gray-400" style={{ width: '0%' }} />
        </div>
      )}
    </motion.div>
  );
}
