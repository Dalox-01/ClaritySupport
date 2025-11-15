"use client";

import { useEffect, useState } from "react";
import { Mail, AlertCircle, Clock } from "lucide-react";
import ChartTitle from "../../components/chart-title";

interface MetricsData {
  unread: number;
  urgent: number;
  avgResponseTime: string;
}

export default function SimpleMetrics() {
  const [metrics, setMetrics] = useState<MetricsData>({
    unread: 0,
    urgent: 0,
    avgResponseTime: "0h"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/mail-center/stats?period=today');
        const data = await response.json();
        
        if (data.today) {
          setMetrics({
            unread: data.today.pending_validation || 0,
            urgent: data.today.urgent || 0,
            avgResponseTime: data.today.avg_response_time || "0h"
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des métriques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <section className="flex h-full flex-col gap-1">
        <ChartTitle title="Métriques Clés" icon={Mail} />
        <div className="flex h-full items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      </section>
    );
  }

  const metricsArray = [
    {
      label: "Total Email Non Lu",
      value: metrics.unread,
      icon: Mail,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400"
    },
    {
      label: "Email Urgent",
      value: metrics.urgent,
      icon: AlertCircle,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/10",
      textColor: "text-red-400"
    },
    {
      label: "Temps de Réponse Moyen",
      value: metrics.avgResponseTime,
      icon: Clock,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
      isTime: true
    }
  ];

  return (
    <section className="flex h-full flex-col gap-2">
      <ChartTitle title="Métriques Clés" icon={Mail} />
      <div className="flex flex-col gap-3 justify-center flex-1">
        {metricsArray.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`relative rounded-lg border border-slate-700/50 ${metric.bgColor} p-3 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`rounded-full bg-gradient-to-br ${metric.color} p-2`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-gray-400">{metric.label}</span>
                </div>
                <span className={`text-2xl font-bold ${metric.textColor}`}>
                  {metric.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
