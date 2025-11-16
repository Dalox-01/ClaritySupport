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
    <div className="relative flex h-full w-full items-center justify-center p-4">
      {filters.length === 0 ? (
        <div className="text-sm text-slate-400">Aucun filtre détecté</div>
      ) : (
        <div className="relative h-full w-full">
          {/* Plus grand filtre au centre */}
          {filters[0] && (
            <div
              className="absolute z-10 flex flex-col items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 group cursor-pointer"
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: filters[0].color || '#3b82f6',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="text-3xl font-bold text-white">{filters[0].count}</div>
              <div className="mt-1 px-2 text-center text-xs font-medium text-white/90">{filters[0].name}</div>
              
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                {filters[0].name}: {filters[0].count} email{filters[0].count > 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Filtres satellites autour */}
          {filters.slice(1).map((filter, index) => {
            const totalSatellites = filters.length - 1;
            const angle = (index * 360) / totalSatellites - 90;
            const radian = (angle * Math.PI) / 180;
            const radius = 140;
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;
            
            const size = Math.min(90, Math.max(60, 60 + (filter.count / filters[0].count) * 30));

            return (
              <div
                key={filter.name}
                className="absolute flex flex-col items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 group cursor-pointer"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: filter.color || '#64748b',
                  top: '50%',
                  left: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                }}
              >
                <div className="text-xl font-bold text-white">{filter.count}</div>
                <div className="mt-0.5 px-1 text-center text-xs font-medium leading-tight text-white/90">{filter.name}</div>
                
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                  {filter.name}: {filter.count} email{filter.count > 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
