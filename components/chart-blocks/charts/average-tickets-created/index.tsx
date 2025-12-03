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
        
        if (data.timeline && data.timeline.length > 0) {
          // Convertir les données timeline en format TicketMetric
          const chartData: TicketMetric[] = [];
          const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
          
          data.timeline.forEach((day: any) => {
            // Extraire le jour de la semaine depuis la date
            const dateObj = new Date(day.date);
            const dayName = daysOfWeek[dateObj.getDay()];
            
            chartData.push({
              date: dayName,
              count: day.received || 0,
              type: "created",
            });
            chartData.push({
              date: dayName,
              count: day.sent || 0,
              type: "resolved",
            });
          });
          
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
    <section className="flex h-full flex-col gap-1">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <ChartTitle title="Volume d'Emails" icon={Mail} />
        <DatePickerWithRange className="scale-75 origin-top-right" />
      </div>
      <div className="relative flex-1 min-h-0">
        <Chart />
      </div>
    </section>
  );
}
