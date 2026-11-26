"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  PhoneCall,
  MessageSquare,
  Video,
  Mail,
  User,
  Phone,
  Search,
  Filter,
  Loader2,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/crm/empty-state";
import {
  getFollowUpsListingAction,
  completeFollowUpAction,
  rescheduleFollowUpAction,
  cancelFollowUpAction,
} from "@/lib/crm/actions";
import { cn } from "@/lib/utils";

interface FollowUpTableClientProps {
  initialFollowUps: any[];
  counsellors: Array<{ id: string; full_name: string; email: string }>;
  isCounsellorOnly?: boolean;
}

export function FollowUpTableClient({
  initialFollowUps,
  counsellors,
  isCounsellorOnly = false,
}: FollowUpTableClientProps) {
  const [isPending, startTransition] = useTransition();
  const [followUps, setFollowUps] = useState<any[]>(initialFollowUps);
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "overdue" | "completed" | "all">("today");
  const [counsellorFilter, setCounsellorFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Complete Dialog
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  // Reschedule Dialog
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Cancel Dialog
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchFollowUps = (tab = activeTab, cId = counsellorFilter) => {
    startTransition(async () => {
      const res = await getFollowUpsListingAction({
        tab,
        counsellorId: cId !== "all" ? cId : undefined,
      });

      if (res.success && res.data) {
        setFollowUps(res.data);
      }
    });
  };

  const handleTabChange = (newTab: "today" | "upcoming" | "overdue" | "completed" | "all") => {
    setActiveTab(newTab);
    fetchFollowUps(newTab, counsellorFilter);
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingId || !completionNotes.trim()) return;

    setIsCompleting(true);
    try {
      const res = await completeFollowUpAction({
        followUpId: completingId,
        completionNotes,
      });

      if (res.success) {
        setCompletingId(null);
        setCompletionNotes("");
        fetchFollowUps();
      } else {
        alert(res.error?.message || "Failed to complete follow-up");
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingId || !newDate) return;

    setIsRescheduling(true);
    try {
      const res = await rescheduleFollowUpAction({
        followUpId: reschedulingId,
        newScheduledAt: new Date(newDate).toISOString(),
        reason: rescheduleReason,
      });

      if (res.success) {
        setReschedulingId(null);
        setNewDate("");
        setRescheduleReason("");
        fetchFollowUps();
      } else {
        alert(res.error?.message || "Failed to reschedule");
      }
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingId) return;

    setIsCancelling(true);
    try {
      const res = await cancelFollowUpAction(cancellingId, cancelReason || "Cancelled by counsellor");
      if (res.success) {
        setCancellingId(null);
        setCancelReason("");
        fetchFollowUps();
      } else {
        alert(res.error?.message || "Failed to cancel follow-up");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // Filter client-side by search
  const filtered = followUps.filter((fu) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const name = fu.lead?.full_name?.toLowerCase() || "";
    const phone = fu.lead?.phone?.toLowerCase() || "";
    const notes = fu.notes?.toLowerCase() || "";
    return name.includes(term) || phone.includes(term) || notes.includes(term);
  });

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "phone_call":
        return <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />;
      case "whatsapp":
        return <MessageSquare className="w-3.5 h-3.5 text-green-600" />;
      case "video_meeting":
        return <Video className="w-3.5 h-3.5 text-purple-600" />;
      case "email":
        return <Mail className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. TABS & FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => handleTabChange("today")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "today"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>Due Today</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("overdue")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "overdue"
                  ? "bg-white text-rose-700 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Overdue</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("upcoming")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "upcoming"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
              <span>Upcoming</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("completed")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "completed"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Completed</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "all"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <span>All Tasks</span>
            </button>
          </div>

          {/* Search & Counsellor Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
              />
            </div>

            {!isCounsellorOnly && (
              <select
                value={counsellorFilter}
                onChange={(e) => {
                  setCounsellorFilter(e.target.value);
                  fetchFollowUps(activeTab, e.target.value);
                }}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
              >
                <option value="all">All Counsellors</option>
                {counsellors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || c.email}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* 2. LOADING STATE */}
      {isPending && (
        <div className="flex items-center justify-center py-6 text-gray-500 text-xs">
          <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#E31E2B]" />
          <span>Loading tasks...</span>
        </div>
      )}

      {/* 3. TASK LIST / EMPTY STATE */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title={`No ${activeTab.replace("_", " ")} Follow-ups`}
          description="There are currently no tasks matching this filter criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((fu) => {
            const isPending = fu.status === "pending";
            const isOverdue = isPending && new Date(fu.scheduled_at) < new Date();

            return (
              <div
                key={fu.id}
                className={cn(
                  "bg-white rounded-2xl p-4 border shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3",
                  isOverdue
                    ? "border-rose-200 bg-rose-50/20"
                    : fu.status === "completed"
                    ? "border-emerald-200 bg-emerald-50/10"
                    : "border-gray-200/80"
                )}
              >
                <div className="space-y-2">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1.5 rounded-lg bg-gray-100">
                        {getChannelIcon(fu.follow_up_type)}
                      </div>
                      <span className="font-bold text-xs text-gray-900 capitalize">
                        {fu.follow_up_type.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isOverdue && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 uppercase">
                          Overdue
                        </span>
                      )}
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                          fu.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : fu.status === "cancelled"
                            ? "bg-gray-100 text-gray-500 border-gray-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        {fu.status}
                      </span>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div>
                    <Link
                      href={`/admin/leads/${fu.lead_id}`}
                      className="font-bold text-sm text-gray-900 hover:text-[#E31E2B] transition-colors block leading-tight"
                    >
                      {fu.lead?.full_name || "Student Lead"}
                    </Link>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <a href={`tel:${fu.lead?.phone}`} className="hover:underline">
                          {fu.lead?.phone}
                        </a>
                      </span>
                    </div>
                  </div>

                  {/* Scheduled Time */}
                  <div className="text-xs text-gray-600 flex items-center gap-1.5 pt-1 border-t border-gray-100">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{new Date(fu.scheduled_at).toLocaleString()}</span>
                  </div>

                  {/* Goal / Notes */}
                  {fu.notes && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg italic">
                      &quot;{fu.notes}&quot;
                    </p>
                  )}

                  {fu.completion_notes && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                      <strong>Outcome:</strong> {fu.completion_notes}
                    </div>
                  )}
                </div>

                {/* Footer CTAs */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    👤 {fu.counsellor?.full_name?.split(" ")[0] || "Counsellor"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isPending ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReschedulingId(fu.id)}
                          className="h-7 text-[10px]"
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setCompletingId(fu.id)}
                          className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Complete
                        </Button>
                      </>
                    ) : (
                      <Link href={`/admin/leads/${fu.lead_id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] text-gray-600">
                          View Lead →
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL: COMPLETE FOLLOW-UP */}
      {completingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">Mark Follow-up Completed</h3>
              <button
                type="button"
                onClick={() => setCompletingId(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Completion Remarks / Outcome *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize conversation: student readiness, questions answered, next steps..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCompletingId(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isCompleting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isCompleting ? "Saving..." : "Confirm Completed"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: RESCHEDULE */}
      {reschedulingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">Reschedule Follow-up</h3>
              <button
                type="button"
                onClick={() => setReschedulingId(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Rescheduling
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Student requested callback after 5 PM"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReschedulingId(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isRescheduling}
                  className="bg-[#E31E2B] text-white"
                >
                  {isRescheduling ? "Rescheduling..." : "Save New Date"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
