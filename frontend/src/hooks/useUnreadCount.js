"use client";

/**
 * useUnreadCount — provides the badge count for the notification bell.
 *
 * Polls every 60s as a fallback. SSE events trigger an immediate refresh
 * via the onNewNotification callback exported from this hook.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import notificationService from "@/services/notificationService";
import { getToken } from "@/utils/helpers";

const POLL_INTERVAL_MS = 60_000; // 60 seconds

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Silently fail — badge will be stale, not broken
    }
  }, []);

  useEffect(() => {
    refresh();

    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [refresh]);

  /** Call this after receiving an SSE event to instantly bump the count. */
  const incrementUnread = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  /** Call this after marking all as read. */
  const resetUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return { unreadCount, refresh, incrementUnread, resetUnread };
}
