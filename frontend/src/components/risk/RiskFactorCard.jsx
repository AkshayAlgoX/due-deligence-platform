// frontend/src/components/risk/RiskFactorCard.jsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  Database,
  Droplets,
  Leaf,
  Lightbulb,
  MapPin,
  Receipt,
  Scale,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { formatScore, formatWeight, getRiskLevelMeta } from "@/utils/riskUtils";

const CATEGORY_ICONS = {
  FLOOD: Droplets,
  LEGAL: Scale,
  TAX: Receipt,
  ZONING: MapPin,
  ENVIRONMENTAL: Leaf,
  MARKET: TrendingUp,
};

export default function RiskFactorCard({ factor, defaultExpanded = false, index = 0 }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!factor) return null;

  const category = factor.category;
  const meta = getRiskLevelMeta(factor.level);
  const Icon = CATEGORY_ICONS[category] || AlertTriangle;
  const scorePercent = Math.max(0, Math.min(100, factor.score || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="border-b border-gray-100 dark:border-[#21262d] last:border-b-0"
    >
      {/* ── Dense row header ────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-left py-4 px-1 group hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors -mx-6 px-6 focus:outline-none"
        aria-expanded={expanded}
      >
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4">
          {/* Icon dot */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${meta.solid}12` }}
          >
            <Icon className="w-4 h-4" style={{ color: meta.solid }} strokeWidth={2.25} />
          </div>

          {/* Name + weight */}
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">
                {t(`risk.categories.${category}`, category)}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-[#6e7681] tabular-nums">
                {formatWeight(factor.weight)}
              </span>
            </div>
            {factor.dataUncertain && (
              <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                <AlertTriangle className="w-2.5 h-2.5" strokeWidth={2.5} />
                <span>{t("risk.factor.dataUncertain", "Data uncertain")}</span>
              </div>
            )}
          </div>

          {/* Inline progress bar */}
          <div className="w-32 sm:w-48 md:w-64 h-1.5 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: meta.solid }}
              initial={{ width: 0 }}
              animate={{ width: `${scorePercent}%` }}
              transition={{ duration: 0.7, delay: index * 0.03 + 0.1, ease: "easeOut" }}
            />
          </div>

          {/* Score number */}
          <div className="text-right">
            <div
              className="text-lg font-bold tabular-nums leading-none"
              style={{ color: meta.solid }}
            >
              {formatScore(factor.score)}
            </div>
            <div className="text-[10px] text-gray-400 dark:text-[#6e7681] mt-0.5">
              /100
            </div>
          </div>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400 dark:text-[#7d8590] group-hover:text-gray-600 dark:group-hover:text-[#c9d1d9] transition-colors"
          >
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </motion.div>
        </div>
      </button>

      {/* ── Expandable detail ───────────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pl-12 pr-4 pb-5 space-y-4">
              {factor.explanation && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590] mb-1.5">
                    {t("risk.factor.explanation", "Analysis")}
                  </div>
                  <p className="text-[13px] leading-relaxed text-gray-700 dark:text-[#c9d1d9]">
                    {factor.explanation}
                  </p>
                </div>
              )}

              {factor.recommendation && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20">
                  <Lightbulb
                    className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                    strokeWidth={2.25}
                  />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 mb-1">
                      {t("risk.factor.recommendation", "Recommendation")}
                    </div>
                    <p className="text-[13px] leading-relaxed text-gray-700 dark:text-[#c9d1d9]">
                      {factor.recommendation}
                    </p>
                  </div>
                </div>
              )}

              {factor.dataSource && (
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-[#7d8590]">
                  <Database className="w-3 h-3" strokeWidth={2} />
                  <span>{t("risk.factor.dataSource", "Source")}:</span>
                  <span className="font-mono text-gray-700 dark:text-[#c9d1d9]">
                    {factor.dataSource}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}