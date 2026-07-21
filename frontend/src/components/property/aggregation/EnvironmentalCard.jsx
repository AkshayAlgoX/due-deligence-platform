"use client";

import { Wind, Trees, Volume2, Factory } from "lucide-react";
import SectionCard from "./SectionCard";
import { getAqiInfo } from "@/constants/aqiScale";

export default function EnvironmentalCard({ section }) {
  const env = section?.data;
  const aqiInfo = env ? getAqiInfo(env.airQualityIndex) : null;

  return (
    <SectionCard
      title="Environmental"
      subtitle="Air quality and surroundings"
      icon={Wind}
      section={section}
    >
      {env && (
        <div className="space-y-4">
          {/* Big AQI display */}
          {env.airQualityIndex != null && aqiInfo && (
            <div className={`rounded-xl px-4 py-4 ring-1 ${aqiInfo.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                    Air quality index
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
      Main pollutant
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
  <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
      Nearest monitoring station
    </p>
    <p className="mt-0.5 text-sm font-semibold text-gray-800">
      {cleanStationName(env.nearestStation)}
    </p>
              {env.measuredAt && (
                <p className="mt-0.5 text-[10px] text-gray-500">
                  Measured {formatTimeAgo(env.measuredAt)}
                </p>
              )}
            </div>
          )}

          {/* Other environmental data */}
          <div className="grid grid-cols-2 gap-3">
            {env.greenCoveragePercent != null && (
              <SmallStat
                icon={Trees}
                iconColor="text-green-600"
                label="Green cover"
                value={`${env.greenCoveragePercent}%`}
              />
            )}
            {env.noiseLevelDb != null && (
              <SmallStat
                icon={Volume2}
                iconColor="text-blue-600"
                label="Noise level"
                value={`${env.noiseLevelDb} dB`}
              />
            )}
            {env.soilType && (
              <SmallStat
                icon={Factory}
                iconColor="text-amber-600"
                label="Soil type"
                value={env.soilType.replace(/_/g, " ")}
              />
            )}
            {env.nearIndustrialZone != null && (
              <SmallStat
                icon={Factory}
                iconColor={env.nearIndustrialZone ? "text-red-500" : "text-gray-500"}
                label="Industrial zone"
                value={env.nearIndustrialZone ? "Nearby" : "Not nearby"}
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
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2">
      <Icon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} strokeWidth={2} />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {label}
        </p>
        <p className="text-xs font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}


/** Format WAQI's pollutant codes into industry-standard notation. */
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

/** Strip translated names in parentheses (e.g. Devanagari, Chinese). */
function cleanStationName(name) {
  if (!name) return "";
  return name.replace(/\s*\([^)]*\)\s*$/, "").trim();
}
function formatTimeAgo(iso) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}