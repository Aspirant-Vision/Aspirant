"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { DistributionPoint } from "@/lib/analytics/types";

interface DistributionDonutChartProps {
  data: DistributionPoint[];
  title?: string;
  description?: string;
}

const DEFAULT_COLORS = ["#E31E2B", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6b7280"];

export function DistributionDonutChart({
  data,
  title,
  description,
}: DistributionDonutChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 text-center text-gray-400 text-xs">
        No distribution data for this period.
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        {(title || description) && (
          <div>
            {title && <h3 className="text-sm font-bold text-gray-900">{title}</h3>}
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          </div>
        )}
        <div className="h-64 w-full flex items-center justify-center bg-gray-50/70 rounded-xl animate-pulse">
          <span className="text-xs text-gray-400">Loading distribution...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs">
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-sm font-bold text-gray-900">{title}</h3>}
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      )}

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [`${value} items`, name]}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "12px",
                border: "none",
                fontSize: "12px",
                color: "#fff",
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
