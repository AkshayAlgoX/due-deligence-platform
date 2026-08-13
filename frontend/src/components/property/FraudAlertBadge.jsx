"use client";

import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";
import { isHighRisk, isCriticalRisk, isLowRisk } from "@/utils/riskUtils";

/**
 * FraudAlertBadge — 10/10 iOS-tier animated risk indicator.
 *
 * Automatically picks the right visual based on risk:
 *  - CRITICAL: red pulsing shield with concentric rings + "CRITICAL RISK" label
 *  - HIGH:     amber pulsing warning + "HIGH RISK" label
 *  - LOW:      subtle green verified badge (optional, only if showVerified)
 *  - MEDIUM:   nothing (avoid visual noise)
 *
 * @param {number|string} score — number (0-100) or level string ("HIGH", etc.)
 * @param {"sm"|"md"|"lg"} size
 * @param {boolean} showVerified — show green badge for low risk
 * @param {boolean} iconOnly — hide the text label (for cards with limited space)
 */
export default function FraudAlertBadge({
  score,
  size = "md",
  showVerified = false,
  iconOnly = false,
}) {
  const critical = isCriticalRisk(score);
  const high = isHighRisk(score);
  const low = isLowRisk(score);

  // Nothing to show for medium risk (avoid clutter)
  if (!critical && !high && !(low && showVerified)) return null;

  // ── CRITICAL — red pulsing with concentric rings (iOS emergency style)
  if (critical) {
    return <CriticalBadge size={size} iconOnly={iconOnly} />;
  }

  // ── HIGH — amber pulsing warning
  if (high) {
    return <HighRiskBadge size={size} iconOnly={iconOnly} />;
  }

  // ── LOW — subtle green verified (optional)
  if (low && showVerified) {
    return <VerifiedBadge size={size} iconOnly={iconOnly} />;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// CRITICAL — pulsing red shield with concentric alert rings
// ─────────────────────────────────────────────────────────────
function CriticalBadge({ size, iconOnly }) {
  const dims = SIZE_MAP[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15, stiffness: 300 }}
      className={`relative inline-flex items-center gap-1.5 ${
        iconOnly ? "" : `${dims.padX} ${dims.padY}`
      } rounded-full bg-red-500 dark:bg-red-500/95 text-white shadow-lg shadow-red-500/40`}
      title="CRITICAL RISK — Fraud alert"
    >
      {/* Concentric ping rings — iOS emergency style */}
      <span className="absolute inset-0 -z-10 flex items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-red-500 opacity-40" />
        <span
          className="absolute h-full w-full animate-ping rounded-full bg-red-500 opacity-30"
          style={{ animationDelay: "0.75s" }}
        />
      </span>

      <motion.div
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      >
        <ShieldAlert size={dims.icon} strokeWidth={2.5} />
      </motion.div>

      {!iconOnly && (
        <span className={`font-bold uppercase tracking-wider ${dims.text}`}>
          Critical Risk
        </span>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// HIGH — amber pulsing warning
// ─────────────────────────────────────────────────────────────
function HighRiskBadge({ size, iconOnly }) {
  const dims = SIZE_MAP[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`relative inline-flex items-center gap-1.5 ${
        iconOnly ? "" : `${dims.padX} ${dims.padY}`
      } rounded-full bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-400`}
      title="HIGH RISK — Extra verification needed"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
      </span>

      <AlertTriangle size={dims.icon} strokeWidth={2.5} />

      {!iconOnly && (
        <span className={`font-bold uppercase tracking-wider ${dims.text}`}>
          High Risk
        </span>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOW — subtle green verified check
// ─────────────────────────────────────────────────────────────
function VerifiedBadge({ size, iconOnly }) {
  const dims = SIZE_MAP[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-1 ${
        iconOnly ? "" : `${dims.padX} ${dims.padY}`
      } rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400`}
      title="Low risk — verified"
    >
      <ShieldCheck size={dims.icon} strokeWidth={2.5} />
      {!iconOnly && (
        <span className={`font-semibold ${dims.text}`}>Verified</span>
      )}
    </motion.div>
  );
}

const SIZE_MAP = {
  sm: { icon: 11, padX: "px-2", padY: "py-0.5", text: "text-[10px]" },
  md: { icon: 13, padX: "px-2.5", padY: "py-1", text: "text-[11px]" },
  lg: { icon: 16, padX: "px-3", padY: "py-1.5", text: "text-[12px]" },
};