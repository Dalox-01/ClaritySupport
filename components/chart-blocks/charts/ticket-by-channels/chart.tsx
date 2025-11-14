"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  type IPieChartSpec,
  VChart,
} from "@visactor/react-vchart";
import type { Datum } from "@visactor/vchart/esm/typings";
import { addThousandsSeparator } from "@/lib/utils";

interface CategoryData {
  type: string;
  value: number;
}

export default function Chart() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/mail-center/stats?period=today');
        const data = await response.json();
        
        if (data.categories) {
          const categoryData: CategoryData[] = [
            { type: "Support", value: data.categories.support || 0 },
            { type: "Vente", value: data.categories.vente || 0 },
            { type: "Spam", value: data.categories.spam || 0 },
            { type: "Urgent", value: data.categories.urgent || 0 },
            { type: "Autre", value: data.categories.autre || 0 },
          ].filter(cat => cat.value > 0);
          
          setCategories(categoryData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const data = categories.reduce(
    (acc, curr) => {
      acc.push({
        type: curr.type,
        value: curr.value + (acc[acc.length - 1]?.value || 0),
        realValue: curr.value,
      });
      return acc;
    },
    [] as { type: string; value: number; realValue: number }[],
  );

  const totalEmails = categories.reduce((acc, curr) => acc + curr.value, 0);

  const spec: IPieChartSpec = {
    type: "pie",
    background: isDark ? "#0a0a0a" : "#ffffff",
    color: isDark 
      ? ["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b"]
      : ["#2563eb", "#0891b2", "#7c3aed", "#db2777", "#d97706"],
    legends: [
      {
        type: "discrete",
        visible: true,
        orient: "bottom",
        item: {
          label: {
            style: {
              fill: isDark ? "#d1d5db" : "#4b5563",
            },
          },
        },
      },
    ],
    data: [
      {
        id: "id0",
        values: categories,
      },
    ],
    valueField: "value",
    categoryField: "type",
    outerRadius: 1,
    innerRadius: 0.88,
    startAngle: -180,
    padAngle: 0.6,
    endAngle: 0,
    centerY: "80%",
    layoutRadius: "auto",
    pie: {
      style: {
        cornerRadius: 6,
      },
    },
    tooltip: {
      trigger: ["click", "hover"],
      style: {
        panel: {
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          border: { color: isDark ? "#374151" : "#e5e7eb", width: 1 },
        },
        titleLabel: {
          fill: isDark ? "#f3f4f6" : "#111827",
        },
        keyLabel: {
          fill: isDark ? "#d1d5db" : "#4b5563",
        },
        valueLabel: {
          fill: isDark ? "#f3f4f6" : "#111827",
        },
      },
      mark: {
        title: {
          visible: false,
        },
        content: [
          {
            key: (datum: Datum | undefined) => datum?.type,
            value: (datum: Datum | undefined) => datum?.value,
          },
        ],
      },
    },
    indicator: [
      {
        visible: true,
        offsetY: "40%",
        title: {
          style: {
            text: "Total Emails",
            fontSize: 16,
            fill: isDark ? "#9ca3af" : "#6b7280",
            opacity: 0.8,
          },
        },
      },
      {
        visible: true,
        offsetY: "64%",
        title: {
          style: {
            text: addThousandsSeparator(totalEmails),
            fontSize: 28,
            fill: isDark ? "#f3f4f6" : "#111827",
          },
        },
      },
    ],
  };

  return <VChart spec={spec} />;
}