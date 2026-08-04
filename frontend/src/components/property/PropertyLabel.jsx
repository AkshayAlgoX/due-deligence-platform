"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { getLabelConfig } from "@/utils/labelUtils";

/**
 * Single Label Chip - Zillow/Redfin grade
 * Sizes: sm | md | lg
 */
export default function PropertyLabel({
  type,
  size = "md",
  showIcon = true,
  className = "",
}) {
  const { t } = useTranslation();
  const config = getLabelConfig(type);

  if (!config) return null;

  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`
        inline-flex items-center rounded-full font-bold uppercase tracking-wide
        shadow-lg ${config.glow}
        ring-1 ${config.ring}
        ${config.bg} ${config.text}
        ${sizeClasses[size]}
        ${config.animate ? "animate-pulse" : ""}
        ${className}
      `}
      title={t(`labels.${type}`)}
    >
      {showIcon && Icon && <Icon size={iconSizes[size]} strokeWidth={2.5} />}
      <span>{t(`labels.${type}`)}</span>
    </motion.div>
  );
}