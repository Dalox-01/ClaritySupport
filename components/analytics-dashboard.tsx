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
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col p-4 overflow-hidden">
      {/* Métriques en haut - 4 cartes compactes */}
      <EmailMetrics />
      
      {/* Grille principale - 2 lignes x 2 colonnes avec hauteur fixe */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        {/* Ligne 1 - Gauche: Bar Chart avec légende */}
        <Card className="border shadow-lg backdrop-blur-xl bg-white dark:bg-slate-900/30 dark:border-blue-500/20 border-gray-200 p-4 overflow-hidden">
          <AverageTicketsCreated />
        </Card>
        
        {/* Ligne 1 - Droite: Circle Packing */}
        <Card className="border shadow-lg backdrop-blur-xl bg-white dark:bg-slate-900/30 dark:border-blue-500/20 border-gray-200 p-4 overflow-hidden">
          <Conversions />
        </Card>
        
        {/* Ligne 2 - Gauche: Donut Chart */}
        <Card className="border shadow-lg backdrop-blur-xl bg-white dark:bg-slate-900/30 dark:border-blue-500/20 border-gray-200 p-4 overflow-hidden">
          <TicketByChannels />
        </Card>
        
        {/* Ligne 2 - Droite: Barres de satisfaction */}
        <Card className="border shadow-lg backdrop-blur-xl bg-white dark:bg-slate-900/30 dark:border-blue-500/20 border-gray-200 p-4 overflow-hidden">
          <CustomerSatisfication />
        </Card>
      </div>
    </div>
  );
}
