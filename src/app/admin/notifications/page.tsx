import React from "react";
import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { NotificationService } from "@/lib/notifications/service";
import { AdminNotificationsClientView } from "@/components/crm/admin-notifications-client-view";

export default async function AdminNotificationsPage() {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  const res = await NotificationService.getNotifications(user.id, { pageSize: 50 });
  const notifications = (res.success && res.data ? res.data.notifications : []) || [];
  const unreadCount = (res.success && res.data ? res.data.unreadCount : 0) || 0;

  return (
    <AdminNotificationsClientView
      userId={user.id}
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
      isSuperAdmin={profile.role === "super_admin"}
    />
  );
}
