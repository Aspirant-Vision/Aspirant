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
  Users,
  Shuffle,
  UserX,
  X,
  CheckSquare,
  Square,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/crm/status-badge";
import { EmptyState } from "@/components/crm/empty-state";
import {
  getLeadsListingAction,
  updateLeadStatusAction,
  assignLeadAction,
  batchAssignLeadsAction,
  batchUpdateLeadStatusAction,
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

  // Selection States for Selective & Batch Actions
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

  // Batch Modal States
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchMode, setBatchMode] = useState<"direct" | "round_robin">("direct");
  const [batchSelectedCounsellor, setBatchSelectedCounsellor] = useState("");
  const [batchRoundRobinCounsellors, setBatchRoundRobinCounsellors] = useState<Set<string>>(
    new Set(counsellors.map((c) => c.id))
  );
  const [batchNotes, setBatchNotes] = useState("");
  const [isBatchAssigning, setIsBatchAssigning] = useState(false);

  // Batch Status Modal State
  const [isBatchStatusModalOpen, setIsBatchStatusModalOpen] = useState(false);
  const [batchStatus, setBatchStatus] = useState<LeadStatus>("contacted");
  const [batchStatusReason, setBatchStatusReason] = useState("");
  const [isBatchUpdatingStatus, setIsBatchUpdatingStatus] = useState(false);

  // Single Assign Modal State
  const [assignModalLead, setAssignModalLead] = useState<any | null>(null);
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Single Status Change Modal State
  const [statusModalLead, setStatusModalLead] = useState<any | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>("new");
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // CSV Export State
  const [isExporting, setIsExporting] = useState(false);

  const fetchLeads = async (
    newPage = page,
    overrides?: {
      search?: string;
      status?: string;
      priority?: string;
      source?: string;
      counsellorId?: string;
      collegeId?: string;
      courseId?: string;
      sortBy?: "newest" | "oldest" | "priority";
    }
  ) => {
    const activeSearch = overrides?.search !== undefined ? overrides.search : search;
    const activeStatus = overrides?.status !== undefined ? overrides.status : status;
    const activePriority = overrides?.priority !== undefined ? overrides.priority : priority;
    const activeSource = overrides?.source !== undefined ? overrides.source : source;
    const activeCounsellorId = overrides?.counsellorId !== undefined ? overrides.counsellorId : counsellorId;
    const activeCollegeId = overrides?.collegeId !== undefined ? overrides.collegeId : collegeId;
    const activeCourseId = overrides?.courseId !== undefined ? overrides.courseId : courseId;
    const activeSortBy = overrides?.sortBy !== undefined ? overrides.sortBy : sortBy;

    startTransition(async () => {
      const res = await getLeadsListingAction({
        search: activeSearch.trim() || undefined,
        status: activeStatus !== "all" ? activeStatus : undefined,
        priority: activePriority !== "all" ? activePriority : undefined,
        source: activeSource !== "all" ? activeSource : undefined,
        counsellorId: activeCounsellorId !== "all" ? activeCounsellorId : undefined,
        collegeId: activeCollegeId !== "all" ? activeCollegeId : undefined,
        courseId: activeCourseId !== "all" ? activeCourseId : undefined,
        sortBy: activeSortBy,
        page: newPage,
        pageSize,
        onlyMine: isCounsellorOnly,
      });

      if (res.success && res.data) {
        setLeads(res.data.leads);
        setTotal(res.data.total);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
        setSelectedLeadIds(new Set()); // Reset selection on page reload
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(1, { search });
  };

  // Selection Helpers
  const allSelectedOnPage = leads.length > 0 && leads.every((l) => selectedLeadIds.has(l.id));
  const someSelectedOnPage = leads.some((l) => selectedLeadIds.has(l.id)) && !allSelectedOnPage;

  const toggleSelectAllPage = () => {
    if (allSelectedOnPage) {
      setSelectedLeadIds(new Set());
    } else {
      const newSet = new Set(selectedLeadIds);
      leads.forEach((l) => newSet.add(l.id));
      setSelectedLeadIds(newSet);
    }
  };

  const toggleSelectLead = (id: string) => {
    const newSet = new Set(selectedLeadIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLeadIds(newSet);
  };

  const selectUnassignedLeads = () => {
    const unassigned = leads.filter((l) => !l.assigned_counsellor_id);
    const newSet = new Set(unassigned.map((l) => l.id));
    setSelectedLeadIds(newSet);
  };

  const clearSelection = () => {
    setSelectedLeadIds(new Set());
  };

  // CSV Export
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

  // Single Lead Assignment
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

  // Batch Assignment Submit (Direct or Round-Robin)
  const handleBatchAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLeadIds.size === 0) return;

    if (batchMode === "direct" && !batchSelectedCounsellor) {
      const confirmUnassign = window.confirm(
        `Are you sure you want to mark all ${selectedLeadIds.size} selected leads as Unassigned?`
      );
      if (!confirmUnassign) return;
    }

    if (batchMode === "round_robin" && batchRoundRobinCounsellors.size === 0) {
      alert("Please select at least one counsellor for round-robin distribution.");
      return;
    }

    setIsBatchAssigning(true);
    try {
      const res = await batchAssignLeadsAction({
        leadIds: Array.from(selectedLeadIds),
        distributionMode: batchMode,
        counsellorId: batchMode === "direct" ? batchSelectedCounsellor || null : undefined,
        counsellorIds: batchMode === "round_robin" ? Array.from(batchRoundRobinCounsellors) : undefined,
        notes: batchNotes,
      });

      if (!res.success) {
        alert(res.error?.message || "Failed to batch assign leads");
      } else {
        setIsBatchModalOpen(false);
        setBatchNotes("");
        setSelectedLeadIds(new Set());
        fetchLeads(page);
      }
    } finally {
      setIsBatchAssigning(false);
    }
  };

  // Batch Status Submit
  const handleBatchStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLeadIds.size === 0) return;

    setIsBatchUpdatingStatus(true);
    try {
      const res = await batchUpdateLeadStatusAction(
        Array.from(selectedLeadIds),
        batchStatus,
        batchStatusReason
      );

      if (!res.success) {
        alert(res.error?.message || "Failed to update lead statuses");
      } else {
        setIsBatchStatusModalOpen(false);
        setBatchStatusReason("");
        setSelectedLeadIds(new Set());
        fetchLeads(page);
      }
    } finally {
      setIsBatchUpdatingStatus(false);
    }
  };

  // Single Status Update
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

  const unassignedCountOnPage = leads.filter((l) => !l.assigned_counsellor_id).length;

  return (
    <div className="space-y-4 relative">
      {/* 1. TOP TOOLBAR: VIEW SWITCHER, SEARCH, FILTERS & BATCH SHORTCUTS */}
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

          {/* Action CTAs & Unassigned Quick Select */}
          <div className="flex flex-wrap items-center gap-2">
            {!isCounsellorOnly && unassignedCountOnPage > 0 && (
              <button
                type="button"
                onClick={selectUnassignedLeads}
                className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Select all unassigned leads currently on page"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Select {unassignedCountOnPage} Unassigned</span>
              </button>
            )}

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
              <Button variant="primary" size="sm" className="text-xs bg-[#E31E2B] text-white">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                <span>Create Lead</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-900 transition-all shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    fetchLeads(1, { search: "" });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value;
                  setStatus(val);
                  fetchLeads(1, { status: val });
                }}
                className={cn(
                  "w-full px-2.5 py-2 text-xs rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-2xs",
                  status !== "all"
                    ? "border-red-400 bg-red-50/30 text-red-900 font-semibold"
                    : "border-gray-200 bg-white text-gray-700"
                )}
              >
                <option value="all">All Statuses</option>
                <option value="new">New Inquiry</option>
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
                  const val = e.target.value;
                  setPriority(val);
                  fetchLeads(1, { priority: val });
                }}
                className={cn(
                  "w-full px-2.5 py-2 text-xs rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-2xs",
                  priority !== "all"
                    ? "border-red-400 bg-red-50/30 text-red-900 font-semibold"
                    : "border-gray-200 bg-white text-gray-700"
                )}
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
                    const val = e.target.value;
                    setCounsellorId(val);
                    fetchLeads(1, { counsellorId: val });
                  }}
                  className={cn(
                    "w-full px-2.5 py-2 text-xs rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-2xs",
                    counsellorId !== "all"
                      ? "border-red-500 bg-red-50/40 text-red-900 font-bold ring-1 ring-red-400/50"
                      : "border-gray-200 bg-white text-gray-700"
                  )}
                >
                  <option value="all">All Counsellors</option>
                  <option value="unassigned">Unassigned Leads Only</option>
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
                  const val = e.target.value as any;
                  setSortBy(val);
                  fetchLeads(1, { sortBy: val });
                }}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="priority">Sort: Highest Priority</option>
              </select>
            </div>
          </div>

          {/* Active Filter Indicators Bar */}
          {(search.trim() !== "" || status !== "all" || priority !== "all" || counsellorId !== "all") && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[11px] font-semibold text-gray-500">
                Active Filter ({total} {total === 1 ? "lead" : "leads"} found):
              </span>

              {search.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-[11px] font-medium border border-gray-200">
                  <span>Keyword: &quot;{search.trim()}&quot;</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      fetchLeads(1, { search: "" });
                    }}
                    className="hover:text-red-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {counsellorId !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold">
                  <span>
                    Counsellor: {counsellorId === "unassigned" ? "Unassigned" : (counsellors.find((c) => c.id === counsellorId)?.full_name || "Selected")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCounsellorId("all");
                      fetchLeads(1, { counsellorId: "all" });
                    }}
                    className="hover:text-red-900 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {status !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold capitalize">
                  <span>Status: {status.replace("_", " ")}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("all");
                      fetchLeads(1, { status: "all" });
                    }}
                    className="hover:text-red-900 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {priority !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold capitalize">
                  <span>Priority: {priority}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPriority("all");
                      fetchLeads(1, { priority: "all" });
                    }}
                    className="hover:text-red-900 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setPriority("all");
                  setCounsellorId("all");
                  fetchLeads(1, {
                    search: "",
                    status: "all",
                    priority: "all",
                    counsellorId: "all",
                  });
                }}
                className="text-[11px] font-bold text-red-600 hover:text-red-800 hover:underline ml-1 cursor-pointer"
              >
                Reset all
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 2. LOADING STATE */}
      {isPending && (
        <div className="flex items-center justify-center py-6 text-gray-500 text-xs">
          <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#E31E2B]" />
          <span>Refreshing lead database...</span>
        </div>
      )}

      {/* 3. VIEW 1: DATA TABLE VIEW WITH BATCH CHECKBOXES */}
      {viewMode === "table" && (
        <>
          {leads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">No Leads Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No candidate inquiries match your active filter settings.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setPriority("all");
                  setCounsellorId("all");
                  fetchLeads(1, {
                    search: "",
                    status: "all",
                    priority: "all",
                    counsellorId: "all",
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200/80 bg-gray-50/70 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                      {!isCounsellorOnly && (
                        <th className="py-3.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={allSelectedOnPage}
                            ref={(el) => {
                              if (el) el.indeterminate = someSelectedOnPage;
                            }}
                            onChange={toggleSelectAllPage}
                            className="rounded border-gray-300 text-[#E31E2B] focus:ring-[#E31E2B] cursor-pointer"
                            title="Select all on this page"
                          />
                        </th>
                      )}
                      <th className="py-3.5 px-4">Student Details</th>
                      <th className="py-3.5 px-4">Preferences</th>
                      <th className="py-3.5 px-4">Status & Priority</th>
                      <th className="py-3.5 px-4">Assigned Counsellor</th>
                      <th className="py-3.5 px-4">Source & Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {leads.map((lead) => {
                      const isSelected = selectedLeadIds.has(lead.id);
                      const isSyntheticEmail =
                        !lead.email || lead.email.endsWith("@aspirantvision.lead");
                      const initials = (lead.full_name || "S")
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w: string) => w.charAt(0).toUpperCase())
                        .join("");

                      const formatSourceLabel = (src?: string | null) => {
                        if (!src) return "Website";
                        const s = src.toLowerCase();
                        if (s.includes("cutoff_predictor")) return "Cutoff Predictor";
                        if (s.includes("fee_concession")) return "Fee Concession";
                        if (s.includes("exam_strategy")) return "Exam Strategy";
                        if (s.includes("campus_admission")) return "Direct Admission";
                        if (s.includes("personalized search")) return "Personalized Search";
                        if (s.includes("homepage_hero")) return "Homepage Hero";
                        if (s.includes("consultation")) return "Consultation Modal";
                        return src.replace(/_/g, " ");
                      };

                      return (
                        <tr
                          key={lead.id}
                          className={cn(
                            "transition-colors group",
                            isSelected
                              ? "bg-red-50/40 border-l-[3px] border-[#E31E2B]"
                              : lead.priority === "urgent"
                              ? "bg-rose-50/15 hover:bg-rose-50/35 border-l-[3px] border-rose-500"
                              : "hover:bg-slate-50/90"
                          )}
                        >
                          {/* Selective Checkbox */}
                          {!isCounsellorOnly && (
                            <td className="py-3.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectLead(lead.id)}
                                className="rounded border-gray-300 text-[#E31E2B] focus:ring-[#E31E2B] cursor-pointer"
                              />
                            </td>
                          )}

                          {/* Student Details with Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className={cn(
                                  "w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 border shadow-2xs transition-transform group-hover:scale-105",
                                  lead.status === "admitted"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : lead.status === "new"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-red-50 text-[#E31E2B] border-red-200/80"
                                )}
                              >
                                {initials}
                              </Link>
                              <div className="min-w-0">
                                <Link
                                  href={`/admin/leads/${lead.id}`}
                                  className="font-bold text-slate-900 text-sm hover:text-[#E31E2B] transition-colors block truncate"
                                >
                                  {lead.full_name}
                                </Link>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-[#E31E2B]"
                                  >
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{lead.phone}</span>
                                  </a>
                                  {isSyntheticEmail ? (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">
                                      Phone Inquiry
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 truncate max-w-[175px]">
                                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="truncate">{lead.email}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Preferences */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {lead.colleges?.name || "General Admission"}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {lead.courses?.name || "Any Stream"}
                              </span>
                            </div>
                            {lead.preferred_location && lead.preferred_location !== "Website Fast Form" && (
                              <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                                📍 {lead.preferred_location}
                              </div>
                            )}
                          </td>

                          {/* Status & Priority */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col items-start gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusModalLead(lead);
                                  setSelectedStatus(lead.status);
                                }}
                                className="cursor-pointer hover:opacity-90 transition-opacity"
                                title="Click to change status"
                              >
                                <StatusBadge status={lead.status} type="lead" />
                              </button>
                              <span
                                className={cn(
                                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap",
                                  getPriorityBadgeClass(lead.priority)
                                )}
                              >
                                {lead.priority === "urgent" ? "🔥 Urgent" : lead.priority}
                              </span>
                            </div>
                          </td>

                          {/* Assigned Counsellor */}
                          <td className="py-3.5 px-4">
                            {lead.counsellor ? (
                              <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-[10px] shrink-0">
                                  {lead.counsellor.full_name?.charAt(0).toUpperCase() || "C"}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 text-xs truncate max-w-[130px]">
                                    {lead.counsellor.full_name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                    Counsellor
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAssignModalLead(lead);
                                  setSelectedCounsellor("");
                                  setAssignNotes("");
                                }}
                                className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                title="Click to assign counsellor"
                              >
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Assign Now</span>
                              </button>
                            )}
                          </td>

                          {/* Source & Date */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] capitalize truncate max-w-[160px]" title={lead.source || "Website"}>
                              {formatSourceLabel(lead.source)}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(lead.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`https://wa.me/91${(lead.phone || "").replace(/\D/g, "").slice(-10)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 w-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 inline-flex items-center justify-center transition-colors"
                                title="WhatsApp Student"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>

                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 inline-flex items-center justify-center transition-colors"
                                title="View Lead 360"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>

                              <Link
                                href={`/admin/leads/${lead.id}/edit`}
                                className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 inline-flex items-center justify-center transition-colors"
                                title="Edit Lead"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Link>

                              {/* Singular Assignment Trigger */}
                              {!isCounsellorOnly && (
                                <button
                                  type="button"
                                  className="h-8 w-8 rounded-lg bg-red-50 hover:bg-red-100 text-[#E31E2B] border border-red-200/80 inline-flex items-center justify-center transition-colors cursor-pointer"
                                  title="Assign Counsellor"
                                  onClick={() => {
                                    setAssignModalLead(lead);
                                    setSelectedCounsellor(lead.assigned_counsellor_id || "");
                                  }}
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                  className="w-80 flex-shrink-0 bg-gray-50/80 rounded-2xl p-3 border border-gray-200/80 flex flex-col max-h-[750px]"
                >
                  {/* Column Header */}
                  <div
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl border mb-3 font-bold text-xs",
                      col.color
                    )}
                  >
                    <span>{col.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-gray-800 text-[10px] shadow-2xs font-extrabold">
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {colLeads.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-xs italic">
                        No leads in this stage
                      </div>
                    ) : (
                      colLeads.map((lead) => {
                        const isSelected = selectedLeadIds.has(lead.id);
                        return (
                          <div
                            key={lead.id}
                            className={cn(
                              "bg-white rounded-xl p-3 border shadow-2xs transition-all space-y-2",
                              isSelected
                                ? "border-[#E31E2B] ring-1 ring-[#E31E2B] bg-red-50/30"
                                : "border-gray-200/90 hover:border-gray-300"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              {!isCounsellorOnly && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectLead(lead.id)}
                                  className="mt-0.5 rounded border-gray-300 text-[#E31E2B] focus:ring-[#E31E2B] cursor-pointer"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/admin/leads/${lead.id}`}
                                  className="font-bold text-gray-900 text-xs hover:text-[#E31E2B] transition-colors truncate block"
                                >
                                  {lead.full_name}
                                </Link>
                                <span className="text-[10px] text-gray-500 block truncate">
                                  {lead.phone}
                                </span>
                              </div>
                              <span
                                className={cn(
                                  "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-bold shrink-0",
                                  getPriorityBadgeClass(lead.priority)
                                )}
                              >
                                {lead.priority}
                              </span>
                            </div>

                            <div className="text-[11px] text-gray-600 space-y-0.5 pt-1 border-t border-gray-100">
                              <div className="truncate font-medium">
                                🏛️ {lead.colleges?.name || "General"}
                              </div>
                              <div className="truncate text-gray-500 text-[10px]">
                                🎓 {lead.courses?.name || "Any Stream"}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px]">
                              {lead.counsellor ? (
                                <span className="text-gray-700 font-semibold truncate max-w-[130px]">
                                  👤 {lead.counsellor.full_name}
                                </span>
                              ) : (
                                <span className="text-amber-600 font-bold flex items-center gap-1">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  Unassigned
                                </span>
                              )}

                              {!isCounsellorOnly && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssignModalLead(lead);
                                    setSelectedCounsellor(lead.assigned_counsellor_id || "");
                                  }}
                                  className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                                  title="Assign counsellor"
                                >
                                  Assign
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. FLOATING BATCH ACTIONS BAR (Appears when 1+ leads are selected) */}
      {!isCounsellorOnly && selectedLeadIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#15182D] text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
            <span className="bg-[#E31E2B] text-white text-xs font-black px-2 py-0.5 rounded-full">
              {selectedLeadIds.size}
            </span>
            <span className="text-xs font-bold text-gray-200 hidden sm:inline">
              Selected
            </span>
          </div>

          {/* Action 1: Batch Assign to Specific Counsellor */}
          <button
            type="button"
            onClick={() => {
              setBatchMode("direct");
              setIsBatchModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assign Counsellor</span>
          </button>

          {/* Action 2: Round-Robin Split across Counsellors */}
          <button
            type="button"
            onClick={() => {
              setBatchMode("round_robin");
              setIsBatchModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Round-Robin</span> Split
          </button>

          {/* Action 3: Batch Status Update */}
          <button
            type="button"
            onClick={() => setIsBatchStatusModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-gray-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Update Status</span>
          </button>

          {/* Action 4: Clear Selection */}
          <button
            type="button"
            onClick={clearSelection}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            title="Deselect all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 6. ADVANCED BATCH ASSIGNMENT MODAL (Direct or Round-Robin) */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#E31E2B]" />
                  <span>Batch Assign {selectedLeadIds.size} Leads</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Distribute the selected admission leads across your counseling team.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setBatchMode("direct")}
                className={cn(
                  "py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  batchMode === "direct"
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Single Counsellor</span>
              </button>
              <button
                type="button"
                onClick={() => setBatchMode("round_robin")}
                className={cn(
                  "py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  batchMode === "round_robin"
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-600" />
                <span>Round-Robin Distribution</span>
              </button>
            </div>

            <form onSubmit={handleBatchAssignSubmit} className="space-y-4">
              {batchMode === "direct" ? (
                /* Mode 1: Single Counsellor for All Selected */
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Assign All {selectedLeadIds.size} Leads To:
                  </label>
                  <select
                    value={batchSelectedCounsellor}
                    onChange={(e) => setBatchSelectedCounsellor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B] bg-white font-medium"
                  >
                    <option value="">Unassigned (Clear Counsellor Assignment)</option>
                    {counsellors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Mode 2: Round-Robin Distribution Across Selected Counsellors */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700">
                      Distribute Evenly Across Active Counsellors:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (batchRoundRobinCounsellors.size === counsellors.length) {
                          setBatchRoundRobinCounsellors(new Set());
                        } else {
                          setBatchRoundRobinCounsellors(new Set(counsellors.map((c) => c.id)));
                        }
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      {batchRoundRobinCounsellors.size === counsellors.length ? "Clear All" : "Select All"}
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-200 rounded-xl p-2.5 bg-gray-50/50">
                    {counsellors.map((c) => {
                      const isIncluded = batchRoundRobinCounsellors.has(c.id);
                      return (
                        <label
                          key={c.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200/80 hover:bg-gray-50 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isIncluded}
                              onChange={() => {
                                const newSet = new Set(batchRoundRobinCounsellors);
                                if (newSet.has(c.id)) newSet.delete(c.id);
                                else newSet.add(c.id);
                                setBatchRoundRobinCounsellors(newSet);
                              }}
                              className="rounded border-gray-300 text-[#E31E2B] focus:ring-[#E31E2B]"
                            />
                            <span className="font-semibold text-gray-900">{c.full_name}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">{c.email}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Distribution Forecast */}
                  {batchRoundRobinCounsellors.size > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>{selectedLeadIds.size} leads</strong> will be evenly divided across{" "}
                        <strong>{batchRoundRobinCounsellors.size} counsellors</strong> (~
                        {Math.ceil(selectedLeadIds.size / batchRoundRobinCounsellors.size)} leads each).
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Assignment Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Internal Assignment Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. High priority regional batch from Bhubaneswar Education Hub"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBatchModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isBatchAssigning}
                  className="bg-[#E31E2B] text-white"
                >
                  {isBatchAssigning ? "Processing Batch Assignment..." : "Execute Batch Assignment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. BATCH STATUS UPDATE MODAL */}
      {isBatchStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">
                Update Status for {selectedLeadIds.size} Leads
              </h3>
              <button
                type="button"
                onClick={() => setIsBatchStatusModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBatchStatusSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Status for Selected Batch *
                </label>
                <select
                  value={batchStatus}
                  onChange={(e) => setBatchStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B] bg-white font-medium"
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Followed up via phone call session"
                  value={batchStatusReason}
                  onChange={(e) => setBatchStatusReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBatchStatusModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isBatchUpdatingStatus}
                  className="bg-[#E31E2B] text-white"
                >
                  {isBatchUpdatingStatus ? "Updating Batch..." : "Confirm Status Update"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. SINGLE LEAD ASSIGNMENT MODAL */}
      {assignModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">
                Assign Counsellor: {assignModalLead.full_name}
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

      {/* 9. SINGLE LEAD STATUS TRANSITION MODAL */}
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
