"use client";

import { useEffect, useState } from "react";
import { VChart } from "@visactor/react-vchart";
import type { IBarChartSpec } from "@visactor/vchart";
import type { TicketMetric } from "@/types/types";

const generateSpec = (data: TicketMetric[]): IBarChartSpec => ({
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
  legends: {
    visible: false,
  },
  stack: false,
  tooltip: {
    trigger: ["click", "hover"],
  },
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const spec = generateSpec(emailData);
  return <VChart spec={spec} />;
}
