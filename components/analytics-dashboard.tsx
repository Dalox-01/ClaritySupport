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
      <Card className="border shadow-xl backdrop-blur-xl bg-white dark:bg-[#1a1f3a]/70 dark:border-blue-500/20 border-gray-200 dark:shadow-blue-500/10 shadow-gray-100/50">
        <div className="p-6 space-y-6">
          {/* Métriques des emails au lieu des tickets */}
          <EmailMetrics />
          
          {/* Disposition selon l'image - Ligne 1: Bar Chart | Circle Packing */}
          <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
            <div className="border border-gray-200 dark:border-blue-500/20 rounded-lg p-4 bg-white dark:bg-slate-900/30">
              <AverageTicketsCreated />
            </div>
            <div className="border border-gray-200 dark:border-blue-500/20 rounded-lg p-4 bg-white dark:bg-slate-900/30">
              <Conversions />
            </div>
          </div>
          
          {/* Ligne 2: Donut Chart | Satisfaction Bars */}
          <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
            <div className="border border-gray-200 dark:border-blue-500/20 rounded-lg p-4 bg-white dark:bg-slate-900/30">
              <TicketByChannels />
            </div>
            <div className="border border-gray-200 dark:border-blue-500/20 rounded-lg p-4 bg-white dark:bg-slate-900/30">
              <CustomerSatisfication />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
