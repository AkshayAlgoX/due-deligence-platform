"use client";

import {
  Waves,
  ShieldCheck,
  ShieldAlert,
  Droplets,
  MapPin,
} from "lucide-react";

/**
 * Flood zone information card.
 *
 * Receives floodZoneInfo as a prop.
 * Displays risk level, zone designation,
 * insurance requirement, nearest water body
 * and last flood date.
 */
export default function FloodZoneCard({ floodZoneInfo }) {
  
  if (!floodZoneInfo) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col w-full">
        <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf7f3]">
            <Waves
              className="h-4 w-4 text-[#16a34a]"
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight">
              Flood zone information
            </h3>

            <p className="text-[11px] text-gray-500 mt-0.5">
              Flood risk and environmental information
            </p>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-500 text-center py-4">
            Flood zone data not available
          </p>
        </div>
      </div>
    );
  }

  const risk = floodZoneInfo.riskLevel?.toLowerCase();

  const riskStyles = {
    low: "bg-green-100 text-green-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col w-full">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf7f3]">
            <Waves
              className="h-4 w-4 text-[#16a34a]"
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight">
              Flood zone information
            </h3>

            <p className="text-[11px] text-gray-500 mt-0.5">
              Flood risk and environmental information
            </p>
          </div>
        </div>

        {floodZoneInfo.riskLevel && (
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
              riskStyles[risk] || "bg-gray-100 text-gray-700"
            }`}
          >
            {floodZoneInfo.riskLevel} risk
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex-1 space-y-3">

        {floodZoneInfo.zoneClassification && (
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/40 px-3 py-2">
            <MapPin className="h-4 w-4 text-gray-500" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Zone designation
              </p>

              <p className="text-sm font-bold text-gray-900">
                {floodZoneInfo.zoneClassification}
              </p>
            </div>
          </div>
        )}

        {floodZoneInfo.insuranceRequired != null && (
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/40 px-3 py-2">

            {floodZoneInfo.insuranceRequired ? (
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-green-600" />
            )}

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Insurance required
              </p>

              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  floodZoneInfo.insuranceRequired
                    ? "bg-amber-100 text-amber-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {floodZoneInfo.insuranceRequired ? "Yes" : "No"}
              </span>
            </div>
          </div>
        )}

        {floodZoneInfo.nearestWaterBody && (
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/40 px-3 py-2">
            <Droplets className="h-4 w-4 text-gray-500" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Nearest water body
              </p>

              <p className="text-sm font-bold text-gray-900">
                {floodZoneInfo.nearestWaterBody}
                {floodZoneInfo.distanceToWaterBodyMeters != null &&
                  ` (${floodZoneInfo.distanceToWaterBodyMeters} m away)`}
              </p>
            </div>
          </div>
        )}

        {floodZoneInfo.lastMajorFloodDate && (
          <div className="rounded-lg border border-gray-100 bg-gray-50/40 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Last flood date
            </p>

            <p className="text-sm font-bold text-gray-900">
              {floodZoneInfo.lastMajorFloodDate || "No recorded floods"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
      