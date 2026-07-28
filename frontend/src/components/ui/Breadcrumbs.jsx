"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

/**
 * Auto-generates breadcrumbs from URL path.
 *
 * Usage:
 *   <Breadcrumbs />
 *
 * Or with custom labels:
 *   <Breadcrumbs
 *     overrides={{ "abc123": "456 MG Road" }}
 *   />
 */
export default function Breadcrumbs({ overrides = {} }) {
  const pathname = usePathname();

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return null;

  const crumbs = parts.map((segment, index) => {
    const href = "/" + parts.slice(0, index + 1).join("/");
    const label = overrides[segment] || humanize(segment);
    return { href, label, isLast: index === parts.length - 1 };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm mb-4"
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-gray-500 hover:text-[#22C55E] transition"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {crumbs.map((crumb, i) => (
        <div key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          {crumb.isLast ? (
            <span className="font-semibold text-gray-800">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-gray-500 hover:text-[#22C55E] transition"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

// Convert "property-search" → "Property Search"
function humanize(segment) {
  // Numeric IDs → "Details"
  if (/^\d+$/.test(segment)) return "Details";
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}