"use client";

import React from "react";
import { useTranslation } from "react-i18next";

const ACTION_STYLES = {
  LOGIN: {
    className: "bg-green-100 text-green-700 border-green-200",
  },

  LOGOUT: {
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },

  PROPERTY_VIEW: {
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },

  PROPERTY_CREATED: {
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },

  PROPERTY_UPDATED: {
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },

  PROPERTY_DELETED: {
    className: "bg-red-100 text-red-700 border-red-200",
  },

  REPORT_GENERATED: {
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },

  REPORT_DOWNLOADED: {
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },

  RISK_ASSESSED: {
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },

  EXPORT_PDF: {
    className: "bg-red-100 text-red-700 border-red-200",
  },

  EXPORT_EXCEL: {
    className: "bg-green-100 text-green-700 border-green-200",
  },

  USER_REGISTERED: {
    className: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },

  PROFILE_UPDATED: {
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },

  PASSWORD_CHANGED: {
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
};

const AuditActionBadge = ({ action }) => {
  const { t } = useTranslation();

  const normalizedAction = action?.toUpperCase();

  const config = ACTION_STYLES[normalizedAction] || {
    className: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const translatedLabel = normalizedAction
    ? t(`audit.action.${normalizedAction}`, {
        defaultValue: normalizedAction.replaceAll("_", " "),
      })
    : t("audit.action.UNKNOWN", {
        defaultValue: "Unknown",
      });

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {translatedLabel}
    </span>
  );
};

export default AuditActionBadge;