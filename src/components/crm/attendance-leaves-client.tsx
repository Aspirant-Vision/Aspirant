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

  // Live Digital Clock
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
              ? "Successfully Clocked In for today!"
              : "Successfully Clocked Out. Day summary updated!";

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

  // Format Time Helper
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
                reviewNotes: reviewNoteText.trim() || (action === "accepted" ? "Approved by Admin" : "Declined by Admin"),
              }
            : l
        )
      );

      const res = await reviewLeaveRequestAction(leaveId, action, reviewNoteText.trim());

      if (res.success) {
        setBannerMessage({
          type: "success",
          text: `Leave request for ${reviewNotePrompt.counsellorName} has been ${action === "accepted" ? "Approved" : "Declined"}! Real-time notification dispatched.`,
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
        // Refresh portfolio view
        const pRes = await getCounsellorDetailPortfolioAction(selectedCounsellorId);
        if (pRes.success) {
          setPortfolio(pRes.data);
        }
        setShowSalaryModal(false);
        setBannerMessage({
          type: "success",
          text: `Salary details updated successfully for ${portfolio?.counsellor.fullName || "counsellor"}!`,
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

  return (
    <div className="space-y-6 pb-16">
      {/* Dynamic Banner Alert */}
      {bannerMessage && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 shadow-sm ${
            bannerMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : bannerMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {bannerMessage.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {bannerMessage.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
            {bannerMessage.type === "info" && <CalendarClock className="w-5 h-5 text-blue-600 flex-shrink-0" />}
            <span className="text-sm font-semibold">{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-gray-400 hover:text-gray-700 text-xs font-bold uppercase tracking-wider px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner: Daily Clock In/Out Live Punch Panel */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                Live Attendance Console
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-baseline gap-4">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight font-mono">
                {currentTime || "--:--:--"}
              </h2>
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                IST (UTC+5:30)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600">
              Welcome back, <strong className="text-gray-900">{userName || userEmail}</strong>! Track daily shift login/logout, review counsellor performance & compensation, and process leave requests.
            </p>
          </div>

          {/* Quick Punch Action & Shift Indicator */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-between sm:justify-start gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Your Daily Status</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      todayStatus.isClockedIn ? "bg-emerald-500 animate-ping" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-xs font-bold text-gray-800">
                    {todayStatus.isClockedIn
                      ? `Clocked In (${formatTime(todayStatus.clockInTime)})`
                      : todayStatus.clockOutTime
                      ? `Shift Ended (${formatTime(todayStatus.clockOutTime)})`
                      : "Not Clocked In"}
                  </span>
                </div>
              </div>
              {todayStatus.totalHours > 0 && (
                <div className="border-l pl-3 border-gray-200">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Hours Today</p>
                  <p className="text-xs font-extrabold text-gray-900">{todayStatus.totalHours} hrs</p>
                </div>
              )}
            </div>

            <button
              onClick={handlePunchClock}
              disabled={isPunching}
              className={`tactile-btn-red text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${
                isPunching ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <Clock className={`w-4 h-4 ${isPunching ? "animate-spin" : ""}`} />
              {isPunching
                ? "Recording..."
                : todayStatus.isClockedIn
                ? "Clock Out (End Shift)"
                : "Clock In (Start Shift)"}
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase">Present Today</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">{stats.presentToday} Staff</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">● On duty active</p>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase">On Leave</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">{stats.onLeaveToday} Staff</p>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">● Approved absences</p>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase">Avg Shift Hours</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">{stats.avgHoursLogged} hrs</p>
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5">● Standard 8.5 hr shift</p>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase">Total Counsellors</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">{counsellorsList.length || 1} Registered</p>
            <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Aspirant Vision team</p>
          </div>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "attendance"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          Daily Attendance & Logs
        </button>

        <button
          onClick={() => setActiveTab("portfolio")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "portfolio"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Counsellor 360° & Salary
        </button>

        <button
          onClick={() => setActiveTab("leaves")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "leaves"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Leave Approvals & Requests
          {leaveRecords.filter((l) => l.status === "pending").length > 0 && (
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-red-100 text-red-700 font-extrabold">
              {leaveRecords.filter((l) => l.status === "pending").length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY ATTENDANCE & PUNCH LOGS */}
      {/* ========================================================================= */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          {/* Filters & Search Header */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search counsellor name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Date:</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-gray-700"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <label className="text-xs font-semibold text-gray-500">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-gray-700 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="late">Late Arrival</option>
                <option value="half_day">Half Day</option>
                <option value="on_leave">On Leave</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          {/* Attendance Daily Logs Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Counsellor</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Clock In (Log In)</th>
                    <th className="py-3 px-4">Clock Out (Log Out)</th>
                    <th className="py-3 px-4">Total Hours</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No attendance records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((record) => {
                      const isClockedOut = Boolean(record.clockOutTime);
                      return (
                        <tr key={record.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">
                                {record.counsellorName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{record.counsellorName}</p>
                                <p className="text-[11px] text-gray-500">{record.counsellorEmail}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-medium text-gray-700">
                            {formatDate(record.date)}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                            {formatTime(record.clockInTime)}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold">
                            {isClockedOut ? (
                              <span className="text-gray-900">{formatTime(record.clockOutTime)}</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                On Shift
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-gray-800">
                            {record.totalHours > 0 ? `${record.totalHours} hrs` : "--"}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                record.status === "present"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : record.status === "late"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : record.status === "half_day"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : record.status === "on_leave"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {record.status.replace("_", " ")}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedCounsellorId(record.counsellorId);
                                setActiveTab("portfolio");
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              View Details & Salary
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
      {/* TAB 2: COUNSELLOR 360° PORTFOLIO, PERFORMANCE & SALARY */}
      {/* ========================================================================= */}
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          {/* Counsellor Selector Strip */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Select Counsellor to Inspect:
              </label>
              <div className="flex items-center gap-2 mt-1.5">
                <select
                  value={selectedCounsellorId}
                  onChange={(e) => setSelectedCounsellorId(e.target.value)}
                  className="px-4 py-2 text-sm font-bold border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs min-w-[260px]"
                >
                  {counsellorsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName || c.email} ({c.role})
                    </option>
                  ))}
                </select>
                {isLoadingPortfolio && (
                  <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading...
                  </span>
                )}
              </div>
            </div>

            {isSuperAdmin && portfolio && (
              <button
                onClick={() => setShowSalaryModal(true)}
                className="tactile-btn-red text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                Adjust Salary & Incentive Structure
              </button>
            )}
          </div>

          {portfolio ? (
            <div className="space-y-6">
              {/* Profile Card & Key Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                      {portfolio.counsellor.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-gray-900">
                          {portfolio.counsellor.fullName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-800">
                          {portfolio.counsellor.role}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {portfolio.counsellor.email}
                        </span>
                        {portfolio.counsellor.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {portfolio.counsellor.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          Joined {formatDate(portfolio.counsellor.joinedDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Status:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Active Staff
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Assigned Leads</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {portfolio.performance.totalAssignedLeads}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">Students assigned for admissions</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Admitted Conversions</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <BadgeCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {portfolio.performance.convertedLeads}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Confirmed student seats</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Conversion Rate</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {portfolio.performance.conversionRate}%
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(portfolio.performance.conversionRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Completed Calls</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {portfolio.performance.completedFollowUps}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">Logged student interactions</p>
                </div>
              </div>

              {/* Salary & Compensation Matrix Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 sm:p-7 shadow-lg">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-700/80 pb-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                      Compensation & Incentives
                    </span>
                    <h4 className="text-xl font-extrabold mt-0.5">
                      Salary Breakdown for {portfolio.counsellor.fullName}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Payment Frequency: {portfolio.salary.payFrequency || "Monthly"} Cycle
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        portfolio.salary.paymentStatus === "disbursed"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : portfolio.salary.paymentStatus === "approved"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      Payment: {portfolio.salary.paymentStatus}
                    </span>
                    {isSuperAdmin && (
                      <button
                        onClick={() => setShowSalaryModal(true)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Base Salary</p>
                    <p className="text-2xl font-black text-white mt-1">
                      ₹{portfolio.salary.baseSalary.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Fixed Monthly</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Incentive Rate</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">
                      {portfolio.salary.incentiveRate}%
                    </p>
                    <p className="text-[10px] text-emerald-400/80 mt-0.5">Per converted seat</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Conversion Bonus</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">
                      +₹{portfolio.salary.conversionsBonus.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-emerald-400/80 mt-0.5">Performance accrued</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Deductions</p>
                    <p className="text-2xl font-black text-rose-400 mt-1">
                      -₹{portfolio.salary.deductions.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-rose-400/80 mt-0.5">TDS / Leave without pay</p>
                  </div>

                  <div className="col-span-2 md:col-span-1 bg-red-600/30 rounded-xl p-4 border border-red-500/40">
                    <p className="text-xs font-bold text-red-300 uppercase">Net Payable</p>
                    <p className="text-2xl font-black text-white mt-1">
                      ₹{portfolio.salary.netPayable.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-red-300 font-semibold mt-0.5">Total payout amount</p>
                  </div>
                </div>
              </div>

              {/* Attendance & Leave Summary for Selected Counsellor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attendance Summary */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
                  <h4 className="font-extrabold text-gray-900 text-sm mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-600" />
                    Monthly Attendance Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <p className="text-[11px] font-bold text-gray-500 uppercase">Present Days</p>
                      <p className="text-xl font-extrabold text-emerald-600 mt-1">
                        {portfolio.attendanceSummary.presentDays}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <p className="text-[11px] font-bold text-gray-500 uppercase">Late Days</p>
                      <p className="text-xl font-extrabold text-amber-600 mt-1">
                        {portfolio.attendanceSummary.lateDays}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <p className="text-[11px] font-bold text-gray-500 uppercase">Leaves Taken</p>
                      <p className="text-xl font-extrabold text-purple-600 mt-1">
                        {portfolio.attendanceSummary.leavesTaken}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Total Hours Logged this cycle: <strong>{portfolio.attendanceSummary.totalHoursWorked} hrs</strong>
                  </p>
                </div>

                {/* Counsellor Leave Overview */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-600" />
                      Leave History ({portfolio.leaves.length})
                    </h4>
                    <button
                      onClick={() => {
                        setShowApplyModal(true);
                      }}
                      className="text-xs font-bold text-red-600 hover:text-red-700"
                    >
                      + Request Leave
                    </button>
                  </div>
                  {portfolio.leaves.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">No leaves taken this period.</p>
                  ) : (
                    <div className="space-y-2">
                      {portfolio.leaves.slice(0, 3).map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs"
                        >
                          <div>
                            <span className="font-bold text-gray-800 capitalize">{l.leaveType} Leave</span>
                            <span className="text-gray-500 ml-2">({l.daysCount} days)</span>
                            <p className="text-[11px] text-gray-500 truncate max-w-[200px]">{l.reason}</p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
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
            <div className="p-12 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl">
              Select a counsellor above to inspect their profile, salary, and performance metrics.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEAVE MANAGEMENT & APPROVAL FLOW */}
      {/* ========================================================================= */}
      {activeTab === "leaves" && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Filter Status:</label>
              <select
                value={leaveStatusFilter}
                onChange={(e) => setLeaveStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="all">All Leaves</option>
                <option value="pending">Pending Approvals</option>
                <option value="accepted">Accepted / Approved</option>
                <option value="rejected">Rejected / Declined</option>
              </select>
            </div>

            <button
              onClick={() => setShowApplyModal(true)}
              className="tactile-btn-red text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Apply for Leave
            </button>
          </div>

          {/* Leaves Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Counsellor</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Days</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Review Notes</th>
                    {isSuperAdmin && <th className="py-3 px-4 text-right">Super Admin Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={isSuperAdmin ? 8 : 7} className="py-12 text-center text-gray-400">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No leave applications match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-900">{leave.counsellorName}</p>
                          <p className="text-[11px] text-gray-500">{leave.counsellorEmail}</p>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-gray-800 capitalize">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200">
                            {leave.leaveType}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">
                          {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          {leave.daysCount} {leave.daysCount > 1 ? "Days" : "Day"}
                        </td>

                        <td className="py-3.5 px-4 text-gray-600 max-w-xs">
                          <p className="truncate" title={leave.reason}>
                            {leave.reason}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
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

                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {leave.reviewNotes ? (
                            <span>{leave.reviewNotes}</span>
                          ) : leave.reviewedByName ? (
                            <span>Reviewed by {leave.reviewedByName}</span>
                          ) : (
                            <span className="text-gray-400">Awaiting Super Admin</span>
                          )}
                        </td>

                        {isSuperAdmin && (
                          <td className="py-3.5 px-4 text-right">
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
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
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
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-2xs"
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-400 font-semibold">Processed</span>
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                Apply for Leave
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                >
                  <option value="casual">Casual Leave (Personal / Travel)</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="paid">Earned Paid Leave</option>
                  <option value="emergency">Emergency Urgent Leave</option>
                  <option value="unpaid">Leave Without Pay (LWP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Leave</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the reason for leave so Super Admin can review..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="tactile-btn-red text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  {isSubmittingLeave ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUPER ADMIN ACCEPT / REJECT LEAVE NOTE PROMPT */}
      {/* ========================================================================= */}
      {reviewNotePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-gray-900 text-lg">
              {reviewNotePrompt.action === "accepted" ? "Accept Leave Request" : "Reject Leave Request"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              For counsellor: <strong>{reviewNotePrompt.counsellorName}</strong>. The counsellor will receive an instant notification update.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admin Note / Remarks (Optional)
              </label>
              <textarea
                rows={3}
                placeholder={
                  reviewNotePrompt.action === "accepted"
                    ? "e.g. Approved. Ensure active leads are handed over."
                    : "e.g. Declined due to high volume student admissions week."
                }
                value={reviewNoteText}
                onChange={(e) => setReviewNoteText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReviewNotePrompt(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewLeave}
                disabled={isProcessingReview}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm ${
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
      {/* MODAL 3: ADJUST SALARY & COMPENSATION (SUPER ADMIN ONLY) */}
      {/* ========================================================================= */}
      {showSalaryModal && portfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  Adjust Compensation & Incentives
                </h3>
                <p className="text-xs text-gray-500">
                  Target Counsellor: <strong>{portfolio.counsellor.fullName}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowSalaryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
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

              <div className="grid grid-cols-2 gap-3">
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
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={salaryForm.paymentStatus}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, paymentStatus: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="disbursed">Disbursed (Paid Out)</option>
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
                  <p className="text-[11px] font-bold text-red-700 uppercase">Calculated Net Payable</p>
                  <p className="text-lg font-black text-red-900">
                    ₹
                    {(
                      salaryForm.baseSalary +
                      (salaryForm.conversionsBonus || 0) -
                      (salaryForm.deductions || 0)
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="text-[10px] text-red-600 font-semibold">Immediate save to DB</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSalaryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSalary}
                  className="tactile-btn-red text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
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
