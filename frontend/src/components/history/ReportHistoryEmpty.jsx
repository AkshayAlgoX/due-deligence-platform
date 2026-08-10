"use client";

import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ReportHistoryEmpty() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-white px-6 py-16 dark:border-[#30363d] dark:bg-[#0d1117]">

      <FileText
        className="mb-4 h-10 w-10 text-purple-200"
        strokeWidth={1.5}
      />

      <h3 className="text-base font-semibold text-gray-900 dark:text-[#e6edf3]">
        {t("reportHistory.empty", {
          defaultValue: "No reports found",
        })}
      </h3>

      <p className="mt-1 max-w-md text-center text-sm text-gray-500 dark:text-[#7d8590]">
        {t("reportHistory.emptyDescription", {
          defaultValue:
            "Try changing your search or filter criteria.",
        })}
      </p>
    </div>
  );
}