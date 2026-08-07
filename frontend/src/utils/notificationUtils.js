/**
 * notificationUtils — helpers for display, grouping, and formatting.
 */

/**
 * Map a NotificationType enum value to a Lucide icon name string.
 * Components import the actual icon and use this for selection.
 */
export const NOTIFICATION_TYPE_ICONS = {
  REPORT_READY: "FileText",
  RISK_ALERT:   "AlertTriangle",
  PRICE_CHANGE: "TrendingUp",
  SYSTEM:       "Bell",
};

/**
 * Map a NotificationType to a color class (Tailwind).
 */
export const NOTIFICATION_TYPE_COLORS = {
  REPORT_READY: {
    bg:   "bg-green-50 dark:bg-[#0d2818]",
    icon: "text-green-600 dark:text-green-400",
    dot:  "bg-green-500",
  },
  RISK_ALERT: {
    bg:   "bg-red-50 dark:bg-[#2d1214]",
    icon: "text-red-600 dark:text-red-400",
    dot:  "bg-red-500",
  },
  PRICE_CHANGE: {
    bg:   "bg-blue-50 dark:bg-[#0d1f38]",
    icon: "text-blue-600 dark:text-blue-400",
    dot:  "bg-blue-500",
  },
  SYSTEM: {
    bg:   "bg-gray-50 dark:bg-[#1c2128]",
    icon: "text-gray-600 dark:text-gray-400",
    dot:  "bg-gray-400",
  },
};

/**
 * Group a flat array of notifications into { Today, Yesterday, Earlier, Older }.
 *
 * @param {NotificationDto[]} notifications
 * @returns {{ group: string, items: NotificationDto[] }[]}
 */
export function groupNotificationsByDate(notifications) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const earlierStart = new Date(todayStart);
  earlierStart.setDate(earlierStart.getDate() - 7);

  const groups = {
    today:     [],
    yesterday: [],
    earlier:   [],
    older:     [],
  };

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    if (d >= todayStart) {
      groups.today.push(n);
    } else if (d >= yesterdayStart) {
      groups.yesterday.push(n);
    } else if (d >= earlierStart) {
      groups.earlier.push(n);
    } else {
      groups.older.push(n);
    }
  }

  const result = [];
  if (groups.today.length)     result.push({ group: "today",     items: groups.today });
  if (groups.yesterday.length) result.push({ group: "yesterday", items: groups.yesterday });
  if (groups.earlier.length)   result.push({ group: "earlier",   items: groups.earlier });
  if (groups.older.length)     result.push({ group: "older",     items: groups.older });

  return result;
}

/**
 * Format a notification timestamp as a human-readable relative time.
 * e.g. "just now", "5 minutes ago", "2 hours ago", "Jan 15"
 *
 * @param {string} isoString
 * @returns {string}
 */
export function formatNotificationTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60)  return "just now";
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return mins === 1 ? "1 min ago" : `${mins} mins ago`;
  }
  if (diffSec < 86400) {
    const hrs = Math.floor(diffSec / 3600);
    return hrs === 1 ? "1 hour ago" : `${hrs} hours ago`;
  }
  // Older than 24h — show date
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
