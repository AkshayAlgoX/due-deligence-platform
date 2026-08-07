"use client";

import { useTranslation } from "react-i18next";
import { Building2, Calendar, User, Hash, CheckCircle2, Shield } from "lucide-react";

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

function formatDateTime(isoString) {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return isoString;
  }
}

export default function ReportCoverSection({ section, report }) {
  const { t } = useTranslation();
  const data = parseSectionData(section);

  const address = data?.address || report?.propertyAddress || "—";
  const city = data?.city || "";
  const state = data?.state || "";
  const zipCode = data?.zipCode || "";
  const propertyType = data?.propertyType || "—";
  const locationLine = [city, state, zipCode].filter(Boolean).join(", ");

  const generatedBy = report?.generatedByEmail || "—";
  const version = report?.version ?? 1;
  const generatedAt = report?.completedAt || report?.createdAt;
  const reportId = report?.id;

  return (
    <div
      id="section-COVER"
      className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden"
    >
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-[#0d1117] dark:via-[#161b22] dark:to-[#0d1117] px-8 py-12">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <Shield className="w-3.5 h-3.5 text-[#22C55E]" strokeWidth={2.5} />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">
              {t("report.cover.brand")}
            </span>
          </div>
        </div>

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
            {t("report.cover.reportTag")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-2">
            {address}
          </h1>
          {locationLine && (
            <p className="text-base text-white/60 font-medium">{locationLine}</p>
          )}
        </div>

        <div className="relative flex flex-wrap items-center gap-3 mt-8">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">
            <Building2 className="w-3.5 h-3.5 text-white/50" strokeWidth={2} />
            <span className="text-[12px] font-semibold text-white/70">
              {propertyType}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">
            <Hash className="w-3.5 h-3.5 text-white/50" strokeWidth={2} />
            <span className="text-[12px] font-semibold text-white/70">
              {t("report.cover.version", { n: version })}
            </span>
          </div>
          {data?.verified && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#22C55E]/20 border border-[#22C55E]/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" strokeWidth={2.5} />
              <span className="text-[12px] font-semibold text-[#22C55E]">
                {t("report.cover.verified")}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-5 border-t border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#0d1117]/40">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#21262d] flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-4 h-4 text-gray-500 dark:text-[#7d8590]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-0.5">
                {t("report.cover.preparedFor")}
              </p>
              <p className="text-[13px] font-semibold text-gray-700 dark:text-[#e6edf3] break-all">
                {generatedBy}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#21262d] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-[#7d8590]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-0.5">
                {t("report.cover.generatedOn")}
              </p>
              <p className="text-[13px] font-semibold text-gray-700 dark:text-[#e6edf3]">
                {formatDateTime(generatedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#21262d] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Hash className="w-4 h-4 text-gray-500 dark:text-[#7d8590]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-0.5">
                {t("report.cover.reportId")}
              </p>
              <p className="text-[13px] font-semibold text-gray-700 dark:text-[#e6edf3]">
                #{reportId}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 border-t border-gray-100 dark:border-[#30363d]">
        <p className="text-[11px] text-gray-400 dark:text-[#6e7681] leading-relaxed">
          {t("report.cover.disclaimer")}
        </p>
      </div>
    </div>
  );
}