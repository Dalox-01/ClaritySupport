"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { VChart } from "@visactor/react-vchart";
import type { IBarChartSpec } from "@visactor/vchart";
import type { TicketMetric } from "@/types/types";

const generateSpec = (data: TicketMetric[], isDark: boolean): IBarChartSpec => ({
  type: "bar",
  data: [
    {
      id: "barData",
      values: data,
    },
  ],
  xField: "date",
  yField: "count",
  seriesField: "type",
  padding: [10, 0, 10, 0],
  background: isDark ? "#0a0a0a" : "#ffffff",
  color: isDark ? ["#3b82f6", "#06b6d4"] : ["#2563eb", "#0891b2"],
  legends: {
    visible: false,
  },
  stack: false,
  tooltip: {
    trigger: ["click", "hover"],
    style: {
      panel: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        border: { color: isDark ? "#374151" : "#e5e7eb", width: 1 },
      },
      shape: {
        shapeType: "circle",
      },
      titleLabel: {
        fill: isDark ? "#f3f4f6" : "#111827",
      },
      keyLabel: {
        fill: isDark ? "#d1d5db" : "#4b5563",
      },
      valueLabel: {
        fill: isDark ? "#f3f4f6" : "#111827",
      },
    },
  },
  axes: [
    {
      orient: "bottom",
      type: "band",
      label: {
        style: {
          fill: isDark ? "#9ca3af" : "#6b7280",
        },
      },
      domainLine: {
        visible: true,
        style: {
          stroke: isDark ? "#374151" : "#e5e7eb",
        },
      },
      tick: {
        visible: true,
        style: {
          stroke: isDark ? "#374151" : "#e5e7eb",
        },
      },
    },
    {
      orient: "left",
      type: "linear",
      label: {
        style: {
          fill: isDark ? "#9ca3af" : "#6b7280",
        },
      },
      domainLine: {
        visible: false,
      },
      tick: {
        visible: false,
      },
      grid: {
        visible: true,
        style: {
          stroke: isDark ? "#1f2937" : "#f3f4f6",
          lineWidth: 1,
        },
      },
    },
  ],
  bar: {
    state: {
      hover: {
        outerBorder: {
          distance: 2,
          lineWidth: 2,
        },
      },
    },
    style: {
      cornerRadius: [12, 12, 12, 12],
      zIndex: (datum) => {
        return datum.type === "resolved" ? 2 : 1;
      },
    },
  },
});

export default function Chart() {
  const { theme } = useTheme();
  const [emailData, setEmailData] = useState<TicketMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchEmailData = async () => {
      try {
        const response = await fetch('/api/mail-center/stats?period=week');
        const data = await response.json();
        
        if (data.timeline && data.timeline.length > 0) {
          // Utiliser les vraies données de la timeline (7 derniers jours)
          const chartData: TicketMetric[] = [];
          
          data.timeline.forEach((day: { date: string; received: number; sent: number }) => {
            // Email reçus
            chartData.push({
              date: day.date,
              count: day.received,
              type: "created",
            });
            
            // Email traités (réponses envoyées)
            chartData.push({
              date: day.date,
              count: day.sent,
              type: "resolved",
            });
          });
          
          setEmailData(chartData);
        } else {
          // Fallback: afficher des jours vides si pas de données
          const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
          const chartData: TicketMetric[] = [];
          
          daysOfWeek.forEach(day => {
            chartData.push({ date: day, count: 0, type: "created" });
            chartData.push({ date: day, count: 0, type: "resolved" });
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const spec = generateSpec(emailData, isDark);
  return <VChart spec={spec} />
}
