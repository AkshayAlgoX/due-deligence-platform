"use client";

import {
  FileText,
  Calendar,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const RISK_TRANSLATIONS = {
  en: {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical",
  },

  hi: {
    LOW: "कम",
    MEDIUM: "मध्यम",
    HIGH: "उच्च",
    CRITICAL: "गंभीर",
  },

  bn: {
    LOW: "কম",
    MEDIUM: "মাঝারি",
    HIGH: "উচ্চ",
    CRITICAL: "গুরুতর",
  },

  gu: {
    LOW: "ઓછું",
    MEDIUM: "મધ્યમ",
    HIGH: "ઉચ્ચ",
    CRITICAL: "ગંભીર",
  },

  mr: {
    LOW: "कमी",
    MEDIUM: "मध्यम",
    HIGH: "उच्च",
    CRITICAL: "गंभीर",
  },

  ta: {
    LOW: "குறைவு",
    MEDIUM: "நடுத்தரம்",
    HIGH: "அதிகம்",
    CRITICAL: "மிகவும் தீவிரம்",
  },

  te: {
    LOW: "తక్కువ",
    MEDIUM: "మధ్యస్థ",
    HIGH: "అధిక",
    CRITICAL: "తీవ్రమైన",
  },

  kn: {
    LOW: "ಕಡಿಮೆ",
    MEDIUM: "ಮಧ್ಯಮ",
    HIGH: "ಹೆಚ್ಚು",
    CRITICAL: "ತೀವ್ರ",
  },

  ml: {
    LOW: "കുറഞ്ഞത്",
    MEDIUM: "ഇടത്തരം",
    HIGH: "ഉയർന്നത്",
    CRITICAL: "ഗുരുതരം",
  },

  pa: {
    LOW: "ਘੱਟ",
    MEDIUM: "ਦਰਮਿਆਨਾ",
    HIGH: "ਉੱਚ",
    CRITICAL: "ਗੰਭੀਰ",
  },

  ur: {
    LOW: "کم",
    MEDIUM: "درمیانہ",
    HIGH: "زیادہ",
    CRITICAL: "انتہائی سنگین",
  },
};

export default function ReportHistoryCard({ report }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const language = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "en"
  )
    .split("-")[0]
    .toLowerCase();

  const currentRiskTranslations =
    RISK_TRANSLATIONS[language] ||
    RISK_TRANSLATIONS.en;

  const getRiskKey = (risk) => {
    const value = String(risk || "LOW").toUpperCase();

    if (value === "MODERATE") {
      return "MEDIUM";
    }

    if (
      value === "LOW" ||
      value === "MEDIUM" ||
      value === "HIGH" ||
      value === "CRITICAL"
    ) {
      return value;
    }

    return "LOW";
  };

  const getRiskStyle = (risk) => {
    switch (getRiskKey(risk)) {
      case "LOW":
        return {
          text: "text-green-600 dark:text-green-400",
          bg: "bg-green-100 dark:bg-green-500/10",
        };

      case "MEDIUM":
        return {
          text: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-100 dark:bg-yellow-500/10",
        };

      case "HIGH":
        return {
          text: "text-orange-600 dark:text-orange-400",
          bg: "bg-orange-100 dark:bg-orange-500/10",
        };

      case "CRITICAL":
        return {
          text: "text-red-600 dark:text-red-400",
          bg: "bg-red-100 dark:bg-red-500/10",
        };

      default:
        return {
          text: "text-gray-600 dark:text-[#8b949e]",
          bg: "bg-gray-100 dark:bg-[#21262d]",
        };
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      i18n.language || "en-IN",
      {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        numberingSystem: "latn",
      }
    ).format(parsedDate);
  };

  const riskKey = getRiskKey(
    report?.riskLevelSnapshot ||
      report?.riskLevel
  );

  const riskStyle = getRiskStyle(riskKey);

  const riskLabel =
    currentRiskTranslations[riskKey] ||
    RISK_TRANSLATIONS.en[riskKey];

  const handleViewReport = () => {
    if (!report?.id) {
      console.error(
        "Report ID is missing:",
        report
      );
      return;
    }

    router.push(`/reports/${report.id}`);
  };

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
        transition-colors
        dark:border-[#30363d]
        dark:bg-[#161b22]
      "
    >
      {/* Preview */}
      <div
        className="
          flex
          h-44
          items-center
          justify-center
          bg-gray-100
          dark:bg-[#21262d]
        "
      >
        <FileText
          className="
            h-10
            w-10
            text-purple-200
            dark:text-purple-300
          "
          strokeWidth={1.5}
        />
      </div>

      {/* Content */}
      <div className="bg-white p-5 dark:bg-[#161b22]">
        {/* Title + Risk */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[16px] font-bold leading-tight text-gray-900 dark:text-[#e6edf3]">
            {report?.title ||
              t(
                "reportHistory.card.defaultTitle",
                {
                  defaultValue:
                    "Property Due Diligence Report",
                }
              )}
          </h3>

          <span
            className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${riskStyle.text} ${riskStyle.bg}`}
          >
            {riskLabel}
          </span>
        </div>

        {/* Property */}
        <div className="mb-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-[#8b949e]">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />

          <span className="truncate">
            {report?.propertyAddress ||
              report?.propertyName ||
              t(
                "reportHistory.card.property",
                {
                  defaultValue: "Property",
                }
              )}
          </span>
        </div>

        {/* Generated */}
        <div className="mb-5 flex items-center gap-1.5 text-xs text-gray-400 dark:text-[#6e7681]">
          <Calendar className="h-3.5 w-3.5" />

          <span>
            {t(
              "reportHistory.card.generated",
              {
                defaultValue: "Generated",
              }
            )}
            :{" "}
            {formatDate(
              report?.completedAt ||
                report?.createdAt ||
                report?.generatedAt
            )}
          </span>
        </div>

        {/* View */}
        <button
          type="button"
          onClick={handleViewReport}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-green-500
            px-4
            py-2.5
            text-sm
            font-semibold
            text-green-600
            transition-all
            duration-200
            hover:bg-green-500
            hover:text-white
            dark:border-green-500
            dark:text-green-400
            dark:hover:bg-green-500
            dark:hover:text-white
          "
        >
          {t(
            "reportHistory.card.viewReport",
            {
              defaultValue: "View Report",
            }
          )}

          <ArrowUpRight
            className="h-4 w-4"
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}