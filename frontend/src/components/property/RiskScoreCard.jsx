// frontend/src/components/property/RiskScoreCard.jsx
"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertCircle,
  Info,
} from "lucide-react";
import { getPropertyRisk } from "@/services/propertyService";

/**
 * RiskScoreCard — standalone card shown in property details page.
 *
 * Fetches risk score from GET /api/properties/{id}/risk.
 * Shows overall score, 4 category bars, and all risk flags.
 * Empty state if no property. Skeleton while loading.
 */

const LABEL_CONFIG = {
  LOW: {
    icon: ShieldCheck,
    color: "text-green-600",
    bg: "bg-green-50",
    ring: "ring-green-200",
    bar: "bg-green-500",
    badge: "bg-green-100 text-green-700",
  },
  MEDIUM: {
    icon: Shield,
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    bar: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  HIGH: {
    icon: ShieldAlert,
    color: "text-red-600",
    bg: "bg-red-50",
    ring: "ring-red-200",
    bar: "bg-red-500",
    badge: "bg-red-100 text-red-700",
  },
};

const CATEGORIES = [
  { key: "financialScore",     label: "Financial",     weight: "30%" },
  { key: "legalScore",         label: "Legal",         weight: "30%" },
  { key: "environmentalScore", label: "Environmental", weight: "25%" },
  { key: "structuralScore",    label: "Structural",    weight: "15%" },
];

function ScoreBar({ score, barColor }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-bold tabular-nums text-gray-700">
        {score}
      </span>
    </div>
  );
}

export default function RiskScoreCard({ propertyId }) {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!propertyId) {
      setRisk(null);
      return;
    }

    let cancelled = false;

    const fetchRisk = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPropertyRisk(propertyId);
        if (!cancelled) setRisk(data);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Could not load risk score");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRisk();
    return () => { cancelled = true; };
  }, [propertyId]);

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gray-100" />
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="h-3 w-36 rounded bg-gray-100" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 rounded bg-gray-100" />
              <div className="h-2 w-full rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <span>Risk score unavailable</span>
        </div>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────
  if (!risk) return null;

  const config = LABEL_CONFIG[risk.riskLabel] ?? LABEL_CONFIG.MEDIUM;
  const Icon = config.icon;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg} ring-1 ${config.ring}`}>
            <Icon className={`h-5 w-5 ${config.color}`} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Risk assessment
            </p>
            <p className="text-sm font-bold text-gray-900">
              Based on real aggregated data
            </p>
          </div>
        </div>

        {/* Overall score badge */}
        <div className="text-right">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-black ${config.badge}`}>
            <span className="tabular-nums">{risk.overallScore}</span>
            <span className="text-[10px] font-bold opacity-70">/100</span>
          </div>
          <p className={`mt-1 text-[11px] font-black uppercase tracking-wider ${config.color}`}>
            {risk.riskLabel === "LOW"
              ? "Low risk"
              : risk.riskLabel === "MEDIUM"
              ? "Medium risk"
              : "High risk"}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-6" />

      {/* Category breakdown */}
      <div className="p-6 space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Category breakdown
        </p>

        {CATEGORIES.map(({ key, label, weight }) => (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">
                {label}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                weight {weight}
              </span>
            </div>
            <ScoreBar score={risk[key]} barColor={config.bar} />
          </div>
        ))}
      </div>

      {/* Risk flags */}
      {risk.riskFlags?.length > 0 && (
        <>
          <div className="h-px bg-gray-100 mx-6" />
          <div className="p-6 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Risk factors · {risk.riskFlags.length}
            </p>
            {risk.riskFlags.map((flag, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2.5"
              >
                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <p className="text-xs text-gray-600 leading-snug">{flag}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Data incomplete disclaimer */}
      {risk.dataIncomplete && (
        <>
          <div className="h-px bg-gray-100 mx-6" />
          <div className="flex items-start gap-2 px-6 py-4">
            <Info className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 mt-0.5" />
            <p className="text-[11px] text-gray-400 leading-snug">
              Some data sources returned mock or unavailable data. Score may
              improve as more real data becomes available.
            </p>
          </div>
        </>
      )}
    </div>
  );
}