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

export function AnalyticsDashboard() {
  return (
    <div>
      {/* Métriques des emails au lieu des tickets */}
      <EmailMetrics />
      
      {/* Disposition modifiée - 2 colonnes égales */}
      <div className="grid grid-cols-1 divide-y border-b border-border laptop:grid-cols-2 laptop:divide-x laptop:divide-y-0 laptop:divide-border">
        <Container className="py-4 laptop:col-span-1">
          <AverageTicketsCreated />
        </Container>
        <Container className="py-4 laptop:col-span-1">
          <TicketByChannels />
        </Container>
      </div>
      
      {/* Deuxième rangée - 2 colonnes égales */}
      <div className="grid grid-cols-1 divide-y border-b border-border laptop:grid-cols-2 laptop:divide-x laptop:divide-y-0 laptop:divide-border">
        <Container className="py-4 laptop:col-span-1">
          <Conversions />
        </Container>
        <Container className="py-4 laptop:col-span-1">
          <CustomerSatisfication />
        </Container>
      </div>
    </div>
  );
}
