"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

export default function HeroStrip({ stats, loading: statsLoading }) {
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [aqi, setAqi] = useState(null);
  const [aqiLoading, setAqiLoading] = useState(false);

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

  const verificationPct =
    stats && stats.totalProperties > 0
      ? Math.round((stats.verifiedProperties / stats.totalProperties) * 100)
      : 0;

  const isEmpty = !statsLoading && stats && stats.totalProperties === 0;
  if (isEmpty) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
      <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-[#30363d] md:grid-cols-3 md:divide-x md:divide-y-0">
        <PortfolioValueCell
          insights={insights}
          loading={insightsLoading}
          totalProperties={stats?.totalProperties ?? 0}
        />
        <VerificationCell
          verified={stats?.verifiedProperties ?? 0}
          total={stats?.totalProperties ?? 0}
          pct={verificationPct}
          loading={statsLoading}
        />
        <LiveAqiCell
          aqi={aqi}
          city={insights?.userTopCity}
          loading={aqiLoading || insightsLoading}
        />
      </div>
    </div>
  );
}

function PortfolioValueCell({ insights, loading, totalProperties }) {
  const { t } = useTranslation();

  return (
    <div className="group relative flex flex-col p-6 transition-colors hover:bg-gray-50/60 dark:hover:bg-[#1c2128]">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818] text-[#16a34a] dark:text-green-400 transition-transform duration-200 group-hover:scale-110">
          <Wallet className="h-5 w-5" strokeWidth={2.2} />
        </div>
        {insights?.totalCitiesCovered > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 dark:bg-[#1c2128] px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-[#7d8590] ring-1 ring-gray-200 dark:ring-[#30363d]">
            <MapPin className="h-2.5 w-2.5" strokeWidth={2.5} />
            {t("hero.portfolio.citiesCount", { count: insights.totalCitiesCovered })}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">
          {t("hero.portfolio.label")}
        </p>
        {loading ? (
          <div className="mt-2 h-8 w-40 animate-pulse rounded bg-gray-100 dark:bg-[#1c2128]" />
        ) : (
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-[#e6edf3] tabular-nums tracking-tight">
            {insights?.totalPortfolioValue > 0
              ? formatINR(insights.totalPortfolioValue)
              : "—"}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590]">
          <span className="tabular-nums font-semibold text-gray-700 dark:text-[#e6edf3]">
            {t("hero.portfolio.acrossProperties", { count: totalProperties })}
          </span>
        </p>
      </div>

      {!loading && insights?.highestValueProperty && (
        <div className="mt-4 rounded-lg border border-gray-100 dark:border-[#30363d] bg-gray-50/60 dark:bg-[#1c2128] p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">
            <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.5} />
            {t("hero.portfolio.topAsset")}
          </div>
          <p className="mt-1 text-xs font-bold text-gray-900 dark:text-[#e6edf3] truncate">
            {insights.highestValueProperty.address}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-[#7d8590]">
            {formatINR(insights.highestValueProperty.marketValue)}
          </p>
        </div>
      )}
    </div>
  );
}

function VerificationCell({ verified, total, pct, loading }) {
  const { t } = useTranslation();
  const RING_CIRCUMFERENCE = 2 * Math.PI * 32;

  return (
    <div className="group relative flex flex-col p-6 transition-colors hover:bg-gray-50/60 dark:hover:bg-[#1c2128]">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818] text-[#16a34a] dark:text-green-400 transition-transform duration-200 group-hover:scale-110">
          <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
        </div>
        {pct === 100 && total > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-[#0d2818] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#16a34a] dark:text-green-400 ring-1 ring-green-100 dark:ring-green-900">
            {t("hero.verification.allVerified")}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-20 w-20 flex-shrink-0">
          {loading ? (
            <div className="h-full w-full animate-pulse rounded-full bg-gray-100 dark:bg-[#1c2128]" />
          ) : (
            <>
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  className="stroke-gray-200 dark:stroke-[#30363d]"
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
                <span className="text-lg font-black text-gray-900 dark:text-[#e6edf3] tabular-nums">
                  {pct}%
                </span>
              </div>
            </>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">
            {t("hero.verification.label")}
          </p>
          {loading ? (
            <div className="mt-2 h-5 w-20 animate-pulse rounded bg-gray-100 dark:bg-[#1c2128]" />
          ) : (
            <p className="mt-1 text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
              <span className="text-xl text-[#16a34a] dark:text-green-400 tabular-nums">{verified}</span>
              <span className="text-gray-400 dark:text-[#6e7681]"> / </span>
              <span className="tabular-nums">{total}</span>
            </p>
          )}
          <p className="mt-0.5 text-xs text-gray-500 dark:text-[#7d8590]">
            {total === 0
              ? t("hero.verification.noPropertiesYet")
              : verified === total
              ? t("hero.verification.portfolioComplete")
              : t("hero.verification.pendingCount", { count: total - verified })}
          </p>
        </div>
      </div>
    </div>
  );
}

function LiveAqiCell({ aqi, city, loading }) {
  const { t } = useTranslation();
  const aqiInfo = aqi?.value != null ? getAqiInfo(aqi.value) : null;

  return (
    <div className="group relative flex flex-col p-6 transition-colors hover:bg-gray-50/60 dark:hover:bg-[#1c2128]">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818] text-[#16a34a] dark:text-green-400 transition-transform duration-200 group-hover:scale-110">
          <Wind className="h-5 w-5" strokeWidth={2.2} />
        </div>
        {aqi?.isLive && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-[#0d2818] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#16a34a] dark:text-green-400 ring-1 ring-green-100 dark:ring-green-900">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            </span>
            {t("hero.aqi.live")}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">
          {t("hero.aqi.label")}
        </p>

        {loading ? (
          <div className="mt-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400 dark:text-[#7d8590]" />
            <span className="text-xs text-gray-400 dark:text-[#7d8590]">
              {t("hero.aqi.fetchingLive")}
            </span>
          </div>
        ) : aqi?.value != null ? (
          <div className="mt-1 flex items-baseline gap-2">
            <p
              className="text-2xl font-black tabular-nums tracking-tight"
              style={{ color: aqiInfo?.hex ?? "#111827" }}
            >
              {aqi.value}
            </p>
            <span className="text-xs font-bold text-gray-700 dark:text-[#e6edf3]">
              {aqiInfo?.labelKey ? t(aqiInfo.labelKey) : (aqi.category ?? "")}
            </span>
          </div>
        ) : (
          <p className="mt-1 text-2xl font-black text-gray-400 dark:text-[#6e7681] tabular-nums">—</p>
        )}

        {city ? (
          <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590] truncate">
            <Building2 className="mr-1 inline h-2.5 w-2.5" />
            <span className="font-semibold text-gray-700 dark:text-[#e6edf3]">{city}</span>
            {aqi?.station && ` · ${aqi.station.split(",")[0]}`}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590]">
            {t("hero.aqi.addPropertyToSee")}
          </p>
        )}
      </div>
    </div>
  );
}