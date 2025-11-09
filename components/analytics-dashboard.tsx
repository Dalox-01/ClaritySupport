'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Mail, 
  Bot, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Activity
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Statistiques Mail Center</h2>
          <p className="text-muted-foreground mt-1">
            Analyse de vos emails et performances IA
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={period === 'today' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setPeriod('today')}
          >
            Aujourd'hui
          </Badge>
          <Badge
            variant={period === 'week' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setPeriod('week')}
          >
            7 jours
          </Badge>
          <Badge
            variant={period === 'month' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setPeriod('month')}
          >
            30 jours
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Emails reçus</p>
              <p className="text-3xl font-bold mt-2">{stats.today.received}</p>
              <p className="text-xs text-blue-500 mt-1">Aujourd'hui</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Mail className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Auto-réponses</p>
              <p className="text-3xl font-bold mt-2">{stats.today.auto_replied}</p>
              <p className="text-xs text-blue-500 mt-1">
                {autoReplyRate}% automatisé
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Bot className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Temps de réponse</p>
              <p className="text-3xl font-bold mt-2">
                {stats.today.avg_response_time > 0 ? (
                  <>
                    {stats.today.avg_response_time}
                    <span className="text-lg">min</span>
                  </>
                ) : (
                  <span className="text-lg text-muted-foreground">--</span>
                )}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                {stats.today.avg_response_time > 0 ? 'Moyenne' : 'Aucune réponse'}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-3xl font-bold mt-2">
                {stats.today.pending_validation}
              </p>
              <p className="text-xs text-orange-500 mt-1">Validation requise</p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catégories */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Répartition par catégorie</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.categories).map(([category, count]) => {
              const percentage = totalCategorized > 0
                ? Math.round((count / totalCategorized) * 100)
                : 0;
              
              const colors: Record<string, string> = {
                support: 'bg-blue-500',
                vente: 'bg-blue-600',
                spam: 'bg-gray-500',
                urgent: 'bg-red-500',
                autre: 'bg-purple-500',
              };

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{category}</span>
                    <span className="font-semibold">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[category]} transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Sentiment */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Analyse de sentiment</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.sentiment).map(([sentiment, count]) => {
              const total = Object.values(stats.sentiment).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              
              const colors: Record<string, string> = {
                positive: 'bg-blue-500',
                neutral: 'bg-gray-500',
                negative: 'bg-red-500',
              };

              const labels: Record<string, string> = {
                positive: 'Positif',
                neutral: 'Neutre',
                negative: 'Négatif',
              };

              return (
                <div key={sentiment} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{labels[sentiment]}</span>
                    <span className="font-semibold">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[sentiment]} transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Rules */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Règles les plus utilisées</h3>
        </div>
        {stats.topRules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Aucune règle d'automatisation activée</p>
            <p className="text-xs mt-2">Configurez l'IA pour voir les statistiques</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.topRules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {rule.triggered} déclenchement{rule.triggered > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={rule.success_rate >= 90 ? 'default' : 'secondary'}
                  className="gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {rule.success_rate}% succès
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Weekly Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Aperçu hebdomadaire</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.week.received}</p>
            <p className="text-sm text-muted-foreground mt-1">Emails reçus</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {stats.week.auto_replied}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Auto-répondus</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">
              {stats.week.manual_replied}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Réponses manuelles</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
