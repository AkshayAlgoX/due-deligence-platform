"use client";

import {
  MapPinned,
  Map,
  Ruler,
  Building2,
  AlertTriangle,
} from "lucide-react";

/**
 * Zoning information card.
 *
 * Receives zoningInfo as a prop.
 * Displays zoning type, allowed uses, FAR,
 * maximum height and restrictions.
 * Shows an empty state when zoning data is unavailable.
 */
export default function ZoningCard({ zoningInfo }) {
  
  const hasData =
    zoningInfo &&
    (zoningInfo.zoneCode ||
      zoningInfo.zoneCategory ||
      zoningInfo.allowedUses?.length ||
      zoningInfo.maxFAR != null ||
      zoningInfo.maxHeightMeters != null ||
      zoningInfo.restrictedUses?.length);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col w-full">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3]">
            <MapPinned
              className="h-4 w-4 text-[#16a34a]"
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight">
              Zoning information
            </h3>

            <p className="text-[11px] text-gray-500 mt-0.5">
              Land use and development regulations
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1">

        {!hasData ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Zoning data not available
          </p>
        ) : (
          <div className="space-y-3">

            {/* Zone Type */}
            {zoningInfo.zoneCode && (
             <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Zone type
                </p>

                <p className="text-lg font-bold text-gray-900">
                  {zoningInfo.zoneCategory
                    ? `${zoningInfo.zoneCategory} (${zoningInfo.zoneCode})`
                    : zoningInfo.zoneCode}
                </p>
              </div>
           )}
            

            {/* Allowed Uses */}
            {zoningInfo.allowedUses?.length > 0 && (
              <div>
                 <p className="text-xs font-bold text-gray-500 mb-2">
                  Allowed usage
                </p>

                <div className="flex flex-wrap gap-2">
                  {zoningInfo.allowedUses.map((use, index) => (
                    <span
                      key={index}
                     className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                    >
                      {use}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FAR */}
            {zoningInfo.maxFAR != null && (
              <div> 
                <p className="text-xs text-gray-500">Max FAR</p>
                <p className="text-lg font-bold">
                  {zoningInfo.maxFAR}
                </p>
              </div>
            )}

            {/* Maximum Height */}
            {zoningInfo.maxHeightMeters != null && (
              <div>
                <p className="text-xs text-gray-500">Max height</p>
                <p className="text-lg font-bold">
                  {zoningInfo.maxHeightMeters} m
                </p>
              </div>
            )}

            {/* Restrictions */}
            {zoningInfo.restrictedUses?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 mb-2">
                  Restrictions
                </p>

                <ul className="space-y-1">
                  {zoningInfo.restrictedUses.map((item, index) => (
                    <li
                      key={index}
                      className="w-40 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}