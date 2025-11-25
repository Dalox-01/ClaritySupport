"use client";

import { useState, useEffect } from "react";
import {
  AverageTicketsCreated,
  Conversions,
  CustomerSatisfication,
} from "@/components/chart-blocks";
import EmailMetrics from "@/components/chart-blocks/charts/metrics/email-metrics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BarChart3, Calendar, Download } from "lucide-react";

interface AnalyticsDashboardProps {
  isLightMode?: boolean;
}

export function AnalyticsDashboard({ isLightMode = false }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={cn(
            "text-2xl font-bold flex items-center gap-3",
            isLightMode ? "text-gray-900" : "text-white"
          )}>
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Analyses & Statistiques
          </h2>
          <p className={cn("text-sm mt-1", isLightMode ? "text-gray-500" : "text-slate-400")}>
            Vue détaillée de vos performances de support client
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className={cn(
            "gap-2",
            isLightMode ? "bg-white" : "bg-slate-900 border-slate-700 text-slate-300"
          )}>
            <Calendar className="w-4 h-4" />
            Derniers 30 jours
          </Button>
          <Button variant="outline" size="sm" className={cn(
            "gap-2",
            isLightMode ? "bg-white" : "bg-slate-900 border-slate-700 text-slate-300"
          )}>
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4">
        <Card className={cn(
          "p-1 border backdrop-blur-xl overflow-hidden",
          isLightMode 
            ? "bg-white/80 border-gray-200 shadow-sm" 
            : "bg-slate-900/40 border-slate-800 shadow-black/20"
        )}>
           {/* We wrap EmailMetrics to control its styling if possible, or just let it render */}
           <div className={cn(
             "rounded-lg p-4",
             isLightMode ? "bg-gray-50/50" : "bg-slate-900/50"
           )}>
             <EmailMetrics />
           </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Tickets */}
        <Card className={cn(
          "p-6 border backdrop-blur-xl flex flex-col",
          isLightMode 
            ? "bg-white/80 border-gray-200 shadow-sm" 
            : "bg-slate-900/40 border-slate-800 shadow-black/20"
        )}>
          <h3 className={cn("font-semibold mb-4", isLightMode ? "text-gray-900" : "text-white")}>
            Volume de tickets
          </h3>
          <div className="flex-1 min-h-[300px]">
            <AverageTicketsCreated />
          </div>
        </Card>

        {/* Conversions */}
        <Card className={cn(
          "p-6 border backdrop-blur-xl flex flex-col",
          isLightMode 
            ? "bg-white/80 border-gray-200 shadow-sm" 
            : "bg-slate-900/40 border-slate-800 shadow-black/20"
        )}>
          <h3 className={cn("font-semibold mb-4", isLightMode ? "text-gray-900" : "text-white")}>
            Taux de conversion
          </h3>
          <div className="flex-1 min-h-[300px]">
            <Conversions />
          </div>
        </Card>

        {/* Customer Satisfaction - Full Width */}
        <Card className={cn(
          "lg:col-span-2 p-6 border backdrop-blur-xl flex flex-col",
          isLightMode 
            ? "bg-white/80 border-gray-200 shadow-sm" 
            : "bg-slate-900/40 border-slate-800 shadow-black/20"
        )}>
          <h3 className={cn("font-semibold mb-4", isLightMode ? "text-gray-900" : "text-white")}>
            Satisfaction Client (CSAT)
          </h3>
          <div className="flex-1 min-h-[300px]">
            <CustomerSatisfication />
          </div>
        </Card>
      </div>
    </div>
  );
}
