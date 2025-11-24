"use client";

import { VChart } from "@visactor/react-vchart";
import type { IRadarChartSpec } from "@visactor/vchart";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentimentAnalysisProps {
  data: Array<{ category: string; score: number }>;
  isLightMode: boolean;
}

const generateSpec = (
  data: Array<{ category: string; score: number }>,
  isLightMode: boolean
): IRadarChartSpec => ({
  type: "radar",
  data: [
    {
      id: "radarData",
      values: data,
    },
  ],
  categoryField: "category",
  valueField: "score",
  seriesField: "type",
  point: {
    visible: true,
    style: {
      fill: isLightMode ? "#3b82f6" : "#60a5fa",
      size: 6,
    },
    state: {
      hover: {
        size: 8,
        stroke: isLightMode ? "#1d4ed8" : "#3b82f6",
        lineWidth: 2,
      },
    },
  },
  line: {
    style: {
      stroke: isLightMode ? "#3b82f6" : "#60a5fa",
      lineWidth: 2,
    },
  },
  area: {
    visible: true,
    style: {
      fill: isLightMode ? "#3b82f6" : "#60a5fa",
      fillOpacity: 0.15,
    },
    state: {
      hover: {
        fillOpacity: 0.25,
      },
    },
  },
  axes: [
    {
      orient: "radius",
      min: 0,
      max: 100,
      grid: {
        visible: true,
        style: {
          stroke: isLightMode ? "#e5e7eb" : "#374151",
          lineWidth: 1,
        },
      },
      label: {
        visible: true,
        space: 10,
        style: {
          fill: isLightMode ? "#6b7280" : "#9ca3af",
          fontSize: 11,
        },
      },
    },
    {
      orient: "angle",
      grid: {
        visible: true,
        style: {
          stroke: isLightMode ? "#e5e7eb" : "#374151",
          lineWidth: 1,
        },
      },
      label: {
        visible: true,
        space: 20,
        style: {
          fill: isLightMode ? "#374151" : "#d1d5db",
          fontSize: 12,
          fontWeight: 500,
        },
      },
    },
  ],
  tooltip: {
    trigger: ["click", "hover"],
    mark: {
      title: {
        visible: true,
      },
      content: [
        {
          key: (datum: any) => datum.category,
          value: (datum: any) => `${datum.score}%`,
        },
      ],
    },
  },
  background: isLightMode ? "#ffffff" : "transparent",
  padding: { top: 20, right: 40, bottom: 20, left: 40 },
});

export default function SentimentAnalysis({ data, isLightMode }: SentimentAnalysisProps) {
  const spec = generateSpec(data, isLightMode);
  const avgScore = Math.round(data.reduce((acc, item) => acc + item.score, 0) / data.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
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
            <Activity className={cn("w-5 h-5", isLightMode ? "text-blue-600" : "text-blue-400")} />
            <h3 className={cn(
              "text-lg font-semibold",
              isLightMode ? "text-gray-900" : "text-white"
            )}>
              Analyse de Sentiment
            </h3>
          </div>
          <p className={cn("text-sm", isLightMode ? "text-gray-600" : "text-gray-400")}>
            Qualité des interactions par catégorie
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Score Moyen</p>
          <p className={cn(
            "text-2xl font-bold",
            avgScore >= 75 ? (isLightMode ? "text-green-600" : "text-green-400") :
            avgScore >= 50 ? (isLightMode ? "text-blue-600" : "text-blue-400") :
            (isLightMode ? "text-orange-600" : "text-orange-400")
          )}>
            {avgScore}%
          </p>
        </div>
      </div>
      <div className="h-80 w-full">
        <VChart spec={spec} />
      </div>
    </motion.div>
  );
}
