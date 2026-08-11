"use client";

import React, { useEffect, useRef, useState } from "react";
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
  // ACTION DROPDOWN UI STATE
  // =========================================================
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);

  const actionDropdownRef = useRef(null);

  // =========================================================
  // CLOSE ACTION DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(event.target)
      ) {
        setActionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // =========================================================
  // CURRENT ACTION LABEL
  // =========================================================
  const selectedActionLabel = filters.action
    ? t(`audit.action.${filters.action}`, {
        defaultValue: filters.action,
      })
    : t("audit.filters.allActions");

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

          {/* =================================================
              CUSTOM ACTION DROPDOWN
          ================================================= */}
          <div
            ref={actionDropdownRef}
            id="audit-action"
            className="relative"
          >
            {/* Dropdown Button */}
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                setActionDropdownOpen((previous) => !previous)
              }
              className="
                flex
                w-full
                items-center
                justify-between
                rounded-md
                border
                border-gray-300
                bg-white
                px-3
                py-2
                text-left
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                transition-all
                duration-200
                hover:border-green-400
                hover:shadow-md
                focus:border-green-500
                focus:ring-2
                focus:ring-green-500/20
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:border-[#30363d]
                dark:bg-[#0d1117]
                dark:text-[#e6edf3]
                dark:hover:border-green-500
              "
              aria-haspopup="listbox"
              aria-expanded={actionDropdownOpen}
            >
              <span className="truncate">
                {selectedActionLabel}
              </span>

              {/* Dropdown Arrow */}
              <svg
                className={`ml-2 h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 dark:text-[#8b949e] ${
                  actionDropdownOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {actionDropdownOpen && (
              <div
                className="
                  absolute
                  left-0
                  right-0
                  z-50
                  mt-2
                  overflow-hidden
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  shadow-xl
                  ring-1
                  ring-black/5
                  dark:border-[#30363d]
                  dark:bg-[#161b22]
                  dark:ring-white/5
                "
              >
                <div
                  className="max-h-72 overflow-y-auto p-1.5"
                  role="listbox"
                >
                  {/* All Actions */}
                  <button
                    type="button"
                    role="option"
                    aria-selected={!filters.action}
                    onClick={() => {
                      handleChange("action", "");
                      setActionDropdownOpen(false);
                    }}
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-md
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      transition-colors
                      ${
                        !filters.action
                          ? "bg-green-50 font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400"
                          : "text-gray-700 hover:bg-gray-100 dark:text-[#c9d1d9] dark:hover:bg-[#21262d]"
                      }
                    `}
                  >
                    <span>
                      {t("audit.filters.allActions")}
                    </span>

                    {!filters.action && (
                      <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.415 0l-3.25-3.25a1 1 0 111.415-1.42l2.543 2.544 6.543-6.544a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Action Options */}
                  {AUDIT_ACTIONS.map((action) => {
                    const isSelected = filters.action === action;

                    return (
                      <button
                        key={action}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          handleChange("action", action);
                          setActionDropdownOpen(false);
                        }}
                        className={`
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-md
                          px-3
                          py-2.5
                          text-left
                          text-sm
                          transition-all
                          duration-150
                          ${
                            isSelected
                              ? "bg-green-50 font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-[#c9d1d9] dark:hover:bg-[#21262d] dark:hover:text-[#e6edf3]"
                          }
                        `}
                      >
                        <span className="truncate">
                          {t(`audit.action.${action}`, {
                            defaultValue: action,
                          })}
                        </span>

                        {isSelected && (
                          <svg
                            className="ml-3 h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.415 0l-3.25-3.25a1 1 0 111.415-1.42l2.543 2.544 6.543-6.544a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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