"use client";

import { Map, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionCard from "./SectionCard";

export default function ZoningCard({ section }) {
  const { t } = useTranslation();
  const zoning = section?.data;

  return (
    <SectionCard
      title={t("property.aggregation.zoning.title")}
      subtitle={t("property.aggregation.zoning.subtitle")}
      icon={Map}
      section={section}
      emptyLabel={t("property.aggregation.zoning.emptyLabel")}
    >
      {zoning && (
        <div className="space-y-4">
          {/* Zone code + category */}
          <div className="flex items-center justify-between rounded-xl bg-[#edf7f3] dark:bg-[#0d2818] px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#16a34a] dark:text-green-400">
                {t("property.aggregation.zoning.zoneCode")}
              </p>
              <p className="mt-0.5 text-2xl font-black text-gray-900 dark:text-[#e6edf3] tabular-nums">
                {zoning.zoneCode || "—"}
              </p>
            </div>
            {zoning.zoneCategory && (
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                  {t("property.aggregation.zoning.category")}
                </p>
                <p className="mt-0.5 text-sm font-bold text-gray-800 dark:text-[#e6edf3]">
                  {zoning.zoneCategory.replace(/_/g, " ")}
                </p>
              </div>
            )}
          </div>

          {/* Building rules */}
          <div className="grid grid-cols-3 gap-3">
            <MetricCell label={t("property.aggregation.zoning.maxFar")} value={zoning.maxFAR?.toFixed(2)} />
            <MetricCell
              label={t("property.aggregation.zoning.groundCoverage")}
              value={zoning.maxGroundCoverage != null ? `${zoning.maxGroundCoverage}%` : null}
            />
            <MetricCell
              label={t("property.aggregation.zoning.maxHeight")}
              value={zoning.maxHeightMeters != null ? `${zoning.maxHeightMeters} m` : null}
            />
          </div>

          {/* Allowed uses */}
          {zoning.allowedUses?.length > 0 && (
            <UsesList
              icon={CheckCircle2}
              iconColor="text-green-600 dark:text-green-400"
              label={t("property.aggregation.zoning.allowedUses")}
              uses={zoning.allowedUses}
            />
          )}

          {/* Restricted uses */}
          {zoning.restrictedUses?.length > 0 && (
            <UsesList
              icon={XCircle}
              iconColor="text-red-500 dark:text-red-400"
              label={t("property.aggregation.zoning.restrictedUses")}
              uses={zoning.restrictedUses}
            />
          )}

          {/* Master plan reference */}
          {zoning.masterPlanReference && (
            <div className="border-t border-gray-100 dark:border-[#30363d] pt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                {t("property.aggregation.zoning.referencePlan")}
              </p>
              <p className="mt-1 text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">
                {zoning.masterPlanReference}
              </p>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function MetricCell({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#1c2128] px-3 py-2.5 text-center">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-gray-900 dark:text-[#e6edf3] tabular-nums">
        {value ?? "—"}
      </p>
    </div>
  );
}

function UsesList({ icon: Icon, iconColor, label, uses }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className={`h-3 w-3 ${iconColor}`} strokeWidth={2.5} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
          {label}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {uses.map((u) => (
          <span
            key={u}
            className="rounded-md bg-gray-100 dark:bg-[#1c2128] px-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:text-[#e6edf3]"
          >
            {u}
          </span>
        ))}
      </div>
    </div>
  );
}