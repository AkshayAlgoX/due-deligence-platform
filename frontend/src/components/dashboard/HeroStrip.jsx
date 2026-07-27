"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  ShieldCheck,
  Wind,
  Loader2,
  MapPin,
  TrendingUp,
  Building2,
} from "lucide-react";
import { formatINR } from "@/utils/currency";
import { getPortfolioInsights } from "@/services/dashboardService";
import { getAggregatedProperty } from "@/services/aggregationService";
import { getAqiInfo } from "@/constants/aqiScale";
/**
 * HeroStrip — big 3-column card at top of dashboard.
 *
 * Left:   Total portfolio value (real sum from backend)
 * Middle: Verification progress ring (real %)
 * Right:  Live AQI from WAQI for user's most-active city
 *
 * All data is real. If a section can't load, it degrades gracefully
 * (shows "—" or skeleton) — never breaks the whole strip.
 */
export default function HeroStrip({ stats, loading: statsLoading }) {
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [aqi, setAqi] = useState(null);
  const [aqiLoading, setAqiLoading] = useState(false);

  // ── Load portfolio insights ──────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setInsightsLoading(true);
        const data = await getPortfolioInsights();
        if (mounted) setInsights(data);
      } catch {
        if (mounted) setInsights(null);
      } finally {
        if (mounted) setInsightsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Load AQI for user's top city via aggregation endpoint ────
  // We fetch the highest-value property's aggregation to get its LIVE env data.
  useEffect(() => {
    if (!insights?.highestValueProperty?.id) {
      setAqi(null);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setAqiLoading(true);
        const agg = await getAggregatedProperty(insights.highestValueProperty.id);
        if (mounted && agg?.environmental?.data) {
          setAqi({
            value: agg.environmental.data.airQualityIndex,
            category: agg.environmental.data.aqiCategory,
            station: agg.environmental.data.nearestStation,
            isLive: agg.environmental.status === "LIVE",
          });
        }
      } catch {
        if (mounted) setAqi(null);
      } finally {
        if (mounted) setAqiLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [insights?.highestValueProperty?.id]);

  // ── Compute verification % ────────────────────────────────────
  const verificationPct =
    stats && stats.totalProperties > 0
      ? Math.round((stats.verifiedProperties / stats.totalProperties) * 100)
      : 0;

  // ── Empty state (no properties yet) ──────────────────────────
  const isEmpty = !statsLoading && stats && stats.totalProperties === 0;
  if (isEmpty) return null; // Dashboard renders its own empty state

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">
        {/* ── Column 1: Portfolio Value ────────────────────────── */}
        <PortfolioValueCell
          insights={insights}
          loading={insightsLoading}
          totalProperties={stats?.totalProperties ?? 0}
        />

        {/* ── Column 2: Verification Progress ──────────────────── */}
        <VerificationCell
          verified={stats?.verifiedProperties ?? 0}
          total={stats?.totalProperties ?? 0}
          pct={verificationPct}
          loading={statsLoading}
        />

        {/* ── Column 3: Live AQI ───────────────────────────────── */}
        <LiveAqiCell
          aqi={aqi}
          city={insights?.userTopCity}
          loading={aqiLoading || insightsLoading}
        />
      </div>
    </div>
  );
}

// ─── Column 1: Portfolio Value ─────────────────────────────────
function PortfolioValueCell({ insights, loading, totalProperties }) {
  return (
    <div className="group relative flex flex-col p-6 transition-colors hover:bg-gray-50/60">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f3] text-[#16a34a] transition-transform duration-200 group-hover:scale-110">
          <Wallet className="h-5 w-5" strokeWidth={2.2} />
        </div>
        {insights?.totalCitiesCovered > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-500 ring-1 ring-gray-200">
            <MapPin className="h-2.5 w-2.5" strokeWidth={2.5} />
            {insights.totalCitiesCovered} {insights.totalCitiesCovered === 1 ? "city" : "cities"}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Portfolio value
        </p>
        {loading ? (
          <div className="mt-2 h-8 w-40 animate-pulse rounded bg-gray-100" />
        ) : (
          <p className="mt-1 text-2xl font-black text-gray-900 tabular-nums tracking-tight">
            {insights?.totalPortfolioValue > 0
              ? formatINR(insights.totalPortfolioValue)
              : "—"}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          across{" "}
          <span className="font-semibold text-gray-700 tabular-nums">
            {totalProperties}
          </span>{" "}
          {totalProperties === 1 ? "property" : "properties"}
        </p>
      </div>

      {/* Highest value property */}
      {!loading && insights?.highestValueProperty && (
        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50/60 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.5} />
            Top asset
          </div>
          <p className="mt-1 text-xs font-bold text-gray-900 truncate">
            {insights.highestValueProperty.address}
          </p>
          <p className="text-[11px] text-gray-500">
            {formatINR(insights.highestValueProperty.marketValue)}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Column 2: Verification Progress ───────────────────────────
function VerificationCell({ verified, total, pct, loading }) {
  const RING_CIRCUMFERENCE = 2 * Math.PI * 32; // r=32

  return (
    <div className="group relative flex flex-col p-6 transition-colors hover:bg-gray-50/60">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f3] text-[#16a34a] transition-transform duration-200 group-hover:scale-110">
          <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
        </div>
        {pct === 100 && total > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#16a34a] ring-1 ring-green-100">
            All verified
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        {/* Ring */}
        <div className="relative h-20 w-20 flex-shrink-0">
          {loading ? (
            <div className="h-full w-full animate-pulse rounded-full bg-gray-100" />
          ) : (
            <>
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-gray-900 tabular-nums">
                  {pct}%
                </span>
              </div>
            </>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Verification
          </p>
          {loading ? (
            <div className="mt-2 h-5 w-20 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="mt-1 text-sm font-bold text-gray-900">
              <span className="text-xl text-[#16a34a] tabular-nums">{verified}</span>
              <span className="text-gray-400"> / </span>
              <span className="tabular-nums">{total}</span>
            </p>
          )}
          <p className="mt-0.5 text-xs text-gray-500">
            {total === 0
              ? "No properties yet"
              : verified === total
              ? "Portfolio complete"
              : `${total - verified} pending`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Column 3: Live AQI ────────────────────────────────────────
function LiveAqiCell({ aqi, city, loading }) {
    const aqiInfo = aqi?.value != null ? getAqiInfo(aqi.value) : null;

  return (
    <div className="group relative flex flex-col p-6 transition-colors hover:bg-gray-50/60">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f3] text-[#16a34a] transition-transform duration-200 group-hover:scale-110">
          <Wind className="h-5 w-5" strokeWidth={2.2} />
        </div>
        {aqi?.isLive && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#16a34a] ring-1 ring-green-100">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            </span>
            Live
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Air quality
        </p>

        {loading ? (
          <div className="mt-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="text-xs text-gray-400">Fetching live data...</span>
          </div>
        ) : aqi?.value != null ? (
          <div className="mt-1 flex items-baseline gap-2">
            <p
              className="text-2xl font-black tabular-nums tracking-tight"
              style={{ color: aqiInfo?.hex ?? "#111827" }}
            >
              {aqi.value}
            </p>
            <span className="text-xs font-bold text-gray-700">
              {aqiInfo?.label ?? aqi.category ?? ""}
            </span>
          </div>
        ) : (
          <p className="mt-1 text-2xl font-black text-gray-400 tabular-nums">—</p>
        )}

        {city ? (
          <p className="mt-1 text-xs text-gray-500 truncate">
            <Building2 className="mr-1 inline h-2.5 w-2.5" />
            <span className="font-semibold text-gray-700">{city}</span>
            {aqi?.station && ` · ${aqi.station.split(",")[0]}`}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">
            Add a property to see live air quality
          </p>
        )}
      </div>
    </div>
  );
}