"use client";

import { useTranslation } from "react-i18next";
import { Users, FileText } from "lucide-react";
import KpiCard from "@/components/admin/KpiCard";
import SystemHealthWidget from "@/components/admin/SystemHealthWidget";
import ActiveUsersCounter from "@/components/admin/ActiveUsersCounter";
import { Skeleton } from "@/components/ui/Skeleton";

export default function KpiGrid({
  loading,
  totalUsers,
  reportsThisMonth,
  systemHealth,
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
  title={t("nav.admin.totalUsers")}
  value={(totalUsers ?? 0).toLocaleString()}
  icon={<Users size={20} />}
/>

<ActiveUsersCounter />

<KpiCard
  title={t("nav.admin.reportsGenerated")}
  value={(reportsThisMonth ?? 0).toLocaleString()}
  icon={<FileText size={20} />}
/>

      <SystemHealthWidget
        systemHealth={systemHealth}
      />
    </div>
  );
}