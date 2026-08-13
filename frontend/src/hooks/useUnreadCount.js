"use client";

/**
 * useUnreadCount — badge count for the notification bell.
 *
 * Behavior:
 *  - Polls every 60s as fallback
 *  - SSE events trigger instant refresh via incrementUnread()
 *  - Silent on transient errors (backend restart, temporary 500s)
 *  - Only logs to console ONCE per outage, not on every retry
 *  - Auto-recovers when backend comes back — logs "recovered" once
 */
import { useState, useEffect, useCallback, useRef } from "react";
import notificationService from "@/services/notificationService";
import { getToken } from "@/utils/helpers";

const POLL_INTERVAL_MS = 60_000;

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);
  const errorLoggedRef = useRef(false); // track if we already logged the current outage

  const refresh = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount ?? 0);

      // If we previously logged an error, log recovery once
      if (errorLoggedRef.current) {
        console.info("[Notifications] Connection recovered");
        errorLoggedRef.current = false;
      }
    } catch (err) {
      // Log the outage exactly ONCE per outage window
      if (!errorLoggedRef.current) {
        console.warn(
          "[Notifications] Backend unreachable — badge count may be stale. Will retry silently."
        );
        errorLoggedRef.current = true;
      }
      // Silent fail — badge stays at last known value
    }
  }, []);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [refresh]);

  const incrementUnread = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  const resetUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return { unreadCount, refresh, incrementUnread, resetUnread };
}