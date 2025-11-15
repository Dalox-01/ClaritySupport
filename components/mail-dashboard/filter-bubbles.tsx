"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FilterDistribution {
  id: string;
  label: string;
  count: number;
  color: string;
}

interface FilterBubblesProps {
  filters: FilterDistribution[];
  isLightMode?: boolean;
  onFilterClick?: (filterId: string) => void;
}

/**
 * Composant Bubbles pour afficher la répartition des filtres
 * Chaque bubble affiche le nombre d'emails et un tooltip au hover
 */
export default function FilterBubbles({ 
  filters, 
  isLightMode = true,
  onFilterClick 
}: FilterBubblesProps) {
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);

  if (!filters || filters.length === 0) {
    return (
      <div className={cn(
        "p-8 text-center rounded-lg border",
        isLightMode 
          ? "border-gray-200 bg-gray-50 text-gray-500" 
          : "border-slate-700/40 bg-slate-900/30 text-slate-400"
      )}>
        Aucune donnée de filtre disponible
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className={cn(
        "p-6 rounded-lg border",
        isLightMode 
          ? "border-gray-200 bg-white" 
          : "border-slate-700/40 bg-slate-900/30"
      )}
    >
      <h3 className={cn(
        "text-lg font-semibold mb-6",
        isLightMode ? "text-gray-900" : "text-white"
      )}>
        Répartition des Filtres
      </h3>

      <div className="flex flex-wrap gap-6 justify-center">
        {filters.map((filter, index) => (
          <div
            key={filter.id}
            className="relative"
            onMouseEnter={() => setHoveredFilter(filter.id)}
            onMouseLeave={() => setHoveredFilter(null)}
          >
            {/* Bubble */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: index * 0.05, 
                type: "spring", 
                stiffness: 200 
              }}
              whileHover={{ 
                scale: 1.15,
                transition: { duration: 0.2 }
              }}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg transition-all cursor-pointer",
                onFilterClick && "hover:shadow-xl"
              )}
              style={{ 
                backgroundColor: filter.color,
                boxShadow: `0 4px 14px ${filter.color}40`
              }}
              onClick={() => onFilterClick?.(filter.id)}
            >
              {filter.count}
            </motion.div>

            {/* Label sous la bubble */}
            <p className={cn(
              "text-center text-xs font-medium mt-2 max-w-[80px] truncate",
              isLightMode ? "text-gray-600" : "text-slate-400"
            )}>
              {filter.label}
            </p>

            {/* Tooltip au hover */}
            {hoveredFilter === filter.id && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl z-10"
                style={{
                  borderLeft: `3px solid ${filter.color}`
                }}
              >
                <div className="font-semibold">{filter.count} emails</div>
                <div className="text-gray-300 text-xs">{filter.label}</div>
                
                {/* Flèche du tooltip */}
                <div 
                  className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"
                />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Légende (optionnelle) */}
      <div className={cn(
        "mt-6 pt-6 border-t",
        isLightMode ? "border-gray-200" : "border-slate-700"
      )}>
        <p className={cn(
          "text-xs text-center",
          isLightMode ? "text-gray-500" : "text-slate-500"
        )}>
          Survolez une bulle pour voir les détails • Cliquez pour filtrer
        </p>
      </div>
    </motion.div>
  );
}

// Variante: Bubbles compactes (pour sidebar)
export function CompactFilterBubbles({ 
  filters, 
  isLightMode = true 
}: Omit<FilterBubblesProps, 'onFilterClick'>) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.slice(0, 5).map((filter) => (
        <div
          key={filter.id}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:shadow-md cursor-pointer"
          style={{ 
            borderColor: filter.color,
            backgroundColor: `${filter.color}10`
          }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: filter.color }}
          >
            {filter.count}
          </div>
          <span className={cn(
            "text-xs font-medium",
            isLightMode ? "text-gray-700" : "text-slate-300"
          )}>
            {filter.label}
          </span>
        </div>
      ))}
      {filters.length > 5 && (
        <div className={cn(
          "px-3 py-1.5 rounded-full border text-xs",
          isLightMode 
            ? "border-gray-300 bg-gray-100 text-gray-600" 
            : "border-slate-600 bg-slate-800 text-slate-400"
        )}>
          +{filters.length - 5} autres
        </div>
      )}
    </div>
  );
}
