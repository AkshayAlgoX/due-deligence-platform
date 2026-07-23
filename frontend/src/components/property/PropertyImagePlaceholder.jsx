"use client";

import { Home, Building2, Warehouse, Trees, Building } from "lucide-react";
import {
  getPlaceholderGradient,
  getPlaceholderIconColor,
} from "@/constants/propertyImages";

/**
 * Honest placeholder for properties without images.
 * We don't show fake stock photos — real due-diligence platforms show
 * the truth: "no photo on file yet."
 *
 * Design inspired by: Linear's empty states, GitHub's default avatars,
 * Notion's page covers — intentional, not accidental.
 */
export default function PropertyImagePlaceholder({ propertyType, size = "default" }) {
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
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}
    >
      {/* ── Refined blueprint pattern (looks intentional) ── */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Subtle radial fade for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/[0.03] to-transparent" />

      {/* ── Center content ── */}
      <div className="relative flex flex-col items-center gap-2.5">
        {/* Icon in clean white square */}
        <div
          className={`flex ${iconBoxSize} items-center justify-center rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]`}
        >
          <Icon className={`${iconSize} ${iconColor}`} strokeWidth={1.75} />
        </div>

        {/* Honest micro-label */}
        <p
          className={`${labelSize} font-bold uppercase tracking-[0.15em] text-gray-500`}
        >
          Photo pending
        </p>
      </div>

    </div>
  );
}