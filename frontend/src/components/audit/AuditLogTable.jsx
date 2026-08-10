"use client";

import React from "react";
import { useTranslation } from "react-i18next";

const AuditLogTable = ({
  logs = [],
  loading = false,
  error = null,
  onViewDetails,
}) => {
  const { t, i18n } = useTranslation();

  // Keep numbers as English digits: 0-9
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    return String(value);
  };

  // Keep numbers English while translating the date format
  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    try {
      return new Intl.DateTimeFormat(i18n.language, {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        numberingSystem: "latn",
      }).format(parsedDate);
    } catch {
      return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        numberingSystem: "latn",
      }).format(parsedDate);
    }
  };

  // Translate action values
  // Example:
  // LOGIN -> लॉगिन
  // PROFILE_UPDATED -> प्रोफ़ाइल अपडेट की गई
  const getActionLabel = (action) => {
    if (!action) return "-";

    const key = String(action).toUpperCase();

    const translated = t(`audit.action.${key}`, {
      defaultValue: key,
    });

    return String(translated).toUpperCase();
  };

  // Translate resources
  const getResourceLabel = (resource) => {
    if (!resource) return "-";

    const key = String(resource).toUpperCase();

    return t(`audit.resource.${key}`, {
      defaultValue: resource,
    });
  };

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[200px]
          items-center
          justify-center
          bg-white
          p-6
          text-sm
          text-gray-500
          dark:bg-[#161b22]
          dark:text-[#8b949e]
        "
      >
        {t("audit.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
          flex
          min-h-[200px]
          items-center
          justify-center
          bg-white
          p-6
          text-sm
          text-red-600
          dark:bg-[#161b22]
          dark:text-red-400
        "
      >
        {t("audit.errors.loadFailed")}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div
        className="
          flex
          min-h-[200px]
          items-center
          justify-center
          bg-white
          p-6
          text-sm
          text-gray-500
          dark:bg-[#161b22]
          dark:text-[#8b949e]
        "
      >
        {t("audit.noResults")}
      </div>
    );
  }

  return (
    <div
      className="
        w-full
        overflow-x-auto
        bg-white
        dark:bg-[#161b22]
      "
    >
      <table className="min-w-full border-collapse">
        <thead
          className="
            border-b
            border-gray-200
            bg-gray-50
            dark:border-[#30363d]
            dark:bg-[#21262d]
          "
        >
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-[#c9d1d9]">
              {t("audit.columns.user")}
            </th>

            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-[#c9d1d9]">
              {t("audit.columns.action")}
            </th>

            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-[#c9d1d9]">
              {t("audit.columns.resource")}
            </th>

            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-[#c9d1d9]">
              {t("audit.columns.resourceId")}
            </th>

            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-[#c9d1d9]">
              {t("audit.columns.ip")}
            </th>

            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-[#c9d1d9]">
              {t("audit.columns.date")}
            </th>

            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-[#c9d1d9]">
              {t("audit.columns.details")}
            </th>
          </tr>
        </thead>

        <tbody
          className="
            divide-y
            divide-gray-200
            dark:divide-[#30363d]
          "
        >
          {logs.map((log) => (
            <tr
              key={log.id}
              className="
                border-b
                border-gray-200
                bg-white
                transition-colors
                hover:bg-gray-50
                dark:border-[#30363d]
                dark:bg-[#161b22]
                dark:hover:bg-[#21262d]
              "
            >
              {/* User */}
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-[#e6edf3]">
                {log.userName ||
                  t("audit.userFallback", {
                    id: formatNumber(log.userId),
                  })}
              </td>

              {/* Action */}
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-[#e6edf3]">
                {getActionLabel(log.action)}
              </td>

              {/* Resource */}
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-[#c9d1d9]">
                {getResourceLabel(log.entityType)}
              </td>

              {/* Resource ID */}
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-[#c9d1d9]">
                {formatNumber(log.entityId)}
              </td>

              {/* IP Address */}
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-[#c9d1d9]">
                {log.ipAddress || "-"}
              </td>

              {/* Created At */}
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-[#c9d1d9]">
                {formatDate(log.createdAt)}
              </td>

              {/* Details */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onViewDetails?.(log)}
                  className="
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-1
                    text-xs
                    font-medium
                    text-gray-700
                    transition-colors
                    hover:bg-gray-100
                    dark:border-[#30363d]
                    dark:bg-[#0d1117]
                    dark:text-[#c9d1d9]
                    dark:hover:bg-[#21262d]
                  "
                >
                  {t("audit.columns.view")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogTable;