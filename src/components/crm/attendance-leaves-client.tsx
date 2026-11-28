"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  UserCheck,
  User,
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  ChevronRight,
  Plus,
  RefreshCw,
  BadgeCheck,
  Phone,
  Mail,
  Edit3,
  Briefcase,
  LogIn,
  LogOut,
  Timer,
  CalendarOff,
  Users,
  Download,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import {
  AttendanceRecord,
  LeaveRequestRecord,
  CounsellorPortfolio,
  punchClockAction,
  getAttendanceOverviewAction,
  getCounsellorDetailPortfolioAction,
  updateCounsellorSalaryAction,
  submitLeaveRequestAction,
  reviewLeaveRequestAction,
} from "@/lib/attendance/actions";
import { cn } from "@/lib/utils";

interface AttendanceLeavesClientProps {
  currentUserId: string;
  userRole: string;
  userName: string;
  userEmail: string;
  initialAttendance: AttendanceRecord[];
  initialStats: {
    presentToday: number;
    onLeaveToday: number;
    avgHoursLogged: number;
    activeStaffCount: number;
  };
  initialTodayStatus: {
    isClockedIn: boolean;
    clockInTime: string | null;
    clockOutTime: string | null;
    totalHours: number;
    status: string;
  };
  initialLeaves: LeaveRequestRecord[];
  counsellorsList: Array<{
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    role: string;
    avatarUrl?: string | null;
  }>;
  initialPortfolio?: CounsellorPortfolio | null;
}

