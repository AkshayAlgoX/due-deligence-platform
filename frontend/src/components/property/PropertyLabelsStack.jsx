"use client";

import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import PropertyLabel from "./PropertyLabel";
import { MAX_VISIBLE_LABELS } from "@/constants/labels";

/**
 * Stacked labels for property cards.
 * Shows top N, then "+N more" if overflow.
 *
 * Props:
 * - labels: array of { type, source, ... }
 * - size: 'sm' | 'md' | 'lg'
 * - maxVisible: number (default 2)
 * - position: 'top-left' | 'top-right' | 'inline'
 */
export default function PropertyLabelsStack({
  labels = [],
  size = "md",
  maxVisible = MAX_VISIBLE_LABELS,
  position = "top-left",
  className = "",
}) {
  const { t } = useTranslation();

  if (!labels || labels.length === 0) return null;

  const visible = labels.slice(0, maxVisible);
  const overflowCount = labels.length - maxVisible;

  const positionClasses = {
    "top-left": "absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5",
    "top-right": "absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5",
    inline: "flex flex-wrap items-center gap-1.5",
  };

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <AnimatePresence mode="popLayout">
        {visible.map((label) => (
          <PropertyLabel
            key={`${label.id ?? label.type}`}
            type={label.type}
            size={size}
          />
        ))}
        {overflowCount > 0 && (
          <motion.div
            key="overflow"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="
              inline-flex items-center rounded-full px-2 py-0.5
              text-[10px] font-bold uppercase tracking-wide
              bg-gray-900/80 text-white
              dark:bg-white/90 dark:text-gray-900
              backdrop-blur-sm shadow-md
            "
            title={t("labels.moreCount", { count: overflowCount })}
          >
            +{overflowCount}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}