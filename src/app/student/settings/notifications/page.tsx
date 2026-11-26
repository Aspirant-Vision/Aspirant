import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { NotificationService } from "@/lib/notifications/service";
import { NotificationPreferencesView } from "@/components/student/notification-preferences-view";

export default async function StudentNotificationSettingsPage() {
  const user = await requireAuth("/login");
  const res = await NotificationService.getPreferences(user.id);
  const preferences = (res.success && res.data ? res.data : []) || [];

  return (
    <NotificationPreferencesView
      initialPreferences={preferences}
      backUrl="/student/notifications"
    />
  );
}
