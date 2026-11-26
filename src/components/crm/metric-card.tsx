import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  href?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  colorVariant?: "red" | "blue" | "emerald" | "purple" | "amber" | "slate";
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  href,
  trend,
  colorVariant = "slate",
  className,
}: MetricCardProps) {
  const iconVariants = {
    red: "bg-red-50 text-red-600 border-red-100/80",
    blue: "bg-blue-50 text-blue-600 border-blue-100/80",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100/80",
    purple: "bg-purple-50 text-purple-600 border-purple-100/80",
    amber: "bg-amber-50 text-amber-600 border-amber-100/80",
    slate: "bg-gray-50 text-gray-700 border-gray-200/80",
  };

  const Content = (
    <div
      className={cn(
        "group relative bg-white border border-gray-200/80 rounded-2xl p-4.5 sm:p-5 transition-all duration-200 shadow-2xs hover:shadow-xs hover:border-gray-300",
        href && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105",
            iconVariants[colorVariant]
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-400 font-medium truncate">
        {subtitle || "Real-time count"}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{Content}</Link>;
  }

  return Content;
}
