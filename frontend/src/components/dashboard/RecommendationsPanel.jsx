"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
   ListChecks,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { getDashboardRecommendations } from "@/services/dashboardService";

const DISMISS_KEY = "dd_dismissed_recommendations";
const MAX_VISIBLE = 5;

// ── Severity → visual mapping (subtle, one accent) ────────────
function getSeverityConfig(severity) {
  switch (severity) {
    case "HIGH":
      return { dot: "bg-red-500",   label: "Urgent",   labelColor: "text-red-600"   };
    case "MEDIUM":
      return { dot: "bg-amber-500", label: "Action",   labelColor: "text-amber-700" };
    case "POSITIVE":
      return { dot: "bg-[#22C55E]", label: "On track", labelColor: "text-[#16a34a]" };
    case "LOW":
    default:
      return { dot: "bg-gray-300",  label: "Tip",      labelColor: "text-gray-500"  };
  }
}

// ── Skeleton ─────────────────────────────────────────────────
function RecommendationsSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-100" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-5">
            <div className="flex items-start gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-48 rounded bg-gray-100" />
                <div className="h-3 w-64 rounded bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Single row ───────────────────────────────────────────────
function RecommendationRow({ rec, onDismiss }) {
  const router = useRouter();
  const cfg = getSeverityConfig(rec.severity);

  return (
    <div className="group relative flex items-start gap-3 px-6 py-4 transition-colors hover:bg-gray-50/60">
      {/* Small colored dot — the only color on the row */}
      <span
        className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${cfg.dot}`}
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{rec.title}</p>
          <span
            className={`text-[10px] font-bold uppercase tracking-wide ${cfg.labelColor}`}
          >
            {cfg.label}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          {rec.description}
        </p>

        {rec.actionUrl && rec.actionLabel && (
          <button
            onClick={() => router.push(rec.actionUrl)}
            className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#16a34a] transition-all hover:gap-1.5"
          >
            {rec.actionLabel}
            <ArrowRight size={11} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Dismiss */}
      {rec.severity !== "POSITIVE" && (
        <button
          onClick={() => onDismiss(rec.type)}
          className="flex-shrink-0 rounded-md p-1 text-gray-300 opacity-0 transition-all hover:bg-white hover:text-gray-500 group-hover:opacity-100"
          aria-label="Dismiss"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function RecommendationsPanel({ refreshKey }) {
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
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf7f3]">
  <ListChecks className="h-4 w-4 text-[#16a34a]" strokeWidth={2.2} />
</div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Recommendations
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {visible.length} action{visible.length !== 1 ? "s" : ""} to
              improve your portfolio
            </p>
          </div>
        </div>

        {urgentCount > 0 && (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
            {urgentCount} urgent
          </span>
        )}
      </div>

      {/* ── Rows ──────────────────────────────────────────── */}
      <div className="divide-y divide-gray-50">
        {shown.map((rec) => (
          <RecommendationRow
            key={rec.type}
            rec={rec}
            onDismiss={handleDismiss}
          />
        ))}
      </div>

      {/* ── Expand / collapse footer ───────────────────────── */}
      {hasMore && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-gray-100 bg-gray-50/40 py-3 text-xs font-semibold text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700"
        >
          {expanded ? (
            <>
              <ChevronUp size={13} strokeWidth={2.5} />
              Show less
            </>
          ) : (
            <>
              <ChevronDown size={13} strokeWidth={2.5} />
              Show {visible.length - MAX_VISIBLE} more
            </>
          )}
        </button>
      )}
    </div>
  );
}