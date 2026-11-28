import React from "react";
import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/crm/page-header";
import { AttendanceLeavesClient } from "@/components/crm/attendance-leaves-client";
import {
  getAttendanceOverviewAction,
  getLeaveRequestsAction,
  getCounsellorDetailPortfolioAction,
} from "@/lib/attendance/actions";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  const admin = createAdminClient();

  // 1. Fetch staff profiles (counsellor, admin, super_admin)
  const { data: staffList } = await admin
    .from("profiles")
    .select("id, full_name, email, phone, role, avatar_url")
    .in("role", ["counsellor", "admin", "super_admin"])
    .order("created_at", { ascending: false });

  const counsellorsList = (staffList || []).map((s) => ({
    id: s.id,
    fullName: s.full_name || s.email,
    email: s.email,
    phone: s.phone,
    role: s.role,
    avatarUrl: s.avatar_url,
  }));

  // 2. Fetch attendance overview
  const attendanceRes = await getAttendanceOverviewAction();
  const initialAttendance = attendanceRes.success && attendanceRes.data ? attendanceRes.data.records : [];
  const initialStats = attendanceRes.success && attendanceRes.data
    ? attendanceRes.data.stats
    : { presentToday: 1, onLeaveToday: 0, avgHoursLogged: 8.5, activeStaffCount: counsellorsList.length || 1 };
  const initialTodayStatus = attendanceRes.success && attendanceRes.data
    ? attendanceRes.data.todayStatus
    : { isClockedIn: false, clockInTime: null, clockOutTime: null, totalHours: 0, status: "Not Clocked In" };

  // 3. Fetch leaves
  const leavesRes = await getLeaveRequestsAction();
  const initialLeaves = leavesRes.success && leavesRes.data ? leavesRes.data : [];

  // 4. Fetch initial portfolio for the first counsellor or current user
  const initialTargetCounsellorId =
    counsellorsList.find((c) => c.role === "counsellor")?.id || user.id;

  const portfolioRes = await getCounsellorDetailPortfolioAction(initialTargetCounsellorId);
  const initialPortfolio = portfolioRes.success ? portfolioRes.data : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        breadcrumbs={[
          { label: "Management", href: "/admin" },
          { label: "Attendance & Leaves" },
        ]}
        title="Attendance & Leaves"
        description="Daily staff shift logs, counsellor performance & salary portfolio, and leave approvals."
      />

      <AttendanceLeavesClient
        currentUserId={user.id}
        userRole={profile.role}
        userName={profile.fullName || profile.email}
        userEmail={profile.email}
        initialAttendance={initialAttendance}
        initialStats={initialStats}
        initialTodayStatus={initialTodayStatus}
        initialLeaves={initialLeaves}
        counsellorsList={counsellorsList}
        initialPortfolio={initialPortfolio}
      />
    </div>
  );
}
