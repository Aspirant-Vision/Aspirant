"use client";

import React, { useState } from "react";
import { exportReportAction } from "@/lib/analytics/actions";
import { ReportType } from "@/lib/analytics/export";
import { DateRangePreset, DATE_RANGE_PRESETS } from "@/lib/analytics/types";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileSpreadsheet,
  ShieldCheck,
  Loader2,
  Inbox,
  FileCheck2,
  Award,
  Users,
  Building2,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface ReportsExportClientViewProps {
  userRole: string;
}

export function ReportsExportClientView({ userRole }: ReportsExportClientViewProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>("leads");
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>("30d");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isCounsellorOnly = userRole === "counsellor";

  const reports: Array<{
    id: ReportType;
    title: string;
    description: string;
    icon: React.ElementType;
    disabled?: boolean;
  }> = [
    {
      id: "leads",
      title: "Lead Acquisition & Portfolio Report",
      description: "Full candidate contact details, enquiry sources, current pipeline status, and assigned counsellors.",
      icon: Inbox,
    },
    {
      id: "applications",
      title: "Admission Applications Report",
      description: "Application numbers, selected colleges/courses, submission dates, and verification review statuses.",
      icon: FileCheck2,
    },
    {
      id: "admissions",
      title: "Confirmed Admissions Registry",
      description: "Official confirmed seat allotments, unique admission references, quota categories, and fee payment status.",
      icon: Award,
    },
    {
      id: "counsellors",
      title: "Counsellor Performance Comparison",
      description: "Detailed staff productivity matrix: allocated leads, follow-up velocity, and final admission conversions.",
      icon: Users,
      disabled: isCounsellorOnly,
    },
    {
      id: "colleges",
      title: "Institutional Demand Intelligence",
      description: "Aggregated candidate interest, course-level demand, and comparative application submission volumes.",
      icon: Building2,
    },
  ];

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

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      setFeedback(null);

      const res = await exportReportAction(selectedReport, selectedPreset);

      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.error.message || "Failed to generate report",
        });
        return;
      }

      // Client-side Blob download
      const blob = new Blob([res.data.csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", res.data.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setFeedback({
        type: "success",
        message: `Report ${res.data.filename} generated and downloaded successfully. Action logged in audit trail.`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: (err as Error).message || "An unexpected error occurred during export",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Configuration Box */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">Select Report Dataset</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Choose the operational module and date boundaries for your spreadsheet export.
          </p>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {reports.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedReport === r.id;

            return (
              <div
                key={r.id}
                onClick={() => !r.disabled && setSelectedReport(r.id)}
                className={`p-4 rounded-xl border transition-all text-left flex items-start gap-3.5 cursor-pointer ${
                  r.disabled
                    ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                    : isSelected
                    ? "bg-red-50/30 border-red-300 ring-2 ring-primary/20 shadow-xs"
                    : "bg-white border-gray-200/80 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-100 text-gray-600 border-gray-200/80"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900 truncate">{r.title}</h3>
                    {r.disabled && (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                        Admin Only
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                    {r.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Date Preset Selection */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-700">Timeframe:</span>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value as DateRangePreset)}
              className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {DATE_RANGE_PRESETS.map((p) => (
                <option key={p} value={p}>
                  {presetLabels[p]}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleDownload}
            disabled={isExporting}
            variant="primary"
            size="sm"
            className="text-xs bg-gray-900 hover:bg-black text-white"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 mr-1.5" />
            )}
            <span>Generate &amp; Download CSV</span>
          </Button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{feedback.message}</div>
          <button
            onClick={() => setFeedback(null)}
            className="font-bold underline cursor-pointer ml-2 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Security & Integrity Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
        <div className="font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>Security &amp; Data Integrity Compliance</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          All CSV exports are sanitized against spreadsheet formula injection attacks (characters like <code className="bg-amber-100 px-1 rounded">=</code>, <code className="bg-amber-100 px-1 rounded">+</code>, and <code className="bg-amber-100 px-1 rounded">-</code> are neutralized). Confidential uploaded documents and raw authentication credentials are never exported. Every export event is recorded in the platform audit log.
        </p>
      </div>
    </div>
  );
}
