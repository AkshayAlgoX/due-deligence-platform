"use client";

import { useTranslation } from "react-i18next";
import { Sparkles, CircleCheck, Circle } from "lucide-react";

const LEVEL_META = {
  VERY_SIMILAR: {
    key: "comparable.similarity.verySimilar",
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-[#0d2818]",
    ring: "ring-green-200 dark:ring-green-900/50",
    icon: Sparkles,
  },
  SIMILAR: {
    key: "comparable.similarity.similar",
    color: "text-[#16a34a] dark:text-green-400",
    bg: "bg-[#edf7f3] dark:bg-[#0d2818]",
    ring: "ring-green-100 dark:ring-green-900/30",
    icon: CircleCheck,
  },
  SOMEWHAT_SIMILAR: {
    key: "comparable.similarity.somewhatSimilar",
    color: "text-gray-600 dark:text-[#7d8590]",
    bg: "bg-gray-50 dark:bg-[#1c2128]",
    ring: "ring-gray-200 dark:ring-[#30363d]",
    icon: Circle,
  },
};

/** Small pill showing similarity level + numeric score (0-100). */
export default function SimilarityBadge({ level, score, size = "sm" }) {
  const { t } = useTranslation();
  const meta = LEVEL_META[level] ?? LEVEL_META.SOMEWHAT_SIMILAR;
  const Icon = meta.icon;
  const padding = size === "lg" ? "px-3 py-1.5 text-xs" : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${padding} ${meta.bg} ${meta.color} ring-1 ${meta.ring}`}
    >
      <Icon className={size === "lg" ? "h-3.5 w-3.5" : "h-2.5 w-2.5"} strokeWidth={2.5} />
      {t(meta.key)}
      {score != null && <span className="tabular-nums opacity-80">· {Math.round(score)}</span>}
    </span>
  );
}
