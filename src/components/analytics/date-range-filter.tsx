"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DateRangePreset, DATE_RANGE_PRESETS } from "@/lib/analytics/types";
import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
  currentPreset?: DateRangePreset;
}

function DateRangeFilterInner({ currentPreset = "30d" }: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (preset: DateRangePreset) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("preset", preset);
    router.push(`${pathname}?${params.toString()}`);
  };

  const presetLabels: Record<DateRangePreset, string> = {
    today: "Today",
    yesterday: "Yesterday",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    this_month: "This Month",
    last_month: "Last Month",
    this_year: "This Year",
    all: "All Time",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex items-center">
        <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
        <select
          value={currentPreset}
          onChange={(e) => handleSelect(e.target.value as DateRangePreset)}
          className="appearance-none pl-8 pr-8 py-1.5 bg-white border border-gray-200/90 rounded-xl text-xs font-semibold text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs cursor-pointer"
        >
          {DATE_RANGE_PRESETS.map((p) => (
            <option key={p} value={p}>
              {presetLabels[p]}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 text-[10px] text-gray-400">▼</span>
      </div>
    </div>
  );
}

export function DateRangeFilter(props: DateRangeFilterProps) {
  return (
    <Suspense
      fallback={
        <div className="h-8 w-28 bg-gray-100 rounded-xl animate-pulse" />
      }
    >
      <DateRangeFilterInner {...props} />
    </Suspense>
  );
}
