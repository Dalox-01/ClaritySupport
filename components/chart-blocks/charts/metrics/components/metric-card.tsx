import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { chartTitle } from "@/components/primitives";
import { cn } from "@/lib/utils";

export default function MetricCard({
  title,
  value,
  change,
  className,
}: {
  title: string;
  value: string;
  change: number;
  className?: string;
}) {
  return (
    <section className={cn(
      "relative group flex flex-col p-5 rounded-xl border border-gray-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden",
      className
    )}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        <h2 className={cn(chartTitle({ color: "mute", size: "sm" }), "mb-2 font-semibold")}>
          {title}
        </h2>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{value}</span>
          <ChangeIndicator change={change} />
        </div>
        <div className="text-xs text-muted-foreground/70">Compare to last month</div>
      </div>
      
      {/* Decorative corner accent */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
    </section>
  );
}

function ChangeIndicator({ change }: { change: number }) {
  return (
    <span
      className={cn(
        "flex items-center rounded-sm px-1 py-0.5 text-xs text-muted-foreground",
        change > 0
          ? "bg-green-50 text-green-500 dark:bg-green-950"
          : "bg-red-50 text-red-500 dark:bg-red-950",
      )}
    >
      {change > 0 ? "+" : ""}
      {Math.round(change * 100)}%
      {change > 0 ? (
        <ArrowUpRight className="ml-0.5 inline-block h-3 w-3" />
      ) : (
        <ArrowDownRight className="ml-0.5 inline-block h-3 w-3" />
      )}
    </span>
  );
}
