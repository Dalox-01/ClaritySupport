"use client";

import { Reply } from "lucide-react";
import { useEffect, useState } from "react";
import { addThousandsSeparator } from "@/lib/utils";
import ChartTitle from "../../components/chart-title";
import Chart from "./chart";

export default function Conversions() {
  const [totalReplies, setTotalReplies] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/mail-center/stats?period=week');
        const data = await response.json();
        
        if (data.week) {
          const total = (data.week.auto_replied || 0) + (data.week.manual_replied || 0);
          setTotalReplies(total);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des réponses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="flex h-full flex-col gap-2">
      <ChartTitle title="Réponses Envoyées" icon={Reply} />
      <Indicator totalReplies={totalReplies} loading={loading} />
      <div className="relative max-h-80 flex-grow">
        <Chart />
      </div>
    </section>
  );
}

function Indicator({ totalReplies, loading }: { totalReplies: number; loading: boolean }) {
  return (
    <div className="mt-3">
      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
      ) : (
        <>
          <span className="mr-1 text-2xl font-medium">
            {addThousandsSeparator(totalReplies)}
          </span>
          <span className="text-muted-foreground/60">Cette semaine</span>
        </>
      )}
    </div>
  );
}
