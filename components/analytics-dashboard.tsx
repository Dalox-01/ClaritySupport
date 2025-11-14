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
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col p-4 overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Métriques en haut - 4 cartes compactes */}
      <div className="mb-4">
        <EmailMetrics />
      </div>
      
      {/* Grille principale - 2x2 avec effets visuels */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        {/* Ligne 1 - Gauche: Bar Chart */}
        <Card className="relative group border border-blue-500/20 shadow-xl hover:shadow-2xl backdrop-blur-xl bg-slate-900/50 p-4 overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <AverageTicketsCreated />
          </div>
        </Card>
        
        {/* Ligne 1 - Droite: Circle Packing */}
        <Card className="relative group border border-purple-500/20 shadow-xl hover:shadow-2xl backdrop-blur-xl bg-slate-900/50 p-4 overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <Conversions />
          </div>
        </Card>
        
        {/* Ligne 2 - Gauche: Donut Chart */}
        <Card className="relative group border border-cyan-500/20 shadow-xl hover:shadow-2xl backdrop-blur-xl bg-slate-900/50 p-4 overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <TicketByChannels />
          </div>
        </Card>
        
        {/* Ligne 2 - Droite: Satisfaction */}
        <Card className="relative group border border-emerald-500/20 shadow-xl hover:shadow-2xl backdrop-blur-xl bg-slate-900/50 p-4 overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <CustomerSatisfication />
          </div>
        </Card>
      </div>
    </div>
  );
}
