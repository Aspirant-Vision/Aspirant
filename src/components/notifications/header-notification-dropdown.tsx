"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { RealtimeToastBanner } from "./realtime-toast-banner";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  FileText,
  UserCheck,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { NotificationItem } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

interface HeaderNotificationDropdownProps {
  userId: string;
  historyUrl: string;
  initialUnreadCount?: number;
  initialNotifications?: NotificationItem[];
}

export function HeaderNotificationDropdown({
  userId,
  historyUrl,
  initialUnreadCount = 0,
  initialNotifications = [],
}: HeaderNotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    toastNotification,
    markAsRead,
    markAllAsRead,
    dismissToast,
  } = useNotifications({
    userId,
    initialUnreadCount,
    initialNotifications,
    pageSize: 8,
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.is_read) {
      await markAsRead(n.id);
    }
    if (n.destination_url) {
      setIsOpen(false);
      router.push(n.destination_url);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "lead":
        return <UserCheck className="w-3.5 h-3.5 text-amber-600" />;
      case "application":
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case "follow_up":
        return <Clock className="w-3.5 h-3.5 text-purple-600" />;
      case "student":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-red-600" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSecs < 60) return "just now";
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
          aria-label="View notifications"
          aria-expanded={isOpen}
        >
          <Bell
            className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 transition-transform",
              unreadCount > 0 && "animate-bell-ring text-[#E31E2B]"
            )}
          />

          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white shadow-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-gray-200 shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-200">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-red-700 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification Item List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 py-1">
              {isLoading && notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-xs">Loading alerts...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-1">
                  <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-300 mx-auto flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">No new notifications</p>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                    You're all caught up! Realtime status updates and scheduled follow-ups will appear here.
                  </p>
                </div>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                      n.is_read
                        ? "bg-white hover:bg-gray-50"
                        : "bg-red-50/30 hover:bg-red-50/60 font-medium"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5 border border-gray-200/60">
                      {getCategoryIcon(n.category)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs truncate ${
                            n.is_read ? "font-semibold text-gray-800" : "font-bold text-gray-900"
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatRelativeTime(n.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-[11px] line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer View All Link */}
            <div className="p-2 border-t border-gray-100 bg-gray-50/50 text-center">
              <Link
                href={historyUrl}
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-gray-700 hover:text-primary transition-colors inline-flex items-center gap-1.5 py-1"
              >
                <span>View all notifications</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Floating Realtime Toast Banner */}
      <RealtimeToastBanner notification={toastNotification} onDismiss={dismissToast} />
    </>
  );
}
