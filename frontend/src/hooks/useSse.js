"use client";

/**
 * useSse — React hook for SSE notification subscription.
 *
 * Connects to the SSE stream, receives real-time notifications,
 * shows a toast, increments the bell badge, and calls back the
 * provided onNotification handler (e.g. to refresh the list).
 *
 * Only connects when the user is authenticated (token present).
 * Disconnects on unmount / logout.
 */
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { subscribeToNotifications } from "@/services/sseService";
import { getToken } from "@/utils/helpers";

/**
 * @param {object}   options
 * @param {function} options.onNewNotification - called with the new notification object
 * @param {function} options.onUnreadIncrement - called to bump the bell badge
 */
export function useSse({ onNewNotification, onUnreadIncrement } = {}) {
  const { t } = useTranslation();
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!getToken()) return;

    const unsubscribe = subscribeToNotifications((notification) => {
      // 1. Show toast
      toast.info(notification.title, {
        description: notification.message,
        duration: 5000,
        action: notification.redirectUrl
          ? {
              label: t("notification.toast.view"),
              onClick: () => {
                if (typeof window !== "undefined") {
                  window.location.href = notification.redirectUrl;
                }
              },
            }
          : undefined,
      });

      // 2. Bump badge count
      onUnreadIncrement?.();

      // 3. Refresh the notification list (if on the notifications page)
      onNewNotification?.(notification);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribeRef.current?.();
    };
  }, [t, onNewNotification, onUnreadIncrement]);
}
