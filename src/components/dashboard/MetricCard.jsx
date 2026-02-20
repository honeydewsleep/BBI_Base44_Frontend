import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MetricCard({ title, value, trend, trendValue, icon: Icon, variant = "default" }) {
  const variants = {
    default: "from-slate-50 to-white border-slate-200",
    revenue: "from-emerald-50/50 to-white border-emerald-200/60",
    expense: "from-rose-50/50 to-white border-rose-200/60",
    customers: "from-violet-50/50 to-white border-violet-200/60"
  };

  const iconVariants = {
    default: "bg-slate-100 text-slate-600",
    revenue: "bg-emerald-100 text-emerald-600",
    expense: "bg-rose-100 text-rose-600",
    customers: "bg-violet-100 text-violet-600"
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-500";

  return (
    <Card className={cn(
      "relative overflow-hidden bg-gradient-to-br border p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50",
      variants[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">{title}</p>
          <p className="text-3xl font-semibold text-slate-900 tracking-tight">{value}</p>
          {trendValue && (
            <div className={cn("flex items-center gap-1.5 text-sm font-medium", trendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span>{trendValue}</span>
              <span className="text-slate-400 font-normal">vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("p-3 rounded-xl", iconVariants[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
}