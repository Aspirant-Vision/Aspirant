"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit2,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  Building,
  GraduationCap,
  LayoutList,
  Kanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/crm/status-badge";
import { DataTableContainer } from "@/components/crm/data-table";
import { EmptyState } from "@/components/crm/empty-state";
import {
  getLeadsListingAction,
  updateLeadStatusAction,
  assignLeadAction,
  exportLeadsCsvAction,
} from "@/lib/crm/actions";
import { LeadPriority, LeadStatus } from "@/types/database.types";
import { cn } from "@/lib/utils";

interface LeadTableClientProps {
  initialLeads: any[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
  counsellors: Array<{ id: string; full_name: string; email: string }>;
  colleges: Array<{ id: string; name: string }>;
  courses: Array<{ id: string; name: string }>;
  isCounsellorOnly?: boolean;
}

const STATUS_COLUMNS: Array<{ id: LeadStatus; label: string; color: string }> = [
  { id: "new", label: "New Leads", color: "border-blue-400 bg-blue-50/40 text-blue-800" },
  { id: "contacted", label: "Contacted", color: "border-sky-400 bg-sky-50/40 text-sky-800" },
  { id: "interested", label: "Interested", color: "border-amber-400 bg-amber-50/40 text-amber-800" },
  { id: "counselling_scheduled", label: "Counselling Scheduled", color: "border-purple-400 bg-purple-50/40 text-purple-800" },
  { id: "application_started", label: "App Started", color: "border-indigo-400 bg-indigo-50/40 text-indigo-800" },
  { id: "admitted", label: "Admitted", color: "border-emerald-400 bg-emerald-50/40 text-emerald-800" },
  { id: "lost", label: "Lost / Not Interested", color: "border-gray-400 bg-gray-50/40 text-gray-800" },
];

export function LeadTableClient({
  initialLeads,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
  counsellors,
  colleges,
  courses,
  isCounsellorOnly = false,
}: LeadTableClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [viewMode, setViewMode] = useState<"table" | "pipeline">("table");
  const [leads, setLeads] = useState<any[]>(initialLeads);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  // Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [source, setSource] = useState("all");
  const [counsellorId, setCounsellorId] = useState("all");
  const [collegeId, setCollegeId] = useState("all");
  const [courseId, setCourseId] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">("newest");

  // Assign Modal State
  const [assignModalLead, setAssignModalLead] = useState<any | null>(null);
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Status Change Modal State
  const [statusModalLead, setStatusModalLead] = useState<any | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>("new");
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // CSV Export State
  const [isExporting, setIsExporting] = useState(false);

  const fetchLeads = async (newPage = page) => {
    startTransition(async () => {
      const res = await getLeadsListingAction({
        search: search.trim() || undefined,
        status: status !== "all" ? status : undefined,
        priority: priority !== "all" ? priority : undefined,
        source: source !== "all" ? source : undefined,
        counsellorId: counsellorId !== "all" ? counsellorId : undefined,
        collegeId: collegeId !== "all" ? collegeId : undefined,
        courseId: courseId !== "all" ? courseId : undefined,
        sortBy,
        page: newPage,
        pageSize,
        onlyMine: isCounsellorOnly,
      });

      if (res.success && res.data) {
        setLeads(res.data.leads);
        setTotal(res.data.total);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(1);
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await exportLeadsCsvAction();
      if (!res.success) {
        alert("Export failed: " + (res.error?.message || "Unknown error"));
      } else {
        const blob = new Blob([res.data.csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", res.data.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: unknown) {
      alert("Export failed: " + (err as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalLead) return;

    setIsAssigning(true);
    try {
      const res = await assignLeadAction({
        leadId: assignModalLead.id,
        counsellorId: selectedCounsellor || null,
        notes: assignNotes,
      });

      if (!res.success) {
        alert(res.error?.message || "Failed to assign lead");
      } else {
        setAssignModalLead(null);
        setSelectedCounsellor("");
        setAssignNotes("");
        fetchLeads(page);
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalLead) return;

    setIsUpdatingStatus(true);
    try {
      const res = await updateLeadStatusAction({
        leadId: statusModalLead.id,
        status: selectedStatus,
        reason: statusReason,
      });

      if (!res.success) {
        alert(res.error?.message || "Failed to update status");
      } else {
        setStatusModalLead(null);
        setStatusReason("");
        fetchLeads(page);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getPriorityBadgeClass = (p: LeadPriority) => {
    switch (p) {
      case "urgent":
        return "bg-rose-100 text-rose-700 border-rose-200 font-bold animate-pulse";
      case "high":
        return "bg-amber-100 text-amber-800 border-amber-200 font-bold";
      case "medium":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "low":
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP TOOLBAR: VIEW SWITCHER, SEARCH, FILTERS & ACTIONS */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* View Switcher Pills */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("pipeline")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === "pipeline"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline View</span>
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            {!isCounsellorOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={isExporting}
                className="text-xs"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                )}
                <span>Export CSV</span>
              </Button>
            )}

            <Link href="/admin/leads/new">
              <Button variant="primary" size="sm" className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                <span>Create Lead</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B] focus:border-[#E31E2B]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                startTransition(() => {
                  fetchLeads(1);
                });
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="counselling_scheduled">Counselling Scheduled</option>
              <option value="application_started">Application Started</option>
              <option value="admitted">Admitted</option>
              <option value="not_interested">Not Interested</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                startTransition(() => {
                  fetchLeads(1);
                });
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Counsellor Filter (If Admin) */}
          {!isCounsellorOnly && (
            <div>
              <select
                value={counsellorId}
                onChange={(e) => {
                  setCounsellorId(e.target.value);
                  startTransition(() => {
                    fetchLeads(1);
                  });
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
              >
                <option value="all">All Counsellors</option>
                <option value="unassigned">Unassigned Leads</option>
                {counsellors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || c.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                startTransition(() => {
                  fetchLeads(1);
                });
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="priority">Sort: Highest Priority</option>
            </select>
          </div>
        </form>
      </div>

      {/* 2. LOADING STATE */}
      {isPending && (
        <div className="flex items-center justify-center py-6 text-gray-500 text-xs">
          <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#E31E2B]" />
          <span>Refreshing lead database...</span>
        </div>
      )}

      {/* 3. VIEW 1: DATA TABLE VIEW */}
      {viewMode === "table" && (
        <>
          {leads.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No Leads Found"
              description="No admission leads match your selected search terms or filters."
            />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200/80 bg-gray-50/70 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Student Details</th>
                      <th className="py-3.5 px-4">Preferences</th>
                      <th className="py-3.5 px-4">Status & Priority</th>
                      <th className="py-3.5 px-4">Assigned Counsellor</th>
                      <th className="py-3.5 px-4">Source & Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50/70 transition-colors">
                        {/* Student Details */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900 text-sm">
                            <Link
                              href={`/admin/leads/${lead.id}`}
                              className="hover:text-[#E31E2B] transition-colors"
                            >
                              {lead.full_name}
                            </Link>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{lead.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{lead.email}</span>
                          </div>
                        </td>

                        {/* Preferences */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-800 flex items-center gap-1">
                            <Building className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[180px]">
                              {lead.colleges?.name || "General Admission"}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[180px]">
                              {lead.courses?.name || "Any Stream"}
                            </span>
                          </div>
                          {lead.preferred_location && (
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              📍 {lead.preferred_location}
                            </div>
                          )}
                        </td>

                        {/* Status & Priority */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setStatusModalLead(lead);
                                setSelectedStatus(lead.status);
                              }}
                              className="cursor-pointer"
                              title="Click to change status"
                            >
                              <StatusBadge status={lead.status} />
                            </button>
                            <span
                              className={cn(
                                "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                getPriorityBadgeClass(lead.priority)
                              )}
                            >
                              {lead.priority}
                            </span>
                          </div>
                        </td>

                        {/* Assigned Counsellor */}
                        <td className="py-3 px-4">
                          {lead.counsellor ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                                {lead.counsellor.full_name?.charAt(0) || "C"}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-xs">
                                  {lead.counsellor.full_name}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  {lead.counsellor.email}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Unassigned</span>
                            </div>
                          )}
                        </td>

                        {/* Source & Date */}
                        <td className="py-3 px-4 text-gray-500">
                          <div className="font-medium text-gray-700 capitalize text-xs">
                            {lead.source?.replace("_", " ") || "Website"}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/leads/${lead.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                title="View Lead 360"
                              >
                                <Eye className="w-3.5 h-3.5 text-gray-600" />
                              </Button>
                            </Link>

                            <Link href={`/admin/leads/${lead.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                title="Edit Lead"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                              </Button>
                            </Link>

                            {!isCounsellorOnly && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                title="Assign Counsellor"
                                onClick={() => {
                                  setAssignModalLead(lead);
                                  setSelectedCounsellor(lead.assigned_counsellor_id || "");
                                }}
                              >
                                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500">
                <div>
                  Showing <strong>{leads.length}</strong> of <strong>{total}</strong> leads
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isPending}
                    onClick={() => fetchLeads(page - 1)}
                    className="h-7 text-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    Previous
                  </Button>
                  <span className="font-semibold text-gray-700">
                    Page {page} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || isPending}
                    onClick={() => fetchLeads(page + 1)}
                    className="h-7 text-xs"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 4. VIEW 2: PIPELINE (KANBAN) VIEW */}
      {viewMode === "pipeline" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1280px]">
            {STATUS_COLUMNS.map((col) => {
              const colLeads = leads.filter((l) => {
                if (col.id === "lost") {
                  return l.status === "lost" || l.status === "not_interested";
                }
                return l.status === col.id;
              });

              return (
                <div
                  key={col.id}
                  className="w-72 shrink-0 bg-gray-100/70 rounded-2xl p-3 border border-gray-200/60 flex flex-col max-h-[750px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-gray-200">
                    <span className="font-bold text-xs text-gray-800">{col.label}</span>
                    <span
                      className={cn(
                        "text-[10px] font-extrabold px-2 py-0.5 rounded-full border",
                        col.color
                      )}
                    >
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {colLeads.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-xs italic">
                        No leads
                      </div>
                    ) : (
                      colLeads.map((card) => (
                        <div
                          key={card.id}
                          className="bg-white rounded-xl p-3 border border-gray-200/80 shadow-2xs hover:shadow-xs transition-shadow space-y-2"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <Link
                              href={`/admin/leads/${card.id}`}
                              className="font-bold text-xs text-gray-900 hover:text-[#E31E2B] transition-colors leading-tight line-clamp-1"
                            >
                              {card.full_name}
                            </Link>
                            <span
                              className={cn(
                                "text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border shrink-0",
                                getPriorityBadgeClass(card.priority)
                              )}
                            >
                              {card.priority}
                            </span>
                          </div>

                          <div className="text-[11px] text-gray-500 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">{card.colleges?.name || "General"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>{card.phone}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] text-gray-400">
                            <span>
                              {card.counsellor?.full_name ? (
                                <span className="text-gray-700 font-medium">
                                  👤 {card.counsellor.full_name.split(" ")[0]}
                                </span>
                              ) : (
                                <span className="text-amber-600 font-semibold">Unassigned</span>
                              )}
                            </span>
                            <Link
                              href={`/admin/leads/${card.id}`}
                              className="text-[#E31E2B] font-bold hover:underline"
                            >
                              View →
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. MODAL: ASSIGN COUNSELLOR */}
      {assignModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">
                Assign Counsellor to {assignModalLead.full_name}
              </h3>
              <button
                type="button"
                onClick={() => setAssignModalLead(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Counsellor *
                </label>
                <select
                  value={selectedCounsellor}
                  onChange={(e) => setSelectedCounsellor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                >
                  <option value="">Unassigned (Remove Counsellor)</option>
                  {counsellors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assignment Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Student interested in CSE with 85% PCM"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAssignModalLead(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isAssigning}
                  className="bg-[#E31E2B] text-white"
                >
                  {isAssigning ? "Assigning..." : "Confirm Assignment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: STATUS TRANSITION */}
      {statusModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">
                Update Lead Status: {statusModalLead.full_name}
              </h3>
              <button
                type="button"
                onClick={() => setStatusModalLead(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Status *
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="counselling_scheduled">Counselling Scheduled</option>
                  <option value="application_started">Application Started</option>
                  <option value="admitted">Admitted</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {(selectedStatus === "lost" || selectedStatus === "not_interested") && (
                <div>
                  <label className="block text-xs font-semibold text-red-700 mb-1">
                    Reason Required *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide specific reason (e.g. Opted for local government college)"
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-red-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusModalLead(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isUpdatingStatus}
                  className="bg-[#E31E2B] text-white"
                >
                  {isUpdatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
