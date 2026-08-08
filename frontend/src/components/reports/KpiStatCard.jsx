// src/components/reports/KpiStatCard.jsx
// Premium filled icon tiles — matches Export History EXCEL/PDF badge DNA

"use client";

import { motion } from "framer-motion";

const COLOR_MAP = {
  slate: {
    // Neutral — subtle grey (Total)
    iconBg: "bg-gray-100 dark:bg-[#1c2128]",
    iconBorder: "border-gray-200 dark:border-[#30363d]",
    iconText: "text-gray-600 dark:text-[#7d8590]",
    valueText: "text-gray-900 dark:text-[#e6edf3]",
    activeBorder: "border-gray-400 dark:border-[#7d8590]",
  },
  emerald: {
    // Green filled — like EXCEL badge
    iconBg: "bg-[#dcfce7] dark:bg-green-500/[0.15]",
    iconBorder: "border-[#22C55E]/40 dark:border-green-400/40",
    iconText: "text-[#16a34a] dark:text-green-400",
    valueText: "text-[#16a34a] dark:text-green-400",
    activeBorder: "border-[#22C55E]/60 dark:border-green-400/60",
  },
  blue: {
    // Blue filled — matching the same DNA
    iconBg: "bg-blue-100 dark:bg-blue-500/[0.15]",
    iconBorder: "border-blue-500/40 dark:border-blue-400/40",
    iconText: "text-blue-600 dark:text-blue-400",
    valueText: "text-blue-600 dark:text-blue-400",
    activeBorder: "border-blue-500/60 dark:border-blue-400/60",
  },
  red: {
    // Red filled — like PDF badge
    iconBg: "bg-red-100 dark:bg-red-500/[0.15]",
    iconBorder: "border-red-500/40 dark:border-red-400/40",
    iconText: "text-red-600 dark:text-red-400",
    valueText: "text-red-600 dark:text-red-400",
    activeBorder: "border-red-500/60 dark:border-red-400/60",
  },
};

export default function KpiStatCard({
  label,
  value,
  icon: Icon,
  color = "slate",
  onClick,
  isActive = false,
  delta,
}) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.slate;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={[
        "group relative flex flex-col items-start justify-between gap-2 w-full min-h-[116px] px-4 py-3.5 rounded-2xl border text-left transition-all duration-200 shadow-sm",
        "bg-white dark:bg-[#161b22]",
        "hover:bg-gray-50 dark:hover:bg-[#1c2128]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/50",
        isActive
          ? `${c.activeBorder} shadow-md`
          : "border-gray-100 dark:border-[#30363d] hover:border-gray-200 dark:hover:border-[#3a424c]",
      ].join(" ")}
      aria-pressed={isActive}
      aria-label={`Filter by ${label}: ${value}`}
    >
      {/* Row 1: filled icon tile + label */}
      <div className="flex items-center gap-2.5 w-full">
        {Icon && (
          <div
            className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl border ${c.iconBg} ${c.iconBorder}`}
            aria-hidden="true"
          >
            <Icon
              size={16}
              strokeWidth={2.25}
              className={`${c.iconText} ${color === "blue" && label === "In Progress" ? "animate-spin" : ""}`}
            />
          </div>
        )}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">
          {label}
        </span>
      </div>

      {/* Row 2: big value + sub-label */}
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-baseline gap-2">
          <span className={`text-[30px] font-bold tabular-nums leading-none ${c.valueText}`}>
            {value ?? 0}
          </span>
          {delta && (
            <span className="text-[11px] font-medium text-gray-500 dark:text-[#7d8590]">
              {delta}
            </span>
          )}
        </div>
        <span className="text-[11px] text-gray-400 dark:text-[#6e7681]">
          Last 7 days
        </span>
      </div>
    </motion.button>
  );
}