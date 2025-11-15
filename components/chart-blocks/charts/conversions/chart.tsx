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
          // Utiliser directement les filtres du backend
          const filterData: FilterData[] = data.filters
            .filter((f: any) => f.count > 0)
            .map((f: any) => ({
              name: f.label,
              count: f.count,
              color: f.color
            }));
          
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
    <div className="flex h-full items-center justify-center p-4">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {filters.map((filter) => {
          const size = minSize + ((filter.count / maxCount) * (maxSize - minSize));
          
          return (
            <div
              key={filter.name}
              className="group relative transition-transform hover:scale-110"
              style={{ width: size, height: size }}
            >
              <div
                className="flex h-full w-full items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl"
                style={{ backgroundColor: filter.color }}
              >
                <span className="text-2xl font-bold text-white">{filter.count}</span>
              </div>
              
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {filter.name}
                <div className="absolute left-1/2 top-full -translate-x-1/2">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
