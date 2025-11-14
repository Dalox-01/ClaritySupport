"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import type { TicketMetric } from "@/types/types";
import ChartTitle from "../../components/chart-title";
import Chart from "./chart";
import { DatePickerWithRange } from "./components/date-range-picker";
import MetricCard from "./components/metric-card";

const calMetricCardValue = (
  data: TicketMetric[],
  type: "created" | "resolved",
) => {
  const filteredData = data.filter((item) => item.type === type);
  if (filteredData.length === 0) return 0;
  return Math.round(
    filteredData.reduce((acc, curr) => acc + curr.count, 0) /
      filteredData.length,
  );
};

export default function AverageTicketsCreated() {
  const [emailData, setEmailData] = useState<TicketMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmailData = async () => {
      try {
        const response = await fetch('/api/mail-center/stats?period=week');
        const data = await response.json();
        
        if (data.week) {
          // Generate last 7 days of data
          const chartData: TicketMetric[] = [];
          const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
          const today = new Date();
          
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayName = daysOfWeek[date.getDay()];
            
            // Simulate distribution across week (in production, this should come from API)
            const received = Math.floor((data.week.received || 0) / 7);
            const replied = Math.floor((data.week.auto_replied + data.week.manual_replied || 0) / 7);
            
            chartData.push({
              date: dayName,
              count: received,
              type: "created",
            });
            chartData.push({
              date: dayName,
              count: replied,
              type: "resolved",
            });
          }
          
          setEmailData(chartData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données emails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmailData();
  }, []);

  const avgCreated = calMetricCardValue(emailData, "created");
  const avgResolved = calMetricCardValue(emailData, "resolved");

  return (
    <section className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <ChartTitle title="Volume d'Emails" icon={Mail} />
        <DatePickerWithRange className="" />
      </div>
      <div className="flex flex-wrap">
        <div className="my-4 flex w-52 shrink-0 flex-col justify-center gap-6">
          <MetricCard
            title="Moy. Emails Reçus"
            value={avgCreated}
            color="#60C2FB"
          />
          <MetricCard
            title="Moy. Emails Traités"
            value={avgResolved}
            color="#3161F8"
          />
        </div>
        <div className="relative h-96 min-w-[320px] flex-1">
          <Chart />
        </div>
      </div>
    </section>
  );
}
