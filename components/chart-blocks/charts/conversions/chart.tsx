"use client";

import { useEffect, useState } from "react";
import { VChart } from "@visactor/react-vchart";
import type { ICirclePackingChartSpec } from "@visactor/vchart";
import { addThousandsSeparator } from "@/lib/utils";

interface ReplyData {
  name: string;
  value: number;
}

export default function Chart() {
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await fetch('/api/mail-center/stats?period=week');
        const data = await response.json();
        
        if (data.week) {
          const replyData: ReplyData[] = [
            { name: "Réponses Auto", value: data.week.auto_replied || 0 },
            { name: "Réponses Manuelles", value: data.week.manual_replied || 0 },
          ].filter(reply => reply.value > 0);
          
          setReplies(replyData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des réponses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReplies();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const spec: ICirclePackingChartSpec = {
    data: [
      {
        id: "data",
        values: replies,
      },
    ],
  type: "circlePacking",
  categoryField: "name",
  valueField: "value",
  drill: true,
  padding: 0,
  layoutPadding: 5,
  label: {
    style: {
      fill: "white",
      stroke: false,
      visible: (d) => d.depth === 0,
      text: (d) => addThousandsSeparator(d.value),
      fontSize: (d) => d.radius / 2,
      dy: (d) => d.radius / 8,
    },
  },
  legends: [
    {
      visible: true,
      orient: "top",
      position: "start",
      padding: 0,
    },
  ],
  tooltip: {
    trigger: ["click", "hover"],
    mark: {
      content: {
        value: (d) => addThousandsSeparator(d?.value),
      },
    },
  },
  animationEnter: {
    easing: "cubicInOut",
  },
  animationExit: {
    easing: "cubicInOut",
  },
  animationUpdate: {
    easing: "cubicInOut",
  },
};

  return <VChart spec={spec} />;
}
