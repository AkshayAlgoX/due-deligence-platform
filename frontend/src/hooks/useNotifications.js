"use client";

/**
 * useNotifications — paginated notification list with full CRUD.
 *
 * Manages:
 *  - Fetching paginated notification history
 *  - Filter state (all / unread / by type)
 *  - Mark read / mark all read
 *  - Delete / clear all
 *  - Page navigation
 */
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import notificationService from "@/services/notificationService";
import { getToken } from "@/utils/helpers";

export function useNotifications({
  initialPage = 0,
  pageSize = 20,
  unreadOnly = false,
  type = null,
} = {}) {
  const { t } = useTranslation();
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState(null);       // Spring Page<NotificationDto>
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!getToken()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await notificationService.list({
        page,
        size: pageSize,
        unread: unreadOnly,
        type,
      });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, unreadOnly, type]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Optimistic UI update
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        };
      });
    } catch (err) {
      toast.error(t("notification.toast.markReadFailed"));
    }
  }, [t]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.map((n) => ({ ...n, isRead: true })),
        };
      });
      toast.success(t("notification.toast.markedAllRead"));
    } catch (err) {
      toast.error(t("notification.toast.markAllReadFailed"));
    }
  }, [t]);

  const deleteNotification = useCallback(async (id) => {
    try {
      await notificationService.delete(id);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.filter((n) => n.id !== id),
          totalElements: prev.totalElements - 1,
        };
      });
    } catch (err) {
      toast.error(t("notification.toast.deleteFailed"));
    }
  }, [t]);

  const clearAll = useCallback(async () => {
    try {
      await notificationService.clearAll();
      setData((prev) =>
        prev ? { ...prev, content: [], totalElements: 0 } : prev
      );
      toast.success(t("notification.toast.cleared"));
    } catch (err) {
      toast.error(t("notification.toast.clearFailed"));
    }
  }, [t]);

  return {
    notifications: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    currentPage: page,
    loading,
    error,
    refresh: fetch,
    setPage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
