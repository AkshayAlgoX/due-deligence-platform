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
  FileDown,
  Loader2,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import dynamic from "next/dynamic";

import { getPropertyById, getPropertyRisk } from "@/services/propertyService";
import { getAggregatedProperty } from "@/services/aggregationService";
import { formatINR, formatINRFull } from "@/utils/currency";

const DownloadComparisonPDFButton = dynamic(
  () => import("@/components/property/pdf/DownloadComparisonPDFButton"),
  { ssr: false }
);

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(val, suffix = "") {
  if (val == null || val === "") return "—";
  return `${val}${suffix}`;
}

function fmtArea(val) {
  if (val == null) return "—";
  return `${val.toLocaleString()} sqft`;
}

function fmtPricePerSqft(marketValue, area) {
  if (marketValue == null || area == null || area === 0) return "—";
  const ppsf = Math.round(marketValue / area);
  return `₹${ppsf.toLocaleString("en-IN")}/sqft`;
}

function fmtRaw(val) {
  if (val == null) return null;
  return Number(val);
}

// ── Delta logic ────────────────────────────────────────────────────────────
// For a given row across N properties, mark best / worst.
// direction: "lower-better" | "higher-better" | "none"

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
  const base = "px-4 py-3 text-sm font-bold text-center align-middle transition-colors";
  const colors = {
    best:    "bg-green-50 text-green-800",
    worst:   "bg-red-50 text-red-700",
    neutral: "text-gray-900",
  };

  return (
    <td className={`${base} ${colors[delta] ?? colors.neutral} border-r border-gray-100 last:border-r-0`}>
      <div className="flex items-center justify-center gap-1.5">
        {delta === "best" && <TrendingUp className="h-3.5 w-3.5 text-green-600 flex-shrink-0" strokeWidth={2.5} />}
        {delta === "worst" && <TrendingDown className="h-3.5 w-3.5 text-red-500 flex-shrink-0" strokeWidth={2.5} />}
        {delta === "neutral" && value != null && <Minus className="h-3 w-3 text-gray-300 flex-shrink-0" strokeWidth={2} />}
        <span>{displayValue}</span>
      </div>
    </td>
  );
}

// ── Risk display ──────────────────────────────────────────────────────────

const RISK_ICON = {
  LOW:    ShieldCheck,
  MEDIUM: Shield,
  HIGH:   ShieldAlert,
};
const RISK_COLOR = {
  LOW:    "text-green-700 bg-green-50",
  MEDIUM: "text-amber-700 bg-amber-50",
  HIGH:   "text-red-700 bg-red-50",
};

function RiskCell({ risk }) {
  if (!risk) {
    return (
      <td className="px-4 py-3 text-center text-sm text-gray-400 border-r border-gray-100 last:border-r-0">
        —
      </td>
    );
  }
  const Icon  = RISK_ICON[risk.riskLabel] ?? Shield;
  const color = RISK_COLOR[risk.riskLabel] ?? "text-gray-700 bg-gray-50";
  const delta = risk.riskLabel === "HIGH"
    ? "worst"
    : risk.riskLabel === "LOW"
    ? "best"
    : "neutral";

  return (
    <td className={`px-4 py-3 text-center border-r border-gray-100 last:border-r-0 ${delta === "best" ? "bg-green-50" : delta === "worst" ? "bg-red-50" : ""}`}>
      <div className="flex flex-col items-center gap-1">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
          {risk.riskLabel === "LOW" ? "Low risk" : risk.riskLabel === "MEDIUM" ? "Medium risk" : "High risk"}
        </span>
        <span className="text-[11px] text-gray-500 tabular-nums font-semibold">
          {risk.overallScore}/100
        </span>
      </div>
    </td>
  );
}

// ── Section status cell ────────────────────────────────────────────────────

const STATUS_COLORS = {
  LIVE:        "bg-green-100 text-green-700",
  CACHED:      "bg-green-100 text-green-700",
  MOCK:        "bg-amber-100 text-amber-700",
  UNAVAILABLE: "bg-red-100 text-red-600",
  TIMEOUT:     "bg-red-100 text-red-600",
  ERROR:       "bg-red-100 text-red-600",
  NO_DATA:     "bg-gray-100 text-gray-500",
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
  if (!status) return (
    <td className="px-4 py-3 text-center text-sm text-gray-400 border-r border-gray-100 last:border-r-0">—</td>
  );
  return (
    <td className="px-4 py-3 text-center border-r border-gray-100 last:border-r-0">
      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500"}`}>
        {STATUS_LABELS[status] ?? status}
      </span>
    </td>
  );
}

// ── Row components ─────────────────────────────────────────────────────────

function SectionHeader({ label, colCount }) {
  return (
    <tr className="bg-gray-50">
      <td
        colSpan={colCount + 1}
        className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100"
      >
        {label}
      </td>
    </tr>
  );
}

