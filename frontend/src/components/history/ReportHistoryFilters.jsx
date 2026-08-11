"use client";

import { Search, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

const RISK_TRANSLATIONS = {
  en: {
    all: "All Risk Levels",
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical",
  },

  hi: {
    all: "सभी जोखिम स्तर",
    LOW: "कम",
    MEDIUM: "मध्यम",
    HIGH: "उच्च",
    CRITICAL: "गंभीर",
  },

  bn: {
    all: "সব ঝুঁকির স্তর",
    LOW: "কম",
    MEDIUM: "মাঝারি",
    HIGH: "উচ্চ",
    CRITICAL: "গুরুতর",
  },

  gu: {
    all: "બધા જોખમ સ્તરો",
    LOW: "ઓછું",
    MEDIUM: "મધ્યમ",
    HIGH: "ઉચ્ચ",
    CRITICAL: "ગંભીર",
  },

  mr: {
    all: "सर्व जोखीम स्तर",
    LOW: "कमी",
    MEDIUM: "मध्यम",
    HIGH: "उच्च",
    CRITICAL: "गंभीर",
  },

  ta: {
    all: "அனைத்து ஆபத்து நிலைகள்",
    LOW: "குறைவு",
    MEDIUM: "நடுத்தரம்",
    HIGH: "அதிகம்",
    CRITICAL: "மிகவும் தீவிரம்",
  },

  te: {
    all: "అన్ని ప్రమాద స్థాయిలు",
    LOW: "తక్కువ",
    MEDIUM: "మధ్యస్థ",
    HIGH: "అధిక",
    CRITICAL: "తీవ్రమైన",
  },

  kn: {
    all: "ಎಲ್ಲಾ ಅಪಾಯದ ಮಟ್ಟಗಳು",
    LOW: "ಕಡಿಮೆ",
    MEDIUM: "ಮಧ್ಯಮ",
    HIGH: "ಹೆಚ್ಚು",
    CRITICAL: "ತೀವ್ರ",
  },

  ml: {
    all: "എല്ലാ അപകട നിലകളും",
    LOW: "കുറഞ്ഞത്",
    MEDIUM: "ഇടത്തരം",
    HIGH: "ഉയർന്നത്",
    CRITICAL: "ഗുരുതരം",
  },

  pa: {
    all: "ਸਾਰੇ ਜੋਖਮ ਪੱਧਰ",
    LOW: "ਘੱਟ",
    MEDIUM: "ਦਰਮਿਆਨਾ",
    HIGH: "ਉੱਚ",
    CRITICAL: "ਗੰਭੀਰ",
  },

  ur: {
    all: "تمام خطرے کی سطحیں",
    LOW: "کم",
    MEDIUM: "درمیانہ",
    HIGH: "زیادہ",
    CRITICAL: "انتہائی سنگین",
  },
};

export default function ReportHistoryFilters({
  filters,
  onChange,
  onReset,
}) {
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

  const getRiskLabel = (risk) => {
    return (
      currentRiskTranslations[risk] ||
      RISK_TRANSLATIONS.en[risk] ||
      risk
    );
  };

  const handleSearchChange = (e) => {
    onChange({
      search: e.target.value,
    });
  };

  const handleRiskChange = (e) => {
    onChange({
      riskLevel: e.target.value,
    });
  };

  const handleDateChange = (e) => {
    onChange({
      date: e.target.value,
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-[#30363d] dark:bg-[#161b22]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">

        {/* Search */}
        <div className="md:col-span-3">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#c9d1d9]">
            {t("reportHistory.filters.search", {
              defaultValue: "Search",
            })}
          </label>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#6e7681]"
              strokeWidth={2}
            />

            <input
              type="text"
              value={filters?.search || ""}
              onChange={handleSearchChange}
              placeholder={t(
                "reportHistory.filters.searchPlaceholder",
                {
                  defaultValue:
                    "Search reports or properties...",
                }
              )}
              className="
                h-11
                w-full
                rounded-lg
                border
                border-gray-200
                bg-white
                pl-10
                pr-4
                text-sm
                text-gray-900
                outline-none
                transition
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-900/10
                dark:border-[#30363d]
                dark:bg-[#0d1117]
                dark:text-[#e6edf3]
                dark:placeholder:text-[#6e7681]
                dark:focus:border-[#484f58]
                dark:focus:ring-white/10
                dark:[color-scheme:dark]
              "
            />
          </div>
        </div>

        {/* Risk */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#c9d1d9]">
            {t("reportHistory.filters.riskLevel", {
              defaultValue: "Risk Level",
            })}
          </label>

          <select
            value={filters?.riskLevel || "ALL"}
            onChange={handleRiskChange}
            className="
              h-11
              w-full
              rounded-lg
              border
              border-gray-200
              bg-white
              px-3
              text-sm
              text-gray-900
              outline-none
              transition
              focus:border-gray-400
              focus:ring-2
              focus:ring-gray-900/10
              dark:border-[#30363d]
              dark:bg-[#0d1117]
              dark:text-[#e6edf3]
              dark:focus:border-[#484f58]
              dark:focus:ring-white/10
              dark:[color-scheme:dark]
            "
          >
            <option value="ALL">
              {getRiskLabel("all")}
            </option>

            <option value="LOW">
              {getRiskLabel("LOW")}
            </option>

            <option value="MEDIUM">
              {getRiskLabel("MEDIUM")}
            </option>

            <option value="HIGH">
              {getRiskLabel("HIGH")}
            </option>

            <option value="CRITICAL">
              {getRiskLabel("CRITICAL")}
            </option>
          </select>
        </div>

        {/* Date */}
        <div className="md:col-span-1">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#c9d1d9]">
            {t("reportHistory.filters.date", {
              defaultValue: "Date",
            })}
          </label>

          <input
            type="date"
            value={filters?.date || ""}
            onChange={handleDateChange}
            className="
              h-11
              w-full
              rounded-lg
              border
              border-gray-200
              bg-white
              px-3
              text-sm
              text-gray-900
              outline-none
              transition
              focus:border-gray-400
              focus:ring-2
              focus:ring-gray-900/10
              dark:border-[#30363d]
              dark:bg-[#0d1117]
              dark:text-[#e6edf3]
              dark:focus:border-[#484f58]
              dark:focus:ring-white/10
              dark:[color-scheme:dark]
            "
          />
        </div>

        {/* Reset */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-gray-200
              bg-white
              px-3
              text-sm
              font-semibold
              text-gray-700
              shadow-sm
              transition-all
              duration-200
              hover:border-gray-300
              hover:bg-gray-50
              hover:text-gray-900
              active:scale-[0.98]
              dark:border-[#30363d]
              dark:bg-[#161b22]
              dark:text-[#c9d1d9]
              dark:hover:border-[#484f58]
              dark:hover:bg-[#21262d]
              dark:hover:text-white
            "
          >
            <RotateCcw
              className="h-4 w-4"
              strokeWidth={2}
            />

            <span>
              {t("reportHistory.filters.reset", {
                defaultValue: "Reset",
              })}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}