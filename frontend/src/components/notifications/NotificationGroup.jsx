"use client";

/**
 * NotificationGroup — renders a dated group header + its notifications.
 */
import { useTranslation } from "react-i18next";
import NotificationItem from "./NotificationItem";

export default function NotificationGroup({ group, items, onMarkRead, onDelete }) {
  const { t } = useTranslation();

  const groupLabel = {
    today:     t("notification.group.today"),
    yesterday: t("notification.group.yesterday"),
    earlier:   t("notification.group.earlier"),
    older:     t("notification.group.older"),
  }[group] ?? group;

  return (
    <div>
      <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
        {groupLabel}
      </p>
      <div className="space-y-0.5">
        {items.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onMarkRead={onMarkRead}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
