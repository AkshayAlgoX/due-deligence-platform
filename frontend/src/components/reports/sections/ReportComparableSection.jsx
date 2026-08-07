"use client";

import { useTranslation } from "react-i18next";
import { BarChart3, Clock } from "lucide-react";

export default function ReportComparableSection() {
  const { t } = useTranslation();

  const features = [
    t("report.comparable.features.recentSales"),
    t("report.comparable.features.pricePerSqFt"),
    t("report.comparable.features.trends"),
    t("report.comparable.features.confidence"),
  ];

  return (
    <div
      id="section-COMPARABLE"
      className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-gray-100 dark:border-[#30363d]">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-4 h-4 text-gray-400 dark:text-[#7d8590]" strokeWidth={2} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
            {t("report.comparable.eyebrow")}
          </p>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
          {t("report.comparable.title")}
        </h2>
      </div>

      <div className="p-8 flex flex-col items-center justify-center text-center min-h-[240px]">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#21262d] flex items-center justify-center mb-4">
          <Clock className="w-7 h-7 text-gray-300 dark:text-[#6e7681]" strokeWidth={1.5} />
        </div>
        <p className="text-[14px] font-semibold text-gray-700 dark:text-[#e6edf3] mb-2">
          {t("report.comparable.placeholderTitle")}
        </p>
        <p className="text-[13px] text-gray-400 dark:text-[#6e7681] max-w-sm leading-relaxed mb-5">
          {t("report.comparable.placeholderBody")}
        </p>

        <div className="flex flex-wrap gap-2 justify-center">
          {features.map((feature) => (
            <span
              key={feature}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-gray-50 dark:bg-[#21262d] border border-gray-100 dark:border-[#30363d] text-gray-500 dark:text-[#7d8590]"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}