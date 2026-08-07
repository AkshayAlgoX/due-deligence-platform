"use client";

import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * RiskHistoryEmpty — Empty state for risk history section.
 *
 * Shown when a property has never been assessed OR only has 1 assessment
 * (no history to display). Encourages user to trigger recalculation.
 *
 * Design inspired by: Linear empty states, Vercel "no deployments" screens.
 */
export default function RiskHistoryEmpty({ onRecalculate, recalculating }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-12"
    >
      <div className="flex flex-col items-center text-center max-w-sm mx-auto">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] flex items-center justify-center mb-5">
          <Clock
            className="w-6 h-6 text-gray-400 dark:text-[#7d8590]"
            strokeWidth={1.75}
          />
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-[#e6edf3] mb-2">
          {t("risk.history.emptyTitle", "No history yet")}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-[#7d8590] leading-relaxed mb-6">
          {t(
            "risk.history.emptyDescription",
            "Risk history will appear here after multiple assessments. Recalculate to track score changes over time."
          )}
        </p>

        {/* CTA */}
        {onRecalculate && (
          <button
            onClick={onRecalculate}
            disabled={recalculating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.25} />
            {recalculating
              ? t("risk.history.recalculating", "Recalculating…")
              : t("risk.history.recalculateCta", "Recalculate risk")}
          </button>
        )}
      </div>
    </motion.div>
  );
}