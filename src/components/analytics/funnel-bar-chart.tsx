"use client";

import React from "react";
import { FunnelStep } from "@/lib/analytics/types";
import { ChevronRight } from "lucide-react";

interface FunnelBarChartProps {
  steps: FunnelStep[];
  title?: string;
  description?: string;
}

export function FunnelBarChart({ steps, title, description }: FunnelBarChartProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 text-center text-gray-400 text-xs">
        No conversion data available for this range.
      </div>
    );
  }

  const maxCount = Math.max(1, steps[0]?.count || 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
      {(title || description) && (
        <div>
          {title && <h3 className="text-sm font-bold text-gray-900">{title}</h3>}
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      )}

      <div className="space-y-3.5 pt-2">
        {steps.map((step, index) => {
          const widthPercent = Math.max(8, Math.round((step.count / maxCount) * 100));

          return (
            <div key={step.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span>{step.name}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-gray-900">{step.count.toLocaleString("en-IN")}</span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {step.conversionFromStart}%
                  </span>
                </div>
              </div>

              {/* Progress bar representing funnel depth */}
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
