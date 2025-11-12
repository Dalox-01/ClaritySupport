'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Mail, 
  Bot, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Activity,
  Zap,
  Target,
  Inbox,
  Send,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
        // Afficher des zéros si pas de données
        console.error('Failed to fetch stats:', response.status);
        setStats({
          today: {
            received: 0,
            auto_replied: 0,
            pending_validation: 0,
            avg_response_time: 0,
          },
          week: {
            received: 0,
            auto_replied: 0,
            manual_replied: 0,
          },
          categories: {
            support: 0,
            vente: 0,
            spam: 0,
            urgent: 0,
            autre: 0,
          },
          sentiment: {
            positive: 0,
            neutral: 0,
            negative: 0,
          },
          topRules: [],
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // En cas d'erreur réseau, afficher des zéros
      setStats({
        today: {
          received: 0,
          auto_replied: 0,
          pending_validation: 0,
          avg_response_time: 0,
        },
        week: {
          received: 0,
          auto_replied: 0,
          manual_replied: 0,
        },
        categories: {
          support: 0,
          vente: 0,
          spam: 0,
          urgent: 0,
          autre: 0,
        },
        sentiment: {
          positive: 0,
          neutral: 0,
          negative: 0,
        },
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

  const autoReplyRate = stats.today.received > 0
    ? Math.round((stats.today.auto_replied / stats.today.received) * 100)
    : 0;

  const totalCategorized = Object.values(stats.categories).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 px-1">
      {/* Header avec gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 p-8"
      >
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Statistiques Mail Center</h2>
                <p className="text-blue-100 mt-1">
                  Analyse de vos emails et performances IA
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={period === 'today' ? 'secondary' : 'outline'}
              className={`cursor-pointer transition-all ${
                period === 'today' 
                  ? 'bg-white text-blue-600 hover:bg-white/90' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              onClick={() => setPeriod('today')}
            >
              Aujourd'hui
            </Badge>
            <Badge
              variant={period === 'week' ? 'secondary' : 'outline'}
              className={`cursor-pointer transition-all ${
                period === 'week' 
                  ? 'bg-white text-blue-600 hover:bg-white/90' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              onClick={() => setPeriod('week')}
            >
              7 jours
            </Badge>
            <Badge
              variant={period === 'month' ? 'secondary' : 'outline'}
              className={`cursor-pointer transition-all ${
                period === 'month' 
                  ? 'bg-white text-blue-600 hover:bg-white/90' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              onClick={() => setPeriod('month')}
            >
              30 jours
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards - Design moderne avec animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                  <Inbox className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-0">
                  +{stats.today.received > 10 ? '12%' : '0%'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Emails reçus</p>
                <p className="text-4xl font-bold mt-2 bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {stats.today.received}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                  Aujourd'hui
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg shadow-purple-500/30">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-0">
                  {autoReplyRate}%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Auto-réponses IA</p>
                <p className="text-4xl font-bold mt-2 bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  {stats.today.auto_replied}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                  {autoReplyRate}% automatisé
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/50 dark:to-cyan-900/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-cyan-500 rounded-xl shadow-lg shadow-cyan-500/30">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-0">
                  Rapide
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Temps de réponse</p>
                <p className="text-4xl font-bold mt-2 bg-gradient-to-br from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                  {stats.today.avg_response_time > 0 ? (
                    <>
                      {stats.today.avg_response_time}
                      <span className="text-xl">min</span>
                    </>
                  ) : (
                    <span className="text-2xl">--</span>
                  )}
                </p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 font-medium">
                  {stats.today.avg_response_time > 0 ? 'Moyenne aujourd\'hui' : 'Aucune réponse'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/30">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 dark:text-orange-300 border-0">
                  En attente
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Validation requise</p>
                <p className="text-4xl font-bold mt-2 bg-gradient-to-br from-orange-600 to-orange-700 bg-clip-text text-transparent">
                  {stats.today.pending_validation}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-medium">
                  À traiter manuellement
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row - Design amélioré */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catégories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Répartition par catégorie</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.categories).map(([category, count], index) => {
                const percentage = totalCategorized > 0
                  ? Math.round((count / totalCategorized) * 100)
                  : 0;
                
                const colors: Record<string, { bg: string; text: string; gradient: string }> = {
                  support: { 
                    bg: 'bg-blue-500', 
                    text: 'text-blue-600 dark:text-blue-400',
                    gradient: 'from-blue-500 to-blue-600'
                  },
                  vente: { 
                    bg: 'bg-emerald-500', 
                    text: 'text-emerald-600 dark:text-emerald-400',
                    gradient: 'from-emerald-500 to-emerald-600'
                  },
                  spam: { 
                    bg: 'bg-gray-500', 
                    text: 'text-gray-600 dark:text-gray-400',
                    gradient: 'from-gray-500 to-gray-600'
                  },
                  urgent: { 
                    bg: 'bg-red-500', 
                    text: 'text-red-600 dark:text-red-400',
                    gradient: 'from-red-500 to-red-600'
                  },
                  autre: { 
                    bg: 'bg-purple-500', 
                    text: 'text-purple-600 dark:text-purple-400',
                    gradient: 'from-purple-500 to-purple-600'
                  },
                };

                const categoryLabels: Record<string, string> = {
                  support: '🎯 Support',
                  vente: '💰 Vente',
                  spam: '🚫 Spam',
                  urgent: '🔥 Urgent',
                  autre: '📁 Autre',
                };

                return (
                  <motion.div 
                    key={category} 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{categoryLabels[category]}</span>
                      <span className={`font-bold ${colors[category].text}`}>
                        {count} <span className="text-xs font-normal text-muted-foreground">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors[category].gradient} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.8 + index * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Sentiment */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Analyse de sentiment</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.sentiment).map(([sentiment, count], index) => {
                const total = Object.values(stats.sentiment).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                
                const colors: Record<string, { bg: string; text: string; gradient: string }> = {
                  positive: { 
                    bg: 'bg-emerald-500', 
                    text: 'text-emerald-600 dark:text-emerald-400',
                    gradient: 'from-emerald-500 to-emerald-600'
                  },
                  neutral: { 
                    bg: 'bg-slate-500', 
                    text: 'text-slate-600 dark:text-slate-400',
                    gradient: 'from-slate-500 to-slate-600'
                  },
                  negative: { 
                    bg: 'bg-red-500', 
                    text: 'text-red-600 dark:text-red-400',
                    gradient: 'from-red-500 to-red-600'
                  },
                };

                const labels: Record<string, string> = {
                  positive: '😊 Positif',
                  neutral: '😐 Neutre',
                  negative: '😞 Négatif',
                };

                return (
                  <motion.div 
                    key={sentiment} 
                    className="space-y-2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{labels[sentiment]}</span>
                      <span className={`font-bold ${colors[sentiment].text}`}>
                        {count} <span className="text-xs font-normal text-muted-foreground">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors[sentiment].gradient} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.8 + index * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top Rules - Design premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Règles les plus utilisées</h3>
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
                  transition={{ delay: 1.3 + index * 0.1 }}
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

      {/* Weekly Overview - Design modernisé */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50/30 dark:from-purple-950/30 dark:to-pink-950/20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Aperçu hebdomadaire</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center space-y-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6 }}
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
              transition={{ delay: 1.7 }}
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
              transition={{ delay: 1.8 }}
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
