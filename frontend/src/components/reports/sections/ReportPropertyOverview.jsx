"use client";

import { useTranslation } from "react-i18next";
import {
  MapPin,
  Home,
  Ruler,
  Calendar,
  BedDouble,
  Bath,
  Layers,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function parseSectionData(section) {
  if (!section?.dataJson) return null;
  try {
    return typeof section.dataJson === "string"
      ? JSON.parse(section.dataJson)
      : section.dataJson;
  } catch {
    return null;
  }
}

function formatCurrency(value) {
  if (value == null) return "—";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatArea(value) {
  if (value == null) return "—";
  return `${value.toLocaleString("en-IN")} sq ft`;
}

function StatRow({ icon: Icon, label, value, accent }) {
  if (value == null || value === "—" || value === "") return null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-[#30363d]/60 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-[#21262d] flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
        </div>
        <span className="text-[13px] text-gray-500 dark:text-[#7d8590] font-medium">
          {label}
        </span>
      </div>
      <span
        className="text-[13px] font-semibold text-right"
        style={{ color: accent || undefined }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ReportPropertyOverview({ section }) {
  const { t } = useTranslation();
  const data = parseSectionData(section);

  if (!data) {
    return (
      <div
        id="section-PROPERTY_OVERVIEW"
        className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 text-center"
      >
        <Home className="w-10 h-10 text-gray-300 dark:text-[#30363d] mx-auto mb-3" />
        <p className="text-[13px] text-gray-400 dark:text-[#6e7681]">
          {t("report.property.unavailable")}
        </p>
      </div>
    );
  }

  const address = data.address || "—";
  const city = data.city || "";
  const state = data.state || "";
  const zipCode = data.zipCode || "";
  const locationLine = [city, state, zipCode].filter(Boolean).join(", ");

  const pricePerSqFt =
    data.area && data.marketValue
      ? Math.round(data.marketValue / data.area)
      : null;

  return (
    <div
      id="section-PROPERTY_OVERVIEW"
      className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-gray-100 dark:border-[#30363d]">
        <div className="flex items-center gap-2 mb-1">
          <Home className="w-4 h-4 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
            {t("report.property.eyebrow")}
          </p>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
          {address}
        </h2>
        {locationLine && (
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-[#6e7681]" strokeWidth={2} />
            <span className="text-[13px] text-gray-500 dark:text-[#7d8590]">
              {locationLine}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {data.marketValue != null && (
          <div className="rounded-xl border border-gray-100 dark:border-[#30363d] bg-gradient-to-r from-gray-50 to-white dark:from-[#0d1117]/60 dark:to-[#161b22] p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-1">
              {t("report.property.marketValue")}
            </p>
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-4xl font-black tabular-nums text-gray-900 dark:text-[#e6edf3] leading-none">
                {formatCurrency(data.marketValue)}
              </span>
              {pricePerSqFt != null && (
                <span className="text-[13px] font-semibold text-gray-400 dark:text-[#6e7681] mb-0.5">
                  · {t("report.property.pricePerSqFt", { value: pricePerSqFt.toLocaleString("en-IN") })}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-100 dark:border-[#30363d] bg-gray-50/30 dark:bg-[#0d1117]/20 px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] pt-3 pb-1">
              {t("report.property.details")}
            </p>
            <StatRow icon={Building2} label={t("report.property.labels.type")} value={data.propertyType} />
            <StatRow icon={Ruler} label={t("report.property.labels.area")} value={formatArea(data.area)} />
            <StatRow icon={Calendar} label={t("report.property.labels.yearBuilt")} value={data.yearBuilt?.toString()} />
            <StatRow icon={Layers} label={t("report.property.labels.stories")} value={data.stories?.toString()} />
            <StatRow icon={Home} label={t("report.property.labels.structure")} value={data.structureType} />
            <StatRow icon={Home} label={t("report.property.labels.condition")} value={data.condition} />
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-[#30363d] bg-gray-50/30 dark:bg-[#0d1117]/20 px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] pt-3 pb-1">
              {t("report.property.specs")}
            </p>
            <StatRow icon={BedDouble} label={t("report.property.labels.bedrooms")} value={data.bedrooms?.toString()} />
            <StatRow icon={Bath} label={t("report.property.labels.bathrooms")} value={data.bathrooms?.toString()} />
            <StatRow icon={MapPin} label={t("report.property.labels.zipCode")} value={data.zipCode} />
            <StatRow
              icon={data.verified ? CheckCircle2 : XCircle}
              label={t("report.property.labels.verified")}
              value={data.verified ? t("report.property.labels.yes") : t("report.property.labels.no")}
              accent={data.verified ? "#22C55E" : "#EF4444"}
            />
            {data.lotSize != null && (
              <StatRow icon={Ruler} label={t("report.property.labels.lotSize")} value={formatArea(data.lotSize)} />
            )}
            {data.zoning && (
              <StatRow icon={MapPin} label={t("report.property.labels.zoning")} value={data.zoning} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}