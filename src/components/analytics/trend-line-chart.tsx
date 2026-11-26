"use client";

import React from "react";
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
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 text-center text-gray-400 text-xs">
        No trend activity recorded for this period.
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
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "12px", fontSize: "11px", fontWeight: 600 }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="leads"
              name="Leads Received"
              stroke="#E31E2B"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#E31E2B" }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="applications"
              name="Applications"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "#2563eb" }}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="admissions"
              name="Confirmed Admissions"
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "#059669" }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
