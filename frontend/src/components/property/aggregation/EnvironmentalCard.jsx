"use client";

import { Wind, Layers, Factory, Leaf, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAqiInfo } from "@/constants/aqiScale";
import { translateEnum } from "@/utils/enumTranslations";

export default function EnvironmentalCard({ data }) {
  const { t } = useTranslation();

  const airQualityIndex  = data?.airQualityIndex    ?? null;
  const soilType         = data?.soilType            ?? null;
  const nearbyIndustrial = data?.nearbyIndustrial    ?? false;
  const greenCoverPct    = data?.greenCoverPercent   ?? null;
  const noiseLevel       = data?.noiseLevel          ?? null;

  const aqiInfo         = airQualityIndex != null ? getAqiInfo(airQualityIndex) : null;
  const greenCoverWidth = greenCoverPct != null ? Math.max(0, Math.min(100, greenCoverPct)) : null;

  return (
    <div className="h-full rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-7 shadow-sm">

      <h2 className="font-bold text-lg text-gray-900 dark:text-[#e6edf3]">
        {t("property.aggregation.environmental.title")}
      </h2>
      <p className="text-gray-500 dark:text-[#7d8590] text-sm mb-6">
        {t("property.aggregation.environmental.subtitle")}
      </p>

      <div className="space-y-5">

        {/* AQI */}
        <div className="flex gap-4 items-start justify-between">
          <div className="flex gap-4 items-start">
            <div className="rounded-full bg-green-100 dark:bg-[#0d2818] p-2">
              <Wind size={16} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-[#7d8590] text-sm">
                {t("property.aggregation.environmental.aqi")}
              </p>
              <p className="font-semibold text-gray-900 dark:text-[#e6edf3]">
                {airQualityIndex ?? "—"}
              </p>
            </div>
          </div>
          {aqiInfo?.labelKey && (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${aqiInfo.color}`}>
              {t(aqiInfo.labelKey)}
            </span>
          )}
        </div>

        {/* AQI description */}
        {aqiInfo?.descriptionKey && (
          <p className="ml-12 text-xs text-gray-500 dark:text-[#7d8590] -mt-3">
            {t(aqiInfo.descriptionKey)}
          </p>
        )}

        {/* Soil type */}
<div className="flex gap-4 items-start">
  <div className="rounded-full bg-green-100 dark:bg-[#0d2818] p-2">
    <Layers size={16} className="text-green-600 dark:text-green-400" />
  </div>
  <div>
    <p className="text-gray-500 dark:text-[#7d8590] text-sm">
      {t("property.aggregation.environmental.soilType")}
    </p>
    <p className="font-semibold text-gray-900 dark:text-[#e6edf3]">
      {soilType ? translateEnum(t, soilType) : "—"}
    </p>
  </div>
</div>

        {/* Nearby industrial */}
        <div className="flex gap-4 items-start justify-between">
          <div className="flex gap-4 items-start">
            <div className="rounded-full bg-green-100 dark:bg-[#0d2818] p-2">
              <Factory size={16} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-[#7d8590] text-sm">
                {t("property.aggregation.environmental.industrialZone")}
              </p>
              <p className="font-semibold text-gray-900 dark:text-[#e6edf3]">
                {nearbyIndustrial
                  ? t("property.aggregation.environmental.nearby")
                  : t("property.aggregation.environmental.notNearby")}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              nearbyIndustrial
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                : "bg-green-100 dark:bg-[#0d2818] text-green-700 dark:text-green-400"
            }`}
          >
            {nearbyIndustrial
              ? t("property.aggregation.environmental.nearby")
              : t("property.aggregation.environmental.notNearby")}
          </span>
        </div>

        {/* Green cover */}
        {greenCoverWidth != null && (
          <div>
            <div className="flex gap-4 items-start">
              <div className="rounded-full bg-green-100 dark:bg-[#0d2818] p-2">
                <Leaf size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 dark:text-[#7d8590] text-sm">
                    {t("property.aggregation.environmental.greenCover")}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-[#e6edf3]">
                    {greenCoverWidth}%
                  </p>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-[#30363d]">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${greenCoverWidth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Noise level */}
        {noiseLevel && (
          <div className="flex gap-4 items-start">
            <div className="rounded-full bg-green-100 dark:bg-[#0d2818] p-2">
              <Volume2 size={16} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-[#7d8590] text-sm">
                {t("property.aggregation.environmental.noiseLevel")}
              </p>
              <p className="font-semibold text-gray-900 dark:text-[#e6edf3]">
                {noiseLevel}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}