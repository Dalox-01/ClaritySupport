"use client";

import { useEffect, useState } from "react";
import { SmilePlus, ThumbsDown, ThumbsUp } from "lucide-react";
import ChartTitle from "../../components/chart-title";
import LinearProgress from "./components/linear-progress";

interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
}

export default function CustomerSatisfaction() {
  const [sentiment, setSentiment] = useState<SentimentData>({ positive: 0, neutral: 0, negative: 0 });
  const [totalEmails, setTotalEmails] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const response = await fetch('/api/mail-center/stats?period=today');
        const data = await response.json();
        
        if (data.sentiment) {
          setSentiment({
            positive: data.sentiment.positive || 0,
            neutral: data.sentiment.neutral || 0,
            negative: data.sentiment.negative || 0,
          });
          setTotalEmails((data.sentiment.positive || 0) + (data.sentiment.neutral || 0) + (data.sentiment.negative || 0));
        }
      } catch (error) {
        console.error('Erreur lors du chargement du sentiment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, []);

  const customerSatisfactionOptions = [
    {
      label: "Positif",
      color: "#5fb67a",
      percentage: sentiment.positive,
      icon: <ThumbsUp className="h-6 w-6" stroke="#5fb67a" fill="#5fb67a" />,
    },
    {
      label: "Neutre",
      color: "#f5c36e",
      percentage: sentiment.neutral,
      icon: <ThumbsUp className="h-6 w-6" stroke="#f5c36e" fill="#f5c36e" />,
    },
    {
      label: "Négatif",
      color: "#da6d67",
      percentage: sentiment.negative,
      icon: <ThumbsDown className="h-6 w-6" stroke="#da6d67" fill="#da6d67" />,
    },
  ];

  return (
    <section className="flex h-full flex-col gap-2">
      <ChartTitle title="Analyse de Sentiment" icon={SmilePlus} />
      <div className="my-4 flex h-full items-center justify-between">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="mx-auto grid w-full grid-cols-2 gap-6">
            <TotalEmails total={totalEmails} />
            {customerSatisfactionOptions.map((option) => (
              <LinearProgress
                key={option.label}
                label={option.label}
                color={option.color}
                percentage={option.percentage}
                icon={option.icon}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TotalEmails({ total }: { total: number }) {
  return (
    <div className="flex flex-col items-start justify-center">
      <div className="text-xs text-muted-foreground">Emails Analysés</div>
      <div className="text-2xl font-medium">{total} Emails</div>
    </div>
  );
}
