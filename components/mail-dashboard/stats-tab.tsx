"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  EmailMetrics, 
  EmailsTimelineChart, 
  EmailsByCategory, 
  SentimentAnalysis,
  FilterBubbles 
} from "@/components/mail-dashboard";
import { cn } from "@/lib/utils";
import { TrendingUp, RefreshCw } from "lucide-react";

type Period = 'today' | 'week' | 'month';

interface StatsData {
  metrics: {
    total_emails: number;
    unread_emails: number;
    urgent_emails: number;
    avg_response_time: string;
  };
  timeline: Array<{
    date: string;
    received: number;
    sent: number;
  }>;
  categories: Array<{
    type: string;
    value: number;
  }>;
  filters: Array<{
    id: string;
    label: string;
    count: number;
    color: string;
  }>;
  sentiment: Array<{
    category: string;
    score: number;
  }>;
}

export default function StatsTab({ isLightMode = true }: { isLightMode?: boolean }) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('week');
  const [refreshing, setRefreshing] = useState(false);

  // Charger les stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/mail-center/stats?period=${period}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Erreur de chargement des stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage et quand period change
  useEffect(() => {
    fetchStats();
  }, [period]);

  // Rafraîchir manuellement
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setTimeout(() => setRefreshing(false), 500);
  };

  // États de chargement/erreur
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={cn(
            "text-sm font-medium",
            isLightMode ? "text-gray-600" : "text-slate-400"
          )}>
            Chargement des statistiques...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "p-8 rounded-lg border text-center",
        isLightMode 
          ? "border-red-200 bg-red-50" 
          : "border-red-900/50 bg-red-950/30"
      )}>
        <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
          Erreur de chargement
        </p>
        <p className="text-sm text-red-500 dark:text-red-300 mb-4">
          {error}
        </p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={cn(
        "p-8 rounded-lg border text-center",
        isLightMode 
          ? "border-gray-200 bg-gray-50" 
          : "border-slate-700/40 bg-slate-900/30"
      )}>
        <p className={cn(
          "text-gray-500",
          isLightMode ? "text-gray-600" : "text-slate-400"
        )}>
          Aucune donnée disponible
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header avec sélecteur de période */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn(
            "text-2xl font-bold flex items-center gap-2",
            isLightMode ? "text-gray-900" : "text-white"
          )}>
            <TrendingUp className="w-6 h-6 text-blue-500" />
            Statistiques
          </h2>
          <p className={cn(
            "text-sm mt-1",
            isLightMode ? "text-gray-600" : "text-slate-400"
          )}>
            Analyse des emails et performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sélecteur de période */}
          <div className={cn(
            "flex rounded-lg border p-1",
            isLightMode 
              ? "border-gray-200 bg-gray-50" 
              : "border-slate-700 bg-slate-800"
          )}>
            {(['today', 'week', 'month'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  period === p
                    ? "bg-blue-500 text-white shadow-sm"
                    : isLightMode
                    ? "text-gray-600 hover:bg-gray-100"
                    : "text-slate-400 hover:bg-slate-700"
                )}
              >
                {p === 'today' ? "Aujourd'hui" : p === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>

          {/* Bouton rafraîchir */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              "p-2 rounded-lg transition-all",
              isLightMode
                ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300",
              refreshing && "opacity-50 cursor-not-allowed"
            )}
            title="Rafraîchir"
          >
            <RefreshCw 
              className={cn(
                "w-5 h-5",
                refreshing && "animate-spin"
              )} 
            />
          </button>
        </div>
      </div>

      {/* 1. Métriques clés (4 cartes) */}
      <EmailMetrics 
        totalEmails={stats.metrics.total_emails}
        unreadEmails={stats.metrics.unread_emails}
        urgentEmails={stats.metrics.urgent_emails}
        avgResponseTime={stats.metrics.avg_response_time}
        isLightMode={isLightMode}
      />

      {/* 2. Volume d'emails (timeline) */}
      <EmailsTimelineChart 
        data={stats.timeline} 
        isLightMode={isLightMode}
      />

      {/* Grille 2 colonnes pour catégories + sentiment */}
      <div className="grid grid-cols-1 laptop:grid-cols-2 gap-6">
        {/* 3. Répartition par catégorie (pie chart) */}
        <EmailsByCategory 
          data={stats.categories}
          isLightMode={isLightMode}
        />

        {/* 4. Analyse de sentiment (radar chart) */}
        <SentimentAnalysis 
          data={stats.sentiment}
          isLightMode={isLightMode}
        />
      </div>

      {/* 5. Répartition par filtres (bubbles) */}
      <FilterBubbles 
        filters={stats.filters}
        isLightMode={isLightMode}
        onFilterClick={(filterId) => {
          console.log('Filtre cliqué:', filterId);
          // Logique pour filtrer les emails par support_category
        }}
      />

      {/* Footer avec infos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className={cn(
          "p-4 rounded-lg border text-center text-sm",
          isLightMode 
            ? "border-gray-200 bg-gray-50 text-gray-600" 
            : "border-slate-700/40 bg-slate-900/30 text-slate-400"
        )}
      >
        <p>
          Dernière mise à jour: {new Date().toLocaleString('fr-FR')} • 
          Données basées sur {stats.metrics.total_emails} emails
        </p>
      </motion.div>
    </div>
  );
}
