"use client";

import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Activity,
} from "lucide-react";

function parseSectionData(section) {
  if (!section?.dataJson) return null;
  try {
    return typeof section.dataJson === "string"
      ? JSON.parse(section.dataJson)
      : section.dataJson;
  } catch {
    return null;
  }
}

function getRiskColor(level) {
  switch (level?.toUpperCase()) {
    case "LOW":
      return { text: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" };
    case "MEDIUM":
      return { text: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" };
    case "HIGH":
      return { text: "#F97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)" };
    case "CRITICAL":
      return { text: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" };
    default:
      return { text: "#7d8590", bg: "rgba(125,133,144,0.1)", border: "rgba(125,133,144,0.25)" };
  }
}

function getRiskIcon(level) {
  switch (level?.toUpperCase()) {
    case "LOW":
      return CheckCircle2;
    case "MEDIUM":
      return Info;
    case "HIGH":
    case "CRITICAL":
      return AlertTriangle;
    default:
      return Activity;
  }
}

const CATEGORY_LABEL_KEYS = {
  FLOOD: "report.appendix.categoryLabels.flood",
  LEGAL: "report.appendix.categoryLabels.legal",
  TAX: "report.appendix.categoryLabels.tax",
  ZONING: "report.appendix.categoryLabels.zoning",
  ENVIRONMENTAL: "report.appendix.categoryLabels.environmental",
  MARKET: "report.appendix.categoryLabels.market",
};

export default function ReportExecutiveSummary({ section, report }) {
  const { t } = useTranslation();
  const data = parseSectionData(section);

  const overallScore = data?.overallScore ?? report?.riskScoreSnapshot ?? 0;
  const overallLevel = data?.overallLevel ?? "UNKNOWN";
  const factors = data?.factors ?? [];
  const riskColor = getRiskColor(overallLevel);
  const RiskIcon = getRiskIcon(overallLevel);

  const keyRisks = factors
    .filter((f) => f.score > 0)
    .sort((a, b) => b.score - a.score);

  const verdictText =
    report?.executiveSummary ||
    section?.content?.split("\n").find((l) => l.includes("risk")) ||
    "";

  return (
    <div
      id="section-EXECUTIVE_SUMMARY"
      className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-gray-100 dark:border-[#30363d]">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
            {t("report.executive.eyebrow")}
          </p>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
          {t("report.executive.title")}
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div
          className="rounded-xl p-5 border"
          style={{ backgroundColor: riskColor.bg, borderColor: riskColor.border }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: riskColor.bg, border: `1px solid ${riskColor.border}` }}
            >
              <RiskIcon className="w-5 h-5" style={{ color: riskColor.text }} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                  style={{
                    color: riskColor.text,
                    backgroundColor: riskColor.bg,
                    border: `1px solid ${riskColor.border}`,
                  }}
                >
                  {overallLevel} {t("report.executive.riskSuffix")}
                </span>
                <span className="text-[13px] font-bold text-gray-700 dark:text-[#e6edf3]">
                  {Math.round(overallScore)}/100
                </span>
              </div>
              <p className="text-[13px] text-gray-600 dark:text-[#7d8590] leading-relaxed">
                {verdictText.split("\n")[0]}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="col-span-2 sm:col-span-1 rounded-xl border border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#0d1117]/40 p-4 flex flex-col justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-2">
              {t("report.executive.riskScore")}
            </p>
            <div>
              <span
                className="text-5xl font-black tabular-nums leading-none"
                style={{ color: riskColor.text }}
              >
                {Math.round(overallScore)}
              </span>
              <span className="text-xl font-bold text-gray-300 dark:text-[#6e7681]">
                /100
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#0d1117]/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-2">
              {t("report.executive.categories")}
            </p>
            <span className="text-4xl font-black tabular-nums text-gray-800 dark:text-[#e6edf3] leading-none">
              {factors.length}
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#0d1117]/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-2">
              {t("report.executive.dataQuality")}
            </p>
            <span
              className="text-[13px] font-bold"
              style={{ color: data?.dataIncomplete ? "#F59E0B" : "#22C55E" }}
            >
              {data?.dataIncomplete
                ? t("report.executive.dataPartial")
                : t("report.executive.dataComplete")}
            </span>
          </div>
        </div>

        {factors.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-3">
              {t("report.executive.categoryBreakdown")}
            </p>
            <div className="space-y-2">
              {factors
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((factor) => {
                  const fc = getRiskColor(factor.level);
                  const pct = Math.min(100, Math.round(factor.score));
                  const labelKey = CATEGORY_LABEL_KEYS[factor.category];
                  const label = labelKey ? t(labelKey) : factor.category;
                  return (
                    <div key={factor.category} className="flex items-center gap-3">
                      <div className="w-24 flex-shrink-0">
                        <span className="text-[12px] font-semibold text-gray-600 dark:text-[#7d8590]">
                          {label}
                        </span>
                      </div>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-[#21262d] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: fc.text }}
                        />
                      </div>
                      <div className="w-12 text-right">
                        <span
                          className="text-[11px] font-bold tabular-nums"
                          style={{ color: fc.text }}
                        >
                          {Math.round(factor.score)}
                        </span>
                      </div>
                      <div
                        className="w-16 text-center text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{
                          color: fc.text,
                          backgroundColor: fc.bg,
                          border: `1px solid ${fc.border}`,
                        }}
                      >
                        {factor.level}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {keyRisks.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-3">
              {t("report.executive.keyFindings")}
            </p>
            <div className="space-y-2">
              {keyRisks.map((factor) => {
                const fc = getRiskColor(factor.level);
                const labelKey = CATEGORY_LABEL_KEYS[factor.category];
                const label = labelKey ? t(labelKey) : factor.category;
                return (
                  <div
                    key={factor.category}
                    className="flex items-start gap-3 rounded-lg p-3 border border-gray-100 dark:border-[#30363d] bg-gray-50/30 dark:bg-[#0d1117]/20"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: fc.text }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[12px] font-bold text-gray-700 dark:text-[#e6edf3]">
                          {label}
                        </span>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                          style={{ color: fc.text, backgroundColor: fc.bg }}
                        >
                          {factor.level}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-500 dark:text-[#7d8590] leading-relaxed">
                        {factor.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}