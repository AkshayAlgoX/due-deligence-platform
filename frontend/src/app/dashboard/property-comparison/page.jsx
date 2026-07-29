// frontend/src/app/dashboard/property-comparison/page.jsx
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  GitCompare,
  TrendingUp,
  TrendingDown,
  Minus,
  BadgeCheck,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Loader2,
  SearchX,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import dynamic from "next/dynamic";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

import { getPropertyById, getPropertyRisk } from "@/services/propertyService";
import { getAggregatedProperty } from "@/services/aggregationService";
import { formatINR } from "@/utils/currency";
import { useSavedComparisons } from "@/hooks/useSavedComparisons";

import SaveComparisonModal from "@/components/property/SaveComparisonModal";
import SavedComparisonsSheet from "@/components/property/SavedComparisonsSheet";
import PropertyHeroCard from "@/components/property/PropertyHeroCard";
import MarketValueChart from "@/components/property/MarketValueChart";

const DownloadComparisonPDFButton = dynamic(
  () => import("@/components/property/pdf/DownloadComparisonPDFButton"),
  { ssr: false }
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(val) {
  if (val == null || val === "") return "—";
  return `${val}`;
}

function fmtArea(val) {
  if (val == null) return "—";
  return `${val.toLocaleString()} sqft`;
}

function fmtRaw(val) {
  if (val == null) return null;
  return Number(val);
}

// ── Delta logic ───────────────────────────────────────────────────────────────

function computeDeltas(values, direction) {
  const nums = values.map(fmtRaw);
  const valid = nums.filter((v) => v != null);
  if (valid.length < 2) return values.map(() => "neutral");

  const max = Math.max(...valid);
  const min = Math.min(...valid);

  return nums.map((v) => {
    if (v == null) return "neutral";
    if (direction === "higher-better") {
      if (v === max) return "best";
      if (v === min) return "worst";
      return "neutral";
    }
    if (direction === "lower-better") {
      if (v === min) return "best";
      if (v === max) return "worst";
      return "neutral";
    }
    return "neutral";
  });
}

function DeltaCell({ value, delta, displayValue }) {
  const base =
    "px-4 py-3 text-sm font-bold text-center align-middle transition-colors";
  const colors = {
    best:    "bg-green-50 dark:bg-[#0d2818] text-green-800 dark:text-green-400",
    worst:   "bg-red-50 dark:bg-[#2d1214] text-red-700 dark:text-red-400",
    neutral: "text-gray-900 dark:text-[#e6edf3]",
  };

  return (
    <td
      className={`${base} ${colors[delta] ?? colors.neutral} border-r border-gray-100 dark:border-[#30363d] last:border-r-0`}
    >
      <div className="flex items-center justify-center gap-1.5">
        {delta === "best" && (
          <TrendingUp
            className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0"
            strokeWidth={2.5}
          />
        )}
        {delta === "worst" && (
          <TrendingDown
            className="h-3.5 w-3.5 text-red-500 dark:text-red-400 flex-shrink-0"
            strokeWidth={2.5}
          />
        )}
        {delta === "neutral" && value != null && (
          <Minus
            className="h-3 w-3 text-gray-300 dark:text-[#484f58] flex-shrink-0"
            strokeWidth={2}
          />
        )}
        <span>{displayValue}</span>
      </div>
    </td>
  );
}

// ── Risk display ──────────────────────────────────────────────────────────────

const RISK_ICON = {
  LOW:    ShieldCheck,
  MEDIUM: Shield,
  HIGH:   ShieldAlert,
};
const RISK_COLOR = {
  LOW:    "text-green-700 dark:text-green-400 bg-green-50 dark:bg-[#0d2818]",
  MEDIUM: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-[#282a10]",
  HIGH:   "text-red-700 dark:text-red-400 bg-red-50 dark:bg-[#2d1214]",
};

function RiskCell({ risk }) {
  if (!risk) {
    return (
      <td className="px-4 py-3 text-center text-sm text-gray-400 dark:text-[#6e7681] border-r border-gray-100 dark:border-[#30363d] last:border-r-0">
        —
      </td>
    );
  }
  const Icon = RISK_ICON[risk.riskLabel] ?? Shield;
  const color = RISK_COLOR[risk.riskLabel] ?? "text-gray-700 dark:text-[#e6edf3] bg-gray-50 dark:bg-[#1c2128]";
  const delta =
    risk.riskLabel === "HIGH"
      ? "worst"
      : risk.riskLabel === "LOW"
        ? "best"
        : "neutral";

  return (
    <td
      className={`px-4 py-3 text-center border-r border-gray-100 dark:border-[#30363d] last:border-r-0 ${
        delta === "best"
          ? "bg-green-50 dark:bg-[#0d2818]"
          : delta === "worst"
            ? "bg-red-50 dark:bg-[#2d1214]"
            : ""
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${color}`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
          {risk.riskLabel === "LOW"
            ? "Low risk"
            : risk.riskLabel === "MEDIUM"
              ? "Medium risk"
              : "High risk"}
        </span>
        <span className="text-[11px] text-gray-500 dark:text-[#7d8590] tabular-nums font-semibold">
          {risk.overallScore}/100
        </span>
      </div>
    </td>
  );
}

// ── Section status cell ───────────────────────────────────────────────────────

const STATUS_COLORS = {
  LIVE:        "bg-green-100 dark:bg-[#0d2818] text-green-700 dark:text-green-400",
  CACHED:      "bg-green-100 dark:bg-[#0d2818] text-green-700 dark:text-green-400",
  MOCK:        "bg-amber-100 dark:bg-[#282a10] text-amber-700 dark:text-amber-400",
  UNAVAILABLE: "bg-red-100 dark:bg-[#2d1214] text-red-600 dark:text-red-400",
  TIMEOUT:     "bg-red-100 dark:bg-[#2d1214] text-red-600 dark:text-red-400",
  ERROR:       "bg-red-100 dark:bg-[#2d1214] text-red-600 dark:text-red-400",
  NO_DATA:     "bg-gray-100 dark:bg-[#1c2128] text-gray-500 dark:text-[#7d8590]",
};
const STATUS_LABELS = {
  LIVE:        "Live",
  CACHED:      "Cached",
  MOCK:        "Sample",
  UNAVAILABLE: "Unavailable",
  TIMEOUT:     "Timed out",
  ERROR:       "Error",
  NO_DATA:     "No data",
};

function StatusCell({ section }) {
  const status = section?.status;
  if (!status)
    return (
      <td className="px-4 py-3 text-center text-sm text-gray-400 dark:text-[#6e7681] border-r border-gray-100 dark:border-[#30363d] last:border-r-0">
        —
      </td>
    );
  return (
    <td className="px-4 py-3 text-center border-r border-gray-100 dark:border-[#30363d] last:border-r-0">
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
          STATUS_COLORS[status] ?? "bg-gray-100 dark:bg-[#1c2128] text-gray-500 dark:text-[#7d8590]"
        }`}
      >
        {STATUS_LABELS[status] ?? status}
      </span>
    </td>
  );
}

// ── Row components ────────────────────────────────────────────────────────────

function SectionHeader({ label, colCount }) {
  return (
    <tr className="bg-gray-50 dark:bg-[#1c2128]">
      <td
        colSpan={colCount + 1}
        className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#6e7681] border-b border-gray-100 dark:border-[#30363d]"
      >
        {label}
      </td>
    </tr>
  );
}

function MetricRow({ label, values, displayValues, direction = "none" }) {
  const deltas = computeDeltas(values, direction);
  return (
    <tr className="border-b border-gray-100 dark:border-[#30363d] hover:bg-gray-50/50 dark:hover:bg-[#1c2128]/50 transition-colors">
      <td className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#7d8590] w-40 border-r border-gray-200 dark:border-[#30363d] bg-gray-50/30 dark:bg-[#161b22]">
        {label}
      </td>
      {displayValues.map((dv, i) => (
        <DeltaCell
          key={i}
          value={values[i]}
          delta={deltas[i]}
          displayValue={dv ?? "—"}
        />
      ))}
    </tr>
  );
}

function PlainRow({ label, values }) {
  return (
    <tr className="border-b border-gray-100 dark:border-[#30363d] hover:bg-gray-50/50 dark:hover:bg-[#1c2128]/50 transition-colors">
      <td className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#7d8590] w-40 border-r border-gray-200 dark:border-[#30363d] bg-gray-50/30 dark:bg-[#161b22]">
        {label}
      </td>
      {values.map((v, i) => (
        <td
          key={i}
          className="px-4 py-3 text-sm font-bold text-center text-gray-900 dark:text-[#e6edf3] border-r border-gray-100 dark:border-[#30363d] last:border-r-0"
        >
          {v ?? "—"}
        </td>
      ))}
    </tr>
  );
}

// ── Property header column (table thead) ──────────────────────────────────────

function PropertyHeader({ property, index }) {
  if (!property) {
    return (
      <th className="px-4 py-4 text-center border-r border-gray-200 dark:border-[#30363d] last:border-r-0">
        <div className="flex flex-col items-center gap-1">
          <div className="h-16 w-full rounded-xl bg-gray-100 dark:bg-[#1c2128] animate-pulse" />
          <div className="h-3 w-24 rounded bg-gray-100 dark:bg-[#1c2128] animate-pulse mt-2" />
        </div>
      </th>
    );
  }

  const LABELS = ["A", "B", "C"];

  return (
    <th className="px-4 py-4 text-center font-normal border-r border-gray-200 dark:border-[#30363d] last:border-r-0 min-w-[220px] max-w-[280px]">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] shadow-[0_4px_12px_rgba(34,197,94,0.3)]">
          <span className="text-sm font-black text-white">{LABELS[index]}</span>
        </div>
        <div className="text-center min-w-0 w-full px-2">
          <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3] line-clamp-2 leading-tight">
            {property.address}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-500 dark:text-[#7d8590]">
            {property.city}
            {property.state ? `, ${property.state}` : ""}
          </p>
        </div>
        {property.verified ? (
          <div className="flex items-center gap-1 rounded-full bg-green-50 dark:bg-[#0d2818] px-2.5 py-1 ring-1 ring-green-200 dark:ring-green-900/50">
            <BadgeCheck className="h-3 w-3 text-green-600 dark:text-green-400" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-green-700 dark:text-green-400">
              Verified
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 rounded-full bg-amber-50 dark:bg-[#282a10] px-2.5 py-1 ring-1 ring-amber-200 dark:ring-amber-900/50">
            <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
              Pending
            </span>
          </div>
        )}
        {property.propertyType && (
          <span className="text-[10px] font-black uppercase tracking-widest text-[#22C55E]">
            {property.propertyType}
          </span>
        )}
      </div>
    </th>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function CompareSkeleton({ count }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm overflow-hidden animate-pulse">
      <div
        className="grid border-b border-gray-200 dark:border-[#30363d]"
        style={{ gridTemplateColumns: `160px repeat(${count}, 1fr)` }}
      >
        <div className="px-4 py-4 bg-gray-50 dark:bg-[#1c2128]" />
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-4 border-l border-gray-200 dark:border-[#30363d] flex flex-col items-center gap-3"
          >
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-[#30363d]" />
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-[#30363d]" />
            <div className="h-3 w-20 rounded bg-gray-200 dark:bg-[#30363d]" />
            <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-[#30363d]" />
          </div>
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex border-b border-gray-100 dark:border-[#30363d]">
          <div className="w-40 px-4 py-3 bg-gray-50/50 dark:bg-[#1c2128] flex-shrink-0">
            <div className="h-3 w-20 rounded bg-gray-200 dark:bg-[#30363d]" />
          </div>
          {Array.from({ length: count }).map((_, j) => (
            <div
              key={j}
              className="flex-1 px-4 py-3 border-l border-gray-100 dark:border-[#30363d] flex justify-center"
            >
              <div className="h-4 w-24 rounded bg-gray-100 dark:bg-[#1c2128]" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main comparison inner ─────────────────────────────────────────────────────

function PropertyComparisonInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const idsParam = searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0)
    .slice(0, 3);

  const [properties, setProperties] = useState([]);
  const [aggregated, setAggregated] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { save, isSaving } = useSavedComparisons({ autoFetch: false });

  const loadAll = useCallback(async () => {
    if (ids.length < 1) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const [prop, agg, risk] = await Promise.allSettled([
            getPropertyById(id),
            getAggregatedProperty(id),
            getPropertyRisk(id),
          ]);
          return {
            property:   prop.status === "fulfilled" ? prop.value : null,
            aggregated: agg.status  === "fulfilled" ? agg.value  : null,
            risk:       risk.status === "fulfilled" ? risk.value  : null,
          };
        })
      );
      const loaded = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
      setProperties(loaded.map((r) => r.property));
      setAggregated(loaded.map((r) => r.aggregated));
      setRisks(loaded.map((r) => r.risk));
    } catch (err) {
      setError(err?.message ?? "Failed to load comparison data");
      toast.error("Could not load comparison", { description: "Please go back and try again." });
    } finally {
      setLoading(false);
    }
  }, [idsParam]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Empty / error state ────────────────────────────────────────────────────
  if (!loading && (ids.length < 2 || error)) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] py-24 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#30363d] mb-4">
          <SearchX className="h-7 w-7 text-gray-300 dark:text-[#484f58]" />
        </div>
        <p className="text-lg font-bold text-gray-800 dark:text-[#e6edf3]">
          {error ?? "Select at least 2 properties to compare"}
        </p>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-[#7d8590] max-w-xs">
          Go to property search, select 2–3 properties using the compare
          checkbox on each card, then click "Compare".
        </p>
        <Link
          href="/dashboard/property-search"
          className="mt-6 flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition hover:bg-[#16a34a]"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to property search
        </Link>
      </div>
    );
  }

  const colCount = ids.length;
  const P = properties;
  const A = aggregated;
  const R = risks;

  const pricePerSqft = P.map((p) =>
    p?.marketValue && p?.area ? Math.round(p.marketValue / p.area) : null
  );

  const defaultName = P.filter(Boolean)
    .map((p) => p.city || p.address?.split(",")[0])
    .filter(Boolean)
    .join(" vs ");

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      <Breadcrumbs />

      {/* ── Page header card ── */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/property-search"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-gray-500 dark:text-[#7d8590] transition hover:border-[#22C55E] hover:text-[#16a34a]"
              aria-label="Back to property search"
            >
              <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.2} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50 dark:bg-[#0d2818] ring-1 ring-green-200 dark:ring-green-900/50">
                  <GitCompare className="h-4 w-4 text-[#16a34a]" strokeWidth={2} />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-[#e6edf3] tracking-tight">
                  Property comparison
                </h1>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">
                Side-by-side analysis of {colCount}{" "}
                {colCount === 1 ? "property" : "properties"} · real data only
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* My Saved button */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-[#7d8590] transition hover:border-[#22C55E] hover:text-[#16a34a] dark:hover:border-[#22C55E] dark:hover:text-[#22C55E] cursor-pointer"
            >
              <BookmarkCheck className="h-4 w-4" strokeWidth={2} />
              My saved
            </button>

            {/* Save Comparison button — green gradient, unchanged */}
            {!loading && properties.filter(Boolean).length >= 2 && (
              <button
                type="button"
                onClick={() => setSaveModalOpen(true)}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] transition hover:shadow-[0_8px_20px_rgba(34,197,94,0.4)] hover:scale-[1.02] disabled:opacity-70 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bookmark className="h-4 w-4" strokeWidth={2.5} />
                )}
                Save comparison
              </button>
            )}

            {/* PDF download */}
            {!loading && properties.filter(Boolean).length > 0 && (
              <DownloadComparisonPDFButton
                properties={properties}
                aggregated={aggregated}
                risks={risks}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Hero cards row ── */}
      {!loading && properties.filter(Boolean).length > 0 && (
        <div className="flex gap-4 flex-wrap">
          {P.map((prop, i) => (
            <PropertyHeroCard
              key={prop?.id ?? ids[i] ?? `hero-slot-${i}`}
              property={prop}
              index={i}
            />
          ))}
        </div>
      )}

      {/* ── Comparison table ── */}
      {loading ? (
        <CompareSkeleton count={colCount} />
      ) : (
        <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <colgroup>
                <col style={{ width: "160px", minWidth: "140px" }} />
                {Array.from({ length: colCount }).map((_, i) => (
                  <col key={i} style={{ minWidth: "220px" }} />
                ))}
              </colgroup>

              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-[#30363d]">
                  <th className="px-4 py-4 text-left bg-gray-50 dark:bg-[#1c2128] border-r border-gray-200 dark:border-[#30363d]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
                      Metric
                    </span>
                  </th>
                  {P.map((prop, i) => (
                    <PropertyHeader
                      key={prop?.id ?? ids[i] ?? `header-slot-${i}`}
                      property={prop}
                      index={i}
                    />
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* ── FINANCIAL ── */}
                <SectionHeader label="Financial" colCount={colCount} />
                <MetricRow
                  label="Market value"
                  values={P.map((p) => p?.marketValue)}
                  displayValues={P.map((p) => p?.marketValue ? formatINR(p.marketValue) : null)}
                  direction="higher-better"
                />
                <MetricRow
                  label="Area"
                  values={P.map((p) => p?.area)}
                  displayValues={P.map((p) => p?.area ? fmtArea(p.area) : null)}
                  direction="higher-better"
                />
                <MetricRow
                  label="Price / sqft"
                  values={pricePerSqft}
                  displayValues={P.map((p, i) =>
                    pricePerSqft[i] ? `₹${pricePerSqft[i].toLocaleString("en-IN")}` : null
                  )}
                  direction="lower-better"
                />
                <MetricRow
                  label="Lot size"
                  values={P.map((p) => p?.lotSize)}
                  displayValues={P.map((p) => p?.lotSize ? fmtArea(p.lotSize) : null)}
                  direction="higher-better"
                />
                <MetricRow
                  label="Year built"
                  values={P.map((p) => p?.yearBuilt)}
                  displayValues={P.map((p) => fmt(p?.yearBuilt))}
                  direction="higher-better"
                />

                {/* ── PROPERTY DETAILS ── */}
                <SectionHeader label="Property details" colCount={colCount} />
                <PlainRow label="Type"       values={P.map((p) => p?.propertyType)} />
                <MetricRow
                  label="Bedrooms"
                  values={P.map((p) => p?.bedrooms)}
                  displayValues={P.map((p) => fmt(p?.bedrooms))}
                  direction="higher-better"
                />
                <MetricRow
                  label="Bathrooms"
                  values={P.map((p) => p?.bathrooms)}
                  displayValues={P.map((p) => fmt(p?.bathrooms))}
                  direction="higher-better"
                />
                <PlainRow label="Stories"        values={P.map((p) => fmt(p?.stories))} />
                <PlainRow label="Condition"       values={P.map((p) => p?.condition ?? null)} />
                <PlainRow label="Structure type"  values={P.map((p) => p?.structureType ?? null)} />
                <PlainRow label="Zoning"          values={P.map((p) => p?.zoning ?? null)} />

                {/* ── RISK ASSESSMENT ── */}
                <SectionHeader label="Risk assessment" colCount={colCount} />
                <tr className="border-b border-gray-100 dark:border-[#30363d]">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#7d8590] border-r border-gray-200 dark:border-[#30363d] bg-gray-50/30 dark:bg-[#161b22]">
                    Overall risk
                  </td>
                  {R.map((risk, i) => (
                    <RiskCell key={i} risk={risk} />
                  ))}
                </tr>
                <MetricRow
                  label="Financial risk"
                  values={R.map((r) => r?.financialScore)}
                  displayValues={R.map((r) => r ? `${r.financialScore}/100` : null)}
                  direction="lower-better"
                />
                <MetricRow
                  label="Legal risk"
                  values={R.map((r) => r?.legalScore)}
                  displayValues={R.map((r) => r ? `${r.legalScore}/100` : null)}
                  direction="lower-better"
                />
                <MetricRow
                  label="Environmental risk"
                  values={R.map((r) => r?.environmentalScore)}
                  displayValues={R.map((r) => r ? `${r.environmentalScore}/100` : null)}
                  direction="lower-better"
                />
                <MetricRow
                  label="Structural risk"
                  values={R.map((r) => r?.structuralScore)}
                  displayValues={R.map((r) => r ? `${r.structuralScore}/100` : null)}
                  direction="lower-better"
                />

                {/* ── DATA QUALITY ── */}
                <SectionHeader label="Data quality" colCount={colCount} />
                <tr className="border-b border-gray-100 dark:border-[#30363d]">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#7d8590] border-r border-gray-200 dark:border-[#30363d] bg-gray-50/30 dark:bg-[#161b22]">
                    Verification
                  </td>
                  {P.map((p, i) => (
                    <td
                      key={i}
                      className="px-4 py-3 text-center border-r border-gray-100 dark:border-[#30363d] last:border-r-0"
                    >
                      {p?.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-[#0d2818] px-2.5 py-1 text-xs font-bold text-green-700 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-900/50">
                          <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-[#282a10] px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-900/50">
                          <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
                          Pending
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* ── INTEGRATION SOURCES ── */}
                <SectionHeader label="Integration data sources" colCount={colCount} />
                {[
                  ["Ownership",    (a) => a?.ownership],
                  ["Tax history",  (a) => a?.taxHistory],
                  ["Zoning",       (a) => a?.zoning],
                  ["Flood zone",   (a) => a?.floodZone],
                  ["Permits",      (a) => a?.permits],
                  ["Environmental",(a) => a?.environmental],
                ].map(([label, getter]) => (
                  <tr
                    key={label}
                    className="border-b border-gray-100 dark:border-[#30363d] hover:bg-gray-50/50 dark:hover:bg-[#1c2128]/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#7d8590] border-r border-gray-200 dark:border-[#30363d] bg-gray-50/30 dark:bg-[#161b22]">
                      {label}
                    </td>
                    {A.map((agg, i) => (
                      <StatusCell key={i} section={getter(agg)} />
                    ))}
                  </tr>
                ))}

                {/* ── ENVIRONMENTAL ── */}
                <SectionHeader label="Environmental" colCount={colCount} />
                <MetricRow
                  label="AQI"
                  values={A.map((a) => a?.environmental?.data?.airQualityIndex)}
                  displayValues={A.map((a) => {
                    const aqi = a?.environmental?.data?.airQualityIndex;
                    const cat = a?.environmental?.data?.aqiCategory;
                    if (aqi == null) return null;
                    return cat ? `${aqi} · ${cat}` : String(aqi);
                  })}
                  direction="lower-better"
                />
                <PlainRow
                  label="Flood risk"
                  values={A.map((a) => a?.floodZone?.data?.riskLevel ?? null)}
                />
                <PlainRow
                  label="Flood zone"
                  values={A.map((a) => a?.floodZone?.data?.zoneClassification ?? null)}
                />
                <tr className="border-b border-gray-100 dark:border-[#30363d] hover:bg-gray-50/50 dark:hover:bg-[#1c2128]/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-[#7d8590] border-r border-gray-200 dark:border-[#30363d] bg-gray-50/30 dark:bg-[#161b22]">
                    Near industrial zone
                  </td>
                  {A.map((a, i) => {
                    const val = a?.environmental?.data?.nearIndustrialZone;
                    return (
                      <td
                        key={i}
                        className="px-4 py-3 text-sm font-bold text-center border-r border-gray-100 dark:border-[#30363d] last:border-r-0"
                      >
                        {val == null ? "—" : val ? (
                          <span className="text-red-600 dark:text-red-400">Yes</span>
                        ) : (
                          <span className="text-green-700 dark:text-green-400">No</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Table legend ── */}
          <div className="flex items-center gap-6 border-t border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#1c2128] px-6 py-3 flex-wrap">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
              Legend
            </p>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" strokeWidth={2.5} />
              <span className="text-[11px] font-semibold text-gray-600 dark:text-[#7d8590]">
                Best value
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-red-500 dark:text-red-400" strokeWidth={2.5} />
              <span className="text-[11px] font-semibold text-gray-600 dark:text-[#7d8590]">
                Worst value
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Minus className="h-3 w-3 text-gray-300 dark:text-[#484f58]" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-gray-600 dark:text-[#7d8590]">
                Middle
              </span>
            </div>
            <span className="text-[11px] text-gray-400 dark:text-[#6e7681]">
              Comparisons are relative — no external benchmarks used
            </span>
          </div>
        </div>
      )}

      {/* ── Market value chart ── */}
      {!loading && properties.filter(Boolean).length >= 2 && (
        <MarketValueChart properties={properties} />
      )}

      {/* ── Save modal ── */}
      <SaveComparisonModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={save}
        isSaving={isSaving}
        propertyIds={ids}
        defaultName={defaultName}
      />

      {/* ── Saved comparisons sheet ── */}
      <SavedComparisonsSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}

export default function PropertyComparisonPage() {
  useEffect(() => {
    document.title = "Property Comparison | Real Estate Due Diligence";
  }, []);

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1400px] mx-auto space-y-6 animate-pulse">
          <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 shadow-sm">
            <div className="h-8 w-64 rounded-lg bg-gray-200 dark:bg-[#30363d]" />
            <div className="mt-2 h-4 w-48 rounded bg-gray-100 dark:bg-[#1c2128]" />
          </div>
          <CompareSkeleton count={2} />
        </div>
      }
    >
      <PropertyComparisonInner />
    </Suspense>
  );
}