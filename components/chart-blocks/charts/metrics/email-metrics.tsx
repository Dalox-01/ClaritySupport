"use client";

import { useState, useEffect } from "react";
import MetricCard from "./components/metric-card";

type EmailMetrics = {
  totalEmails: number;
  unreadEmails: number;
  urgentEmails: number;
  avgResponseTime: string;
  changes: {
    totalChange: number;
    unreadChange: number;
    urgentChange: number;
    responseTimeChange: number;
  };
};

export default function EmailMetrics() {
  const [metrics, setMetrics] = useState<EmailMetrics>({
    totalEmails: 0,
    unreadEmails: 0,
    urgentEmails: 0,
    avgResponseTime: "0 min",
    changes: {
      totalChange: 0,
      unreadChange: 0,
      urgentChange: 0,
      responseTimeChange: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      // Récupérer les stats du backend
      const response = await fetch("/api/mail-center/stats?period=today");
      
      if (response.ok) {
        const data = await response.json();
        
        setMetrics({
          totalEmails: data.today?.received || 0,
          unreadEmails: data.today?.pending_validation || 0,
          urgentEmails: data.categories?.urgent || 0,
          avgResponseTime: data.today?.avg_response_time > 0 
            ? `${data.today.avg_response_time} min`
            : "N/A",
          changes: {
            totalChange: 0.12, // TODO: Calculer depuis les données historiques
            unreadChange: -0.08,
            urgentChange: 0.03,
            responseTimeChange: -0.15,
          },
        });
      } else {
        console.error("Failed to load email metrics");
      }
    } catch (error) {
      console.error("Error loading email metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const metricsData = [
    {
      title: "Total Emails",
      value: metrics.totalEmails.toString(),
      change: metrics.changes.totalChange,
    },
    {
      title: "Non Lus",
      value: metrics.unreadEmails.toString(),
      change: metrics.changes.unreadChange,
    },
    {
      title: "Emails Urgents",
      value: metrics.urgentEmails.toString(),
      change: metrics.changes.urgentChange,
    },
    {
      title: "Temps de Réponse Moyen",
      value: metrics.avgResponseTime,
      change: metrics.changes.responseTimeChange,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-0.5"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {metricsData.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