function MetricRow({ label, values, displayValues, direction = "none" }) {
  const deltas = computeDeltas(values, direction);
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3 text-xs font-semibold text-gray-500 w-40 border-r border-gray-200 bg-gray-50/30">
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
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3 text-xs font-semibold text-gray-500 w-40 border-r border-gray-200 bg-gray-50/30">
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3 text-sm font-bold text-center text-gray-900 border-r border-gray-100 last:border-r-0">
          {v ?? "—"}
        </td>
      ))}
    </tr>
  );
}

// ── Property hero column header ────────────────────────────────────────────

function PropertyHeader({ property, risk, index }) {
  if (!property) {
    return (
      <th className="px-4 py-4 text-center border-r border-gray-200 last:border-r-0">
        <div className="flex flex-col items-center gap-1">
          <div className="h-16 w-full rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-3 w-24 rounded bg-gray-100 animate-pulse mt-2" />
        </div>
      </th>
    );
  }

  const LABELS = ["A", "B", "C"];

  return (
    <th className="px-4 py-4 text-center font-normal border-r border-gray-200 last:border-r-0 min-w-[220px] max-w-[280px]">
      <div className="flex flex-col items-center gap-2">
        {/* Index badge */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] shadow-[0_4px_12px_rgba(34,197,94,0.3)]">
          <span className="text-sm font-black text-white">{LABELS[index]}</span>
        </div>

        {/* Address */}
        <div className="text-center min-w-0 w-full px-2">
          <p className="text-sm font-black text-gray-900 line-clamp-2 leading-tight">
            {property.address}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-500">
            {property.city}{property.state ? `, ${property.state}` : ""}
          </p>
        </div>

        {/* Verified badge */}
        {property.verified ? (
          <div className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 ring-1 ring-green-200">
            <BadgeCheck className="h-3 w-3 text-green-600" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-green-700">Verified</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 ring-1 ring-amber-200">
            <AlertTriangle className="h-3 w-3 text-amber-600" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-amber-700">Pending</span>
          </div>
        )}

        {/* Property type */}
        {property.propertyType && (
          <span className="text-[10px] font-black uppercase tracking-widest text-[#22C55E]">
            {property.propertyType}
          </span>
        )}
      </div>
    </th>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────

function CompareSkeleton({ count }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: `160px repeat(${count}, 1fr)` }}>
        <div className="px-4 py-4 bg-gray-50" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="px-4 py-4 border-l border-gray-200 flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-6 w-16 rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex border-b border-gray-100">
          <div className="w-40 px-4 py-3 bg-gray-50/50 flex-shrink-0">
            <div className="h-3 w-20 rounded bg-gray-200" />
          </div>
          {Array.from({ length: count }).map((_, j) => (
            <div key={j} className="flex-1 px-4 py-3 border-l border-gray-100 flex justify-center">
              <div className="h-4 w-24 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main comparison inner ──────────────────────────────────────────────────

function PropertyComparisonInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const idsParam = searchParams.get("ids") ?? "";
  const ids      = idsParam
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0)
    .slice(0, 3);

  const [properties,  setProperties]  = useState([]);
  const [aggregated,  setAggregated]  = useState([]);
  const [risks,       setRisks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const loadAll = useCallback(async () => {
    if (ids.length < 1) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all in parallel — property + aggregation + risk for each
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const [prop, agg, risk] = await Promise.allSettled([
            getPropertyById(id),
            getAggregatedProperty(id),
            getPropertyRisk(id),
          ]);
          return {
            property:   prop.status   === "fulfilled" ? prop.value   : null,
            aggregated: agg.status    === "fulfilled" ? agg.value    : null,
            risk:       risk.status   === "fulfilled" ? risk.value   : null,
          };
        })
      );

      const loaded = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      setProperties(loaded.map((r) => r.property));
      setAggregated(loaded.map((r) => r.aggregated));
      setRisks(loaded.map((r) => r.risk));
    } catch (err) {
      setError(err?.message ?? "Failed to load comparison data");
      toast.error("Could not load comparison", {
        description: "Please go back and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [idsParam]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Empty / error states ───────────────────────────────────────
  if (!loading && (ids.length < 2 || error)) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-24 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 mb-4">
          <SearchX className="h-7 w-7 text-gray-300" />
        </div>
        <p className="text-lg font-bold text-gray-800">
          {error ?? "Select at least 2 properties to compare"}
        </p>
        <p className="mt-1.5 text-sm text-gray-500 max-w-xs">
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

  // ── Table data helpers ─────────────────────────────────────────
  const P  = properties;   // array of PropertyResponse
  const A  = aggregated;   // array of AggregatedPropertyResponse
  const R  = risks;        // array of RiskScoreResponse

  const pricePerSqft = P.map((p) =>
    p?.marketValue && p?.area ? Math.round(p.marketValue / p.area) : null
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">

      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/property-search"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-[#22C55E] hover:text-[#16a34a]"
              aria-label="Back to property search"
            >
              <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.2} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50 ring-1 ring-green-200">
                  <GitCompare className="h-4 w-4 text-[#16a34a]" strokeWidth={2} />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Property comparison
                </h1>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Side-by-side analysis of {colCount} {colCount === 1 ? "property" : "properties"} · real data only
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!loading && properties.filter(Boolean).length > 0 && (
              <DownloadComparisonPDFButton
                properties={properties}
                aggregated={aggregated}
                risks={risks}
              />
            )}
            <Link
              href="/dashboard/property-search"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* ── Comparison table ──────────────────────────────────────── */}
      {loading ? (
        <CompareSkeleton count={colCount} />
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">

              {/* Column group for widths */}
              <colgroup>
                <col style={{ width: "160px", minWidth: "140px" }} />
                {Array.from({ length: colCount }).map((_, i) => (
                  <col key={i} style={{ minWidth: "220px" }} />
                ))}
              </colgroup>

              {/* ── THEAD: property hero headers ──────────────────── */}
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-4 text-left bg-gray-50 border-r border-gray-200">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Metric
                    </span>
                  </th>
                  {P.map((prop, i) => (
                    <PropertyHeader
                      key={ids[i]}
                      property={prop}
                      risk={R[i]}
                      index={i}
                    />
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* ── FINANCIAL ──────────────────────────────────── */}
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
                  displayValues={P.map((p, i) => pricePerSqft[i] ? `₹${pricePerSqft[i].toLocaleString("en-IN")}` : null)}
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

                {/* ── PROPERTY DETAILS ───────────────────────────── */}
                <SectionHeader label="Property details" colCount={colCount} />

                <PlainRow
                  label="Type"
                  values={P.map((p) => p?.propertyType)}
                />
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
                <PlainRow
                  label="Stories"
                  values={P.map((p) => fmt(p?.stories))}
                />
                <PlainRow
                  label="Condition"
                  values={P.map((p) => p?.condition ?? null)}
                />
                <PlainRow
                  label="Structure type"
                  values={P.map((p) => p?.structureType ?? null)}
                />
                <PlainRow
                  label="Zoning"
                  values={P.map((p) => p?.zoning ?? null)}
                />

                {/* ── RISK ASSESSMENT ────────────────────────────── */}
                <SectionHeader label="Risk assessment" colCount={colCount} />

                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-500 border-r border-gray-200 bg-gray-50/30">
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

                {/* ── VERIFICATION ───────────────────────────────── */}
                <SectionHeader label="Data quality" colCount={colCount} />

                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-500 border-r border-gray-200 bg-gray-50/30">
                    Verification
                  </td>
                  {P.map((p, i) => (
                    <td key={i} className="px-4 py-3 text-center border-r border-gray-100 last:border-r-0">
                      {p?.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 ring-1 ring-green-200">
                          <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                          <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
                          Pending
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* ── INTEGRATION SOURCES ────────────────────────── */}
                <SectionHeader label="Integration data sources" colCount={colCount} />

                {[
                  ["Ownership",     (a) => a?.ownership],
                  ["Tax history",   (a) => a?.taxHistory],
                  ["Zoning",        (a) => a?.zoning],
                  ["Flood zone",    (a) => a?.floodZone],
                  ["Permits",       (a) => a?.permits],
                  ["Environmental", (a) => a?.environmental],
                ].map(([label, getter]) => (
                  <tr key={label} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-500 border-r border-gray-200 bg-gray-50/30">
                      {label}
                    </td>
                    {A.map((agg, i) => (
                      <StatusCell key={i} section={getter(agg)} />
                    ))}
                  </tr>
                ))}

                {/* ── ENVIRONMENTAL ──────────────────────────────── */}
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
                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-500 border-r border-gray-200 bg-gray-50/30">
                    Near industrial zone
                  </td>
                  {A.map((a, i) => {
                    const val = a?.environmental?.data?.nearIndustrialZone;
                    return (
                      <td key={i} className="px-4 py-3 text-sm font-bold text-center border-r border-gray-100 last:border-r-0">
                        {val == null ? "—" : val ? (
                          <span className="text-red-600">Yes</span>
                        ) : (
                          <span className="text-green-700">No</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

              </tbody>
            </table>
          </div>

          {/* Table legend */}
          <div className="flex items-center gap-6 border-t border-gray-100 bg-gray-50/50 px-6 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Legend
            </p>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" strokeWidth={2.5} />
              <span className="text-[11px] font-semibold text-gray-600">Best value</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" strokeWidth={2.5} />
              <span className="text-[11px] font-semibold text-gray-600">Worst value</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Minus className="h-3 w-3 text-gray-300" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-gray-600">Middle</span>
            </div>
            <span className="text-[11px] text-gray-400">
              Comparisons are relative — no external benchmarks used
            </span>
          </div>
        </div>
      )}
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
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="h-8 w-64 rounded-lg bg-gray-200" />
            <div className="mt-2 h-4 w-48 rounded bg-gray-100" />
          </div>
          <CompareSkeleton count={2} />
        </div>
      }
    >
      <PropertyComparisonInner />
    </Suspense>
  );
}