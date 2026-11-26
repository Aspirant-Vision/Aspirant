import React from "react";
import { requireAuth, getUserRoles } from "@/lib/auth/session";
import { isSuperAdmin, isCounsellor } from "@/lib/auth/roles";
import { UserRole } from "@/types/auth.types";
import {
  getSuperAdminDashboardData,
  getAdminDashboardData,
  getCounsellorDashboardData,
} from "@/lib/crm/dashboard-metrics";
import { SuperAdminDashboard } from "@/components/crm/super-admin-dashboard";
import { AdminDashboard } from "@/components/crm/admin-dashboard";
import { CounsellorDashboard } from "@/components/crm/counsellor-dashboard";

export default async function AdminDashboardPage() {
  const profile = await requireAuth("/admin/login");
  const roles = await getUserRoles(profile.id);
  const primaryRole: UserRole = profile.role || roles[0] || "student";
  const displayName = profile.fullName || profile.email.split("@")[0] || "Staff";

  if (isSuperAdmin(primaryRole)) {
    const data = await getSuperAdminDashboardData();
    return <SuperAdminDashboard data={data} displayName={displayName} />;
  }

  if (isCounsellor(primaryRole)) {
    const data = await getCounsellorDashboardData(profile.id);
    return <CounsellorDashboard data={data} displayName={displayName} />;
  }

  // Default to Admin Dashboard
  const data = await getAdminDashboardData();
  return <AdminDashboard data={data} displayName={displayName} />;
}
