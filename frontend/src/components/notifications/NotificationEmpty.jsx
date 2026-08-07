"use client";

/**
 * NotificationEmpty — shown when no notifications match the current filter.
 */
import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotificationEmpty({ filtered = false }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#30363d] flex items-center justify-center mb-4">
        <Bell size={28} className="text-gray-300 dark:text-[#484f58]" strokeWidth={1.5} />
      </div>
      <p className="font-bold text-gray-800 dark:text-[#e6edf3] text-lg">
        {filtered
          ? t("notification.empty.filteredTitle")
          : t("notification.empty.title")}
      </p>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-[#7d8590] max-w-sm">
        {filtered
          ? t("notification.empty.filteredDescription")
          : t("notification.empty.description")}
      </p>
    </div>
  );
}
