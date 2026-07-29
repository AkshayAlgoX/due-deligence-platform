"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

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
        className="flex items-center gap-1 text-gray-500 dark:text-[#7d8590] hover:text-[#22C55E] dark:hover:text-[#22C55E] transition"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {crumbs.map((crumb, i) => (
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

function humanize(segment) {
  if (/^\d+$/.test(segment)) return "Details";
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}