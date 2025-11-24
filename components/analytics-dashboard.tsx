"use client";

import { useState, useEffect } from "react";
import {
  AverageTicketsCreated,
  Conversions,
  CustomerSatisfication,
} from "@/components/chart-blocks";
import Container from "@/components/container";
import EmailMetrics from "@/components/chart-blocks/charts/metrics/email-metrics";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AnalyticsDashboard() {
  return (
    <div className="relative w-full h-[calc(100vh-12rem)] flex flex-col overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
      {/* macOS Window Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/30 bg-slate-800/50 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs font-medium text-gray-400">Analytics Dashboard</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900">
        {/* Métriques en haut - 4 cartes ultra compactes */}
        <div className="mb-2.5">
          <EmailMetrics />
        </div>
        
        {/* Grille principale */}
        <div className="flex-1 flex flex-col gap-2.5 min-h-0">
          {/* Ligne 1 - Volume Email et Répartition Filtres (2 colonnes) */}
          <div className="flex-1 grid grid-cols-2 gap-2.5 min-h-0">
            <div className="relative rounded-lg border border-slate-700/30 bg-slate-900/30 backdrop-blur-sm shadow-lg overflow-hidden">
              <div className="p-2 h-full overflow-hidden">
                <AverageTicketsCreated />
              </div>
            </div>
            
            <div className="relative rounded-lg border border-slate-700/30 bg-slate-900/30 backdrop-blur-sm shadow-lg overflow-hidden">
              <div className="p-2 h-full overflow-hidden">
                <Conversions />
              </div>
            </div>
          </div>
          
          {/* Ligne 2 - Analyse des Sentiments (pleine largeur) */}
          <div className="relative rounded-lg border border-slate-700/30 bg-slate-900/30 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="p-2 h-full overflow-hidden">
              <CustomerSatisfication />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
