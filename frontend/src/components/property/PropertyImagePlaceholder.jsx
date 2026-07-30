"use client";

import { useTranslation } from "react-i18next";
import { Home, Building2, Warehouse, Trees, Building } from "lucide-react";
import {
  getPlaceholderGradient,
  getPlaceholderIconColor,
} from "@/constants/propertyImages";

export default function PropertyImagePlaceholder({ propertyType, size = "default" }) {
  const { t } = useTranslation();

  const icons = {
    Residential: Home,
    Commercial: Building2,
    Industrial: Warehouse,
    Land: Trees,
    "Mixed-Use": Building,
  };

  const Icon = icons[propertyType] || Home;
  const gradient = getPlaceholderGradient(propertyType);
  const iconColor = getPlaceholderIconColor(propertyType);

  const iconBoxSize = size === "hero" ? "h-20 w-20" : "h-14 w-14";
  const iconSize = size === "hero" ? "h-10 w-10" : "h-7 w-7";
  const labelSize = size === "hero" ? "text-xs" : "text-[9px]";

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} dark:bg-none dark:bg-[#0d1117]`}
    >
      {/* Blueprint pattern — light mode: dark lines / dark mode: white lines */}
      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      {/* Dark mode grid overlay — white lines, only visible in dark */}
      <div
        className="absolute inset-0 hidden opacity-[0.08] dark:block"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/[0.03] dark:from-black/60 to-transparent" />

      <div className="relative flex flex-col items-center gap-2.5">
        <div
          className={`flex ${iconBoxSize} items-center justify-center rounded-2xl bg-white dark:bg-[#161b22] shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)] ring-1 ring-black/[0.04] dark:ring-[#30363d]`}
        >
          <Icon className={`${iconSize} ${iconColor}`} strokeWidth={1.75} />
        </div>

        <p
          className={`${labelSize} font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-[#6e7681]`}
        >
          {t("property.card.photoPending")}
        </p>
      </div>
    </div>
  );
}