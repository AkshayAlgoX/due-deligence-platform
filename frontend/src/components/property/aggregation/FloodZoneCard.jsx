"use client";

import { Waves, Shield } from "lucide-react";
import SectionCard from "./SectionCard";

const RISK_STYLES = {
  LOW:    { ring: "ring-green-200 dark:ring-green-900",  bg: "bg-green-50 dark:bg-[#0d2818]",  text: "text-green-700 dark:text-green-400",  label: "Low risk" },
  MEDIUM: { ring: "ring-amber-200 dark:ring-amber-900",  bg: "bg-amber-50 dark:bg-[#282a10]",  text: "text-amber-700 dark:text-amber-400",  label: "Medium risk" },
  HIGH:   { ring: "ring-red-200 dark:ring-red-900",      bg: "bg-red-50 dark:bg-[#2d1214]",    text: "text-red-700 dark:text-red-400",    label: "High risk" },
};

export default function FloodZoneCard({ section }) {
  const flood = section?.data;
  const style = flood ? (RISK_STYLES[flood.riskLevel] ?? RISK_STYLES.LOW) : null;

  return (
    <SectionCard
      title="Flood risk"
      subtitle="Flood zone classification and history"
      icon={Waves}
      section={section}
    >
      {flood && (
        <div className="space-y-4">
          {/* Big risk badge */}
          <div className={`rounded-xl px-4 py-4 ring-1 ${style.bg} ${style.ring}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${style.text}`}>
                  Flood risk
                </p>
                <p className={`mt-1 text-xl font-black ${style.text}`}>
                  {style.label}
                </p>
              </div>
              {flood.zoneClassification && (
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                    Zone
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-800 dark:text-[#e6edf3]">
                    {flood.zoneClassification.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Insurance requirement */}
          {flood.insuranceRequired != null && (
            <div className="flex items-start gap-2 rounded-lg border border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#1c2128] px-3 py-2.5">
              <Shield
                className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                  flood.insuranceRequired ? "text-red-500 dark:text-red-400" : "text-green-600 dark:text-green-400"
                }`}
                strokeWidth={2.2}
              />
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-[#e6edf3]">
                  {flood.insuranceRequired
                    ? "Flood insurance recommended"
                    : "Flood insurance not mandatory"}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-[#7d8590]">
                  Based on {flood.dataAgency || "regional hazard data"}
                </p>
              </div>
            </div>
          )}

          {/* Water body info */}
          {flood.nearestWaterBody && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                  Nearest water body
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-[#e6edf3]">
                  {flood.nearestWaterBody}
                </p>
              </div>
              {flood.distanceToWaterBodyMeters != null && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                    Distance
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-[#e6edf3] tabular-nums">
                    {(flood.distanceToWaterBodyMeters / 1000).toFixed(2)} km
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Last flood */}
          {flood.lastMajorFloodDate && (
            <div className="rounded-lg bg-amber-50 dark:bg-[#282a10] px-3 py-2 ring-1 ring-amber-200 dark:ring-amber-900">
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                <span className="font-bold">Last major flood:</span>{" "}
                {new Date(flood.lastMajorFloodDate).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}