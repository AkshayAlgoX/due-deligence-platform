"use client";

import { Wind, Trees, Volume2, Factory } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionCard from "./SectionCard";
import { getAqiInfo } from "@/constants/aqiScale";

export default function EnvironmentalCard({ section }) {
  const { t } = useTranslation();
  const env = section?.data;
  const aqiInfo = env ? getAqiInfo(env.airQualityIndex) : null;

  const formatTimeAgo = (iso) => {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return t("common.justNow");
    if (secs < 3600) return t("common.minutesAgo", { n: Math.floor(secs / 60) });
    if (secs < 86400) return t("common.hoursAgo", { n: Math.floor(secs / 3600) });
    return t("common.daysAgo", { n: Math.floor(secs / 86400) });
  };

  return (
    <SectionCard
      title={t("property.aggregation.environmental.title")}
      subtitle={t("property.aggregation.environmental.subtitle")}
      icon={Wind}
      section={section}
      emptyLabel={t("property.aggregation.environmental.emptyLabel")}
    >
      {env && (
        <div className="space-y-4">
          {/* Big AQI display */}
          {env.airQualityIndex != null && aqiInfo && (
            <div className={`rounded-xl px-4 py-4 ring-1 ${aqiInfo.color} dark:brightness-110 dark:contrast-125`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                    {t("property.aggregation.environmental.aqi")}
                  </p>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-black tabular-nums">
                      {env.airQualityIndex}
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wider">
                      {aqiInfo.label}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] opacity-80">
                    {aqiInfo.desc}
                  </p>
                </div>
                {env.dominantPollutant && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                      {t("property.aggregation.environmental.mainPollutant")}
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      {formatPollutant(env.dominantPollutant)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Station info */}
          {env.nearestStation && (
            <div className="rounded-lg border border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#1c2128] px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                {t("property.aggregation.environmental.nearestStation")}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">
                {cleanStationName(env.nearestStation)}
              </p>
              {env.measuredAt && (
                <p className="mt-0.5 text-[10px] text-gray-500 dark:text-[#7d8590]">
                  {t("property.aggregation.environmental.measured", { ago: formatTimeAgo(env.measuredAt) })}
                </p>
              )}
            </div>
          )}

          {/* Other environmental data */}
          <div className="grid grid-cols-2 gap-3">
            {env.greenCoveragePercent != null && (
              <SmallStat
                icon={Trees}
                iconColor="text-green-600 dark:text-green-400"
                label={t("property.aggregation.environmental.greenCover")}
                value={`${env.greenCoveragePercent}%`}
              />
            )}
            {env.noiseLevelDb != null && (
              <SmallStat
                icon={Volume2}
                iconColor="text-blue-600 dark:text-blue-400"
                label={t("property.aggregation.environmental.noiseLevel")}
                value={`${env.noiseLevelDb} dB`}
              />
            )}
            {env.soilType && (
              <SmallStat
                icon={Factory}
                iconColor="text-amber-600 dark:text-amber-400"
                label={t("property.aggregation.environmental.soilType")}
                value={env.soilType.replace(/_/g, " ")}
              />
            )}
            {env.nearIndustrialZone != null && (
              <SmallStat
                icon={Factory}
                iconColor={env.nearIndustrialZone ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-[#7d8590]"}
                label={t("property.aggregation.environmental.industrialZone")}
                value={env.nearIndustrialZone ? t("property.aggregation.environmental.nearby") : t("property.aggregation.environmental.notNearby")}
              />
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function SmallStat({ icon: Icon, iconColor, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-3 py-2">
      <Icon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} strokeWidth={2} />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
          {label}
        </p>
        <p className="text-xs font-bold text-gray-900 dark:text-[#e6edf3] truncate">{value}</p>
      </div>
    </div>
  );
}

function formatPollutant(code) {
  if (!code) return "";
  const map = {
    PM25: "PM2.5",
    PM10: "PM10",
    NO2: "NO₂",
    SO2: "SO₂",
    O3: "O₃",
    CO: "CO",
  };
  return map[code.toUpperCase()] ?? code;
}

function cleanStationName(name) {
  if (!name) return "";
  return name.replace(/\s*\([^)]*\)\s*$/, "").trim();
}