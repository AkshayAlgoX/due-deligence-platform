"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ListChecks,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
} from "lucide-react";
import { getDashboardRecommendations } from "@/services/dashboardService";

const DISMISS_KEY = "dd_dismissed_recommendations";
const MAX_VISIBLE = 5;

// ── Severity → visual mapping ─────────────────────────────────
// Returns visual props only; label is looked up via t() at render time
// so we don't call t() outside a component.
function getSeverityVisuals(severity) {
  switch (severity) {
    case "HIGH":
      return {
        dot: "bg-red-500",
        labelKey: "recommendations.severity.urgent",
        labelColor: "text-red-600 dark:text-red-400",
      };
    case "MEDIUM":
      return {
        dot: "bg-amber-500",
        labelKey: "recommendations.severity.action",
        labelColor: "text-amber-700 dark:text-amber-400",
      };
    case "POSITIVE":
      return {
        dot: "bg-[#22C55E]",
        labelKey: "recommendations.severity.onTrack",
        labelColor: "text-[#16a34a] dark:text-green-400",
      };
    case "LOW":
    default:
      return {
        dot: "bg-gray-300 dark:bg-[#6e7681]",
        labelKey: "recommendations.severity.tip",
        labelColor: "text-gray-500 dark:text-[#7d8590]",
      };
  }
}

// ── Skeleton ─────────────────────────────────────────────────
function RecommendationsSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#30363d] p-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-100 dark:bg-[#1c2128]" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 animate-pulse rounded bg-gray-100 dark:bg-[#1c2128]" />
            <div className="h-3 w-40 animate-pulse rounded bg-gray-100 dark:bg-[#1c2128]" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-[#30363d]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-5">
            <div className="flex items-start gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-[#30363d]" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-48 rounded bg-gray-100 dark:bg-[#1c2128]" />
                <div className="h-3 w-64 rounded bg-gray-100 dark:bg-[#1c2128]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationRow({ rec, onDismiss }) {
  const router = useRouter();
  const { t } = useTranslation();
  const cfg = getSeverityVisuals(rec.severity);

  return (
    <div className="group relative flex items-start gap-3 px-6 py-4 transition-colors hover:bg-gray-50/60 dark:hover:bg-[#1c2128]">
      <span
        className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${cfg.dot}`}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">
            {rec.titleKey ? t(rec.titleKey, rec.titleParams ?? {}) : ""}
          </p>
          <span
            className={`text-[10px] font-bold uppercase tracking-wide ${cfg.labelColor}`}
          >
            {t(cfg.labelKey)}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-[#7d8590]">
          {rec.descriptionKey ? t(rec.descriptionKey, rec.descriptionParams ?? {}) : ""}
        </p>

        {rec.actionUrl && rec.actionLabelKey && (
          <button
            onClick={() => router.push(rec.actionUrl)}
            className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#16a34a] dark:text-green-400 transition-all hover:gap-1.5"
          >
            {t(rec.actionLabelKey)}
            <ArrowRight size={11} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {rec.severity !== "POSITIVE" && (
        <button
          onClick={() => onDismiss(rec.type)}
          className="flex-shrink-0 rounded-md p-1 text-gray-300 dark:text-[#6e7681] opacity-0 transition-all hover:bg-white dark:hover:bg-[#0d1117] hover:text-gray-500 dark:hover:text-[#e6edf3] group-hover:opacity-100"
          aria-label={t("recommendations.dismiss")}
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function RecommendationsPanel({ refreshKey }) {
  const { t } = useTranslation();
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [dismissed, setDismissed] = useState([]);
  const [expanded, setExpanded]   = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISS_KEY);
      setDismissed(stored ? JSON.parse(stored) : []);
    } catch {
      setDismissed([]);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDashboardRecommendations();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleDismiss = (type) => {
    const next = [...dismissed, type];
    setDismissed(next);
    try {
      localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
    } catch {}
  };

  const visible = items.filter((r) => !dismissed.includes(r.type));
  const shown   = expanded ? visible : visible.slice(0, MAX_VISIBLE);
  const hasMore = visible.length > MAX_VISIBLE;

  if (loading) return <RecommendationsSkeleton />;
  if (visible.length === 0) return null;

  const urgentCount = visible.filter((r) => r.severity === "HIGH").length;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#30363d] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818]">
            <ListChecks className="h-4 w-4 text-[#16a34a] dark:text-green-400" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
              {t("recommendations.title")}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-[#7d8590]">
              {t("recommendations.actionsCount", { count: visible.length })}
            </p>
          </div>
        </div>

        {urgentCount > 0 && (
          <span className="rounded-full bg-red-50 dark:bg-[#2d1214] px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400">
            {t("recommendations.urgentCount", { count: urgentCount })}
          </span>
        )}
      </div>

      <div className="divide-y divide-gray-50 dark:divide-[#30363d]">
        {shown.map((rec) => (
          <RecommendationRow
            key={rec.type}
            rec={rec}
            onDismiss={handleDismiss}
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-gray-100 dark:border-[#30363d] bg-gray-50/40 dark:bg-[#0d1117] py-3 text-xs font-semibold text-gray-500 dark:text-[#7d8590] transition-all hover:bg-gray-50 dark:hover:bg-[#1c2128] hover:text-gray-700 dark:hover:text-[#e6edf3]"
        >
          {expanded ? (
            <>
              <ChevronUp size={13} strokeWidth={2.5} />
              {t("recommendations.showLess")}
            </>
          ) : (
            <>
              <ChevronDown size={13} strokeWidth={2.5} />
              {t("recommendations.showMore", { count: visible.length - MAX_VISIBLE })}
            </>
          )}
        </button>
      )}
    </div>
  );
}