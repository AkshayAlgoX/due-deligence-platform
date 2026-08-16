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

/**
 * Category color tokens — consistent across radar, contributors, factors.
 * Each entry: { solid, Icon }
 */
const CATEGORY_META = {
  FLOOD:         { solid: "#3B82F6", Icon: Droplets },
  LEGAL:         { solid: "#A855F7", Icon: Scale },
  TAX:           { solid: "#F59E0B", Icon: Receipt },
  ZONING:        { solid: "#6366F1", Icon: MapPin },
  ENVIRONMENTAL: { solid: "#22C55E", Icon: Leaf },
  MARKET:        { solid: "#F43F5E", Icon: TrendingUp },
};

export default function RiskFactorCard({ factor, defaultExpanded = false, index = 0 }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!factor) return null;

  const category = factor.category;
  const catMeta = CATEGORY_META[category] || { solid: "#7d8590", Icon: AlertTriangle };
  const Icon = catMeta.Icon;
  const catColor = catMeta.solid;

  const levelMeta = getRiskLevelMeta(factor.level);
  const scorePercent = Math.max(0, Math.min(100, factor.score || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="border-b border-gray-100 dark:border-[#21262d] last:border-b-0"
    >
      {/* ══════════════════════════════════════════════════════
          ROW HEADER
      ══════════════════════════════════════════════════════ */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-left py-4 -mx-6 px-6 group hover:bg-gray-50/60 dark:hover:bg-[#1c2128] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0d1117] rounded-xl"
        aria-expanded={expanded}
      >
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4">
          {/* ── Filled colored category tile ── */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${catColor}15`,
              boxShadow: `inset 0 0 0 1px ${catColor}30`,
            }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: catColor }}
              strokeWidth={2.25}
            />
          </div>

          {/* ── Name + weight pill + uncertain flag ── */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
                {t(`risk.categories.${category}`, category)}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tabular-nums bg-gray-100 dark:bg-[#1c2128] text-gray-500 dark:text-[#7d8590] border border-gray-200/70 dark:border-[#30363d]">
                {formatWeight(factor.weight)} {t("risk.factor.weightLabel", "weight")}
              </span>
              {factor.dataUncertain && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/25">
                  <AlertTriangle className="w-2.5 h-2.5" strokeWidth={2.5} />
                  {t("risk.factor.dataUncertain", "Data uncertain")}
                </span>
              )}
            </div>
          </div>

          {/* ── Inline gradient progress bar ── */}
          <div className="hidden sm:block w-40 md:w-56 lg:w-72 h-2 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: `linear-gradient(90deg, ${catColor}bb 0%, ${catColor} 100%)`,
                boxShadow: `0 0 10px ${catColor}55`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${scorePercent}%` }}
              transition={{ duration: 0.8, delay: index * 0.04 + 0.15, ease: "easeOut" }}
            >
              {/* Subtle shine sweep */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                }}
              />
            </motion.div>
          </div>

          {/* ── Score + tier ── */}
          <div className="text-right">
            <div
              className="text-lg font-black tabular-nums leading-none"
              style={{ color: levelMeta.solid }}
            >
              {formatScore(factor.score)}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest mt-1"
              style={{ color: levelMeta.solid, opacity: 0.75 }}
            >
              {t(`risk.levels.${factor.level}`, factor.level)}
            </div>
          </div>

          {/* ── Chevron ── */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#7d8590] group-hover:bg-white dark:group-hover:bg-[#30363d] group-hover:text-gray-700 dark:group-hover:text-[#e6edf3] transition-colors"
          >
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </motion.div>
        </div>
      </button>

      {/* ══════════════════════════════════════════════════════
          EXPANDABLE DETAIL
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pl-16 pr-4 pb-6 pt-1 space-y-4">
              {/* ── Analysis ── */}
              {factor.explanation && (
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-[#6e7681] mb-2">
                    {t("risk.factor.explanation", "Analysis")}
                  </div>
                 <p className="text-sm leading-relaxed text-gray-700 dark:text-[#c9d1d9] max-w-3xl">
  {factor.explanation}
</p>
                </div>
              )}

              {/* ── Recommendation callout ── */}
              {factor.recommendation && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-500/8 border border-blue-100 dark:border-blue-500/20">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.25)" }}
                  >
                    <Lightbulb
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                      strokeWidth={2.25}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-700 dark:text-blue-400 mb-1">
                      {t("risk.factor.recommendation", "Recommendation")}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-[#c9d1d9] max-w-3xl">
  {factor.recommendation}
</p>
                  </div>
                </div>
              )}

              {/* ── Data source chip ── */}
              {factor.dataSource && (
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-[#1c2128] border border-gray-200/70 dark:border-[#30363d]">
                    <Database
                      className="w-3 h-3 text-gray-400 dark:text-[#7d8590]"
                      strokeWidth={2}
                    />
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-[#7d8590]">
                      {t("risk.factor.dataSource", "Source")}:
                    </span>
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-[#c9d1d9]">
                      {factor.dataSource}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}