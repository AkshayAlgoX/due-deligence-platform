"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function Page() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Risk Assessment | Real Estate Due Diligence";
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
        <EmptyState
          icon={AlertTriangle}
          title={t("pages.riskAssessment.title")}
          description={t("pages.riskAssessment.description")}
        />
      </div>
    </div>
  );
}