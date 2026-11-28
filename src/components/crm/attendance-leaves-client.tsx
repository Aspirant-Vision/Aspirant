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
  FileText,
  BadgeCheck,
  Building,
  Phone,
  Mail,
  Edit3,
  Send,
  ArrowUpRight,
  Briefcase,
  LogIn,
  LogOut,
  Timer,
  CalendarCheck2,
  CalendarOff,
  Users,
  Download,
  Sparkles,
  ShieldCheck,
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
              ? "Successfully Clocked In for today! Shift timer is running."
              : "Successfully Clocked Out. Today's shift summary updated.";

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
            text: res.error.message || "Failed to record clock punch.",
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
      const today = new Date().toISOString().split("T")[0];
      const isToday = isoOrDate.startsWith(today);
      const formatted = d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return isToday ? `Today, ${formatted}` : formatted;
    } catch {
      return isoOrDate;
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
          text: "Leave application submitted! Sent to Super Admin for real-time approval.",
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
          text: `Leave request for ${reviewNotePrompt.counsellorName} has been ${
            action === "accepted" ? "Approved" : "Declined"
          }! Real-time notification dispatched.`,
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
    <div className="space-y-6 pb-16">
      {/* Toast Alert Banner */}
      {bannerMessage && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 shadow-sm animate-in fade-in slide-in-from-top-2 ${
            bannerMessage.type === "success"
              ? "bg-emerald-50/90 border-emerald-200/80 text-emerald-900"
              : bannerMessage.type === "error"
              ? "bg-rose-50/90 border-rose-200/80 text-rose-900"
              : "bg-blue-50/90 border-blue-200/80 text-blue-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {bannerMessage.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            )}
            {bannerMessage.type === "error" && (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            {bannerMessage.type === "info" && (
              <CalendarClock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            )}
            <span className="text-sm font-semibold">{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-gray-400 hover:text-gray-700 text-xs font-bold uppercase tracking-wider px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. EXECUTIVE LIVE ATTENDANCE & SHIFT CONSOLE */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Live Status & Digital Time */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/80">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                Live Attendance Console
              </span>
              <span className="text-xs text-slate-500 font-semibold px-2.5 py-1 bg-slate-100 rounded-full">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                IST (UTC+5:30)
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                {currentTime || "--:--:--"}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Signed in as <strong className="text-slate-900 font-bold">{userName || userEmail}</strong> ({userRole.replace("_", " ")}). Punch your shift, review counsellor performance & compensation, and approve leaves.
            </p>
          </div>

          {/* Right: Personal Shift Controller Card */}
          <div className="w-full lg:w-auto bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shadow-2xs">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                Your Shift Status
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    todayStatus.isClockedIn
                      ? "bg-emerald-500 animate-ping"
                      : todayStatus.clockOutTime
                      ? "bg-slate-400"
                      : "bg-amber-400"
                  }`}
                />
                <span className="text-sm font-extrabold text-slate-900">
                  {todayStatus.isClockedIn
                    ? `On Duty (In: ${formatTime(todayStatus.clockInTime)})`
                    : todayStatus.clockOutTime
                    ? `Shift Ended (${formatTime(todayStatus.clockOutTime)})`
                    : "Not Clocked In"}
                </span>
              </div>
              {todayStatus.totalHours > 0 && (
                <p className="text-xs font-semibold text-slate-500">
                  Total logged: <span className="text-slate-900 font-bold">{todayStatus.totalHours} hrs</span>
                </p>
              )}
            </div>

            <button
              onClick={handlePunchClock}
              disabled={isPunching}
              className={`tactile-btn-red text-white px-6 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                isPunching ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isPunching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : todayStatus.isClockedIn ? (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Clock Out (End Shift)</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Clock In (Start Shift)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STANDALONE KPI METRIC CARDS (CLEAN & ATTRACTIVE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Present Today */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Staff on Duty
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.presentToday}
            </p>
            <span className="text-xs font-bold text-slate-500">Counsellors</span>
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active on shift right now
          </p>
        </div>

        {/* Card 2: On Leave */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              On Approved Leave
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <CalendarOff className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.onLeaveToday}
            </p>
            <span className="text-xs font-bold text-slate-500">Staff</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 mt-1">
            Scheduled time-off approved
          </p>
        </div>

        {/* Card 3: Avg Shift Hours */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Average Shift
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.avgHoursLogged}
            </p>
            <span className="text-xs font-bold text-slate-500">Hours/day</span>
          </div>
          <p className="text-[11px] font-semibold text-blue-600 mt-1">
            Standard 8.5 hr working cycle
          </p>
        </div>

        {/* Card 4: Team Roster */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Team Roster
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {counsellorsList.length || 2}
            </p>
            <span className="text-xs font-bold text-slate-500">Staff Registered</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 mt-1">
            Aspirant Vision operational staff
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. EXECUTIVE SEGMENTED NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 inline-flex items-center gap-1 shadow-2xs">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "attendance"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <CalendarClock
              className={`w-4 h-4 ${
                activeTab === "attendance" ? "text-red-600" : "text-slate-500"
              }`}
            />
            <span>Daily Attendance &amp; Shift Logs</span>
          </button>

          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "portfolio"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Briefcase
              className={`w-4 h-4 ${
                activeTab === "portfolio" ? "text-red-600" : "text-slate-500"
              }`}
            />
            <span>Counsellor 360° &amp; Salary</span>
          </button>

          <button
            onClick={() => setActiveTab("leaves")}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "leaves"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Calendar
              className={`w-4 h-4 ${
                activeTab === "leaves" ? "text-red-600" : "text-slate-500"
              }`}
            />
            <span>Leave Management &amp; Approvals</span>
            {pendingLeavesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-black animate-pulse">
                {pendingLeavesCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === "leaves" && (
          <button
            onClick={() => setShowApplyModal(true)}
            className="tactile-btn-red text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY ATTENDANCE & SHIFT ROSTER */}
      {/* ========================================================================= */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          {/* Refined Filter Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search counsellor name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white text-slate-800 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Date Filter with "Today" Shortcut */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setDateFilter(new Date().toISOString().split("T")[0])}
                  className="px-2.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Filter Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 bg-white cursor-pointer shadow-2xs min-w-[130px]"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present (On Shift)</option>
                <option value="late">Late Arrival</option>
                <option value="half_day">Half Day</option>
                <option value="on_leave">On Leave</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          {/* Premium Attendance Roster Table */}
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 px-5">Counsellor</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">Clock In (Log In)</th>
                    <th className="py-4 px-4">Clock Out (Log Out)</th>
                    <th className="py-4 px-4">Hours Logged</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400">
                        <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-sm text-slate-700">
                          No attendance records found
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Try adjusting your date or search filters above.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((record) => {
                      const isClockedOut = Boolean(record.clockOutTime);
                      const isPresent = record.status === "present" || record.status === "late";
                      return (
                        <tr
                          key={record.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Counsellor Profile */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                                  {record.counsellorName.charAt(0).toUpperCase()}
                                </div>
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                    !isClockedOut && record.clockInTime
                                      ? "bg-emerald-500 animate-pulse"
                                      : "bg-slate-400"
                                  }`}
                                />
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900 group-hover:text-red-600 transition-colors text-sm">
                                  {record.counsellorName}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  {record.counsellorEmail}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 font-semibold text-slate-700">
                            {formatDate(record.date)}
                          </td>

                          {/* Clock In */}
                          <td className="py-4 px-4 font-mono font-bold text-slate-900">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{formatTime(record.clockInTime)}</span>
                            </div>
                          </td>

                          {/* Clock Out */}
                          <td className="py-4 px-4 font-mono font-bold">
                            {isClockedOut ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-800">
                                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                                <span>{formatTime(record.clockOutTime)}</span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                Active Shift
                              </span>
                            )}
                          </td>

                          {/* Total Hours with mini progress */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <p className="font-extrabold text-slate-900 text-xs">
                                {record.totalHours > 0 ? `${record.totalHours} hrs` : "--"}
                              </p>
                              {record.totalHours > 0 && (
                                <div className="w-16 bg-slate-100 rounded-full h-1 overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-1 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        (record.totalHours / 8.5) * 100,
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide ${
                                record.status === "present"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                                  : record.status === "late"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                                  : record.status === "half_day"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                                  : record.status === "on_leave"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200/80"
                                  : "bg-rose-50 text-rose-700 border border-rose-200/80"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  record.status === "present"
                                    ? "bg-emerald-500"
                                    : record.status === "late"
                                    ? "bg-amber-500"
                                    : record.status === "half_day"
                                    ? "bg-blue-500"
                                    : record.status === "on_leave"
                                    ? "bg-purple-500"
                                    : "bg-rose-500"
                                }`}
                              />
                              {record.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => {
                                setSelectedCounsellorId(record.counsellorId);
                                setActiveTab("portfolio");
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200/80 hover:border-red-200 rounded-xl transition-all shadow-2xs cursor-pointer group-hover:scale-105"
                            >
                              <span>View 360° Profile</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COUNSELLOR 360° PORTFOLIO, PERFORMANCE & SALARY BREAKDOWN */}
      {/* ========================================================================= */}
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          {/* Counsellor Selector Strip */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Inspect Counsellor Portfolio:
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCounsellorId}
                  onChange={(e) => setSelectedCounsellorId(e.target.value)}
                  className="px-4 py-2.5 text-sm font-extrabold border border-slate-200 rounded-2xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-2xs min-w-[280px] cursor-pointer"
                >
                  {counsellorsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName || c.email} ({c.role.replace("_", " ").toUpperCase()})
                    </option>
                  ))}
                </select>
                {isLoadingPortfolio && (
                  <span className="text-xs text-red-600 font-bold flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Loading data...
                  </span>
                )}
              </div>
            </div>

            {isSuperAdmin && portfolio && (
              <button
                onClick={() => setShowSalaryModal(true)}
                className="tactile-btn-red text-white px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Adjust Salary &amp; Incentive Structure</span>
              </button>
            )}
          </div>

          {portfolio ? (
            <div className="space-y-6">
              {/* Profile Card & Key Info */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-2xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
                      {portfolio.counsellor.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                          {portfolio.counsellor.fullName}
                        </h3>
                        <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                          {portfolio.counsellor.role.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500 font-semibold mt-1.5">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {portfolio.counsellor.email}
                        </span>
                        {portfolio.counsellor.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {portfolio.counsellor.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Joined {formatDate(portfolio.counsellor.joinedDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Active Staff Member
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Assigned Leads
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {portfolio.performance.totalAssignedLeads}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    Allocated student inquiries
                  </p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Admitted Conversions
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
                      <BadgeCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {portfolio.performance.convertedLeads}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    Confirmed student seats locked
                  </p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Conversion Rate
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-100">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {portfolio.performance.conversionRate}%
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(portfolio.performance.conversionRate, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Completed Calls
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {portfolio.performance.completedFollowUps}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    Follow-ups conducted
                  </p>
                </div>
              </div>

              {/* Clean Executive Compensation & Salary Matrix Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-2xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600">
                      Staff Compensation Matrix
                    </span>
                    <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">
                      Salary &amp; Incentives Breakdown for {portfolio.counsellor.fullName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Payroll Cycle: {portfolio.salary.payFrequency || "Monthly"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                        portfolio.salary.paymentStatus === "disbursed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : portfolio.salary.paymentStatus === "approved"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      Status: {portfolio.salary.paymentStatus}
                    </span>
                    {isSuperAdmin && (
                      <button
                        onClick={() => setShowSalaryModal(true)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase">Base Salary</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      ₹{portfolio.salary.baseSalary.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Fixed monthly base
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase">Incentive Rate</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">
                      {portfolio.salary.incentiveRate}%
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Per admitted lead
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase">Conversions Bonus</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">
                      +₹{portfolio.salary.conversionsBonus.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Performance reward
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase">Deductions</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">
                      -₹{portfolio.salary.deductions.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
                      TDS / Unpaid leaves
                    </p>
                  </div>

                  <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-2xl p-4 shadow-sm">
                    <p className="text-xs font-extrabold text-red-200 uppercase">Net Payable</p>
                    <p className="text-2xl font-black text-white mt-1">
                      ₹{portfolio.salary.netPayable.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-red-100 font-bold mt-0.5">
                      Total disbursement amount
                    </p>
                  </div>
                </div>
              </div>

              {/* Monthly Attendance & Leave Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attendance Summary */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs">
                  <h4 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-600" />
                    Monthly Attendance Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Days Present</p>
                      <p className="text-2xl font-black text-emerald-600 mt-1">
                        {portfolio.attendanceSummary.presentDays}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Late Days</p>
                      <p className="text-2xl font-black text-amber-600 mt-1">
                        {portfolio.attendanceSummary.lateDays}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Leaves Taken</p>
                      <p className="text-2xl font-black text-purple-600 mt-1">
                        {portfolio.attendanceSummary.leavesTaken}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4 font-semibold">
                    Total Hours Logged this cycle:{" "}
                    <strong className="text-slate-900">
                      {portfolio.attendanceSummary.totalHoursWorked} hrs
                    </strong>
                  </p>
                </div>

                {/* Counsellor Leave Overview */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-600" />
                      Leave History ({portfolio.leaves.length})
                    </h4>
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      + Request Leave
                    </button>
                  </div>
                  {portfolio.leaves.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center font-semibold">
                      No leave history recorded for this period.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {portfolio.leaves.slice(0, 3).map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 capitalize">
                              {l.leaveType} Leave
                            </span>
                            <span className="text-slate-500 ml-2 font-medium">
                              ({l.daysCount} days)
                            </span>
                            <p className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">
                              {l.reason}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              l.status === "accepted"
                                ? "bg-emerald-100 text-emerald-800"
                                : l.status === "rejected"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {l.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl font-semibold">
              Select a counsellor from the menu above to inspect their profile, salary, and performance metrics.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEAVE APPROVALS & REQUESTS WORKSPACE */}
      {/* ========================================================================= */}
      {activeTab === "leaves" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Filter Leaves:
              </span>
              <select
                value={leaveStatusFilter}
                onChange={(e) => setLeaveStatusFilter(e.target.value)}
                className="px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Leaves</option>
                <option value="pending">Pending Approvals</option>
                <option value="accepted">Accepted / Approved</option>
                <option value="rejected">Rejected / Declined</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              Pending Action: <strong className="text-red-600">{pendingLeavesCount}</strong> requests
            </div>
          </div>

          {/* Leaves Table */}
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 px-5">Counsellor</th>
                    <th className="py-4 px-4">Type</th>
                    <th className="py-4 px-4">Duration</th>
                    <th className="py-4 px-4">Days</th>
                    <th className="py-4 px-4">Reason</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Review Notes</th>
                    {isSuperAdmin && (
                      <th className="py-4 px-5 text-right">Super Admin Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isSuperAdmin ? 8 : 7}
                        className="py-16 text-center text-slate-400"
                      >
                        <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-sm text-slate-700">
                          No leave requests match this filter
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <tr
                        key={leave.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-4 px-5">
                          <p className="font-extrabold text-slate-900 text-sm">
                            {leave.counsellorName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {leave.counsellorEmail}
                          </p>
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-800 capitalize">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-bold text-xs">
                            {leave.leaveType}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-700 whitespace-nowrap font-medium">
                          {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                        </td>

                        <td className="py-4 px-4 font-extrabold text-slate-900">
                          {leave.daysCount} {leave.daysCount > 1 ? "Days" : "Day"}
                        </td>

                        <td className="py-4 px-4 text-slate-600 max-w-xs font-medium">
                          <p className="truncate" title={leave.reason}>
                            {leave.reason}
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              leave.status === "accepted"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : leave.status === "rejected"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {leave.status === "accepted" && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {leave.status === "rejected" && <XCircle className="w-3.5 h-3.5" />}
                            {leave.status === "pending" && <Clock className="w-3.5 h-3.5" />}
                            {leave.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-500 text-xs font-medium">
                          {leave.reviewNotes ? (
                            <span className="text-slate-800 font-semibold">{leave.reviewNotes}</span>
                          ) : leave.reviewedByName ? (
                            <span>Reviewed by {leave.reviewedByName}</span>
                          ) : (
                            <span className="text-slate-400">Awaiting Super Admin review</span>
                          )}
                        </td>

                        {isSuperAdmin && (
                          <td className="py-4 px-5 text-right">
                            {leave.status === "pending" ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    setReviewNotePrompt({
                                      leaveId: leave.id,
                                      action: "accepted",
                                      counsellorName: leave.counsellorName,
                                    })
                                  }
                                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
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
                                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer"
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-semibold">
                                Processed
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: APPLY FOR LEAVE */}
      {/* ========================================================================= */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                Apply for Leave
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })
                  }
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                >
                  <option value="casual">Casual Leave (Personal / Family)</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="paid">Earned Paid Leave</option>
                  <option value="emergency">Emergency Urgent Leave</option>
                  <option value="unpaid">Leave Without Pay (LWP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Reason for Leave
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the reason for leave so Super Admin can review..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none resize-none font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="tactile-btn-red text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-70"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-black text-slate-900 text-lg">
              {reviewNotePrompt.action === "accepted"
                ? "Accept Leave Request"
                : "Reject Leave Request"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              For counsellor: <strong>{reviewNotePrompt.counsellorName}</strong>. They will receive an instant notification update.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Admin Note / Remarks (Optional)
              </label>
              <textarea
                rows={3}
                placeholder={
                  reviewNotePrompt.action === "accepted"
                    ? "e.g. Approved. Ensure pending student follow-ups are handed over."
                    : "e.g. Declined due to high admissions counseling schedule."
                }
                value={reviewNoteText}
                onChange={(e) => setReviewNoteText(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none resize-none font-medium text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewNotePrompt(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewLeave}
                disabled={isProcessingReview}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer disabled:opacity-70 ${
                  reviewNotePrompt.action === "accepted"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isProcessingReview
                  ? "Processing..."
                  : reviewNotePrompt.action === "accepted"
                  ? "Confirm Approval"
                  : "Confirm Decline"}
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  Adjust Compensation &amp; Incentives
                </h3>
                <p className="text-xs text-slate-500">
                  Target Counsellor: <strong>{portfolio.counsellor.fullName}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowSalaryModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Deductions (₹ TDS / LWP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={salaryForm.deductions}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, deductions: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Payment Status</label>
                  <select
                    value={salaryForm.paymentStatus}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, paymentStatus: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="disbursed">Disbursed (Paid Out)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Pay Frequency</label>
                  <input
                    type="text"
                    value={salaryForm.payFrequency}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, payFrequency: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-red-700 uppercase">
                    Calculated Net Payable
                  </p>
                  <p className="text-xl font-black text-red-950">
                    ₹
                    {(
                      salaryForm.baseSalary +
                      (salaryForm.conversionsBonus || 0) -
                      (salaryForm.deductions || 0)
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="text-xs text-red-600 font-bold bg-white px-3 py-1 rounded-full border border-red-200 shadow-2xs">
                  Immediate DB sync
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSalaryModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSalary}
                  className="tactile-btn-red text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-70"
                >
                  {isSavingSalary ? "Saving..." : "Save Salary Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
