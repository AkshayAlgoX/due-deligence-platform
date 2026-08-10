"use client";

import React from "react";
import { useTranslation } from "react-i18next";

const AUDIT_ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "PROPERTY_VIEW",
  "PROPERTY_CREATED",
  "PROPERTY_UPDATED",
  "PROPERTY_DELETED",
  "REPORT_GENERATED",
  "REPORT_DOWNLOADED",
  "RISK_ASSESSED",
  "EXPORT_PDF",
  "EXPORT_EXCEL",
  "USER_REGISTERED",
  "PROFILE_UPDATED",
  "PASSWORD_CHANGED",
];

const AuditLogFilters = ({
  filters = {},
  onChange,
  onClear,
  loading = false,
}) => {
  // =========================================================
  // TRANSLATION
  // =========================================================
  const { t } = useTranslation();

  // =========================================================
  // HANDLE FILTER CHANGE
  // =========================================================
  const handleChange = (field, value) => {
    if (onChange) {
      onChange({
        ...filters,
        [field]: value,
      });
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-[#30363d] dark:bg-[#161b22]">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
            {t("audit.filters.title")}
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-[#8b949e]">
            {t("audit.filters.description")}
          </p>
        </div>

        {/* ===================================================
            CLEAR FILTERS
        =================================================== */}
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="
            rounded-md
            border
            border-gray-300
            bg-white
            px-3
            py-2
            text-sm
            font-medium
            text-gray-700
            transition-colors
            hover:bg-gray-50
            disabled:cursor-not-allowed
            disabled:opacity-50
            dark:border-[#30363d]
            dark:bg-[#0d1117]
            dark:text-[#c9d1d9]
            dark:hover:bg-[#21262d]
          "
        >
          {t("audit.filters.clear")}
        </button>
      </div>

      {/* =====================================================
          FILTER FIELDS
      ===================================================== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ===================================================
            ACTION
        =================================================== */}
        <div>
          <label
            htmlFor="audit-action"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-[#c9d1d9]"
          >
            {t("audit.filters.action")}
          </label>

          <select
            id="audit-action"
            value={filters.action || ""}
            onChange={(e) =>
              handleChange("action", e.target.value)
            }
            disabled={loading}
            className="
              w-full
              rounded-md
              border
              border-gray-300
              bg-white
              px-3
              py-2
              text-sm
              text-gray-900
              outline-none
              transition-colors
              focus:border-green-500
              focus:ring-2
              focus:ring-green-500/20
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-[#30363d]
              dark:bg-[#0d1117]
              dark:text-[#e6edf3]
              dark:focus:border-green-500
              dark:[color-scheme:dark]
            "
          >
            {/* All Actions */}
            <option
              value=""
              className="bg-white text-gray-900 dark:bg-[#0d1117] dark:text-[#e6edf3]"
            >
              {t("audit.filters.allActions")}
            </option>

            {/* Action options */}
            {AUDIT_ACTIONS.map((action) => (
              <option
                key={action}
                value={action}
                className="bg-white text-gray-900 dark:bg-[#0d1117] dark:text-[#e6edf3]"
              >
                {t(`audit.action.${action}`, {
                  defaultValue: action,
                })}
              </option>
            ))}
          </select>
        </div>

        {/* ===================================================
            USER ID
        =================================================== */}
        <div>
          <label
            htmlFor="audit-user-id"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-[#c9d1d9]"
          >
            {t("audit.filters.userId")}
          </label>

          <input
            id="audit-user-id"
            type="number"
            min="1"
            placeholder={t(
              "audit.filters.userIdPlaceholder"
            )}
            value={filters.userId || ""}
            onChange={(e) =>
              handleChange("userId", e.target.value)
            }
            disabled={loading}
            className="
              w-full
              rounded-md
              border
              border-gray-300
              bg-white
              px-3
              py-2
              text-sm
              text-gray-900
              outline-none
              placeholder:text-gray-400
              transition-colors
              focus:border-green-500
              focus:ring-2
              focus:ring-green-500/20
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-[#30363d]
              dark:bg-[#0d1117]
              dark:text-[#e6edf3]
              dark:placeholder:text-[#6e7681]
            "
          />
        </div>

        {/* ===================================================
            FROM DATE
        =================================================== */}
        <div>
          <label
            htmlFor="audit-from-date"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-[#c9d1d9]"
          >
            {t("audit.filters.fromDate")}
          </label>

          <input
            id="audit-from-date"
            type="date"
            value={filters.from || ""}
            onChange={(e) =>
              handleChange("from", e.target.value)
            }
            disabled={loading}
            className="
              w-full
              rounded-md
              border
              border-gray-300
              bg-white
              px-3
              py-2
              text-sm
              text-gray-900
              outline-none
              transition-colors
              focus:border-green-500
              focus:ring-2
              focus:ring-green-500/20
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-[#30363d]
              dark:bg-[#0d1117]
              dark:text-[#e6edf3]
              dark:[color-scheme:dark]
            "
          />
        </div>

        {/* ===================================================
            TO DATE
        =================================================== */}
        <div>
          <label
            htmlFor="audit-to-date"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-[#c9d1d9]"
          >
            {t("audit.filters.toDate")}
          </label>

          <input
            id="audit-to-date"
            type="date"
            value={filters.to || ""}
            onChange={(e) =>
              handleChange("to", e.target.value)
            }
            disabled={loading}
            className="
              w-full
              rounded-md
              border
              border-gray-300
              bg-white
              px-3
              py-2
              text-sm
              text-gray-900
              outline-none
              transition-colors
              focus:border-green-500
              focus:ring-2
              focus:ring-green-500/20
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-[#30363d]
              dark:bg-[#0d1117]
              dark:text-[#e6edf3]
              dark:[color-scheme:dark]
            "
          />
        </div>
      </div>
    </div>
  );
};

export default AuditLogFilters;