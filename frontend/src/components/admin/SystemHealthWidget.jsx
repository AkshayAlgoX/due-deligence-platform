"use client";

import { useTranslation } from "react-i18next";
import { Server } from "lucide-react";
import KpiCard from "@/components/admin/KpiCard";

export default function SystemHealthWidget({ systemHealth }) {
  const { t } = useTranslation();
  return (
    <KpiCard
      title={t("nav.admin.systemHealth")}
      value={systemHealth}
      icon={<Server size={20} />}
    />
  );
}