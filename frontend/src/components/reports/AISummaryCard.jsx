"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const VERDICT_CONFIG = {
  PROCEED: {
    label: "Proceed",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-teal-500",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
    ring: "ring-emerald-500/20",
  },
  CAUTION: {
    label: "Proceed with Caution",
    icon: AlertTriangle,
    gradient: "from-amber-500 to-orange-500",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
    ring: "ring-amber-500/20",
  },
  HIGH_RISK: {
    label: "High Risk",
    icon: ShieldAlert,
    gradient: "from-red-500 to-rose-500",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/30",
    ring: "ring-red-500/20",
  },
};

export default function AISummaryCard({ reportId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const getToken = () =>
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("token");

  const fetchSummary = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/reports/${reportId}/ai-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load summary (${res.status})`);
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      setError(err.message || "Could not load AI summary");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  const handleRegenerate = async () => {
    if (regenerating) return;
    setRegenerating(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/api/reports/${reportId}/ai-summary/regenerate`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Failed (${res.status})`);
      }
      const data = await res.json();
      setSummary(data);
      toast.success("AI summary regenerated");
    } catch (err) {
      toast.error(err.message || "Could not regenerate summary");
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    const text = [
      `Verdict: ${VERDICT_CONFIG[summary.verdict]?.label || summary.verdict}`,
      "",
      summary.headline,
      "",
      "Key Points:",
      ...summary.keyPoints.map((p) => `• ${p}`),
      "",
      `Recommendation: ${summary.recommendation}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Summary copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error && !summary) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-[#e6edf3]">
              AI Executive Summary
            </h3>
          </div>
        </div>
        <p className="text-[13px] text-gray-500 dark:text-[#7d8590] mb-3">{error}</p>
        <button
          onClick={fetchSummary}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition"
        >
          <RefreshCw className="h-3 w-3" />
          Try again
        </button>
      </div>
    );
  }

  if (!summary) return null;

  const config = VERDICT_CONFIG[summary.verdict] || VERDICT_CONFIG.CAUTION;
  const VerdictIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]"
    >
      {/* Ambient gradient background */}
      <div
        className={`pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06] bg-gradient-to-br ${config.gradient}`}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="relative flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
            >
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-[#e6edf3]">
                  AI Executive Summary
                </h3>
                {summary.cached && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40">
                    Cached
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-[#7d8590] mt-0.5">
                Powered by Llama 3.3 70B · Not financial advice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition"
              title="Copy summary"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition disabled:opacity-50"
              title="Regenerate summary"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Verdict pill */}
        <AnimatePresence mode="wait">
          <motion.div
            key={summary.verdict}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.text} mb-4`}
          >
            <VerdictIcon className="h-3.5 w-3.5" />
            <span className="text-[12px] font-bold uppercase tracking-wide">
              {config.label}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Headline */}
        <p className="text-[16px] font-semibold text-gray-900 dark:text-[#e6edf3] leading-snug mb-5">
          {summary.headline}
        </p>

        {/* Key points */}
        <div className="space-y-2 mb-5">
          {summary.keyPoints?.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex items-start gap-2.5"
            >
              <div className={`mt-1.5 h-1.5 w-1.5 rounded-full ${config.bg} border ${config.border} flex-shrink-0`}>
                <div className={`h-full w-full rounded-full ${config.text.replace("text-", "bg-")}`} />
              </div>
              <p className="text-[13px] text-gray-700 dark:text-[#c9d1d9] leading-relaxed">
                {point}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Recommendation */}
        <div className="pt-4 border-t border-gray-100 dark:border-white/[0.06]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7d8590] mb-1.5">
            Recommendation
          </p>
          <p className="text-[13px] text-gray-700 dark:text-[#c9d1d9] leading-relaxed">
            {summary.recommendation}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Loading state — shimmer with AI vibe
// ─────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6">
      {/* Animated gradient */}
      <motion.div
        animate={{
          background: [
            "linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.06), transparent)",
            "linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.06), transparent)",
            "linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.06), transparent)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0"
      />

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-[#e6edf3]">
              AI Executive Summary
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              Analyzing report...
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-6 w-32 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
          <div className="h-5 w-full rounded bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
          <div className="h-5 w-4/5 rounded bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
          <div className="pt-2 space-y-2">
            <div className="h-4 w-full rounded bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-full rounded bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}