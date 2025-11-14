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
      "relative group flex flex-col p-2.5 rounded-lg border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden",
      className
    )}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        <h2 className="mb-1 text-[10px] font-medium text-gray-400 uppercase tracking-wide">
          {title}
        </h2>
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="text-lg font-bold text-white">{value}</span>
          <ChangeIndicator change={change} />
        </div>
        <div className="text-[9px] text-gray-500">vs last month</div>
      </div>
      
      {/* Decorative corner accent */}
      <div className="absolute -right-4 -top-4 w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500" />
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
