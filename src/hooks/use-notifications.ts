"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { NotificationItem, NotificationCategory } from "@/lib/notifications/types";
import {
  getNotificationsAction,
  getUnreadNotificationsCountAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/notifications/actions";

interface UseNotificationsOptions {
  userId?: string | null;
  initialNotifications?: NotificationItem[];
  initialUnreadCount?: number;
  category?: NotificationCategory;
  pageSize?: number;
}

export function useNotifications({
  userId,
  initialNotifications = [],
  initialUnreadCount = 0,
  category,
  pageSize = 20,
}: UseNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<NotificationItem | null>(null);

  const supabase = createClient();
  const activeUserIdRef = useRef<string | null>(userId || null);

  useEffect(() => {
    activeUserIdRef.current = userId || null;
  }, [userId]);

  // Fetch or refresh notifications from database
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        getNotificationsAction({ category, pageSize }),
        getUnreadNotificationsCountAction(),
      ]);

      if (listRes.success) {
        setNotifications(listRes.data.notifications);
      }
      if (countRes.success) {
        setUnreadCount(countRes.data);
      }
    } catch (err) {
      console.error("[useNotifications] refresh error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [category, pageSize]);

  // Handle Mark as Read
  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markNotificationReadAction(notificationId);
    } catch (err) {
      console.error("[useNotifications] markAsRead error:", err);
      refresh();
    }
  }, [refresh]);

  // Handle Mark All as Read
  const markAllAsRead = useCallback(async (targetCategory?: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) =>
        !targetCategory || n.category === targetCategory ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsReadAction(targetCategory);
    } catch (err) {
      console.error("[useNotifications] markAllAsRead error:", err);
      refresh();
    }
  }, [refresh]);

  // Clear active toast notification
  const dismissToast = useCallback(() => {
    setToastNotification(null);
  }, []);

  // Supabase Realtime Subscription setup
  useEffect(() => {
    if (!userId) {
      return;
    }

    // Set up channel with user-specific isolation
    const channelName = `notifications:user:${userId}`;
    let channel: any = null;

    try {
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${userId}`,
          },
          (payload) => {
            const newNotification = payload.new as NotificationItem;
            if (!newNotification || !newNotification.id) return;

            // Check if matches category filter if specified
            if (category && newNotification.category !== category) {
              return;
            }

            // Deduplicate and append to top of list
            setNotifications((prev) => {
              const safePrev = Array.isArray(prev) ? prev : [];
              const exists = safePrev.some((n) => n.id === newNotification.id);
              if (exists) return safePrev;
              return [newNotification, ...safePrev];
            });

            if (!newNotification.is_read) {
              setUnreadCount((prev) => prev + 1);
            }

            // Trigger realtime toast notification banner
            setToastNotification(newNotification);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${userId}`,
          },
          (payload) => {
            const updated = payload.new as NotificationItem;
            if (!updated || !updated.id) return;

            setNotifications((prev) => {
              const safePrev = Array.isArray(prev) ? prev : [];
              return safePrev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n));
            });

            // Update unread count
            setNotifications((latest) => {
              const safeLatest = Array.isArray(latest) ? latest : [];
              const count = safeLatest.filter((n) => !n.is_read).length;
              setUnreadCount(count);
              return safeLatest;
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${userId}`,
          },
          (payload) => {
            const deleted = payload.old as { id: string };
            if (!deleted || !deleted.id) return;

            setNotifications((prev) => {
              const safePrev = Array.isArray(prev) ? prev : [];
              return safePrev.filter((n) => n.id !== deleted.id);
            });
          }
        )
        .subscribe((status) => {
          setIsConnected(status === "SUBSCRIBED");
        });
    } catch (err) {
      console.warn("[useNotifications] Realtime subscribe error:", err);
    }

    // Reconnection & window focus handler for resilience
    const handleFocus = () => {
      refresh();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.warn("[useNotifications] removeChannel error:", e);
        }
      }
    };
  }, [userId, category, supabase, refresh]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    toastNotification,
    markAsRead,
    markAllAsRead,
    dismissToast,
    refresh,
  };
}
