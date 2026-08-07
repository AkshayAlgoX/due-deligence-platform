"use client";

import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  Receipt,
  User,
  FileText,
  Wind,
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

function formatDateArray(arr) {
  if (!Array.isArray(arr) || arr.length < 3) return "—";
  const [y, m, d] = arr;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TaxStatusChip({ status, t }) {
  const meta = {
    PAID: { color: "#22C55E", bg: "rgba(34,197,94,0.1)", key: "report.financial.tax.status.paid" },
    PENDING: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", key: "report.financial.tax.status.pending" },
    OVERDUE: { color: "#EF4444", bg: "rgba(239,68,68,0.1)", key: "report.financial.tax.status.overdue" },
  };
  const s = meta[status] || { color: "#7d8590", bg: "rgba(125,133,144,0.1)", key: null };
  return (
    <span
      className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {s.key ? t(s.key) : status}
    </span>
  );
}

function DataSourceChip({ status, t }) {
  if (status === "LIVE") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#22C55E]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
        {t("report.financial.source.live")}
      </span>
    );
  }
  return (
    <span className="text-[11px] font-semibold text-gray-400 dark:text-[#6e7681]">
      {t("report.financial.source.mock")}
    </span>
  );
}

export default function ReportFinancialSection({ section }) {
  const { t } = useTranslation();
  const data = parseSectionData(section);

  if (!data) {
    return (
      <div
        id="section-FINANCIAL"
        className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 text-center"
      >
        <TrendingUp className="w-10 h-10 text-gray-300 dark:text-[#30363d] mx-auto mb-3" />
        <p className="text-[13px] text-gray-400 dark:text-[#6e7681]">
          {t("report.financial.unavailable")}
        </p>
      </div>
    );
  }

  const property = data.property || {};
  const ownership = data.ownership?.data || {};
  const taxHistoryWrapper = data.taxHistory;
  const taxRecords = Array.isArray(taxHistoryWrapper?.data) ? taxHistoryWrapper.data : [];
  const permits = data.permits?.data || [];
  const environmental = data.environmental?.data || {};

  const pricePerSqFt =
    property.area && property.marketValue
      ? Math.round(property.marketValue / property.area)
      : null;

  const paidCount = taxRecords.filter((r) => r.status === "PAID").length;
  const pendingCount = taxRecords.filter((r) => r.status === "PENDING").length;
  const overdueCount = taxRecords.filter((r) => r.status === "OVERDUE").length;

  return (
    <div
      id="section-FINANCIAL"
      className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-gray-100 dark:border-[#30363d]">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
            {t("report.financial.eyebrow")}
          </p>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
          {t("report.financial.title")}
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-100 dark:border-[#30363d] bg-gray-50/40 dark:bg-[#0d1117]/30 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-1">
              {t("report.financial.marketValue")}
            </p>
            <p className="text-2xl font-black tabular-nums text-gray-900 dark:text-[#e6edf3]">
              {formatCurrency(property.marketValue)}
            </p>
          </div>
          {pricePerSqFt != null && (
            <div className="rounded-xl border border-gray-100 dark:border-[#30363d] bg-gray-50/40 dark:bg-[#0d1117]/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-1">
                {t("report.financial.pricePerSqFt")}
              </p>
              <p className="text-2xl font-black tabular-nums text-gray-900 dark:text-[#e6edf3]">
                ₹{pricePerSqFt.toLocaleString("en-IN")}
              </p>
            </div>
          )}
          {ownership.registeredValue != null && (
            <div className="rounded-xl border border-gray-100 dark:border-[#30363d] bg-gray-50/40 dark:bg-[#0d1117]/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-1">
                {t("report.financial.registeredValue")}
              </p>
              <p className="text-2xl font-black tabular-nums text-gray-900 dark:text-[#e6edf3]">
                {formatCurrency(ownership.registeredValue)}
              </p>
            </div>
          )}
        </div>

        {(ownership.currentOwner || ownership.ownershipType) && (
          <div className="rounded-xl border border-gray-100 dark:border-[#30363d] overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/60 dark:bg-[#21262d]/40 border-b border-gray-100 dark:border-[#30363d]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                    {t("report.financial.ownership.title")}
                  </span>
                </div>
                <DataSourceChip status={data.ownership?.status} t={t} />
              </div>
            </div>
            <div className="px-4 py-3 space-y-2">
              {ownership.currentOwner && (
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-[#30363d]/50">
                  <span className="text-[13px] text-gray-500 dark:text-[#7d8590]">
                    {t("report.financial.ownership.currentOwner")}
                  </span>
                  <span className="text-[13px] font-semibold text-gray-800 dark:text-[#e6edf3]">
                    {ownership.currentOwner}
                  </span>
                </div>
              )}
              {ownership.ownershipType && (
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-[#30363d]/50">
                  <span className="text-[13px] text-gray-500 dark:text-[#7d8590]">
                    {t("report.financial.ownership.ownershipType")}
                  </span>
                  <span className="text-[13px] font-semibold text-gray-800 dark:text-[#e6edf3]">
                    {ownership.ownershipType}
                  </span>
                </div>
              )}
              {ownership.registrationDate && (
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-[#30363d]/50">
                  <span className="text-[13px] text-gray-500 dark:text-[#7d8590]">
                    {t("report.financial.ownership.registrationDate")}
                  </span>
                  <span className="text-[13px] font-semibold text-gray-800 dark:text-[#e6edf3]">
                    {formatDateArray(ownership.registrationDate)}
                  </span>
                </div>
              )}
              {ownership.registrationNumber && (
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-[#30363d]/50">
                  <span className="text-[13px] text-gray-500 dark:text-[#7d8590]">
                    {t("report.financial.ownership.registrationNumber")}
                  </span>
                  <span className="text-[12px] font-mono text-gray-800 dark:text-[#e6edf3]">
                    {ownership.registrationNumber}
                  </span>
                </div>
              )}
              {ownership.stampDutyPaid != null && (
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] text-gray-500 dark:text-[#7d8590]">
                    {t("report.financial.ownership.stampDutyPaid")}
                  </span>
                  <span className="text-[13px] font-semibold text-gray-800 dark:text-[#e6edf3]">
                    {formatCurrency(ownership.stampDutyPaid)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {taxRecords.length > 0 && (
          <div className="rounded-xl border border-gray-100 dark:border-[#30363d] overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/60 dark:bg-[#21262d]/40 border-b border-gray-100 dark:border-[#30363d]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                    {t("report.financial.tax.title")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DataSourceChip status={taxHistoryWrapper?.status} t={t} />
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <span className="text-[#22C55E]">
                      {t("report.financial.tax.paid", { n: paidCount })}
                    </span>
                    {pendingCount > 0 && (
                      <span className="text-[#F59E0B]">
                        {t("report.financial.tax.pending", { n: pendingCount })}
                      </span>
                    )}
                    {overdueCount > 0 && (
                      <span className="text-[#EF4444]">
                        {t("report.financial.tax.overdue", { n: overdueCount })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-[#30363d]/50">
              {taxRecords.map((record, i) => (
                <div
                  key={i}
                  className="px-4 py-3 flex items-center justify-between flex-wrap gap-2 hover:bg-gray-50/40 dark:hover:bg-[#21262d]/20 transition-colors duration-150"
                >
                  <div>
                    <span className="text-[13px] font-semibold text-gray-800 dark:text-[#e6edf3]">
                      {t("report.financial.tax.fy", { year: record.assessmentYear })}
                    </span>
                    {record.municipality && (
                      <span className="text-[11px] text-gray-400 dark:text-[#6e7681] ml-2">
                        {record.municipality}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-semibold text-gray-700 dark:text-[#e6edf3]">
                      {formatCurrency(record.taxAmount)}
                    </span>
                    <TaxStatusChip status={record.status} t={t} />
                    {record.paidDate && (
                      <span className="text-[11px] text-gray-400 dark:text-[#6e7681] hidden sm:block">
                        {formatDateArray(record.paidDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {permits.length > 0 && (
          <div className="rounded-xl border border-gray-100 dark:border-[#30363d] overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/60 dark:bg-[#21262d]/40 border-b border-gray-100 dark:border-[#30363d]">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                  {t("report.financial.permits.title")}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-[#30363d]/50">
              {permits.map((permit, i) => (
                <div
                  key={i}
                  className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-gray-50/40 dark:hover:bg-[#21262d]/20 transition-colors duration-150"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800 dark:text-[#e6edf3]">
                      {permit.permitType}
                    </p>
                    <p className="text-[12px] text-gray-400 dark:text-[#6e7681] font-mono">
                      {permit.permitNumber}
                    </p>
                    {permit.description && (
                      <p className="text-[12px] text-gray-500 dark:text-[#7d8590] mt-0.5">
                        {permit.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
                      style={{
                        color: permit.status === "APPROVED" ? "#22C55E" : "#F59E0B",
                        backgroundColor:
                          permit.status === "APPROVED"
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(245,158,11,0.1)",
                      }}
                    >
                      {permit.status}
                    </span>
                    <p className="text-[11px] text-gray-400 dark:text-[#6e7681] mt-1">
                      {permit.issuingAuthority}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {environmental.airQualityIndex != null && (
          <div className="rounded-xl border border-gray-100 dark:border-[#30363d] overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/60 dark:bg-[#21262d]/40 border-b border-gray-100 dark:border-[#30363d]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-3.5 h-3.5 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
                    {t("report.financial.environmental.title")}
                  </span>
                </div>
                <DataSourceChip status={data.environmental?.status} t={t} />
              </div>
            </div>
            <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-1">
                  {t("report.financial.environmental.aqi")}
                </p>
                <p className="text-xl font-black text-gray-800 dark:text-[#e6edf3]">
                  {environmental.airQualityIndex}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-[#6e7681]">
                  {environmental.aqiCategory}
                </p>
              </div>
              {environmental.soilType && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-1">
                    {t("report.financial.environmental.soilType")}
                  </p>
                  <p className="text-[13px] font-semibold text-gray-800 dark:text-[#e6edf3]">
                    {environmental.soilType.replace(/_/g, " ")}
                  </p>
                </div>
              )}
              {environmental.noiseLevelDb != null && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-1">
                    {t("report.financial.environmental.noiseLevel")}
                  </p>
                  <p className="text-[13px] font-semibold text-gray-800 dark:text-[#e6edf3]">
                    {environmental.noiseLevelDb} dB
                  </p>
                </div>
              )}
              {environmental.greenCoveragePercent != null && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-1">
                    {t("report.financial.environmental.greenCover")}
                  </p>
                  <p className="text-[13px] font-semibold text-gray-800 dark:text-[#e6edf3]">
                    {environmental.greenCoveragePercent}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}