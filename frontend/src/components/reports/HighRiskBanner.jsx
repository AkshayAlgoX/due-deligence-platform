"use client";

import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { isCriticalRisk, isHighRisk } from "@/utils/riskUtils";

export default function HighRiskBanner({ score, level }) {
  const [dismissed, setDismissed] = useState(false);
  const value = level || score;

  if (dismissed || !isHighRisk(value)) return null;

  const critical = isCriticalRisk(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl border ${
        critical
          ? "border-red-500/40 bg-red-50 dark:bg-red-500/10"
          : "border-amber-500/40 bg-amber-50 dark:bg-amber-500/10"
      }`}
    >
      {/* Animated stripe */}
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className={`absolute top-0 left-0 h-[2px] w-1/3 ${
          critical
            ? "bg-gradient-to-r from-transparent via-red-500 to-transparent"
            : "bg-gradient-to-r from-transparent via-amber-500 to-transparent"
        }`}
      />

      <div className="flex items-start gap-3 px-5 py-4">
        <motion.div
          animate={
            critical
              ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.05, 1] }
              : { scale: [1, 1.05, 1] }
          }
          transition={{ duration: critical ? 0.6 : 1.5, repeat: Infinity, repeatDelay: 2 }}
          className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${
            critical
              ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
              : "bg-amber-500 text-white shadow-lg shadow-amber-500/40"
          }`}
        >
          {critical ? (
            <ShieldAlert className="h-5 w-5" strokeWidth={2.5} />
          ) : (
            <AlertTriangle className="h-5 w-5" strokeWidth={2.5} />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`text-sm font-bold uppercase tracking-wide ${
                critical
                  ? "text-red-800 dark:text-red-300"
                  : "text-amber-800 dark:text-amber-300"
              }`}
            >
              {critical ? "⚠ Critical Risk Detected" : "⚠ High Risk Detected"}
            </h3>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                critical
                  ? "bg-red-500 text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              Verify Before Proceeding
            </span>
          </div>
          <p
            className={`text-[13px] leading-relaxed ${
              critical
                ? "text-red-700 dark:text-red-200/90"
                : "text-amber-700 dark:text-amber-200/90"
            }`}
          >
            {critical
              ? "This property shows critical risk indicators. We strongly recommend a full legal review, independent inspection, and title verification before any transaction."
              : "This property has elevated risk factors that require careful evaluation. Review all risk categories below and verify key details with independent sources."}
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className={`flex-shrink-0 p-1 rounded-lg transition ${
            critical
              ? "text-red-500 hover:bg-red-500/10"
              : "text-amber-500 hover:bg-amber-500/10"
          }`}
          aria-label="Dismiss warning"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}