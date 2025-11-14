"use client";

import { useState, useEffect } from "react";
import {
  AverageTicketsCreated,
  Conversions,
  CustomerSatisfication,
  TicketByChannels,
} from "@/components/chart-blocks";
import Container from "@/components/container";
import EmailMetrics from "@/components/chart-blocks/charts/metrics/email-metrics";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AnalyticsDashboard() {
  return (
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col p-3 overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Métriques en haut - 4 cartes compactes */}
      <div className="mb-3">
        <EmailMetrics />
      </div>
      
      {/* Grille principale - 2x2 style fenêtre macOS */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        {/* Ligne 1 - Gauche: Bar Chart */}
        <div className="relative rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* macOS Window Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/30 bg-slate-800/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
            </div>
          </div>
          {/* Content */}
          <div className="p-3 h-[calc(100%-36px)] overflow-hidden">
            <AverageTicketsCreated />
          </div>
        </div>
        
        {/* Ligne 1 - Droite: Circle Packing */}
        <div className="relative rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/30 bg-slate-800/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="p-3 h-[calc(100%-36px)] overflow-hidden">
            <Conversions />
          </div>
        </div>
        
        {/* Ligne 2 - Gauche: Donut Chart */}
        <div className="relative rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/30 bg-slate-800/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="p-3 h-[calc(100%-36px)] overflow-hidden">
            <TicketByChannels />
          </div>
        </div>
        
        {/* Ligne 2 - Droite: Satisfaction */}
        <div className="relative rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/30 bg-slate-800/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="p-3 h-[calc(100%-36px)] overflow-hidden">
            <CustomerSatisfication />
          </div>
        </div>
      </div>
    </div>
  );
}
