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
    <div className="w-full h-full">
      {/* Métriques en haut - 4 cartes */}
      <EmailMetrics />
      
      {/* Grille principale - 2 lignes x 2 colonnes */}
      <div className="mt-6 grid grid-cols-1 laptop:grid-cols-2 gap-6">
        {/* Ligne 1 - Gauche: Bar Chart avec légende */}
        <Card className="border shadow-lg backdrop-blur-xl bg-white dark:bg-slate-900/30 dark:border-blue-500/20 border-gray-200 p-6">
          <AverageTicketsCreated />
        </Card>
        
        {/* Ligne 1 - Droite: Circle Packing */}
        <Card className="border shadow-lg backdrop-blur-xl bg-white dark:bg-slate-900/30 dark:border-blue-500/20 border-gray-200 p-6">
          <Conversions />
        </Card>
        
        {/* Ligne 2 - Gauche: Donut Chart */}
        <Card className="border shadow-lg backdrop-blur-xl bg-white dark:bg-slate-900/30 dark:border-blue-500/20 border-gray-200 p-6">
          <TicketByChannels />
        </Card>
        
        {/* Ligne 2 - Droite: Barres de satisfaction */}
        <Card className="border shadow-lg backdrop-blur-xl bg-white dark:bg-slate-900/30 dark:border-blue-500/20 border-gray-200 p-6">
          <CustomerSatisfication />
        </Card>
      </div>
    </div>
  );
}