export function AttendanceLeavesClient({
  currentUserId,
  userRole,
  userName,
  userEmail,
  initialAttendance,
  initialStats,
  initialTodayStatus,
  initialLeaves,
  counsellorsList,
  initialPortfolio,
}: AttendanceLeavesClientProps) {
  const isSuperAdmin = userRole === "super_admin" || userRole === "admin";

  // Tab State
  const [activeTab, setActiveTab] = useState<"attendance" | "portfolio" | "leaves">("attendance");

  // Clock in / out state
  const [todayStatus, setTodayStatus] = useState(initialTodayStatus);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isPunching, startPunchTransition] = useTransition();
  const [bannerMessage, setBannerMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Attendance Records State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendance);
  const [stats, setStats] = useState(initialStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split("T")[0]);

  // Counsellor Portfolio Selection State
  const [selectedCounsellorId, setSelectedCounsellorId] = useState<string>(
    initialPortfolio?.counsellor.id || counsellorsList[0]?.id || currentUserId
  );
  const [portfolio, setPortfolio] = useState<CounsellorPortfolio | null>(initialPortfolio || null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);

  // Salary Edit Modal State (Super Admin only)
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    baseSalary: 48000,
    incentiveRate: 7.5,
    conversionsBonus: 10500,
    deductions: 0,
    paymentStatus: "approved" as "pending" | "approved" | "disbursed",
    payFrequency: "Monthly",
  });
  const [isSavingSalary, setIsSavingSalary] = useState(false);

  // Leave Management State
  const [leaveRecords, setLeaveRecords] = useState<LeaveRequestRecord[]>(initialLeaves);
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>("all");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "casual" as "casual" | "sick" | "paid" | "emergency" | "unpaid",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  // Real-time Approval Note State
  const [reviewNotePrompt, setReviewNotePrompt] = useState<{
    leaveId: string;
    action: "accepted" | "rejected";
    counsellorName: string;
  } | null>(null);
  const [reviewNoteText, setReviewNoteText] = useState("");
  const [isProcessingReview, setIsProcessingReview] = useState(false);

  // Live Digital Clock (HH:MM:SS AM/PM)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync selected counsellor portfolio when switching selection
  useEffect(() => {
    if (!selectedCounsellorId) return;
    let isCancelled = false;

    async function loadPortfolio() {
      setIsLoadingPortfolio(true);
      try {
        const res = await getCounsellorDetailPortfolioAction(selectedCounsellorId);
        if (!isCancelled && res.success && res.data) {
          setPortfolio(res.data);
          setSalaryForm({
            baseSalary: res.data.salary.baseSalary,
            incentiveRate: res.data.salary.incentiveRate,
            conversionsBonus: res.data.salary.conversionsBonus,
            deductions: res.data.salary.deductions,
            paymentStatus: res.data.salary.paymentStatus,
            payFrequency: res.data.salary.payFrequency || "Monthly",
          });
        }
      } catch (e) {
        console.error("Failed to load portfolio", e);
      } finally {
        if (!isCancelled) setIsLoadingPortfolio(false);
      }
    }

    loadPortfolio();
    return () => {
      isCancelled = true;
    };
  }, [selectedCounsellorId]);

  // Auto-dismiss banner message
  useEffect(() => {
    if (!bannerMessage) return;
    const timer = setTimeout(() => setBannerMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [bannerMessage]);

  // Handle Clock In / Clock Out
  const handlePunchClock = () => {
    startPunchTransition(async () => {
      try {
        const res = await punchClockAction(currentUserId);
        if (res.success) {
          const actionText =
            res.data.action === "clock_in"
              ? "Clocked In successfully! Shift timer running."
              : "Clocked Out successfully. Shift summary saved.";

          setBannerMessage({ type: "success", text: actionText });

          setTodayStatus({
            isClockedIn: res.data.action === "clock_in",
            clockInTime: res.data.record.clockInTime,
            clockOutTime: res.data.record.clockOutTime,
            totalHours: res.data.record.totalHours,
            status: res.data.record.status,
          });

          // Refresh roster in background
          const overviewRes = await getAttendanceOverviewAction({ date: dateFilter });
          if (overviewRes.success) {
            setAttendanceRecords(overviewRes.data.records);
            setStats(overviewRes.data.stats);
          }
        } else {
          setBannerMessage({
            type: "error",
            text: res.error.message || "Failed to record punch.",
          });
        }
      } catch (err: unknown) {
        setBannerMessage({
          type: "error",
          text: (err as Error).message || "An unexpected error occurred.",
        });
      }
    });
  };

  // Format Time Helper (12-hour format e.g. 09:15 AM)
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "--:--";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  // Format Date Helper
  const formatDate = (isoOrDate?: string | null) => {
    if (!isoOrDate) return "-";
    try {
      const d = new Date(isoOrDate);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoOrDate;
    }
  };

  // Smart Date Range Formatter (Prevents Text Spilling!)
  const formatLeaveDates = (start: string, end: string, days: number) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const sMonth = s.toLocaleDateString("en-IN", { month: "short" });
      const sDay = s.getDate();
      const sYear = s.getFullYear();

      if (start === end || days === 1) {
        return `${sDay} ${sMonth} ${sYear}`;
      }

      const eMonth = e.toLocaleDateString("en-IN", { month: "short" });
      const eDay = e.getDate();
      const eYear = e.getFullYear();

      if (sYear === eYear && sMonth === eMonth) {
        return `${sDay}–${eDay} ${sMonth} ${sYear}`;
      }
      return `${sDay} ${sMonth} – ${eDay} ${eMonth}`;
    } catch {
      return `${start} to ${end}`;
    }
  };

  // Handle Leave Application Submit
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      alert("Please provide a reason for the leave application.");
      return;
    }

    setIsSubmittingLeave(true);
    try {
      const res = await submitLeaveRequestAction({
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
        counsellorId: currentUserId,
      });

      if (res.success) {
        setLeaveRecords((prev) => [res.data, ...prev]);
        setShowApplyModal(false);
        setLeaveForm({
          leaveType: "casual",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
          reason: "",
        });
        setBannerMessage({
          type: "success",
          text: "Leave application submitted! Sent to Super Admin for approval.",
        });
      } else {
        alert(res.error.message || "Failed to submit leave request.");
      }
    } catch (err: unknown) {
      alert((err as Error).message || "Error submitting leave.");
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Handle Super Admin Leave Review (Accept / Reject)
  const handleReviewLeave = async () => {
    if (!reviewNotePrompt) return;
    setIsProcessingReview(true);

    const { leaveId, action } = reviewNotePrompt;
    try {
      // Optimistic update for immediate real-time counsellor feedback
      setLeaveRecords((prev) =>
        prev.map((l) =>
          l.id === leaveId
            ? {
                ...l,
                status: action,
                reviewedByName: userName || "Super Admin",
                reviewedAt: new Date().toISOString(),
                reviewNotes:
                  reviewNoteText.trim() ||
                  (action === "accepted" ? "Approved by Admin" : "Declined by Admin"),
              }
            : l
        )
      );

      const res = await reviewLeaveRequestAction(leaveId, action, reviewNoteText.trim());

      if (res.success) {
        setBannerMessage({
          type: "success",
          text: `Leave for ${reviewNotePrompt.counsellorName} has been ${
            action === "accepted" ? "Approved" : "Declined"
          }!`,
        });
      } else {
        setBannerMessage({
          type: "error",
          text: res.error.message || "Failed to update leave status on server.",
        });
      }
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to submit review.");
    } finally {
      setIsProcessingReview(false);
      setReviewNotePrompt(null);
      setReviewNoteText("");
    }
  };

  // Handle Salary Save (Super Admin)
  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounsellorId) return;

    setIsSavingSalary(true);
    try {
      const res = await updateCounsellorSalaryAction(selectedCounsellorId, salaryForm);
      if (res.success) {
        const pRes = await getCounsellorDetailPortfolioAction(selectedCounsellorId);
        if (pRes.success) {
          setPortfolio(pRes.data);
        }
        setShowSalaryModal(false);
        setBannerMessage({
          type: "success",
          text: `Salary details updated successfully for ${
            portfolio?.counsellor.fullName || "counsellor"
          }!`,
        });
      } else {
        alert(res.error.message || "Failed to update salary.");
      }
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to save salary.");
    } finally {
      setIsSavingSalary(false);
    }
  };

  // Export CSV
  const handleExportAttendanceCSV = () => {
    const headers = ["Counsellor Name", "Email", "Date", "Clock In", "Clock Out", "Total Hours", "Status"];
    const rows = filteredAttendance.map((r) => [
      `"${r.counsellorName}"`,
      `"${r.counsellorEmail}"`,
      `"${r.date}"`,
      `"${formatTime(r.clockInTime)}"`,
      `"${r.clockOutTime ? formatTime(r.clockOutTime) : "On Shift"}"`,
      r.totalHours,
      `"${r.status}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Attendance List
  const filteredAttendance = attendanceRecords.filter((rec) => {
    const matchesSearch =
      !searchQuery ||
      rec.counsellorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.counsellorEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || rec.status === statusFilter;
    const matchesDate = !dateFilter || rec.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Filtered Leaves List
  const filteredLeaves = leaveRecords.filter((leave) => {
    if (leaveStatusFilter === "all") return true;
    return leave.status === leaveStatusFilter;
  });

  const pendingLeavesCount = leaveRecords.filter((l) => l.status === "pending").length;

  return (
    <div className="space-y-5 pb-16">
      {/* Toast Alert Banner */}
      {bannerMessage && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 shadow-2xs ${
            bannerMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : bannerMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {bannerMessage.type === "success" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            )}
            {bannerMessage.type === "error" && (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            {bannerMessage.type === "info" && (
              <CalendarClock className="w-4 h-4 text-blue-600 flex-shrink-0" />
            )}
            <span className="text-xs font-bold">{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-gray-400 hover:text-gray-700 text-xs font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. COMPACT, EXECUTIVE SHIFT CONSOLE BAR (SPILL-FREE) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Clock Chip */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 font-mono text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-red-600" />
            <span>{currentTime || "--:--:--"}</span>
            <span className="text-[10px] text-gray-400 font-sans">IST</span>
          </div>

          {/* Today Date */}
          <span className="text-xs font-semibold text-gray-600">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>

          <span className="text-gray-300">|</span>

          {/* Current User Status Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            <span
              className={`w-2 h-2 rounded-full ${
                todayStatus.isClockedIn
                  ? "bg-emerald-500 animate-pulse"
                  : todayStatus.clockOutTime
                  ? "bg-gray-400"
                  : "bg-amber-400"
              }`}
            />
            <span>
              {todayStatus.isClockedIn
                ? `On Shift (${formatTime(todayStatus.clockInTime)})`
                : todayStatus.clockOutTime
                ? `Shift Done (${todayStatus.totalHours}h)`
                : "Off Shift"}
            </span>
          </div>
        </div>

        {/* Punch Clock Button */}
        <button
          onClick={handlePunchClock}
          disabled={isPunching}
          className={`tactile-btn-red text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
            isPunching ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isPunching ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Updating...</span>
            </>
          ) : todayStatus.isClockedIn ? (
            <>
              <LogOut className="w-3.5 h-3.5" />
              <span>Clock Out</span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              <span>Clock In</span>
            </>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. SPILL-PROOF 4-METRIC CARDS (CLEAN & COMPACT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Present */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-gray-500 truncate">Staff Active</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-2xl font-black text-gray-900 tracking-tight">{stats.presentToday}</p>
            <span className="text-[11px] font-semibold text-gray-400">counsellors</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 truncate">On duty today</p>
        </div>

        {/* Card 2: On Leave */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-gray-500 truncate">On Leave</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <CalendarOff className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-2xl font-black text-gray-900 tracking-tight">{stats.onLeaveToday}</p>
            <span className="text-[11px] font-semibold text-gray-400">staff</span>
          </div>
          <p className="text-[11px] text-gray-500 font-semibold mt-0.5 truncate">Approved off</p>
        </div>

        {/* Card 3: Avg Shift */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-gray-500 truncate">Avg Shift</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Timer className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-2xl font-black text-gray-900 tracking-tight">{stats.avgHoursLogged}h</p>
            <span className="text-[11px] font-semibold text-gray-400">logged</span>
          </div>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5 truncate">8.5h benchmark</p>
        </div>

        {/* Card 4: Team Total */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-gray-500 truncate">Team Total</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-2xl font-black text-gray-900 tracking-tight">{counsellorsList.length || 2}</p>
            <span className="text-[11px] font-semibold text-gray-400">staff</span>
          </div>
          <p className="text-[11px] text-gray-500 font-semibold mt-0.5 truncate">Registered</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CRM PILL TAB NAVIGATION */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-2 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("attendance")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "attendance"
                ? "bg-[#15182D] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Attendance Roster</span>
          </button>

          <button
            onClick={() => setActiveTab("portfolio")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "portfolio"
                ? "bg-[#15182D] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Counsellor 360°</span>
          </button>

          <button
            onClick={() => setActiveTab("leaves")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "leaves"
                ? "bg-[#15182D] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Leave Approvals</span>
            {pendingLeavesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-black ml-0.5">
                {pendingLeavesCount}
              </span>
            )}
          </button>
        </div>

        {/* Contextual Actions */}
        <div className="flex items-center gap-2">
          {activeTab === "attendance" && (
            <button
              onClick={handleExportAttendanceCSV}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Export CSV</span>
            </button>
          )}

          {activeTab === "leaves" && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="tactile-btn-red text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply for Leave</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ATTENDANCE ROSTER (NO HORIZONTAL OVERFLOW, CLEAN & CRISP) */}
      {/* ========================================================================= */}
      {activeTab === "attendance" && (
        <div className="space-y-3.5">
          {/* Filter Bar */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search counsellor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 bg-white text-gray-800"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-700 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setDateFilter(new Date().toISOString().split("T")[0])}
                  className="px-2 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Today
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs font-semibold text-gray-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-800 bg-white cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="late">Late Arrival</option>
                <option value="half_day">Half Day</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>

          {/* Table Container (100% width, NO horizontal scroll) */}
          <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-gray-50/90 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-[28%]">Counsellor</th>
                  <th className="py-3 px-3 w-[16%]">Date</th>
                  <th className="py-3 px-3 w-[15%]">Clock In</th>
                  <th className="py-3 px-3 w-[15%]">Clock Out</th>
                  <th className="py-3 px-3 w-[11%]">Hours</th>
                  <th className="py-3 px-3 w-[15%] text-right">Status &amp; Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                      No attendance records found for this date.
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => {
                    const isClockedOut = Boolean(record.clockOutTime);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50/70 transition-colors">
                        {/* Counsellor */}
                        <td className="py-3 px-4 truncate">
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                              {record.counsellorName.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <p className="font-bold text-gray-900 truncate">
                                {record.counsellorName}
                              </p>
                              <p className="text-[11px] text-gray-500 truncate">
                                {record.counsellorEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-gray-600 font-medium whitespace-nowrap">
                          {formatDate(record.date)}
                        </td>

                        {/* Clock In */}
                        <td className="py-3 px-3 font-semibold text-gray-900 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            <LogIn className="w-3 h-3 text-emerald-600" />
                            {formatTime(record.clockInTime)}
                          </span>
                        </td>

                        {/* Clock Out */}
                        <td className="py-3 px-3 font-semibold whitespace-nowrap">
                          {isClockedOut ? (
                            <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                              <LogOut className="w-3 h-3 text-gray-500" />
                              {formatTime(record.clockOutTime)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              On Shift
                            </span>
                          )}
                        </td>

                        {/* Total Hours */}
                        <td className="py-3 px-3 font-bold text-gray-800 whitespace-nowrap">
                          {record.totalHours > 0 ? `${record.totalHours}h` : "--"}
                        </td>

                        {/* Status & Action */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                record.status === "present"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : record.status === "late"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-purple-50 text-purple-700 border border-purple-200"
                              }`}
                            >
                              {record.status.replace("_", " ")}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedCounsellorId(record.counsellorId);
                                setActiveTab("portfolio");
                              }}
                              className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                            >
                              Details →
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COUNSELLOR 360° PORTFOLIO, PERFORMANCE & SALARY BREAKDOWN */}
      {/* ========================================================================= */}
      {activeTab === "portfolio" && (
        <div className="space-y-4">
          {/* Selector & Actions */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-gray-500 uppercase">Counsellor:</span>
              <select
                value={selectedCounsellorId}
                onChange={(e) => setSelectedCounsellorId(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer min-w-[200px]"
              >
                {counsellorsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName || c.email} ({c.role})
                  </option>
                ))}
              </select>
              {isLoadingPortfolio && (
                <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Loading...
                </span>
              )}
            </div>

            {isSuperAdmin && portfolio && (
              <button
                onClick={() => setShowSalaryModal(true)}
                className="tactile-btn-red text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Adjust Salary</span>
              </button>
            )}
          </div>

          {portfolio ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-extrabold text-lg flex items-center justify-center shadow-2xs shrink-0">
                      {portfolio.counsellor.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">
                          {portfolio.counsellor.fullName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
                          {portfolio.counsellor.role}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {portfolio.counsellor.email}
                        </span>
                        {portfolio.counsellor.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {portfolio.counsellor.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          Joined {formatDate(portfolio.counsellor.joinedDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active Staff
                  </span>
                </div>
              </div>

              {/* Performance Metrics (Spill-Proof) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs overflow-hidden">
                  <p className="text-[11px] font-bold text-gray-500 truncate">Leads</p>
                  <p className="text-xl font-black text-gray-900 mt-1">
                    {portfolio.performance.totalAssignedLeads}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">Assigned</p>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs overflow-hidden">
                  <p className="text-[11px] font-bold text-gray-500 truncate">Admitted</p>
                  <p className="text-xl font-black text-emerald-600 mt-1">
                    {portfolio.performance.convertedLeads}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 truncate">Converted</p>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs overflow-hidden">
                  <p className="text-[11px] font-bold text-gray-500 truncate">Conversion</p>
                  <p className="text-xl font-black text-purple-600 mt-1">
                    {portfolio.performance.conversionRate}%
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div
                      className="bg-purple-600 h-1 rounded-full"
                      style={{ width: `${Math.min(portfolio.performance.conversionRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs overflow-hidden">
                  <p className="text-[11px] font-bold text-gray-500 truncate">Follow-ups</p>
                  <p className="text-xl font-black text-amber-600 mt-1">
                    {portfolio.performance.completedFollowUps}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">Completed</p>
                </div>
              </div>

              {/* Salary Breakdown (Spill-Proof) */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">
                      Salary &amp; Compensation Matrix
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Cycle: {portfolio.salary.payFrequency || "Monthly"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      portfolio.salary.paymentStatus === "disbursed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {portfolio.salary.paymentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-3">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 overflow-hidden">
                    <p className="text-[10px] font-bold text-gray-500 truncate">Base Pay</p>
                    <p className="text-base font-black text-gray-900 mt-1 truncate">
                      ₹{portfolio.salary.baseSalary.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 overflow-hidden">
                    <p className="text-[10px] font-bold text-gray-500 truncate">Incentive</p>
                    <p className="text-base font-black text-emerald-600 mt-1 truncate">
                      {portfolio.salary.incentiveRate}% / lead
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 overflow-hidden">
                    <p className="text-[10px] font-bold text-gray-500 truncate">Bonus</p>
                    <p className="text-base font-black text-emerald-600 mt-1 truncate">
                      +₹{portfolio.salary.conversionsBonus.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 overflow-hidden">
                    <p className="text-[10px] font-bold text-gray-500 truncate">Deductions</p>
                    <p className="text-base font-black text-rose-600 mt-1 truncate">
                      -₹{portfolio.salary.deductions.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-1 bg-emerald-50 border border-emerald-200 p-3 rounded-xl overflow-hidden">
                    <p className="text-[10px] font-bold text-emerald-800 truncate">Net Payout</p>
                    <p className="text-base font-black text-emerald-950 mt-1 truncate">
                      ₹{portfolio.salary.netPayable.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs font-semibold">
              Select a counsellor to inspect their profile.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEAVE MANAGEMENT & APPROVALS (ZERO HORIZONTAL OVERFLOW!) */}
      {/* ========================================================================= */}
      {activeTab === "leaves" && (
        <div className="space-y-3.5">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Filter:</span>
              <select
                value={leaveStatusFilter}
                onChange={(e) => setLeaveStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold border border-gray-200 rounded-lg text-gray-800 bg-white cursor-pointer"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending Approval</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <span className="text-xs font-bold text-gray-500">
              Pending: <strong className="text-red-600">{pendingLeavesCount}</strong>
            </span>
          </div>

          {/* Leaves Table (Responsive, Fixed Widths, No Cutoff Buttons) */}
          <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-gray-50/90 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-[24%]">Counsellor</th>
                  <th className="py-3 px-3 w-[18%]">Leave &amp; Dates</th>
                  <th className="py-3 px-3 w-[28%]">Reason</th>
                  <th className="py-3 px-3 w-[14%]">Status</th>
                  <th className="py-3 px-4 w-[16%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                      No leave requests match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Counsellor */}
                      <td className="py-3 px-4 truncate">
                        <p className="font-bold text-gray-900 truncate">{leave.counsellorName}</p>
                        <p className="text-[11px] text-gray-500 truncate">{leave.counsellorEmail}</p>
                      </td>

                      {/* Leave & Dates (Smart Formatted, Spill-Free) */}
                      <td className="py-3 px-3 truncate">
                        <div className="space-y-0.5 truncate">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                            {leave.leaveType} ({leave.daysCount}d)
                          </span>
                          <p className="text-[11px] text-gray-500 truncate" title={`${leave.startDate} to ${leave.endDate}`}>
                            {formatLeaveDates(leave.startDate, leave.endDate, leave.daysCount)}
                          </p>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-3 truncate">
                        <p className="truncate text-gray-700 font-medium" title={leave.reason}>
                          {leave.reason}
                        </p>
                        {leave.reviewNotes && (
                          <p className="text-[10px] text-gray-500 truncate mt-0.5" title={leave.reviewNotes}>
                            Note: {leave.reviewNotes}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            leave.status === "accepted"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : leave.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {leave.status === "accepted" && <CheckCircle2 className="w-3 h-3" />}
                          {leave.status === "rejected" && <XCircle className="w-3 h-3" />}
                          {leave.status === "pending" && <Clock className="w-3 h-3" />}
                          {leave.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isSuperAdmin && leave.status === "pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                setReviewNotePrompt({
                                  leaveId: leave.id,
                                  action: "accepted",
                                  counsellorName: leave.counsellorName,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs cursor-pointer"
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() =>
                                setReviewNotePrompt({
                                  leaveId: leave.id,
                                  action: "rejected",
                                  counsellorName: leave.counsellorName,
                                })
                              }
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-semibold">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: APPLY FOR LEAVE */}
      {/* ========================================================================= */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                Apply for Leave
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3.5 mt-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                >
                  <option value="casual">Casual Leave (Personal / Family)</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="paid">Earned Paid Leave</option>
                  <option value="emergency">Emergency Urgent Leave</option>
                  <option value="unpaid">Leave Without Pay (LWP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Reason for leave application..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="tactile-btn-red text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xs cursor-pointer disabled:opacity-70"
                >
                  {isSubmittingLeave ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUPER ADMIN ACCEPT / REJECT LEAVE NOTE */}
      {/* ========================================================================= */}
      {reviewNotePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="font-extrabold text-gray-900 text-base">
              {reviewNotePrompt.action === "accepted" ? "Accept Leave" : "Reject Leave"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              For counsellor: <strong>{reviewNotePrompt.counsellorName}</strong>
            </p>

            <div className="mt-3.5">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admin Note (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Add optional note or handover instruction..."
                value={reviewNoteText}
                onChange={(e) => setReviewNoteText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReviewNotePrompt(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewLeave}
                disabled={isProcessingReview}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-2xs cursor-pointer ${
                  reviewNotePrompt.action === "accepted"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isProcessingReview
                  ? "Processing..."
                  : reviewNotePrompt.action === "accepted"
                  ? "Confirm Accept"
                  : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADJUST SALARY & INCENTIVES (SUPER ADMIN ONLY) */}
      {/* ========================================================================= */}
      {showSalaryModal && portfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-red-600" />
                  Adjust Compensation
                </h3>
                <p className="text-xs text-gray-500">
                  Target: <strong>{portfolio.counsellor.fullName}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowSalaryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-3.5 mt-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Base Salary (₹ / month)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={salaryForm.baseSalary}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, baseSalary: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Incentive Rate (% per lead)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={salaryForm.incentiveRate}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, incentiveRate: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Conversion Bonus (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={salaryForm.conversionsBonus}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, conversionsBonus: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Deductions (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={salaryForm.deductions}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, deductions: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={salaryForm.paymentStatus}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, paymentStatus: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="disbursed">Disbursed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pay Frequency</label>
                  <input
                    type="text"
                    value={salaryForm.payFrequency}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, payFrequency: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-red-700 uppercase">Calculated Net Payable</p>
                  <p className="text-base font-black text-red-950">
                    ₹
                    {(
                      salaryForm.baseSalary +
                      (salaryForm.conversionsBonus || 0) -
                      (salaryForm.deductions || 0)
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="text-[10px] text-red-600 font-bold bg-white px-2 py-0.5 rounded border border-red-200">
                  Real-time sync
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSalaryModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSalary}
                  className="tactile-btn-red text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xs cursor-pointer disabled:opacity-70"
                >
                  {isSavingSalary ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
