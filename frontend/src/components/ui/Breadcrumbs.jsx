"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home } from "lucide-react";

// Map URL slugs → translation keys (reuses nav.* keys we already have)
const SLUG_TO_KEY = {
  "dashboard":            "nav.dashboard",
  "property-search":      "nav.propertySearch",
  "due-diligence":        "nav.dueDiligence",
  "risk-assessment":      "nav.riskAssessment",
  "property-comparison":  "nav.propertyComparison",
  "saved-comparisons":    "nav.savedComparisons",
  "reports":              "nav.reports",
  "notifications":        "nav.notifications",
  "audit-logs":           "nav.auditLogs",
  "profile":              "nav.profile",
  "settings":             "nav.settings",
  "support":              "nav.support",
};

export default function Breadcrumbs({ overrides = {} }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return null;

  const crumbs = parts.map((segment, index) => {
    const href = "/" + parts.slice(0, index + 1).join("/");
    const label = overrides[segment] || resolveLabel(segment, t);
    return { href, label, isLast: index === parts.length - 1 };
  });

  return (
    <nav
      aria-label={t("common.breadcrumbLabel")}
      className="flex items-center gap-1.5 text-sm mb-4"
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-gray-500 dark:text-[#7d8590] hover:text-[#22C55E] dark:hover:text-[#22C55E] transition"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {crumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-[#30363d]" />
          {crumb.isLast ? (
            <span className="font-semibold text-gray-800 dark:text-[#e6edf3]">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-gray-500 dark:text-[#7d8590] hover:text-[#22C55E] dark:hover:text-[#22C55E] transition"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

// Resolve a URL segment to a display label
function resolveLabel(segment, t) {
  // 1) Numeric IDs (like /property-search/42) → "Details" / "विवरण"
  if (/^\d+$/.test(segment)) return t("common.breadcrumbs.details");

  // 2) Known slug → use translation key
  const key = SLUG_TO_KEY[segment];
  if (key) return t(key);

  // 3) Fallback: humanize the slug (unknown routes stay English)
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}