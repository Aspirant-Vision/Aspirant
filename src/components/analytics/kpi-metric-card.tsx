import React from "react";
import { MetricComparison } from "@/lib/analytics/types";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

interface KpiMetricCardProps {
  title: string;
  metric: MetricComparison;
  subtitle?: string;
  definition?: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ElementType | React.ReactNode;
  color?: "blue" | "emerald" | "amber" | "purple" | "rose";
}

export function KpiMetricCard({
  title,
  metric,
  subtitle,
  definition,
  prefix = "",
  suffix = "",
  icon,
  color = "blue",
}: KpiMetricCardProps) {
  const isPositive = (metric.diff ?? 0) > 0;
  const isNeutral = (metric.diff ?? 0) === 0;

  const colorStyles = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  }[color];

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComp = icon as React.ElementType;
    return <IconComp className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:border-gray-300 transition-all">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
          {title}
        </span>
        {icon && (
          <div className={`p-2 rounded-xl border ${colorStyles}`}>
            {renderIcon()}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {prefix}
          {metric.value.toLocaleString("en-IN")}
          {suffix}
        </span>

        {metric.hasComparison && metric.percentageChange !== null && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isNeutral
                ? "bg-gray-100 text-gray-600"
                : isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {metric.percentageChange}%
            </span>
          </span>
        )}
      </div>

      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
        <span>
          {subtitle ||
            (metric.hasComparison
              ? `vs. prev: ${prefix}${metric.previousValue.toLocaleString("en-IN")}${suffix}`
              : "No previous baseline")}
        </span>
        {definition && (
          <span title={definition} className="cursor-help text-gray-400 hover:text-gray-700">
            <Info className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
