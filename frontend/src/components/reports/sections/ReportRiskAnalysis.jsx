"use client";

import { useTranslation } from "react-i18next";
import { Activity, AlertTriangle, Info, Database } from "lucide-react";

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
      return { text: "#22C55E", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)" };
    case "MEDIUM":
      return { text: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" };
    case "HIGH":
      return { text: "#F97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)" };
    case "CRITICAL":
      return { text: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" };
    default:
      return { text: "#7d8590", bg: "rgba(125,133,144,0.08)", border: "rgba(125,133,144,0.2)" };
  }
}

const CATEGORY_META = {
  FLOOD: { labelKey: "report.riskAnalysis.categories.flood", icon: "🌊" },
  LEGAL: { labelKey: "report.riskAnalysis.categories.legal", icon: "⚖️" },
  TAX: { labelKey: "report.riskAnalysis.categories.tax", icon: "🧾" },
  ZONING: { labelKey: "report.riskAnalysis.categories.zoning", icon: "🏙️" },
  ENVIRONMENTAL: { labelKey: "report.riskAnalysis.categories.environmental", icon: "🌿" },
  MARKET: { labelKey: "report.riskAnalysis.categories.market", icon: "📈" },
};

function ScoreArc({ score, level }) {
  const color = getRiskColor(level);
  const pct = Math.min(100, Math.max(0, score));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-gray-100 dark:text-[#21262d]"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color.text}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-xl font-black tabular-nums leading-none"
          style={{ color: color.text }}
        >
          {Math.round(score)}
        </span>
        <span className="text-[10px] font-semibold text-gray-400 dark:text-[#6e7681]">
          /100
        </span>
      </div>
    </div>
  );
}

function FactorCard({ factor, t }) {
  const meta = CATEGORY_META[factor.category] || { labelKey: null, icon: "📊" };
  const label = meta.labelKey ? t(meta.labelKey) : factor.category;
  const color = getRiskColor(factor.level);

  return (
    <div
      className="rounded-xl border p-5 transition-all duration-200 hover:shadow-sm"
      style={{ borderColor: color.border, backgroundColor: color.bg }}
    >
      <div className="flex items-start gap-4">
        <ScoreArc score={factor.score} level={factor.level} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-base">{meta.icon}</span>
            <h3 className="text-[14px] font-bold text-gray-900 dark:text-[#e6edf3]">
              {label}
            </h3>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{
                color: color.text,
                backgroundColor: color.bg,
                border: `1px solid ${color.border}`,
              }}
            >
              {factor.level}
            </span>
            <span className="text-[11px] text-gray-400 dark:text-[#6e7681] ml-auto">
              {t("report.riskAnalysis.weight", { pct: Math.round(factor.weight * 100) })}
            </span>
          </div>

          <p className="text-[13px] text-gray-600 dark:text-[#7d8590] leading-relaxed mb-3">
            {factor.explanation}
          </p>

          {factor.recommendation && (
            <div className="flex items-start gap-2 rounded-lg bg-white/60 dark:bg-[#0d1117]/40 border border-gray-100 dark:border-[#30363d] px-3 py-2">
              <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-[12px] text-gray-600 dark:text-[#7d8590] leading-relaxed">
                <span className="font-semibold text-gray-700 dark:text-[#e6edf3]">
                  {t("report.riskAnalysis.recommendationLabel")}
                </span>
                {factor.recommendation}
              </p>
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-3">
            <Database className="w-3 h-3 text-gray-300 dark:text-[#6e7681]" strokeWidth={2} />
            <span className="text-[11px] text-gray-400 dark:text-[#6e7681]">
              {factor.dataSource}
              {factor.dataUncertain && (
                <span className="ml-1 text-[#F59E0B]">{t("report.riskAnalysis.uncertain")}</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportRiskAnalysis({ section }) {
  const { t } = useTranslation();
  const data = parseSectionData(section);

  if (!data) {
    return (
      <div
        id="section-RISK_ANALYSIS"
        className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 text-center"
      >
        <Activity className="w-10 h-10 text-gray-300 dark:text-[#30363d] mx-auto mb-3" />
        <p className="text-[13px] text-gray-400 dark:text-[#6e7681]">
          {t("report.riskAnalysis.unavailable")}
        </p>
      </div>
    );
  }

  const factors = data.factors ?? [];
  const overallColor = getRiskColor(data.overallLevel);
  const sortedFactors = factors.slice().sort((a, b) => b.score - a.score);

  return (
    <div
      id="section-RISK_ANALYSIS"
      className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-gray-100 dark:border-[#30363d]">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
            {t("report.riskAnalysis.eyebrow")}
          </p>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
            {t("report.riskAnalysis.title")}
          </h2>
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{
                color: overallColor.text,
                backgroundColor: overallColor.bg,
                borderColor: overallColor.border,
              }}
            >
              {t("report.riskAnalysis.overallPill", {
                score: Math.round(data.overallScore),
                level: data.overallLevel,
              })}
            </span>
          </div>
        </div>
      </div>

      {data.dataIncomplete && (
        <div className="mx-6 mt-5 flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" strokeWidth={2} />
          <p className="text-[13px] text-amber-700 dark:text-amber-400">
            {t("report.riskAnalysis.dataIncomplete")}
            {data.unavailableProviderCount > 0 &&
              ` ${t("report.riskAnalysis.unavailableProviders", { count: data.unavailableProviderCount })}`}
          </p>
        </div>
      )}

      <div className="p-6 space-y-4">
        {sortedFactors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[13px] text-gray-400 dark:text-[#6e7681]">
              {t("report.riskAnalysis.empty")}
            </p>
          </div>
        ) : (
          sortedFactors.map((factor) => (
            <FactorCard key={factor.category} factor={factor} t={t} />
          ))
        )}
      </div>
    </div>
  );
}