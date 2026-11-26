import React from "react";
import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { NotificationService } from "@/lib/notifications/service";
import { NotificationPreferencesView } from "@/components/student/notification-preferences-view";

export default async function AdminNotificationSettingsPage() {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  const res = await NotificationService.getPreferences(user.id);
  const preferences = (res.success && res.data ? res.data : []) || [];

  return (
    <NotificationPreferencesView
      initialPreferences={preferences}
      backUrl="/admin/notifications"
    />
  );
}
