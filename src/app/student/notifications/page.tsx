import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { getStudentNotificationsAction } from "@/lib/student/actions";
import { NotificationsClientView } from "@/components/student/notifications-client-view";

export default async function StudentNotificationsPage() {
  const user = await requireAuth();
  const res = await getStudentNotificationsAction();
  const notifications = (res.success && res.data ? res.data : []) || [];

  return (
    <NotificationsClientView
      userId={user.id}
      initialNotifications={notifications}
    />
  );
}
