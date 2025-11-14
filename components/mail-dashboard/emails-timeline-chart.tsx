"use client";

import { VChart } from "@visactor/react-vchart";
import type { IBarChartSpec } from "@visactor/vchart";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailTimelineData {
  date: string;
  received: number;
  sent: number;
}

interface EmailsTimelineChartProps {
  data: EmailTimelineData[];
  isLightMode: boolean;
}

const generateSpec = (data: EmailTimelineData[], isLightMode: boolean): IBarChartSpec => ({
  type: "bar",
  data: [
    {
      id: "barData",
      values: data.flatMap(item => [
        { date: item.date, count: item.received, type: "Reçus" },
        { date: item.date, count: item.sent, type: "Envoyés" }
      ]),
    },
  ],
  xField: "date",
  yField: "count",
  seriesField: "type",
  padding: [20, 10, 40, 60],
  legends: {
    visible: true,
    orient: "bottom",
    padding: { top: 10 },
    item: {
      label: {
        style: {
          fill: isLightMode ? "#374151" : "#9ca3af",
          fontSize: 12,
        },
      },
    },
  },
  stack: false,
  tooltip: {
    trigger: ["click", "hover"],
    mark: {
      title: {
        visible: true,
      },
      content: [
        {
          key: (datum: any) => datum.type,
          value: (datum: any) => datum.count,
        },
      ],
    },
  },
  bar: {
    state: {
      hover: {
        outerBorder: {
          distance: 2,
          lineWidth: 2,
          stroke: isLightMode ? "#3b82f6" : "#60a5fa",
        },
      },
    },
    style: {
      cornerRadius: [8, 8, 0, 0],
      fill: (datum: any) => {
        return datum.type === "Reçus" 
          ? (isLightMode ? "#3b82f6" : "#60a5fa")
          : (isLightMode ? "#10b981" : "#34d399");
      },
    },
  },
  axes: [
    {
      orient: "bottom",
      type: "band",
      label: {
        style: {
          fill: isLightMode ? "#6b7280" : "#9ca3af",
          fontSize: 11,
        },
      },
      domainLine: {
        visible: true,
        style: {
          stroke: isLightMode ? "#e5e7eb" : "#374151",
        },
      },
    },
    {
      orient: "left",
      type: "linear",
      label: {
        style: {
          fill: isLightMode ? "#6b7280" : "#9ca3af",
          fontSize: 11,
        },
      },
      grid: {
        visible: true,
        style: {
          stroke: isLightMode ? "#f3f4f6" : "#1f2937",
          lineWidth: 1,
        },
      },
    },
  ],
  background: isLightMode ? "#ffffff" : "transparent",
});

export default function EmailsTimelineChart({ data, isLightMode }: EmailsTimelineChartProps) {
  const spec = generateSpec(data, isLightMode);

  const totalReceived = data.reduce((acc, item) => acc + item.received, 0);
  const avgReceived = Math.round(totalReceived / data.length);
  const totalSent = data.reduce((acc, item) => acc + item.sent, 0);
  const avgSent = Math.round(totalSent / data.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn(
        "p-6 rounded-lg border",
        isLightMode 
          ? "border-gray-200 bg-white" 
          : "border-slate-700/40 bg-slate-900/30"
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={cn("w-5 h-5", isLightMode ? "text-blue-600" : "text-blue-400")} />
            <h3 className={cn(
              "text-lg font-semibold",
              isLightMode ? "text-gray-900" : "text-white"
            )}>
              Volume d'Emails - 7 Derniers Jours
            </h3>
          </div>
          <p className={cn("text-sm", isLightMode ? "text-gray-600" : "text-gray-400")}>
            Évolution des emails reçus et envoyés
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Moy. Reçus/jour</p>
            <p className={cn("text-lg font-semibold", isLightMode ? "text-blue-600" : "text-blue-400")}>
              {avgReceived}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Moy. Envoyés/jour</p>
            <p className={cn("text-lg font-semibold", isLightMode ? "text-green-600" : "text-green-400")}>
              {avgSent}
            </p>
          </div>
        </div>
      </div>
      <div className="h-80 w-full">
        <VChart spec={spec} />
      </div>
    </motion.div>
  );
}
