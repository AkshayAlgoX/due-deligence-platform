"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  CheckCheck,
  Trash2,
  RefreshCw,
  Filter,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { useSse } from "@/hooks/useSse";
import {
  groupNotificationsByDate,
} from "@/utils/notificationUtils";
import NotificationGroup from "@/components/notifications/NotificationGroup";
import NotificationEmpty from "@/components/notifications/NotificationEmpty";
import { Skeleton } from "@/components/ui/Skeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const FILTER_OPTIONS = [
  { key: "ALL",          labelKey: "notification.filter.all" },
  { key: "UNREAD",       labelKey: "notification.filter.unread" },
  { key: "REPORT_READY", labelKey: "notification.filter.reportReady" },
  { key: "RISK_ALERT",   labelKey: "notification.filter.riskAlert" },
  { key: "SYSTEM",       labelKey: "notification.filter.system" },
];

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const { refresh: refreshBadge, resetUnread } = useUnreadCount();

  // Derive filter props from activeFilter
  const isUnreadOnly = activeFilter === "UNREAD";
  const typeFilter = ["REPORT_READY", "RISK_ALERT", "RISK_ALERT", "SYSTEM"].includes(activeFilter)
    ? activeFilter
    : null;

  const {
    notifications,
    totalElements,
    totalPages,
    currentPage,
    loading,
    error,
    refresh,
    setPage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications({
    pageSize: 20,
    unreadOnly: isUnreadOnly,
    type: typeFilter,
  });

  // SSE: refresh list + badge on new notification
  const handleNewNotification = useCallback(() => {
    refresh();
    refreshBadge();
  }, [refresh, refreshBadge]);

  useSse({ onNewNotification: handleNewNotification });

  useEffect(() => {
    document.title = "Notifications | Real Estate Due Diligence";
  }, []);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    resetUnread();
  };

  const handleClearAll = async () => {
    setClearingAll(true);
    try {
      await clearAll();
      resetUnread();
    } finally {
      setClearingAll(false);
      setShowClearConfirm(false);
    }
  };

  const handleFilterChange = (key) => {
    setActiveFilter(key);
    setPage(0);
  };

  const grouped = groupNotificationsByDate(notifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-[#0d2818] ring-1 ring-green-200 dark:ring-green-900/50">
            <Bell className="h-5 w-5 text-[#16a34a]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-[#e6edf3]">
              {t("notification.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-[#7d8590]">
              {totalElements > 0
                ? t("notification.subtitle", { count: totalElements })
                : t("notification.subtitleEmpty")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            aria-label={t("common.refresh")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 dark:text-[#7d8590] hover:bg-gray-50 dark:hover:bg-[#1c2128] transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#16a34a] hover:bg-green-50 dark:hover:bg-[#0d2818] transition"
            >
              <CheckCheck size={15} />
              {t("notification.markAllRead")}
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-[#2d1214] transition"
            >
              <Trash2 size={15} />
              {t("notification.clearAll")}
            </button>
          )}
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(({ key, labelKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleFilterChange(key)}
            className={`
              flex items-center gap-1.5 rounded-full px-3 py-1.5
              text-xs font-semibold transition
              ${activeFilter === key
                ? "bg-[#22C55E] text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
                : "bg-gray-100 dark:bg-[#1c2128] text-gray-600 dark:text-[#7d8590] hover:bg-gray-200 dark:hover:bg-[#30363d]"
              }
            `}
          >
            {key === "UNREAD" && unreadCount > 0 && (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[9px] font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* ── Notification list ── */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm overflow-hidden">

        {/* Error */}
        {error && (
          <div className="p-6 text-center text-sm text-red-500">
            {error}
            <button
              type="button"
              onClick={refresh}
              className="ml-2 font-semibold underline"
            >
              {t("common.retry")}
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && notifications.length === 0 && (
          <NotificationEmpty filtered={activeFilter !== "ALL"} />
        )}

        {/* Grouped notifications */}
        {!loading && !error && notifications.length > 0 && (
          <div className="p-4 space-y-5">
            {grouped.map(({ group, items }) => (
              <NotificationGroup
                key={group}
                group={group}
                items={items}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-[#30363d] px-4 py-3">
            <span className="text-xs text-gray-500 dark:text-[#7d8590]">
              {t("notification.pagination.showing", {
                from: currentPage * 20 + 1,
                to: Math.min((currentPage + 1) * 20, totalElements),
                total: totalElements,
              })}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-[#7d8590] hover:bg-gray-50 dark:hover:bg-[#1c2128] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {t("notification.pagination.prev")}
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setPage(currentPage + 1)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-[#7d8590] hover:bg-gray-50 dark:hover:bg-[#1c2128] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {t("notification.pagination.next")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clear All confirm dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title={t("notification.clearAllConfirm.title")}
        description={t("notification.clearAllConfirm.description")}
        confirmLabel={t("notification.clearAllConfirm.confirm")}
        variant="danger"
        onConfirm={handleClearAll}
        loading={clearingAll}
      />
    </div>
  );
}
