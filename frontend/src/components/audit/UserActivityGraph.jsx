"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

const UserActivityGraph = ({ logs = [], loading = false }) => {
  const { t, i18n } = useTranslation();

  const activityData = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const dateKey = date.toISOString().split("T")[0];

      const count = logs.filter((log) => {
        if (!log?.createdAt) return false;

        const logDate = new Date(log.createdAt);

        if (Number.isNaN(logDate.getTime())) {
          return false;
        }

        return (
          logDate.toISOString().split("T")[0] === dateKey
        );
      }).length;

      /*
       * Keep the weekday key in English.
       * The translation file converts it to the selected language.
       */
      const weekdayKey = date
        .toLocaleDateString("en-US", {
          weekday: "short",
        })
        .toLowerCase();

      days.push({
        date: dateKey,
        dayKey: weekdayKey,
        count,
      });
    }

    return days;
  }, [logs]);

  const maxCount = Math.max(
    ...activityData.map((item) => item.count),
    1
  );

  /*
   * Keep numbers in Latin/English digits.
   * This prevents Hindi, Bengali, Marathi, etc.
   * from converting 123 into १२३ / ১২৩ / १२३.
   */
  const formatNumber = (value) => {
    return String(value ?? 0);
  };

  if (loading) {
    return (
      <div
        className="
          rounded-lg
          bg-white
          p-5
          transition-colors
          dark:bg-[#161b22]
        "
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-[#e6edf3]">
          {t("audit.activity.title")}
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-[#8b949e]">
          {t("audit.activity.graph.description")}
        </p>

        <div
          className="
            mt-6
            flex
            h-48
            items-center
            justify-center
            text-sm
            text-gray-500
            dark:text-[#8b949e]
          "
        >
          {t("audit.activity.graph.loading")}
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        rounded-lg
        bg-white
        p-5
        transition-colors
        dark:bg-[#161b22]
      "
    >
      <h2 className="text-base font-semibold text-gray-900 dark:text-[#e6edf3]">
        {t("audit.activity.title")}
      </h2>

      <p className="mt-1 text-sm text-gray-500 dark:text-[#8b949e]">
        {t("audit.activity.graph.description")}
      </p>

      <div
        className="
          flex
          h-56
          items-end
          gap-3
          border-b
          border-l
          border-gray-200
          px-3
          pb-0
          pt-4
          dark:border-[#30363d]
        "
      >
        {activityData.map((item) => {
          const height =
            item.count === 0
              ? 4
              : Math.max(
                  (item.count / maxCount) * 100,
                  8
                );

          return (
            <div
              key={item.date}
              className="flex h-full flex-1 flex-col items-center justify-end"
            >
              {/* Number always uses English digits */}
              <div className="mb-2 text-xs font-medium text-gray-600 dark:text-[#c9d1d9]">
                {formatNumber(item.count)}
              </div>

              <div
                className="
                  w-full
                  max-w-10
                  rounded-t-md
                  bg-blue-500
                  transition-all
                  dark:bg-blue-500
                "
                style={{
                  height: `${height}%`,
                }}
                title={t(
                  "audit.activity.graph.tooltip",
                  {
                    count: formatNumber(item.count),
                    date: item.date,
                  }
                )}
              />

              {/* Weekday is translated */}
              <div className="mt-2 text-xs text-gray-500 dark:text-[#8b949e]">
                {t(
                  `audit.activity.graph.days.${item.dayKey}`
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-[#8b949e]">
        <span>
          {t("audit.activity.graph.sevenDaysAgo")}
        </span>

        <span>
          {t("audit.activity.graph.today")}
        </span>
      </div>
    </div>
  );
};

export default UserActivityGraph;