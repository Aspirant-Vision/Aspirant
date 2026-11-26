"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { NotificationItem } from "@/lib/notifications/types";
import { Bell, CheckCircle2, Clock, ExternalLink, X, AlertTriangle, FileText, UserCheck } from "lucide-react";

interface RealtimeToastBannerProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
}

export function RealtimeToastBanner({
  notification,
  onDismiss,
}: RealtimeToastBannerProps) {
  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const getCategoryIcon = () => {
    switch (notification.category) {
      case "lead":
        return <UserCheck className="w-4 h-4 text-amber-600" />;
      case "application":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "follow_up":
        return <Clock className="w-4 h-4 text-purple-600" />;
      case "student":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200/90 p-4 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center shrink-0 shadow-xs">
          {getCategoryIcon()}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {notification.category} alert
            </span>
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-700 transition-colors p-0.5 rounded-md"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{notification.title}</h4>
          <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>

          {notification.destination_url && (
            <div className="pt-1.5">
              <Link
                href={notification.destination_url}
                onClick={onDismiss}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
              >
                <span>View Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
