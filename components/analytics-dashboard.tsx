'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle2,
  Activity,
  TrendingUp,
  Mail,
  Bot,
  Send
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  EmailMetrics, 
  EmailsTimelineChart, 
  EmailsByCategory, 
  SentimentAnalysis 
} from '@/components/mail-dashboard';

type DashboardStats = {
  today: {
    received: number;
    auto_replied: number;
    pending_validation: number;
    avg_response_time: number;
  };
  week: {
    received: number;
    auto_replied: number;
    manual_replied: number;
  };
  categories: {
    support: number;
    vente: number;
    spam: number;
    urgent: number;
    autre: number;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topRules: Array<{
    name: string;
    triggered: number;
    success_rate: number;
  }>;
};

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/mail-center/stats?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status);
        setStats({
          today: { received: 0, auto_replied: 0, pending_validation: 0, avg_response_time: 0 },
          week: { received: 0, auto_replied: 0, manual_replied: 0 },
          categories: { support: 0, vente: 0, spam: 0, urgent: 0, autre: 0 },
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          topRules: [],
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        today: { received: 0, auto_replied: 0, pending_validation: 0, avg_response_time: 0 },
        week: { received: 0, auto_replied: 0, manual_replied: 0 },
        categories: { support: 0, vente: 0, spam: 0, urgent: 0, autre: 0 },
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        topRules: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Préparer les données pour les graphiques VChart
  const timelineData = [
    { date: "Lun", received: 45, sent: 32 },
    { date: "Mar", received: 52, sent: 38 },
    { date: "Mer", received: 38, sent: 29 },
    { date: "Jeu", received: 61, sent: 45 },
    { date: "Ven", received: 48, sent: 36 },
    { date: "Sam", received: 23, sent: 15 },
    { date: "Dim", received: 19, sent: 12 },
  ];

  const categoryData = [
    { type: "Support", value: stats.categories.support },
    { type: "Vente", value: stats.categories.vente },
    { type: "Urgent", value: stats.categories.urgent },
    { type: "Spam", value: stats.categories.spam },
    { type: "Autre", value: stats.categories.autre },
  ].filter(item => item.value > 0);

  const sentimentData = [
    { category: "Réactivité", score: 85 },
    { category: "Clarté", score: 78 },
    { category: "Résolution", score: 92 },
    { category: "Satisfaction", score: 88 },
    { category: "Courtoisie", score: 95 },
  ];

  return (
    <div className="space-y-6 px-1">
      {/* Métriques principales avec nouveau design VChart */}
      <EmailMetrics
        totalEmails={stats.today.received}
        unreadEmails={stats.today.pending_validation}
        urgentEmails={stats.categories.urgent}
        avgResponseTime={stats.today.avg_response_time > 0 ? `${stats.today.avg_response_time}min` : "N/A"}
        isLightMode={true}
      />

      {/* Graphique Timeline - Emails reçus/envoyés */}
      <EmailsTimelineChart data={timelineData} isLightMode={true} />

      {/* Grille de graphiques - Répartition et Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmailsByCategory data={categoryData} isLightMode={true} />
        <SentimentAnalysis data={sentimentData} isLightMode={true} />
      </div>

      {/* Top Rules - Stats supplémentaires */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Règles d'Automatisation les Plus Utilisées</h3>
          </div>
          {stats.topRules.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Aucune règle d'automatisation activée</p>
                <p className="text-xs text-muted-foreground mt-1">Configurez l'IA pour voir les statistiques</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topRules.map((rule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="group relative overflow-hidden flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {rule.triggered} déclenchement{rule.triggered > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={rule.success_rate >= 90 ? 'default' : 'secondary'}
                    className={`gap-1 ${
                      rule.success_rate >= 90 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {rule.success_rate}% succès
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Weekly Overview - Statistiques hebdomadaires */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50/30 dark:from-purple-950/30 dark:to-pink-950/20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Aperçu Hebdomadaire</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center space-y-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="inline-flex p-3 bg-blue-500/10 rounded-xl mb-2">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {stats.week.received}
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Emails reçus</p>
            </motion.div>
            <motion.div 
              className="text-center space-y-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 }}
            >
              <div className="inline-flex p-3 bg-purple-500/10 rounded-xl mb-2">
                <Bot className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {stats.week.auto_replied}
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Auto-répondus</p>
            </motion.div>
            <motion.div 
              className="text-center space-y-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
            >
              <div className="inline-flex p-3 bg-pink-500/10 rounded-xl mb-2">
                <Send className="w-6 h-6 text-pink-500" />
              </div>
              <p className="text-4xl font-bold bg-gradient-to-br from-pink-600 to-pink-700 bg-clip-text text-transparent">
                {stats.week.manual_replied}
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Réponses manuelles</p>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
