import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { chartTitle } from "@/components/primitives";
import { cn } from "@/lib/utils";

export default function MetricCard({
  title,
  value,
  change,
  className,
  isLightMode,
}: {
  title: string;
  value: string;
  change?: number;
  className?: string;
  isLightMode?: boolean;
}) {
  return (
    <section className={cn(
      "relative group flex flex-col p-2 rounded-md border backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden",
      isLightMode 
        ? "bg-white/80 border-gray-200" 
        : "bg-slate-900/50 border-slate-700/50",
      className
    )}>
      {/* Gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        isLightMode 
          ? "bg-gradient-to-br from-blue-500/5 to-cyan-500/5" 
          : "bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        <h2 className={cn(
          "mb-0.5 text-[9px] font-medium uppercase tracking-wide",
          isLightMode ? "text-gray-500" : "text-gray-400"
        )}>
          {title}
        </h2>
        <div className="flex items-baseline gap-1 mb-0.5">
          <span className={cn(
            "text-base font-bold",
            isLightMode ? "text-gray-900" : "text-white"
          )}>{value}</span>
        </div>
      </div>
      
      {/* Decorative corner accent */}
      <div className={cn(
        "absolute -right-3 -top-3 w-10 h-10 rounded-full blur-md group-hover:scale-150 transition-transform duration-500",
        isLightMode 
          ? "bg-gradient-to-br from-blue-500/10 to-cyan-500/10" 
          : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
      )} />
    </section>
  );
}
