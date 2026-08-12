"use client";

import StatsCard from "@/components/dashboard/StatsCard";

/**
 * Thin wrapper around StatsCard, kept as its own file to match
 * the project's documented component structure (Member 3 / Admin Dashboard).
 */
export default function KpiCard({ title, value, icon, trendValue, trendUp, subtitle, href }) {
  return (
    <StatsCard
      title={title}
      value={value}
      icon={icon}
      trendValue={trendValue}
      trendUp={trendUp}
      subtitle={subtitle}
      href={href}
    />
  );
}