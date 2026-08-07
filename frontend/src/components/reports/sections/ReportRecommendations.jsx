"use client";

import { useTranslation } from "react-i18next";
import { Sparkles, AlertTriangle, Info, CheckCircle2, ArrowRight } from "lucide-react";

function parseSectionData(section) {
  if (!section?.dataJson) return null;
  try {
    const parsed =
      typeof section.dataJson === "string"
        ? JSON.parse(section.dataJson)
        : section.dataJson;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getPriorityMeta(level) {
  switch (level?.toUpperCase()) {
    case "MEDIUM":
      return {
        color: "#F59E0B",
        bg: "rgba(245,158,11,0.08)",
        border: "rgba(245,158,11,0.2)",
        icon: AlertTriangle,
        labelKey: "report.recommendations.priority.medium",
      };
    case "HIGH":
      return {
        color: "#F97316",
        bg: "rgba(249,115,22,0.08)",
        border: "rgba(249,115,22,0.2)",
        icon: AlertTriangle,
        labelKey: "report.recommendations.priority.high",
      };
    case "CRITICAL":
      return {
        color: "#EF4444",
        bg: "rgba(239,68,68,0.08)",
        border: "rgba(239,68,68,0.2)",
        icon: AlertTriangle,
        labelKey: "report.recommendations.priority.critical",
      };
    default:
      return {
        color: "#22C55E",
        bg: "rgba(34,197,94,0.08)",
        border: "rgba(34,197,94,0.2)",
        icon: CheckCircle2,
        labelKey: "report.recommendations.priority.low",
      };
  }
}

const CATEGORY_LABEL_KEYS = {
  FLOOD: "report.riskAnalysis.categories.flood",
  LEGAL: "report.riskAnalysis.categories.legal",
  TAX: "report.riskAnalysis.categories.tax",
  ZONING: "report.riskAnalysis.categories.zoning",
  ENVIRONMENTAL: "report.riskAnalysis.categories.environmental",
  MARKET: "report.riskAnalysis.categories.market",
};

export default function ReportRecommendations({ section }) {
  const { t } = useTranslation();
  const factors = parseSectionData(section);

  const items = factors
    ? factors
        .filter((f) => f.recommendation)
        .map((f) => ({
          category: f.category,
          level: f.level,
          score: f.score,
          recommendation: f.recommendation,
          explanation: f.explanation,
        }))
        .sort((a, b) => b.score - a.score)
    : [];

  const highPriorityItems = items.filter((i) => i.score > 10);
  const lowPriorityItems = items.filter((i) => i.score <= 10 && i.score > 0);
  const allClearItems = items.filter((i) => i.score === 0);

  // General guidance list — 5 tips shown regardless
  const generalGuidance = [1, 2, 3, 4, 5].map((n) =>
    t(`report.recommendations.general${n}`, {
      defaultValue: [
        "Always engage a qualified property lawyer for legal review.",
        "Obtain an official encumbrance certificate from the Sub-Registrar office.",
        "Verify property tax clearance with the local municipal body.",
        "Conduct a physical inspection with a certified structural surveyor.",
        "Cross-verify all documentation with original records at government offices.",
      ][n - 1],
    })
  );

  return (
    <div
      id="section-RECOMMENDATIONS"
      className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-gray-100 dark:border-[#30363d]">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
            {t("report.recommendations.eyebrow")}
          </p>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
          {t("report.recommendations.title")}
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {!factors && (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 text-gray-300 dark:text-[#30363d] mx-auto mb-3" />
            <p className="text-[13px] text-gray-400 dark:text-[#6e7681]">
              {t("report.recommendations.unavailable")}
            </p>
          </div>
        )}

        {highPriorityItems.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-3">
              {t("report.recommendations.actionRequired")}
            </p>
            <div className="space-y-3">
              {highPriorityItems.map((item) => {
                const meta = getPriorityMeta(item.level);
                const Icon = meta.icon;
                const categoryLabelKey = CATEGORY_LABEL_KEYS[item.category];
                const categoryLabel = categoryLabelKey
                  ? t(categoryLabelKey)
                  : item.category;
                return (
                  <div
                    key={item.category}
                    className="rounded-xl border p-4 transition-all duration-200"
                    style={{ borderColor: meta.border, backgroundColor: meta.bg }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          backgroundColor: meta.bg,
                          border: `1px solid ${meta.border}`,
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: meta.color }} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-[13px] font-bold text-gray-800 dark:text-[#e6edf3]">
                            {categoryLabel}
                          </span>
                          <span
                            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{
                              color: meta.color,
                              backgroundColor: meta.bg,
                              border: `1px solid ${meta.border}`,
                            }}
                          >
                            {t("report.recommendations.priorityPill", {
                              level: t(meta.labelKey),
                            })}
                          </span>
                          <span className="text-[11px] font-semibold text-gray-400 dark:text-[#6e7681] ml-auto">
                            {t("report.recommendations.scoreLabel", {
                              score: Math.round(item.score),
                            })}
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-600 dark:text-[#7d8590] leading-relaxed flex items-start gap-2">
                          <ArrowRight
                            className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                            style={{ color: meta.color }}
                            strokeWidth={2.5}
                          />
                          {item.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {lowPriorityItems.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-3">
              {t("report.recommendations.minorObservations")}
            </p>
            <div className="space-y-2">
              {lowPriorityItems.map((item) => {
                const meta = getPriorityMeta(item.level);
                const Icon = meta.icon;
                const categoryLabelKey = CATEGORY_LABEL_KEYS[item.category];
                const categoryLabel = categoryLabelKey
                  ? t(categoryLabelKey)
                  : item.category;
                return (
                  <div
                    key={item.category}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-[#30363d] bg-gray-50/30 dark:bg-[#0d1117]/20 px-4 py-3"
                  >
                    <Icon
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: meta.color }}
                      strokeWidth={2}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-bold text-gray-700 dark:text-[#e6edf3] mr-2">
                        {categoryLabel}:
                      </span>
                      <span className="text-[12px] text-gray-500 dark:text-[#7d8590]">
                        {item.recommendation}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {allClearItems.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-3">
              {t("report.recommendations.standardVerification")}
            </p>
            <div className="space-y-2">
              {allClearItems.map((item) => {
                const categoryLabelKey = CATEGORY_LABEL_KEYS[item.category];
                const categoryLabel = categoryLabelKey
                  ? t(categoryLabelKey)
                  : item.category;
                return (
                  <div
                    key={item.category}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-[#30363d] px-4 py-3"
                  >
                    <CheckCircle2
                      className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5"
                      strokeWidth={2}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-bold text-gray-700 dark:text-[#e6edf3] mr-2">
                        {categoryLabel}:
                      </span>
                      <span className="text-[12px] text-gray-500 dark:text-[#7d8590]">
                        {item.recommendation}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-100 dark:border-[#30363d] overflow-hidden">
          <div className="px-4 py-3 bg-gray-50/60 dark:bg-[#21262d]/40 border-b border-gray-100 dark:border-[#30363d]">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                {t("report.recommendations.generalTitle")}
              </span>
            </div>
          </div>
          <ul className="divide-y divide-gray-50 dark:divide-[#30363d]/50">
            {generalGuidance.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-3">
                <span className="text-[11px] font-bold text-gray-300 dark:text-[#6e7681] mt-0.5 w-4 flex-shrink-0">
                  {i + 1}.
                </span>
                <span className="text-[13px] text-gray-600 dark:text-[#7d8590] leading-relaxed">
                  {tip}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}