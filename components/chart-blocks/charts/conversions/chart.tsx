"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface FilterData {
  name: string;
  count: number;
  color: string;
}

export default function Chart() {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<FilterData[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('/api/mail-center/stats?period=week');
        const data = await response.json();
        
        if (data.filters && data.filters.length > 0) {
          // Utiliser directement les filtres du backend et trier du plus grand au plus petit
          const filterData: FilterData[] = data.filters
            .filter((f: any) => f.count > 0)
            .map((f: any) => ({
              name: f.label,
              count: f.count,
              color: f.color
            }))
            .sort((a: FilterData, b: FilterData) => b.count - a.count);
          
          setFilters(filterData);
        } else {
          setFilters([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des filtres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (filters.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Aucun filtre actif
      </div>
    );
  }

  // Calculate circle sizes based on count
  const maxCount = Math.max(...filters.map(f => f.count));
  const minSize = 60;
  const maxSize = 120;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-visible p-4">
      {filters.length === 0 ? (
        <div className="text-sm text-slate-400">Aucun filtre détecté</div>
      ) : (
        <div className="relative h-full w-full overflow-visible">
          {/* Cercle principal au centre - Le plus gros filtre */}
          {filters[0] && (
            <div
              className="absolute z-10 flex flex-col items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:z-30 group cursor-pointer border-4 border-white/20"
              style={{
                width: '140px',
                height: '140px',
                background: `linear-gradient(135deg, ${filters[0].color} 0%, ${filters[0].color}dd 100%)`,
                boxShadow: `0 8px 32px ${filters[0].color}66, 0 0 0 4px ${filters[0].color}22`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="text-4xl font-bold text-white drop-shadow-lg">{filters[0].count}</div>
              <div className="mt-1.5 px-3 text-center text-xs font-semibold uppercase tracking-wider text-white/95 drop-shadow-md">
                {filters[0].name}
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900/95 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white opacity-0 shadow-2xl transition-opacity group-hover:opacity-100 border border-white/10">
                {filters[0].name}: {filters[0].count} email{filters[0].count > 1 ? 's' : ''}
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900/95"></div>
              </div>
            </div>
          )}

          {/* Cercles satellites - Positionnés autour et se chevauchant légèrement */}
          {filters.slice(1).map((filter, index) => {
            const totalSatellites = filters.length - 1;
            // Angles variés pour un placement plus organique
            const baseAngle = (index * 360) / totalSatellites;
            const angleVariation = (Math.sin(index * 2.3) * 15); // Variation naturelle
            const angle = baseAngle + angleVariation - 90;
            const radian = (angle * Math.PI) / 180;
            
            // Distance plus proche pour créer le chevauchement
            const radius = 85 + (Math.cos(index * 1.7) * 15); // Variation de distance
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;
            
            // Taille dynamique basée sur le ratio avec le principal
            const sizeRatio = filter.count / filters[0].count;
            const size = Math.max(75, Math.min(110, 75 + sizeRatio * 45));
            
            // Z-index alterné pour effet de profondeur
            const zIndex = 5 + (index % 3);

            return (
              <div
                key={filter.name}
                className="absolute flex flex-col items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:z-30 group cursor-pointer border-3 border-white/30"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  background: `linear-gradient(135deg, ${filter.color} 0%, ${filter.color}dd 100%)`,
                  boxShadow: `0 8px 24px ${filter.color}55, 0 0 0 3px ${filter.color}33, inset 0 2px 8px rgba(255,255,255,0.2)`,
                  top: '50%',
                  left: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  zIndex: zIndex
                }}
              >
                <div className="text-2xl font-bold text-white drop-shadow-lg">{filter.count}</div>
                <div className="mt-0.5 px-2 text-center text-xs font-semibold uppercase tracking-wide leading-tight text-white/95 drop-shadow-md">
                  {filter.name}
                </div>
                
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900/95 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white opacity-0 shadow-2xl transition-opacity group-hover:opacity-100 border border-white/10">
                  {filter.name}: {filter.count} email{filter.count > 1 ? 's' : ''}
                  <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900/95"></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
