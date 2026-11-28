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
  CheckCircle2,
  AlertCircle,
  FileDown,
  Sparkles,
} from "lucide-react";

interface ReportsExportClientViewProps {
  userRole: string;
}

export function ReportsExportClientView({ userRole }: ReportsExportClientViewProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>("leads");
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>("30d");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportingReportId, setExportingReportId] = useState<ReportType | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    filename?: string;
    rowCount?: number;
  } | null>(null);

  const isCounsellorOnly = userRole === "counsellor";

  const reports: Array<{
    id: ReportType;
    title: string;
    category: string;
    description: string;
    columns: string[];
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    disabled?: boolean;
  }> = [
    {
      id: "leads",
      title: "Lead Acquisition & Portfolio",
      category: "CRM & Inquiries",
      description: "Full candidate contact information, inquiry acquisition channels, current pipeline status, and assigned counsellors.",
      columns: ["Full Name", "Contact", "Pipeline Status", "Priority", "Channel", "Assigned Counsellor", "Interested College"],
      icon: Inbox,
      iconBg: "bg-blue-50 text-blue-600 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      id: "applications",
      title: "Admission Applications",
      category: "Admissions Operations",
      description: "Official student application numbers, selected colleges and courses, verification progress, and submission dates.",
      columns: ["Application No.", "Student Details", "College", "Degree Course", "Status", "Academic Session", "Submission Date"],
      icon: FileCheck2,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      iconColor: "text-emerald-600",
    },
    {
      id: "admissions",
      title: "Confirmed Admissions Registry",
      category: "Enrollment & Allotments",
      description: "Confirmed seat allotments, unique admission reference numbers, enrolled colleges, allotted courses, and registration dates.",
      columns: ["Admission Ref", "Application No.", "Candidate Name", "Enrolled Campus", "Course", "Allotment Date"],
      icon: Award,
      iconBg: "bg-purple-50 text-purple-600 border-purple-200",
      iconColor: "text-purple-600",
    },
    {
      id: "counsellors",
      title: "Counsellor Performance Comparison",
      category: "Staff Productivity",
      description: "Detailed staff productivity matrix: allocated leads, follow-up contact velocity, initiated applications, and conversion rates.",
      columns: ["Counsellor Name", "Allocated Leads", "Contacted Leads", "Applications", "Admissions", "Conversion Rate %"],
      icon: Users,
      iconBg: "bg-amber-50 text-amber-600 border-amber-200",
      iconColor: "text-amber-600",
      disabled: isCounsellorOnly,
    },
    {
      id: "colleges",
      title: "Institutional Demand Intelligence",
      category: "Campus Analytics",
      description: "Institutional demand overview: aggregate student inquiries, application submission volumes, confirmed admissions, and conversion yield.",
      columns: ["College Name", "Location", "Accreditation", "Total Enquiries", "Applications", "Confirmed Seats", "Yield %"],
      icon: Building2,
      iconBg: "bg-rose-50 text-rose-600 border-rose-200",
      iconColor: "text-rose-600",
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

  const quickPresets: DateRangePreset[] = ["7d", "30d", "90d", "this_year", "all"];

  const handleDownload = async (targetReport?: ReportType) => {
    const reportToRun = targetReport || selectedReport;
    try {
      setIsExporting(true);
      setExportingReportId(reportToRun);
      setFeedback(null);

      const res = await exportReportAction(reportToRun, selectedPreset);

      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.error.message || "Failed to generate report. Please verify permissions or try again.",
        });
        return;
      }

      // Prepend UTF-8 Byte Order Mark (\uFEFF) so Microsoft Excel on Windows renders all characters accurately
      const blob = new Blob(["\uFEFF" + res.data.csvContent], {
        type: "text/csv;charset=utf-8;",
      });
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
        message: `Report generated and downloaded successfully.`,
        filename: res.data.filename,
        rowCount: res.data.rowCount,
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: (err as Error).message || "An unexpected error occurred during export",
      });
    } finally {
      setIsExporting(false);
      setExportingReportId(null);
    }
  };

  const activeReport = reports.find((r) => r.id === selectedReport) || reports[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Timeframe Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
              <Calendar className="w-4 h-4 text-gray-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 uppercase tracking-wider">Export Timeframe</div>
              <p className="text-xs text-gray-500">Filter records by registration or creation timestamp</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {quickPresets.map((preset) => {
              const isSelected = selectedPreset === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSelectedPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  {presetLabels[preset]}
                </button>
              );
            })}

            <div className="h-4 w-px bg-gray-200 hidden sm:block mx-1" />

            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value as DateRangePreset)}
              className="py-1.5 px-3 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {DATE_RANGE_PRESETS.map((p) => (
                <option key={p} value={p}>
                  {presetLabels[p]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dataset Selection Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Operational Datasets</h2>
            <p className="text-xs text-gray-500">Choose a dataset to export directly to CSV spreadsheet format</p>
          </div>
          <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            5 Modules Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedReport === r.id;
            const isThisExporting = isExporting && exportingReportId === r.id;

            return (
              <div
                key={r.id}
                onClick={() => {
                  if (!r.disabled) {
                    setSelectedReport(r.id);
                  }
                }}
                className={`relative p-5 rounded-2xl border transition-all text-left flex flex-col justify-between gap-4 cursor-pointer group ${
                  r.disabled
                    ? "opacity-55 cursor-not-allowed bg-gray-50 border-gray-200"
                    : isSelected
                    ? "bg-white border-red-500 ring-2 ring-red-500/20 shadow-md"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${r.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {r.category}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors">
                          {r.title}
                        </h3>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {r.disabled ? (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-200/80 px-2 py-0.5 rounded-md">
                          Admin Only
                        </span>
                      ) : isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-gray-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.columns.slice(0, 4).map((col, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
                      >
                        {col}
                      </span>
                    ))}
                    {r.columns.length > 4 && (
                      <span className="text-[10px] font-semibold text-gray-400 px-1.5 py-0.5">
                        +{r.columns.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-500">
                    Format: <span className="font-semibold text-gray-700">CSV (RFC 4180)</span>
                  </span>

                  <button
                    type="button"
                    disabled={r.disabled || isExporting}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(r.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      r.disabled
                        ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                        : isThisExporting
                        ? "bg-red-100 text-red-700"
                        : isSelected
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                  >
                    {isThisExporting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Export Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-red-600 text-[10px] font-bold uppercase tracking-wider text-white">
              Ready to Export
            </span>
            <span className="text-xs text-gray-300">
              Filter: <strong className="text-white">{presetLabels[selectedPreset]}</strong>
            </span>
          </div>
          <h3 className="text-base font-bold text-white">{activeReport.title}</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Generates genuine CSV spreadsheet file with sanitized fields, formula-injection neutralization, and verified relational data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Button
            onClick={() => handleDownload()}
            disabled={isExporting || activeReport.disabled}
            className="h-11 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating CSV File...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Download CSV Spreadsheet</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Live Feedback Toast/Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 space-y-1">
            <div className="font-bold text-sm">
              {feedback.type === "success" ? "Export Successful" : "Export Failed"}
            </div>
            <p className="leading-relaxed text-xs opacity-90">{feedback.message}</p>
            {feedback.filename && (
              <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-emerald-700">
                <span>File: <code>{feedback.filename}</code></span>
                <span>•</span>
                <span>Rows Generated: {feedback.rowCount ?? 0}</span>
                <span>•</span>
                <span>Saved to your Downloads folder</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* Security & Data Integrity Compliance Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs text-amber-950 space-y-1.5">
        <div className="font-bold flex items-center gap-2 text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Security &amp; Data Integrity Compliance</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          All CSV exports are sanitized against spreadsheet formula injection attacks (characters like <code className="bg-amber-100/90 px-1 rounded font-mono text-[10px]">=</code>, <code className="bg-amber-100/90 px-1 rounded font-mono text-[10px]">+</code>, <code className="bg-amber-100/90 px-1 rounded font-mono text-[10px]">-</code>, and <code className="bg-amber-100/90 px-1 rounded font-mono text-[10px]">@</code> are safely quoted). UTF-8 byte order mark is embedded for automatic character encoding in Microsoft Excel and Google Sheets. Every export is recorded in the immutable administrative audit log.
        </p>
      </div>
    </div>
  );
}
