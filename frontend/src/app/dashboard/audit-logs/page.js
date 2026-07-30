"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function Page() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Audit Logs | Real Estate Due Diligence";
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
        <EmptyState
          icon={ClipboardList}
          title={t("pages.auditLogs.title")}
          description={t("pages.auditLogs.description")}
        />
      </div>
    </div>
  );
}