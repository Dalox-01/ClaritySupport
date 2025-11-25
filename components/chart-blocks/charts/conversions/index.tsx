"use client";

import { Filter } from "lucide-react";
import { useEffect, useState } from "react";
import ChartTitle from "../../components/chart-title";
import Chart from "./chart";

export default function Conversions() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/mail-center/stats?period=today');
        const data = await response.json();
      } catch (error) {
        console.error('Erreur lors du chargement des filtres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="flex h-full flex-col gap-1">
      <ChartTitle title="Répartition des Filtres" icon={Filter} />
      <div className="relative flex-grow min-h-0">
        <Chart />
      </div>
    </section>
  );
}
