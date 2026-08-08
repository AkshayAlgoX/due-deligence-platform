// src/components/reports/KpiStatCard.jsx
// ---------------------------------------------------------------------------
// Redesigned KPI card — icon + label + big number + delta indicator
// Replaces the inline StatChip from page.jsx
// ---------------------------------------------------------------------------

"use client";

import { motion } from "framer-motion";

/**
 * @param {{
 *   label: string,
 *   value: number,
 *   icon: React.ComponentType<{ size?: number, strokeWidth?: number, className?: string }>,
 *   color?: "emerald"|"blue"|"amber"|"red"|"slate",
 *   delta?: number|null,       // +3 = "+3 this week ▲", -1 = "-1 this week ▼"
 *   deltaLabel?: string,       // defaults to "this week"
 *   isActive?: boolean,        // true when this card's filter is selected
 *   onClick?: () => void,
 * }} props
 */
export default function KpiStatCard({
  label,
  value,
  icon: Icon,
  color = "slate",
  delta = null,
  deltaLabel = "this week",
  isActive = false,
  onClick,
}) {
  const colorMap = {
    emerald: {
      icon: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      value: "text-emerald-400",
      activeBorder: "border-emerald-500/50",
      activeGlow: "shadow-emerald-500/10",
    },
    blue: {
      icon: "text-blue-400",
      iconBg: "bg-blue-500/10",
      value: "text-blue-400",
      activeBorder: "border-blue-500/50",
      activeGlow: "shadow-blue-500/10",
    },
    amber: {
      icon: "text-amber-400",
      iconBg: "bg-amber-500/10",
      value: "text-amber-400",
      activeBorder: "border-amber-500/50",
      activeGlow: "shadow-amber-500/10",
    },
    red: {
      icon: "text-red-400",
      iconBg: "bg-red-500/10",
      value: "text-red-400",
      activeBorder: "border-red-500/50",
      activeGlow: "shadow-red-500/10",
    },
    slate: {
      icon: "text-slate-400",
      iconBg: "bg-slate-700/40",
      value: "text-slate-100",
      activeBorder: "border-slate-500/50",
      activeGlow: "shadow-slate-500/10",
    },
  };

  const c = colorMap[color] ?? colorMap.slate;

  const deltaPositive = delta !== null && delta > 0;
  const deltaNeutral = delta === null || delta === 0;
  const deltaText = deltaNeutral
    ? null
    : `${deltaPositive ? "+" : ""}${delta} ${deltaLabel} ${deltaPositive ? "▲" : "▼"}`;

  const isClickable = typeof onClick === "function";

  return (
    <motion.div
      whileHover={isClickable ? { y: -1 } : undefined}
      transition={{ duration: 0.15 }}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => (e.key === "Enter" || e.key === " ") && onClick()
          : undefined
      }
      aria-pressed={isClickable ? isActive : undefined}
      className={`
        relative flex flex-col gap-3 p-4 rounded-xl border
        bg-white/[0.02] backdrop-blur-sm
        transition-all duration-200
        ${isClickable ? "cursor-pointer select-none" : ""}
        ${
          isActive
            ? `border-white/20 shadow-lg ${c.activeGlow}`
            : "border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04]"
        }
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
      `}
    >
      {/* Active indicator strip */}
      {isActive && (
        <div
          className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${c.activeBorder} bg-gradient-to-r from-transparent via-current to-transparent opacity-60`}
          aria-hidden="true"
        />
      )}

      {/* Top row — icon + label */}
      <div className="flex items-center gap-2.5">
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-lg ${c.iconBg} flex-shrink-0`}
          aria-hidden="true"
        >
          <Icon size={14} strokeWidth={1.75} className={c.icon} />
        </div>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider leading-none">
          {label}
        </span>
      </div>

      {/* Middle — big number */}
      <div className="flex items-end gap-2">
        <span
          className={`text-3xl font-bold leading-none tabular-nums tracking-tight ${c.value}`}
        >
          {value ?? 0}
        </span>
      </div>

      {/* Bottom — delta indicator */}
      <div className="h-4 flex items-center">
        {deltaText ? (
          <span
            className={`text-xs font-medium leading-none ${
              deltaPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {deltaText}
          </span>
        ) : (
          <span className="text-xs text-slate-600 leading-none">
            Last 7 days
          </span>
        )}
      </div>
    </motion.div>
  );
}