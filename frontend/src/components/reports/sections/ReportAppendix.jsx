"use client";

import { useTranslation } from "react-i18next";
import { BookOpen, Database, Clock, Scale } from "lucide-react";

const CATEGORY_WEIGHTS = [
  { labelKey: "report.appendix.categoryLabels.flood", weight: 25, weightStr: "25%" },
  { labelKey: "report.appendix.categoryLabels.legal", weight: 20, weightStr: "20%" },
  { labelKey: "report.appendix.categoryLabels.tax", weight: 15, weightStr: "15%" },
  { labelKey: "report.appendix.categoryLabels.zoning", weight: 15, weightStr: "15%" },
  { labelKey: "report.appendix.categoryLabels.environmental", weight: 15, weightStr: "15%" },
  { labelKey: "report.appendix.categoryLabels.market", weight: 10, weightStr: "10%" },
];

const RISK_LEVELS = [
  { range: "0 – 25", level: "LOW", color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  { range: "26 – 50", level: "MEDIUM", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { range: "51 – 75", level: "HIGH", color: "#F97316", bg: "rgba(249,115,22,0.1)" },
  { range: "76 – 100", level: "CRITICAL", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
];

function DataSourceRow({ name, status, t }) {
  const isLive = status === "LIVE";
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-[#30363d]/50 last:border-0">
      <span className="text-[13px] text-gray-600 dark:text-[#7d8590] capitalize">
        {name}
      </span>
      <div className="flex items-center gap-1.5">
        {isLive ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[11px] font-bold text-[#22C55E]">
              {t("report.financial.source.live")}
            </span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-[#6e7681]" />
            <span className="text-[11px] font-bold text-gray-400 dark:text-[#6e7681]">
              {t("report.financial.source.mock")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReportAppendix({ section, report }) {
  const { t } = useTranslation();
  const content = section?.content || "";

  const dataSourceLines = content
    .split("\n")
    .filter(
      (line) =>
        line.trim().startsWith("*") &&
        (line.includes("MOCK") || line.includes("LIVE"))
    )
    .map((line) => {
      const isLive = line.includes("LIVE");
      const nameMatch = line.match(/^\s*\*\s+([^:]+):/);
      return nameMatch
        ? { name: nameMatch[1].trim(), status: isLive ? "LIVE" : "MOCK" }
        : null;
    })
    .filter(Boolean);

  const durationMatch = content.match(/(\d+)ms/);
  const fetchDuration = durationMatch ? durationMatch[1] : null;

  return (
    <div
      id="section-APPENDIX"
      className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-gray-100 dark:border-[#30363d]">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
            {t("report.appendix.eyebrow")}
          </p>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
          {t("report.appendix.title")}
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {dataSourceLines.length > 0 && (
          <div className="rounded-xl border border-gray-100 dark:border-[#30363d] overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/60 dark:bg-[#21262d]/40 border-b border-gray-100 dark:border-[#30363d]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                    {t("report.appendix.dataSources")}
                  </span>
                </div>
                {fetchDuration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-gray-400 dark:text-[#6e7681]" strokeWidth={2} />
                    <span className="text-[11px] text-gray-400 dark:text-[#6e7681]">
                      {t("report.appendix.fetchedIn", { ms: fetchDuration })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="px-4 py-1">
              {dataSourceLines.map((ds, i) => (
                <DataSourceRow key={i} name={ds.name} status={ds.status} t={t} />
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-100 dark:border-[#30363d] overflow-hidden">
          <div className="px-4 py-3 bg-gray-50/60 dark:bg-[#21262d]/40 border-b border-gray-100 dark:border-[#30363d]">
            <div className="flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                {t("report.appendix.methodology")}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[13px] text-gray-600 dark:text-[#7d8590] leading-relaxed">
              {t("report.appendix.methodologyIntro")}
            </p>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-2">
                {t("report.appendix.categoryWeights")}
              </p>
              <div className="space-y-1.5">
                {CATEGORY_WEIGHTS.map((cw) => (
                  <div key={cw.labelKey} className="flex items-center gap-3">
                    <span className="text-[13px] text-gray-600 dark:text-[#7d8590] w-28">
                      {t(cw.labelKey)}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-[#21262d]">
                      <div
                        className="h-full rounded-full bg-gray-400 dark:bg-[#6e7681]"
                        style={{ width: cw.weightStr }}
                      />
                    </div>
                    <span className="text-[13px] font-bold text-gray-700 dark:text-[#e6edf3] w-8 text-right">
                      {cw.weightStr}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-2">
                {t("report.appendix.thresholds")}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RISK_LEVELS.map((rl) => (
                  <div
                    key={rl.level}
                    className="rounded-lg border px-3 py-2.5 text-center"
                    style={{ borderColor: `${rl.color}33`, backgroundColor: rl.bg }}
                  >
                    <p
                      className="text-[11px] font-black uppercase tracking-widest mb-0.5"
                      style={{ color: rl.color }}
                    >
                      {rl.level}
                    </p>
                    <p className="text-[12px] font-semibold text-gray-600 dark:text-[#7d8590]">
                      {rl.range}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[12px] text-gray-400 dark:text-[#6e7681] leading-relaxed">
              {t("report.appendix.uncertaintyNote")}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-100 dark:border-amber-900/20 bg-amber-50/40 dark:bg-amber-900/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
            {t("report.appendix.disclaimer")}
          </p>
          <p className="text-[13px] text-gray-600 dark:text-[#7d8590] leading-relaxed">
            {t("report.appendix.disclaimerBody")}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-[#30363d]">
          <div className="flex items-center gap-4 text-[11px] text-gray-400 dark:text-[#6e7681]">
            {report?.id && <span>#{report.id}</span>}
            {report?.version && <span>v{report.version}</span>}
            {report?.generatedByEmail && <span>{report.generatedByEmail}</span>}
          </div>
          <span className="text-[11px] font-semibold text-gray-400 dark:text-[#6e7681]">
            {t("report.cover.brand")}
          </span>
        </div>
      </div>
    </div>
  );
}