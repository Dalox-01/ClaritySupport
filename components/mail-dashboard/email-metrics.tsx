"use client";

import { motion } from "framer-motion";
import { Mail, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: any;
  color: string;
  index: number;
  isLightMode: boolean;
}

function MetricCard({ title, value, change, icon: Icon, color, index, isLightMode }: MetricCardProps) {
  const colorClasses = {
    blue: isLightMode ? "from-blue-500/40 to-blue-600/30 shadow-blue-200/50 text-blue-700" : "from-blue-500/30 to-blue-600/20 shadow-blue-500/20 text-blue-300",
    orange: isLightMode ? "from-orange-500/40 to-orange-600/30 shadow-orange-200/50 text-orange-700" : "from-orange-500/30 to-orange-600/20 shadow-orange-500/20 text-orange-300",
    green: isLightMode ? "from-green-500/40 to-green-600/30 shadow-green-200/50 text-green-700" : "from-green-500/30 to-green-600/20 shadow-green-500/20 text-green-300",
    purple: isLightMode ? "from-purple-500/40 to-purple-600/30 shadow-purple-200/50 text-purple-700" : "from-purple-500/30 to-purple-600/20 shadow-purple-500/20 text-purple-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "flex flex-col p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02]",
        isLightMode 
          ? "border-gray-200 bg-white shadow-sm hover:shadow-md" 
          : "border-slate-700/40 bg-slate-900/30 shadow-black/20"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={cn(
          "p-2 rounded-lg bg-gradient-to-br shadow-sm",
          colorClasses[color as keyof typeof colorClasses]
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <span
            className={cn(
              "flex items-center rounded-sm px-2 py-0.5 text-xs",
              change > 0
                ? "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
                : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
            )}
          >
            {change > 0 ? "+" : ""}
            {Math.round(change * 100)}%
            {change > 0 ? (
              <ArrowUpRight className="ml-0.5 inline-block h-3 w-3" />
            ) : (
              <ArrowDownRight className="ml-0.5 inline-block h-3 w-3" />
            )}
          </span>
        )}
      </div>
      <h3 className={cn(
        "text-xs font-semibold uppercase tracking-wide mb-1",
        isLightMode ? "text-gray-600" : "text-slate-400"
      )}>
        {title}
      </h3>
      <p className={cn(
        "text-2xl font-bold",
        isLightMode ? "text-gray-900" : "text-white"
      )}>
        {value}
      </p>
      {change !== undefined && (
        <p className="text-xs text-gray-500 mt-1">vs. mois dernier</p>
      )}
    </motion.div>
  );
}

interface EmailMetricsProps {
  totalEmails: number;
  unreadEmails: number;
  urgentEmails: number;
  avgResponseTime?: string;
  isLightMode: boolean;
}

export default function EmailMetrics({ 
  totalEmails, 
  unreadEmails, 
  urgentEmails, 
  avgResponseTime = "2h 15min",
  isLightMode 
}: EmailMetricsProps) {
  const metrics = [
    {
      title: "Total Emails",
      value: totalEmails.toString(),
      change: 0.12,
      icon: Mail,
      color: "blue",
    },
    {
      title: "Non Lus",
      value: unreadEmails.toString(),
      change: -0.08,
      icon: AlertCircle,
      color: "orange",
    },
    {
      title: "Urgents",
      value: urgentEmails.toString(),
      change: 0.03,
      icon: AlertCircle,
      color: "green",
    },
    {
      title: "Temps de Réponse Moy.",
      value: avgResponseTime,
      change: -0.15,
      icon: Clock,
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 phone:grid-cols-2 laptop:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.title}
          {...metric}
          index={index}
          isLightMode={isLightMode}
        />
      ))}
    </div>
  );
}
