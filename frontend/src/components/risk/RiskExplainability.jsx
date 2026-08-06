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

const CATEGORY_ICONS = {
  FLOOD: Droplets,
  LEGAL: Scale,
  TAX: Receipt,
  ZONING: MapPin,
  ENVIRONMENTAL: Leaf,
  MARKET: TrendingUp,
};

export default function RiskExplainability() {
  const { t } = useTranslation();

  const categories = [
    { key: "FLOOD", weight: CATEGORY_META.FLOOD.weight, accent: CATEGORY_META.FLOOD.accent },
    { key: "LEGAL", weight: CATEGORY_META.LEGAL.weight, accent: CATEGORY_META.LEGAL.accent },
    { key: "TAX", weight: CATEGORY_META.TAX.weight, accent: CATEGORY_META.TAX.accent },
    { key: "ZONING", weight: CATEGORY_META.ZONING.weight, accent: CATEGORY_META.ZONING.accent },
    { key: "ENVIRONMENTAL", weight: CATEGORY_META.ENVIRONMENTAL.weight, accent: CATEGORY_META.ENVIRONMENTAL.accent },
    { key: "MARKET", weight: CATEGORY_META.MARKET.weight, accent: CATEGORY_META.MARKET.accent },
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
      className="relative bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl overflow-hidden"
    >
      {/* Gradient accent bar at top */}
      <div className="h-1 bg-gradient-to-r from-brand-green via-blue-500 to-purple-500" />

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-[#30363d]">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-brand-green/10 to-blue-500/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-brand-green" strokeWidth={2.25} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight">
              {t("risk.explain.title", "How Risk Scoring Works")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-[#7d8590] mt-0.5">
              {t("risk.explain.subtitle", "Transparent, rule-based scoring — no black-box AI")}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* ── Section: How it works ────────────────────────── */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590] mb-3">
            {t("risk.explain.howItWorks", "How the Overall Score Is Calculated")}
          </h3>
          <p className="text-[15px] leading-relaxed text-gray-700 dark:text-[#c9d1d9]">
            {t(
              "risk.explain.description",
              "Each property is analyzed across 6 categories. Each category gets a score from 0–100 (higher = more risk). The overall score is a weighted sum — categories with more weight (like Flood at 25%) impact the final score more."
            )}
          </p>
        </section>

        {/* ── Category weights — RICH, colored icons with rich rows ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
              {t("risk.explain.categoryWeights", "Category Weights")}
            </h3>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-[#7d8590] bg-gray-100 dark:bg-[#21262d] px-2 py-0.5 rounded">
              {t("risk.explain.totalWeight", "Total: 100%")}
            </span>
          </div>

          <div className="space-y-2">
            {categories.map((cat, idx) => {
              const Icon = CATEGORY_ICONS[cat.key];
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.04 }}
                  className="grid grid-cols-[auto_120px_1fr_56px] items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1c2128] transition-colors"
                >
                  {/* Colored icon */}
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center"
                    style={{
                      backgroundColor: `${cat.accent}15`,
                      boxShadow: `inset 0 0 0 1px ${cat.accent}30`,
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: cat.accent }}
                      strokeWidth={2.25}
                    />
                  </div>

                  {/* Category name */}
                  <span className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">
                    {t(`risk.categories.${cat.key}`, cat.key)}
                  </span>

                  {/* Bar with colored fill */}
                  <div className="h-2 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: cat.accent,
                        boxShadow: `0 0 8px ${cat.accent}50`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.weight * 100}%` }}
                      transition={{ delay: 0.3 + idx * 0.04, duration: 0.7, ease: "easeOut" }}
                    />
                  </div>

                  {/* Percentage — big and bold */}
                  <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-[#e6edf3] text-right">
                    {Math.round(cat.weight * 100)}%
                  </span>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Risk levels — visually rich cards ─────────────── */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590] mb-4">
            {t("risk.explain.levelThresholds", "Risk Levels")}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {levels.map(({ key, range, Icon }) => {
              const meta = getRiskLevelMeta(key);
              return (
                <div
                  key={key}
                  className="relative overflow-hidden rounded-lg border transition-all hover:shadow-md"
                  style={{
                    borderColor: `${meta.solid}30`,
                    background: `linear-gradient(135deg, ${meta.solid}08, ${meta.solid}03)`,
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${meta.solid}18` }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: meta.solid }}
                          strokeWidth={2.5}
                        />
                      </div>
                      <span
                        className="text-[10px] font-black uppercase tracking-widest tabular-nums"
                        style={{ color: meta.solid }}
                      >
                        {range}
                      </span>
                    </div>
                    <div
                      className="text-base font-bold"
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

        {/* ── Data honesty — professional callout ───────────── */}
        <section className="relative overflow-hidden rounded-lg border border-blue-200 dark:border-blue-500/25 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-500/8 dark:to-blue-500/3 p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <Info
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                strokeWidth={2.25}
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3] mb-1">
                {t("risk.explain.dataHonesty.title", "About Data Sources")}
              </h4>
              <p className="text-[13px] leading-relaxed text-gray-700 dark:text-[#c9d1d9]">
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