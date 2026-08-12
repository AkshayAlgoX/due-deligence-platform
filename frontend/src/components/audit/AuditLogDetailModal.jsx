"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import AuditActionBadge from "./AuditActionBadge";

const AuditLogDetailModal = ({
  open,
  log,
  loading = false,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!open) {
    return null;
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================
  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  // =========================================================
  // FORMAT VALUE
  // =========================================================
  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    // If backend returns JSON as a string,
    // try to format it nicely.
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return value;
      }
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  // =========================================================
  // TRANSLATE ENTITY TYPE
  // =========================================================
  const getTranslatedEntityType = (entityType) => {
    if (!entityType) {
      return "-";
    }

    const normalizedEntityType = String(entityType).trim().toUpperCase();

    return t(`audit.resource.${normalizedEntityType}`, {
      defaultValue: entityType,
    });
  };

  // =========================================================
  // TRANSLATE NEW VALUE / DETAILS
  // =========================================================
  const getTranslatedNewValue = (value, action) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    // ---------------------------------------------------------
    // If value is an object, keep JSON formatting.
    // ---------------------------------------------------------
    if (typeof value !== "string") {
      return formatValue(value);
    }

    // ---------------------------------------------------------
    // If backend returns JSON as a string, try parsing it.
    // ---------------------------------------------------------
    try {
      const parsed = JSON.parse(value);

      if (typeof parsed === "object" && parsed !== null) {
        return JSON.stringify(parsed, null, 2);
      }
    } catch {
      // Not JSON. Continue normally.
    }

    // ---------------------------------------------------------
    // Normalize backend action.
    // Example:
    //
    // LOGIN
    // LOGOUT
    // PASSWORD_CHANGED
    // PROPERTY_VIEW
    // ---------------------------------------------------------
    const normalizedAction = action
      ? String(action).trim().toUpperCase()
      : "";

    // ---------------------------------------------------------
    // IMPORTANT:
    // Use the ACTION from the backend first.
    //
    // This means:
    //
    // action = PASSWORD_CHANGED
    // value  = "Password changed"
    //
    // will display:
    //
    // पासवर्ड बदला गया
    //
    // when Hindi is selected.
    // ---------------------------------------------------------
    const supportedActions = [
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

    if (supportedActions.includes(normalizedAction)) {
      return t(`audit.action.${normalizedAction}`, {
        defaultValue: value,
      });
    }

    // ---------------------------------------------------------
    // FALLBACK:
    // Some old audit records may not have a usable action.
    // Translate the English backend description directly.
    // ---------------------------------------------------------
    const normalizedValue = value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    const valueToActionMap = {
      // LOGIN
      "login": "LOGIN",
      "user login": "LOGIN",
      "user logged in": "LOGIN",
      "logged in": "LOGIN",

      // LOGOUT
      "logout": "LOGOUT",
      "user logout": "LOGOUT",
      "user logged out": "LOGOUT",
      "logged out": "LOGOUT",
      "logged out from all devices": "LOGOUT",

      // PROPERTY
      "property view": "PROPERTY_VIEW",
      "property viewed": "PROPERTY_VIEW",
      "viewed property": "PROPERTY_VIEW",

      "property created": "PROPERTY_CREATED",

      "property updated": "PROPERTY_UPDATED",

      "property deleted": "PROPERTY_DELETED",

      // REPORT
      "report generated": "REPORT_GENERATED",

      "report downloaded": "REPORT_DOWNLOADED",

      // RISK
      "risk assessed": "RISK_ASSESSED",

      // EXPORT
      "export pdf": "EXPORT_PDF",
      "pdf exported": "EXPORT_PDF",

      "export excel": "EXPORT_EXCEL",
      "excel exported": "EXPORT_EXCEL",

      // USER
      "user registered": "USER_REGISTERED",

      // PROFILE
      "profile updated": "PROFILE_UPDATED",

      // PASSWORD
      "password changed": "PASSWORD_CHANGED",
    };

    const actionKey = valueToActionMap[normalizedValue];

    if (actionKey) {
      return t(`audit.action.${actionKey}`, {
        defaultValue: value,
      });
    }

    // ---------------------------------------------------------
    // If it is not a known audit description,
    // keep the original backend value.
    // ---------------------------------------------------------
    return formatValue(value);
  };

  return (
    <div
      className="fixed inset-x-0 top-20 bottom-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[calc(100vh-7rem)] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-[#161b22]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* =========================================================
            HEADER
        ========================================================= */}
        <div className="flex items-start justify-between border-b px-6 py-5 dark:border-[#30363d]">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">
              {t("audit.detail.title")}
            </h2>

            {log?.id && (
              <p className="mt-1 text-sm text-gray-500 dark:text-[#8b949e]">
                {t("audit.detail.logId", {
                  id: log.id,
                })}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-[#8b949e] dark:hover:bg-[#21262d] dark:hover:text-[#e6edf3]"
            aria-label={t("audit.detail.close")}
          >
            ×
          </button>
        </div>

        {/* =========================================================
            LOADING
        ========================================================= */}
        {loading && (
          <div className="flex min-h-[250px] items-center justify-center p-6">
            <p className="text-sm text-gray-500 dark:text-[#8b949e]">
              {t("audit.detail.loading")}
            </p>
          </div>
        )}

        {/* =========================================================
            CONTENT
        ========================================================= */}
        {!loading && log && (
          <div className="space-y-6 p-6">

            {/* =====================================================
                ACTIVITY
            ===================================================== */}
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-[#8b949e]">
                {t("audit.detail.activity")}
              </h3>

              <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 dark:border-[#30363d]">

                {/* Action */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-[#8b949e]">
                    {t("audit.detail.action")}
                  </p>

                  <div className="mt-1">
                    <AuditActionBadge action={log.action} />
                  </div>
                </div>

                {/* Created At */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-[#8b949e]">
                    {t("audit.detail.createdAt")}
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-[#e6edf3]">
                    {formatDate(log.createdAt)}
                  </p>
                </div>

                {/* User */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-[#8b949e]">
                    {t("audit.detail.user")}
                  </p>

                  <p className="mt-1 text-sm text-gray-900 dark:text-[#e6edf3]">
                    {log.userName || "-"}
                  </p>
                </div>

                {/* User ID */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-[#8b949e]">
                    {t("audit.detail.userId")}
                  </p>

                  <p className="mt-1 text-sm text-gray-900 dark:text-[#e6edf3]">
                    {log.userId ?? "-"}
                  </p>
                </div>

                {/* Entity Type */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-[#8b949e]">
                    {t("audit.detail.entityType")}
                  </p>

                  <p className="mt-1 text-sm text-gray-900 dark:text-[#e6edf3]">
                    {getTranslatedEntityType(log.entityType)}
                  </p>
                </div>

                {/* Entity ID */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-[#8b949e]">
                    {t("audit.detail.entityId")}
                  </p>

                  <p className="mt-1 text-sm text-gray-900 dark:text-[#e6edf3]">
                    {log.entityId ?? "-"}
                  </p>
                </div>
              </div>
            </section>

            {/* =====================================================
                REQUEST INFORMATION
            ===================================================== */}
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-[#8b949e]">
                {t("audit.detail.requestInformation")}
              </h3>

              <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 dark:border-[#30363d]">

                {/* IP Address */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-[#8b949e]">
                    {t("audit.detail.ipAddress")}
                  </p>

                  <p className="mt-1 text-sm text-gray-900 dark:text-[#e6edf3]">
                    {log.ipAddress || "-"}
                  </p>
                </div>

                {/* User Agent */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-[#8b949e]">
                    {t("audit.detail.userAgent")}
                  </p>

                  <p className="mt-1 break-all text-sm text-gray-900 dark:text-[#e6edf3]">
                    {log.userAgent || "-"}
                  </p>
                </div>
              </div>
            </section>

            {/* =====================================================
                CHANGES
            ===================================================== */}
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-[#8b949e]">
                {t("audit.detail.changes")}
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* Previous Value */}
                <div className="rounded-lg border bg-gray-50 p-4 dark:border-[#30363d] dark:bg-[#0d1117]">
                  <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-[#8b949e]">
                    {t("audit.detail.previousValue")}
                  </p>

                  <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words text-xs text-gray-700 dark:text-[#c9d1d9]">
                    {formatValue(log.oldValue)}
                  </pre>
                </div>

                {/* New Value / Details */}
                <div className="rounded-lg border bg-gray-50 p-4 dark:border-[#30363d] dark:bg-[#0d1117]">
                  <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-[#8b949e]">
                    {t("audit.detail.newValue")}
                  </p>

                  <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words text-xs text-gray-700 dark:text-[#c9d1d9]">
                    {getTranslatedNewValue(
                      log.newValue,
                      log.action
                    )}
                  </pre>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            NO DATA
        ========================================================= */}
        {!loading && !log && (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-[#8b949e]">
            {t("audit.detail.unavailable")}
          </div>
        )}

        {/* =========================================================
            FOOTER
        ========================================================= */}
        <div className="sticky bottom-0 z-10 flex justify-end border-t bg-gray-50 px-6 py-4 dark:border-[#30363d] dark:bg-[#0d1117]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#e6edf3] dark:hover:bg-[#21262d]"
          >
            {t("audit.detail.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailModal;