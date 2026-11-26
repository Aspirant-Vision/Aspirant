import React from "react";
import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { NotificationService } from "@/lib/notifications/service";
import { AdminNotificationsClientView } from "@/components/crm/admin-notifications-client-view";
import { NotificationItem } from "@/lib/notifications/types";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  let notifications: NotificationItem[] = [];
  let unreadCount = 0;

  try {
    const res = await NotificationService.getNotifications(user.id, { pageSize: 50 });
    if (res.success && res.data) {
      notifications = res.data.notifications || [];
      unreadCount = res.data.unreadCount || 0;
    }
  } catch (err) {
    console.error("[AdminNotificationsPage] Exception fetching notifications:", err);
  }

  return (
    <AdminNotificationsClientView
      userId={user.id}
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
      isSuperAdmin={profile.role === "super_admin"}
    />
  );
}
