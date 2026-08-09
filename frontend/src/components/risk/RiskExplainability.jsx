// frontend/src/components/risk/RiskExplainability.jsx
"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Droplets,
  Info,
  Leaf,
  MapPin,
  Receipt,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { CATEGORY_META, getRiskLevelMeta } from "@/utils/riskUtils";

/**
 * Category color tokens — LOCKED, must match:
 *   - RiskFactorCard
 *   - RiskHistoryTimeline
 *   - RiskBreakdownRadar (indirect)
 *   - page.jsx CATEGORY_COLORS
 */
const CATEGORY_TOKENS = {
  FLOOD:         { Icon: Droplets,    color: "#3B82F6" },
  LEGAL:         { Icon: Scale,       color: "#A855F7" },
  TAX:           { Icon: Receipt,     color: "#F59E0B" },
  ZONING:        { Icon: MapPin,      color: "#6366F1" },
  ENVIRONMENTAL: { Icon: Leaf,        color: "#22C55E" },
  MARKET:        { Icon: TrendingUp,  color: "#F43F5E" },
};

export default function RiskExplainability() {
  const { t } = useTranslation();

  const categories = [
    { key: "FLOOD", weight: CATEGORY_META.FLOOD.weight },
    { key: "LEGAL", weight: CATEGORY_META.LEGAL.weight },
    { key: "TAX", weight: CATEGORY_META.TAX.weight },
    { key: "ZONING", weight: CATEGORY_META.ZONING.weight },
    { key: "ENVIRONMENTAL", weight: CATEGORY_META.ENVIRONMENTAL.weight },
    { key: "MARKET", weight: CATEGORY_META.MARKET.weight },
  ];

  const levels = [
    { key: "LOW", range: "0–25", Icon: ShieldCheck },
    { key: "MEDIUM", range: "26–50", Icon: Shield },
    { key: "HIGH", range: "51–75", Icon: ShieldAlert },
    { key: "CRITICAL", range: "76–100", Icon: ShieldX },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Gradient accent bar at top */}
      <div className="h-1 bg-gradient-to-r from-[#22C55E] via-[#3B82F6] to-[#A855F7]" />

      {/* ══════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-[#21262d]">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "#22C55E18",
              boxShadow: "inset 0 0 0 1px #22C55E35",
            }}
          >
            <BookOpen
              className="w-5 h-5 text-[#22C55E] dark:text-green-400"
              strokeWidth={2.25}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight">
              {t("risk.explain.title", "How Risk Scoring Works")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-[#7d8590] mt-0.5">
              {t(
                "risk.explain.subtitle",
                "Transparent, rule-based scoring — no black-box AI"
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* ══════════════════════════════════════════════════════
            SECTION — How it works
        ══════════════════════════════════════════════════════ */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-[#6e7681] mb-3">
            {t(
              "risk.explain.howItWorks",
              "How the Overall Score Is Calculated"
            )}
          </h3>
          <p className="text-[15px] leading-relaxed text-gray-700 dark:text-[#c9d1d9] max-w-3xl">
            {t(
              "risk.explain.description",
              "Each property is analyzed across 6 categories. Each category gets a score from 0–100 (higher = more risk). The overall score is a weighted sum — categories with more weight (like Flood at 25%) impact the final score more."
            )}
          </p>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION — Category weights
        ══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-[#6e7681]">
              {t("risk.explain.categoryWeights", "Category Weights")}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-gray-600 dark:text-[#c9d1d9] bg-gray-50 dark:bg-[#1c2128] border border-gray-200/70 dark:border-[#30363d]">
              {t("risk.explain.totalWeight", "Total: 100%")}
            </span>
          </div>

          <div className="space-y-2">
            {categories.map((cat, idx) => {
              const token = CATEGORY_TOKENS[cat.key];
              const Icon = token.Icon;
              const color = token.color;
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.04 }}
                  className="grid grid-cols-[auto_130px_1fr_56px] items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1c2128] transition-colors"
                >
                  {/* Filled colored tile — matches all other components */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${color}15`,
                      boxShadow: `inset 0 0 0 1px ${color}30`,
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color }}
                      strokeWidth={2.25}
                    />
                  </div>

                  {/* Category name */}
                  <span className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">
                    {t(`risk.categories.${cat.key}`, cat.key)}
                  </span>

                  {/* Gradient bar with glow */}
                  <div className="h-2 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, ${color}bb 0%, ${color} 100%)`,
                        boxShadow: `0 0 10px ${color}55`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.weight * 100}%` }}
                      transition={{
                        delay: 0.3 + idx * 0.04,
                        duration: 0.7,
                        ease: "easeOut",
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-40"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Percentage */}
                  <span className="text-sm font-black tabular-nums text-right"
                    style={{ color }}
                  >
                    {Math.round(cat.weight * 100)}%
                  </span>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION — Risk levels
        ══════════════════════════════════════════════════════ */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-[#6e7681] mb-4">
            {t("risk.explain.levelThresholds", "Risk Levels")}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {levels.map(({ key, range, Icon }) => {
              const meta = getRiskLevelMeta(key);
              return (
                <div
                  key={key}
                  className="relative overflow-hidden rounded-xl border transition-all hover:shadow-md"
                  style={{
                    borderColor: `${meta.solid}30`,
                    background: `linear-gradient(135deg, ${meta.solid}0d, ${meta.solid}04)`,
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${meta.solid}18`,
                          boxShadow: `inset 0 0 0 1px ${meta.solid}35`,
                        }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: meta.solid }}
                          strokeWidth={2.5}
                        />
                      </div>
                      <span
                        className="text-[10px] font-black uppercase tracking-widest tabular-nums px-2 py-0.5 rounded-md"
                        style={{
                          color: meta.solid,
                          backgroundColor: `${meta.solid}12`,
                        }}
                      >
                        {range}
                      </span>
                    </div>
                    <div
                      className="text-base font-black uppercase tracking-wider"
                      style={{ color: meta.solid }}
                    >
                      {t(`risk.levels.${key}`, key)}
                    </div>
                  </div>
                  {/* Accent bar at bottom */}
                  <div
                    className="h-1"
                    style={{ backgroundColor: meta.solid }}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION — Data honesty callout
        ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-xl border border-blue-200 dark:border-blue-500/25 bg-gradient-to-br from-blue-50/70 to-blue-50/20 dark:from-blue-500/[0.06] dark:to-blue-500/[0.02] p-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "#3B82F618",
                boxShadow: "inset 0 0 0 1px #3B82F635",
              }}
            >
              <Info
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                strokeWidth={2.25}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3] mb-1">
                {t("risk.explain.dataHonesty.title", "About Data Sources")}
              </h4>
              <p className="text-[13px] leading-relaxed text-gray-700 dark:text-[#c9d1d9] max-w-3xl">
                {t(
                  "risk.explain.dataHonesty.body",
                  "When a data source is unavailable, we apply an uncertainty penalty rather than assume zero risk. Missing information is itself a risk factor — we won't hide that from you."
                )}
              </p>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}