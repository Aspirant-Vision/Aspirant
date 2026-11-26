"use client";

import React from "react";
import { HeaderNotificationDropdown } from "@/components/notifications/header-notification-dropdown";

interface NotificationBellProps {
  userId?: string;
  initialUnreadCount?: number;
}

export function NotificationBell({
  userId = "",
  initialUnreadCount = 0,
}: NotificationBellProps) {
  return (
    <HeaderNotificationDropdown
      userId={userId}
      historyUrl="/admin/notifications"
      initialUnreadCount={initialUnreadCount}
    />
  );
}
