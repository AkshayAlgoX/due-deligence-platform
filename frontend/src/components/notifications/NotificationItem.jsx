"use client";

/**
 * NotificationItem — single notification row.
 *
 * Shows:
 *  - Type icon (colored)
 *  - Unread indicator dot
 *  - Title + message
 *  - Relative timestamp
 *  - Mark read / delete actions
 */
import { useRouter } from "next/navigation";
import { Trash2, FileText, AlertTriangle, TrendingUp, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  NOTIFICATION_TYPE_COLORS,
  formatNotificationTime,
} from "@/utils/notificationUtils";

const TYPE_ICONS = {
  REPORT_READY: FileText,
  RISK_ALERT:   AlertTriangle,
  PRICE_CHANGE: TrendingUp,
  SYSTEM:       Bell,
};

export default function NotificationItem({ notification, onMarkRead, onDelete }) {
  const router = useRouter();
  const { t } = useTranslation();

  const colors = NOTIFICATION_TYPE_COLORS[notification.notificationType] ||
                 NOTIFICATION_TYPE_COLORS.SYSTEM;
  const Icon = TYPE_ICONS[notification.notificationType] || Bell;

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead?.(notification.id);
    }
    if (notification.redirectUrl) {
      router.push(notification.redirectUrl);
    }
  };

  return (
    <div
      className={`
        group relative flex items-start gap-3 rounded-xl p-3 transition
        ${notification.isRead
          ? "hover:bg-gray-50 dark:hover:bg-[#1c2128]"
          : "bg-green-50/50 dark:bg-[#0d2818]/40 hover:bg-green-50 dark:hover:bg-[#0d2818]/60"
        }
        ${notification.redirectUrl ? "cursor-pointer" : ""}
      `}
      onClick={handleClick}
      role={notification.redirectUrl ? "button" : "article"}
      tabIndex={notification.redirectUrl ? 0 : -1}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && notification.redirectUrl) {
          handleClick();
        }
      }}
    >
      {/* Type icon */}
      <div className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg ${colors.bg}`}>
        <Icon size={16} className={colors.icon} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold truncate
            ${notification.isRead
              ? "text-gray-700 dark:text-[#7d8590]"
              : "text-gray-900 dark:text-[#e6edf3]"
            }`}>
            {notification.title}
          </p>
          <span className="flex-shrink-0 text-[11px] text-gray-400 dark:text-[#6e7681] mt-0.5">
            {formatNotificationTime(notification.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-[#7d8590] line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <span
          className={`absolute top-3.5 right-10 w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`}
          aria-label={t("notification.unread")}
        />
      )}

      {/* Delete button — visible on hover */}
      <button
        type="button"
        aria-label={t("notification.delete")}
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(notification.id);
        }}
        className="
          absolute right-2 top-2
          opacity-0 group-hover:opacity-100
          flex h-7 w-7 items-center justify-center rounded-lg
          text-gray-400 hover:text-red-500
          dark:text-[#7d8590] dark:hover:text-red-400
          hover:bg-red-50 dark:hover:bg-[#2d1214]
          transition
        "
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
