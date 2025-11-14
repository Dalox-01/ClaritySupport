"use client";

import { useEffect, useState } from "react";
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
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

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
    legends: [
      {
        type: "discrete",
        visible: true,
        orient: "bottom",
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
            opacity: 0.6,
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
          },
        },
      },
    ],
  };

  return <VChart spec={spec} />;
}