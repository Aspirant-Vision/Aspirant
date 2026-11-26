"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TimeSeriesPoint } from "@/lib/analytics/types";

interface TrendLineChartProps {
  data: TimeSeriesPoint[];
  title?: string;
  description?: string;
}

export function TrendLineChart({ data, title, description }: TrendLineChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 text-center text-gray-400 text-xs">
        No trend activity recorded for this period.
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
        <div className="h-72 w-full flex items-center justify-center bg-gray-50/70 rounded-xl animate-pulse">
          <span className="text-xs text-gray-400">Loading trend visualization...</span>
        </div>
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    formattedDate: new Date(d.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs">
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-sm font-bold text-gray-900">{title}</h3>}
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      )}

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "12px",
                border: "none",
                fontSize: "12px",
                color: "#fff",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ fontWeight: 600, color: "#94a3b8", marginBottom: "4px" }}
              itemStyle={{ padding: "2px 0" }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: "11px", paddingBottom: "12px" }}
            />
            <Line
              type="monotone"
              dataKey="leads"
              name="Enquiries"
              stroke="#E31E2B"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="applications"
              name="Applications"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="admissions"
              name="Confirmed Seats"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
