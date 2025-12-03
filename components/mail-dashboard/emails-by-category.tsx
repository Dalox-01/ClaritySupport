"use client";

import { VChart } from "@visactor/react-vchart";
import type { IPieChartSpec } from "@visactor/vchart";
import { motion } from "framer-motion";
import { PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailsByCategoryProps {
  data: Array<{ type: string; value: number }>;
  isLightMode: boolean;
}

const generateSpec = (
  data: Array<{ type: string; value: number }>, 
  totalEmails: number,
  isLightMode: boolean
): IPieChartSpec => ({
  type: "pie",
  legends: [
    {
      type: "discrete",
      visible: true,
      orient: "right",
      padding: { left: 20 },
      item: {
        label: {
          style: {
            fill: isLightMode ? "#374151" : "#9ca3af",
            fontSize: 12,
          },
        },
      },
    },
  ],
  data: [
    {
      id: "pieData",
      values: data,
    },
  ],
  valueField: "value",
  categoryField: "type",
  outerRadius: 0.85,
  innerRadius: 0.65,
  padAngle: 2,
  pie: {
    style: {
      cornerRadius: 4,
    },
    state: {
      hover: {
        outerRadius: 0.88,
        stroke: isLightMode ? "#ffffff" : "#1f2937",
        lineWidth: 2,
      },
    },
  },
  tooltip: {
    trigger: ["click", "hover"],
    mark: {
      title: {
        visible: false,
      },
      content: [
        {
          key: (datum: any) => datum?.type,
          value: (datum: any) => `${datum?.value} emails (${Math.round((datum?.value / totalEmails) * 100)}%)`,
        },
      ],
    },
  },
  indicator: [
    {
      visible: true,
      offsetY: "-10%",
      title: {
        style: {
          text: "Total",
          fontSize: 14,
          fill: isLightMode ? "#6b7280" : "#9ca3af",
        },
      },
    },
    {
      visible: true,
      offsetY: "10%",
      title: {
        style: {
          text: totalEmails.toString(),
          fontSize: 28,
          fontWeight: "bold",
          fill: isLightMode ? "#111827" : "#f9fafb",
        },
      },
    },
  ],
  background: isLightMode ? "#ffffff" : "transparent",
  color: isLightMode 
    ? ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
    : ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#f472b6"],
});

export default function EmailsByCategory({ data, isLightMode }: EmailsByCategoryProps) {
  const totalEmails = data.reduce((acc, item) => acc + item.value, 0);
  const spec = generateSpec(data, totalEmails, isLightMode);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={cn(
        "p-6 rounded-lg border",
        isLightMode 
          ? "border-gray-200 bg-white" 
          : "border-slate-700/40 bg-slate-900/30"
      )}
    >
      <div className="flex items-center gap-2 mb-6">
        <PieChart className={cn("w-5 h-5", isLightMode ? "text-blue-600" : "text-blue-400")} />
        <h3 className={cn(
          "text-lg font-semibold",
          isLightMode ? "text-gray-900" : "text-white"
        )}>
          Répartition par Catégorie
        </h3>
      </div>
      <div className="h-80 w-full">
        <VChart spec={spec} />
      </div>
    </motion.div>
  );
}
