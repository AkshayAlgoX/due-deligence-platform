"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import RiskHistoryChart from "./RiskHistoryChart";
import RiskHistoryEmpty from "./RiskHistoryEmpty";
import RiskHistoryMetadata from "./RiskHistoryMetadata";
import RiskHistorySkeleton from "./RiskHistorySkeleton";
import RiskHistoryTimeline from "./RiskHistoryTimeline";

/**
 * RiskHistorySection — Full risk history experience.
 */
export default function RiskHistorySection({
  history,
  loading,
  onRecalculate,
  recalculating,
}) {
  const { t } = useTranslation();

  if (loading && !history) {
    return <RiskHistorySkeleton />;
  }

  const hasNoHistory =
    !history || !history.history || history.history.length === 0;

  if (hasNoHistory) {
    return (
      <section className="mb-8">
        <SectionHeader t={t} />
        <RiskHistoryEmpty
          onRecalculate={onRecalculate}
          recalculating={recalculating}
        />
      </section>
    );
  }

  const isSingleAssessment = history.history.length === 1;

  return (
    <section className="mb-8">
      <SectionHeader t={t} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        {/* Metadata KPI grid */}
        <RiskHistoryMetadata history={history} />

        {/* Chart — only if 2+ assessments */}
        {!isSingleAssessment && (
          <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-[#e6edf3]">
                {t("risk.history.chartTitle", "Risk Score Trend")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#7d8590] mt-0.5">
                {t(
                  "risk.history.chartSubtitle",
                  "Overall risk score across all assessments"
                )}
              </p>
            </div>
            <RiskHistoryChart history={history} />
          </div>
        )}

        {/* Timeline */}
        <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-[#21262d]">
            <h3 className="text-base font-bold text-gray-900 dark:text-[#e6edf3]">
              {t("risk.history.timelineTitle", "Assessment Timeline")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-[#7d8590] mt-0.5">
              {t(
                "risk.history.timelineSubtitle",
                "Every recalculation, newest first"
              )}
            </p>
          </div>
          <RiskHistoryTimeline history={history} />
        </div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   Section header with filled icon tile
   ══════════════════════════════════════════════════════════════ */

function SectionHeader({ t }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          backgroundColor: "#3B82F618",
          boxShadow: "inset 0 0 0 1px #3B82F635",
        }}
      >
        <TrendingUp
          className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400"
          strokeWidth={2.25}
        />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight">
          {t("risk.history.sectionTitle", "Risk History")}
        </h2>
        <p className="text-xs text-gray-500 dark:text-[#7d8590]">
          {t(
            "risk.history.sectionSubtitle",
            "Track how this property's risk profile has evolved"
          )}
        </p>
      </div>
    </div>
  );
}